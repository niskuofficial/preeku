import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/user/me", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId)).limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching user profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/user/me", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const { name } = req.body;
    const [updated] = await db.update(usersTable)
      .set({ name: name ?? "", updatedAt: new Date() })
      .where(eq(usersTable.clerkId, userId))
      .returning();
    res.json({ success: true, name: updated?.name ?? "" });
  } catch (err) {
    req.log.error({ err }, "Error updating user profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
