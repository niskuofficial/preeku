import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  (req as any).userId = userId;

  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId)).limit(1);
    if (existing.length === 0) {
      const email = (auth as any)?.sessionClaims?.email ?? "";
      const name = (auth as any)?.sessionClaims?.name ?? (auth as any)?.sessionClaims?.firstName ?? "";
      // Check if any admin exists — first user to sign up becomes admin
      const [adminCount] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.isAdmin, true));
      const isFirstAdmin = adminCount.count === 0;
      await db.insert(usersTable).values({ clerkId: userId, email, name, isAdmin: isFirstAdmin });
    } else if (existing[0].isBlocked) {
      return res.status(403).json({ error: "Account is blocked. Contact support." });
    }
  } catch (_) {}

  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId)).limit(1);
    if (!user.length || !user[0].isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    (req as any).userId = userId;
    next();
  } catch (_) {
    res.status(500).json({ error: "Internal server error" });
  }
}
