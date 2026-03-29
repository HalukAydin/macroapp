import { Router, type IRouter } from "express";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { weightEntries } from "../db/schema.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router: IRouter = Router();

const weightBodySchema = z.object({
  weightKg: z.number().min(1).max(500),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
});

// GET /weight — all entries for current user, newest first
router.get("/", requireAuth, async (req, res) => {
  const { userId } = req as AuthedRequest;
  try {
    const entries = await db
      .select()
      .from(weightEntries)
      .where(eq(weightEntries.userId, userId))
      .orderBy(desc(weightEntries.date));

    res.json(entries);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /weight — add a weight entry
router.post("/", requireAuth, async (req, res) => {
  const { userId } = req as AuthedRequest;
  const parsed = weightBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { weightKg, date } = parsed.data;

  try {
    const [entry] = await db
      .insert(weightEntries)
      .values({ userId, weightKg, date })
      .returning();

    res.status(201).json(entry);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
