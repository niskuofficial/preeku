import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, walletTable } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";

const router: IRouter = Router();

router.post("/mobile/register", async (req, res) => {
  try {
    const { name, email, deviceId } = req.body;
    if (!deviceId || typeof deviceId !== "string") {
      return res.status(400).json({ error: "deviceId is required" });
    }

    const mobileUserId = `mobile_${deviceId}`;

    const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, mobileUserId)).limit(1);

    if (existing.length > 0) {
      const wallet = await db.select().from(walletTable).where(eq(walletTable.userId, mobileUserId)).limit(1);
      return res.json({
        success: true,
        userId: mobileUserId,
        isNew: false,
        walletBalance: wallet[0] ? parseFloat(wallet[0].balance) : 100000,
      });
    }

    await db.insert(usersTable).values({
      clerkId: mobileUserId,
      email: email || "",
      name: name || "Mobile User",
      isAdmin: false,
      isBlocked: false,
    });

    const [wallet] = await db.insert(walletTable).values({
      userId: mobileUserId,
      balance: "100000",
      initialBalance: "100000",
    }).returning();

    res.json({
      success: true,
      userId: mobileUserId,
      isNew: true,
      walletBalance: parseFloat(wallet.balance),
    });
  } catch (err) {
    console.error("Mobile register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/mobile/update-profile", async (req, res) => {
  try {
    const { deviceId, name, email } = req.body;
    if (!deviceId) return res.status(400).json({ error: "deviceId required" });

    const mobileUserId = `mobile_${deviceId}`;
    await db.update(usersTable)
      .set({ name: name || "", email: email || "", updatedAt: new Date() })
      .where(eq(usersTable.clerkId, mobileUserId));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
