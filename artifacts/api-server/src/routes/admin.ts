import { Router, type IRouter } from "express";
import { db, usersTable, walletTable, ordersTable, positionsTable, stocksTable } from "@workspace/db";
import { eq, desc, count, ilike, or, sql } from "drizzle-orm";
import { requireAdmin, requireAuth } from "../middlewares/requireAuth";
import { getOrCreateWallet } from "./wallet";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));

    const result = await Promise.all(users.map(async (u) => {
      const [wallet] = await db.select().from(walletTable).where(eq(walletTable.userId, u.clerkId)).limit(1);
      const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, u.clerkId));
      const positions = await db.select().from(positionsTable).where(eq(positionsTable.userId, u.clerkId));
      return {
        id: u.id,
        clerkId: u.clerkId,
        email: u.email,
        name: u.name,
        profilePhoto: u.profilePhoto ?? null,
        isAdmin: u.isAdmin,
        isBlocked: u.isBlocked,
        createdAt: u.createdAt,
        walletBalance: wallet ? parseFloat(wallet.balance) : 1000000,
        totalOrders: orders.length,
        openPositions: positions.length,
      };
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Admin: Error fetching users");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/users/:clerkId/wallet", requireAdmin, async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { balance } = req.body;
    if (typeof balance !== "number" || balance < 0) {
      return res.status(400).json({ error: "Invalid balance amount" });
    }
    const wallet = await getOrCreateWallet(clerkId);
    const [updated] = await db.update(walletTable)
      .set({ balance: balance.toFixed(2), updatedAt: new Date() })
      .where(eq(walletTable.id, wallet.id))
      .returning();
    res.json({ success: true, balance: parseFloat(updated.balance) });
  } catch (err) {
    req.log.error({ err }, "Admin: Error updating wallet");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/users/:clerkId/block", requireAdmin, async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { isBlocked } = req.body;
    const [updated] = await db.update(usersTable)
      .set({ isBlocked: Boolean(isBlocked), updatedAt: new Date() })
      .where(eq(usersTable.clerkId, clerkId))
      .returning();
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, isBlocked: updated.isBlocked });
  } catch (err) {
    req.log.error({ err }, "Admin: Error updating block status");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/users/:clerkId/admin", requireAdmin, async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { isAdmin } = req.body;
    const [updated] = await db.update(usersTable)
      .set({ isAdmin: Boolean(isAdmin), updatedAt: new Date() })
      .where(eq(usersTable.clerkId, clerkId))
      .returning();
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, isAdmin: updated.isAdmin });
  } catch (err) {
    req.log.error({ err }, "Admin: Error updating admin status");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/me", requireAdmin, async (req, res) => {
  res.json({ isAdmin: true });
});

