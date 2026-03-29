import { Router, type IRouter } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

const router: IRouter = Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters")
});

function createToken(userId: number): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
}

// POST /auth/register
router.post("/register", async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));

    if (existing.length > 0) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(users)
      .values({ email, passwordHash })
      .returning({ id: users.id });

    res.status(201).json({ token: createToken(user.id) });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    res.json({ token: createToken(user.id) });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
