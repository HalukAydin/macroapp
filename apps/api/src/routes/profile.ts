import { Router, type IRouter } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { mifflinStJeorBmr, calculateTdee, calculateMacroTargets } from "@macro/core";
import { db } from "../db/index.js";
import { profiles } from "../db/schema.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router: IRouter = Router();

const profileBodySchema = z.object({
  age: z.number().int().min(13).max(90),
  gender: z.enum(["male", "female"]),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(35).max(250),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["cut", "maintain", "bulk"])
});

type ProfileInput = z.infer<typeof profileBodySchema>;

// Default macro rules — can be made user-configurable in a future iteration
const PROTEIN_G_PER_KG = 2.0;
const FAT_MIN_G_PER_KG = 0.8;

function targetCaloriesForGoal(tdee: number, goal: ProfileInput["goal"]): number {
  if (goal === "cut") return tdee - 300;
  if (goal === "bulk") return tdee + 250;
  return tdee;
}

function computeCalcs(p: ProfileInput) {
  const bmr = mifflinStJeorBmr({
    sex: p.gender,
    age: p.age,
    heightCm: p.heightCm,
    weightKg: p.weightKg
  });
  const tdee = calculateTdee({
    sex: p.gender,
    age: p.age,
    heightCm: p.heightCm,
    weightKg: p.weightKg,
    activity: p.activityLevel
  });
  const targetCalories = targetCaloriesForGoal(tdee, p.goal);
  const macros = calculateMacroTargets({
    weightKg: p.weightKg,
    targetCalories,
    rules: { proteinGPerKg: PROTEIN_G_PER_KG, fatMinGPerKg: FAT_MIN_G_PER_KG }
  });
  return { bmr, tdee, targetCalories, macros };
}

// GET /profile
router.get("/", requireAuth, async (req, res) => {
  const { userId } = req as AuthedRequest;
  try {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    res.json({ ...profile, calculated: computeCalcs(profile) });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /profile — create or update (upsert by userId)
router.post("/", requireAuth, async (req, res) => {
  const { userId } = req as AuthedRequest;
  const parsed = profileBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { age, gender, heightCm, weightKg, activityLevel, goal } = parsed.data;

  try {
    const existing = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, userId));

    let profile;
    if (existing.length > 0) {
      [profile] = await db
        .update(profiles)
        .set({ age, gender, heightCm, weightKg, activityLevel, goal })
        .where(eq(profiles.userId, userId))
        .returning();
    } else {
      [profile] = await db
        .insert(profiles)
        .values({ userId, age, gender, heightCm, weightKg, activityLevel, goal })
        .returning();
    }

    res.json({ ...profile, calculated: computeCalcs(parsed.data) });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
