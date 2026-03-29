import { Router, type IRouter } from "express";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { foodEntries } from "../db/schema.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router: IRouter = Router();

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

const foodBodySchema = z.object({
  foodName: z.string().min(1),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  grams: z.number().min(0),
  date: isoDate
});

const dateQuerySchema = z.object({
  date: isoDate
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

// GET /food?date=YYYY-MM-DD — entries for current user on given date
router.get("/", requireAuth, async (req, res) => {
  const { userId } = req as AuthedRequest;
  const parsed = dateQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { date } = parsed.data;

  try {
    const entries = await db
      .select()
      .from(foodEntries)
      .where(and(eq(foodEntries.userId, userId), eq(foodEntries.date, date)))
      .orderBy(desc(foodEntries.createdAt));

    res.json(entries);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /food — add a food entry
router.post("/", requireAuth, async (req, res) => {
  const { userId } = req as AuthedRequest;
  const parsed = foodBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { foodName, calories, protein, carbs, fat, grams, date } = parsed.data;

  try {
    const [entry] = await db
      .insert(foodEntries)
      .values({ userId, foodName, calories, protein, carbs, fat, grams, date })
      .returning();

    res.status(201).json(entry);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /food/:id — delete a food entry (only if owned by current user)
router.delete("/:id", requireAuth, async (req, res) => {
  const { userId } = req as AuthedRequest;
  const parsed = idParamSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid entry id" });
    return;
  }

  const { id } = parsed.data;

  try {
    const deleted = await db
      .delete(foodEntries)
      .where(and(eq(foodEntries.id, id), eq(foodEntries.userId, userId)))
      .returning({ id: foodEntries.id });

    if (deleted.length === 0) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }

    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
