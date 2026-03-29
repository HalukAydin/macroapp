import type { ActivityLevel, BasicProfileForEnergy } from "./types";

export function mifflinStJeorBmr(params: Pick<BasicProfileForEnergy, "sex" | "age" | "heightCm" | "weightKg">): number {
  const { sex, age, heightCm, weightKg } = params;

  // Mifflin-St Jeor:
  // Men:    BMR = 10W + 6.25H - 5A + 5
  // Women:  BMR = 10W + 6.25H - 5A - 161
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const sexAdj = sex === "male" ? 5 : -161;

  return Math.round(base + sexAdj);
}

export function activityMultiplier(level: ActivityLevel): number {
  switch (level) {
    case "sedentary":
      return 1.2;
    case "light":
      return 1.375;
    case "moderate":
      return 1.55;
    case "active":
      return 1.725;
    case "very_active":
      return 1.9;
    default: {
      // exhaustive check
      const _never: never = level;
      return _never;
    }
  }
}

export function calculateTdee(profile: BasicProfileForEnergy): number {
  const bmr = mifflinStJeorBmr(profile);
  const mult = activityMultiplier(profile.activity);
  return Math.round(bmr * mult);
}