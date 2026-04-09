import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { JWT_SECRET } from "../routes/auth";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const deviceId = req.headers["x-device-id"] as string | undefined;

  if (deviceId) {
    try {
      const mobileClerkId = `mobile_${deviceId}`;
      const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, mobileClerkId)).limit(1);
      if (existing.length > 0) {
        if (existing[0].isBlocked) {
          return res.status(403).json({ error: "Account is blocked. Contact support." });
        }
        (req as any).userId = mobileClerkId;
        return next();
      }
    } catch (_) {}
    return res.status(401).json({ error: "Unauthorized" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as any).userId = payload.userId;

    const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, payload.userId)).limit(1);
    if (existing.length > 0 && existing[0].isBlocked) {
      return res.status(403).json({ error: "Account is blocked. Contact support." });
    }
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };

    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, payload.userId)).limit(1);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    (req as any).userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