router.patch("/admin/users/:clerkId/password", requireAdmin, async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { password } = req.body;
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [updated] = await db.update(usersTable)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(usersTable.clerkId, clerkId))
      .returning();
    if (!updated) return res.status(404).json({ error: "User not found" });
    req.log.info({ clerkId }, "Admin: Password changed for user");
    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    req.log.error({ err }, "Admin: Error changing password");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/users/:clerkId/profile", requireAdmin, async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { name, email, profilePhoto } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof name === "string") updates.name = name;
    if (typeof email === "string") updates.email = email;
    if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;
    const [updated] = await db.update(usersTable)
      .set(updates)
      .where(eq(usersTable.clerkId, clerkId))
      .returning();
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, name: updated.name, email: updated.email, profilePhoto: updated.profilePhoto ?? null });
  } catch (err) {
    req.log.error({ err }, "Admin: Error updating user profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Stock logos management
router.get("/admin/stocks", requireAdmin, async (req, res) => {
  try {
    const search = (req.query.search as string | undefined)?.trim();
    const limit = Math.min(parseInt(req.query.limit as string || "50", 10), 200);
    const offset = parseInt(req.query.offset as string || "0", 10);
    const whereClause = search ? or(ilike(stocksTable.symbol, `%${search}%`), ilike(stocksTable.name, `%${search}%`)) : undefined;
    const [stocks, [{ total }]] = await Promise.all([
      db.select({
        symbol: stocksTable.symbol,
        name: stocksTable.name,
        exchange: stocksTable.exchange,
        sector: stocksTable.sector,
        logoUrl: stocksTable.logoUrl,
      }).from(stocksTable).where(whereClause).orderBy(stocksTable.symbol).limit(limit).offset(offset),
      db.select({ total: sql<number>`count(*)::int` }).from(stocksTable).where(whereClause),
    ]);
    res.setHeader("X-Total-Count", String(total));
    res.json(stocks);
  } catch (err) {
    req.log.error({ err }, "Admin: Error fetching stocks");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/stocks/:symbol/logo", requireAdmin, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { logoUrl } = req.body;
    if (logoUrl !== null && typeof logoUrl !== "string") {
      return res.status(400).json({ error: "logoUrl must be a string or null" });
    }
    const [updated] = await db.update(stocksTable)
      .set({ logoUrl: logoUrl || null })
      .where(eq(stocksTable.symbol, symbol.toUpperCase()))
      .returning({ symbol: stocksTable.symbol, logoUrl: stocksTable.logoUrl });
    if (!updated) return res.status(404).json({ error: "Stock not found" });
    res.json({ success: true, symbol: updated.symbol, logoUrl: updated.logoUrl });
  } catch (err) {
    req.log.error({ err }, "Admin: Error updating stock logo");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Seed stocks from Angel One ScripMaster (public CDN, no auth needed)
router.post("/admin/seed-stocks", requireAdmin, async (req, res) => {
  try {
    req.log.info("Admin: Starting stocks seed from Angel One ScripMaster...");
    const response = await fetch("https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json");
    if (!response.ok) throw new Error(`ScripMaster fetch failed: ${response.status}`);
    const scrips: Array<{ token: string; symbol: string; name: string; exch_seg: string; instrumenttype: string; lotsize: string }> = await response.json();

    const nseEquity = scrips.filter(s => s.exch_seg === "NSE" && s.instrumenttype === "EQ");
    req.log.info(`Admin: Found ${nseEquity.length} NSE equity stocks in ScripMaster`);

    let inserted = 0;
    const CHUNK = 100;
    for (let i = 0; i < nseEquity.length; i += CHUNK) {
      const chunk = nseEquity.slice(i, i + CHUNK);
      const values = chunk.map(s => ({
        symbol: s.symbol.replace(/-EQ$/, ""),
        name: s.name || s.symbol,
        exchange: "NSE" as const,
        sector: "Equities",
        currentPrice: "0.00",
        previousClose: "0.00",
        high: "0.00",
        low: "0.00",
        volume: 0,
        marketCap: "0.00",
        updatedAt: new Date(),
      }));
      await db.insert(stocksTable).values(values).onConflictDoUpdate({
        target: stocksTable.symbol,
        set: { name: sql`excluded.name`, exchange: sql`excluded.exchange`, updatedAt: sql`excluded.updated_at` },
      });
      inserted += chunk.length;
    }
    req.log.info(`Admin: Seeded ${inserted} stocks`);
    res.json({ success: true, inserted });
  } catch (err) {
    req.log.error({ err }, "Admin: seed-stocks error");
    res.status(500).json({ error: String(err) });
  }
});

// Bootstrap: first signed-in user can claim admin if NO admins exist yet
router.post("/admin/bootstrap", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const admins = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.isAdmin, true));
    if (admins[0].count > 0) {
      return res.status(403).json({ error: "An admin already exists. Contact them for access." });
    }
    const [updated] = await db.update(usersTable)
      .set({ isAdmin: true, updatedAt: new Date() })
      .where(eq(usersTable.clerkId, userId))
      .returning();
    if (!updated) return res.status(404).json({ error: "User not found. Sign in first." });
    res.json({ success: true, message: "You are now the admin!" });
  } catch (err) {
    req.log.error({ err }, "Bootstrap error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
