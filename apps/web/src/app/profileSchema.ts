import { z } from "zod";

export const profileSchema = z.object({
  sex: z.enum(["male", "female"]),
  age: z.number().int().min(13).max(90),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(35).max(250),
  activity: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["cut", "maintain", "bulk"]),

  proteinGPerKg: z.number().min(1.2).max(3),
  fatMinGPerKg: z.number().min(0.3).max(1.5)
});

export type ProfileFormValues = z.infer<typeof profileSchema>;