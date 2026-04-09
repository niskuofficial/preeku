import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const router: IRouter = Router();

export const JWT_SECRET = process.env.JWT_SECRET || "preeku-jwt-secret-2024-change-in-prod";
const JWT_EXPIRES = "30d";

router.post("/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail)).limit(1);
    if (existing.length > 0) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `web_${randomUUID()}`;

    const [adminCount] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.isAdmin, true));
    const isFirstAdmin = adminCount.count === 0;

    const [user] = await db.insert(usersTable).values({
      clerkId: userId,
      email: normalizedEmail,
      name: name?.trim() || normalizedEmail.split("@")[0],
      passwordHash,
      isAdmin: isFirstAdmin,
    }).returning();

    const token = jwt.sign({ userId: user.clerkId, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({
      token,
      user: { id: user.clerkId, email: user.email, name: user.name, isAdmin: user.isAdmin },
    });
  } catch (err) {
    req.log.error({ err }, "Register error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const normalizedEmail = email.toLowerCase().trim();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail)).limit(1);

    if (!user || !user.passwordHash) return res.status(401).json({ error: "Invalid email or password" });
    if (user.isBlocked) return res.status(403).json({ error: "Account is blocked. Contact support." });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ userId: user.clerkId, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({
      token,
      user: { id: user.clerkId, email: user.email, name: user.name, isAdmin: user.isAdmin },
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, payload.userId)).limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ id: user.clerkId, email: user.email, name: user.name, isAdmin: user.isAdmin });
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
});

export default router;
