export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export interface BasicProfileForEnergy {
  sex: Sex;
  age: number;      // years
  heightCm: number; // cm
  weightKg: number; // kg
  activity: ActivityLevel;
}