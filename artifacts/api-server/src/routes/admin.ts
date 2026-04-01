import { Router, type IRouter } from "express";
import { db, usersTable, walletTable, ordersTable, positionsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAdmin, requireAuth } from "../middlewares/requireAuth";
import { getOrCreateWallet } from "./wallet";

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
    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }
    const clerkSecret = process.env.CLERK_SECRET_KEY;
    if (!clerkSecret) return res.status(500).json({ error: "Clerk not configured." });

    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${clerkSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password, skip_password_checks: true }),
    });

    if (!clerkRes.ok) {
      const err = await clerkRes.json();
      return res.status(400).json({ error: err?.errors?.[0]?.message || "Failed to update password." });
    }

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
