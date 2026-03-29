import { describe, expect, it } from "vitest";
import { activityMultiplier, mifflinStJeorBmr, calculateTdee } from "../src/domain/energy";

describe("energy", () => {
  it("calculates BMR (male) using Mifflin-St Jeor", () => {
    // Example: male, 24y, 175cm, 78kg
    const bmr = mifflinStJeorBmr({ sex: "male", age: 24, heightCm: 175, weightKg: 78 });
    // Base = 10*78 + 6.25*175 - 5*24 = 780 + 1093.75 - 120 = 1753.75
    // +5 => 1758.75 => rounded 1759
    expect(bmr).toBe(1759);
  });

  it("calculates TDEE with activity multiplier", () => {
    const tdee = calculateTdee({ sex: "male", age: 24, heightCm: 175, weightKg: 78, activity: "moderate" });
    // BMR 1759 * 1.55 = 2726.45 => rounded 2726
    expect(tdee).toBe(2726);
    expect(activityMultiplier("moderate")).toBe(1.55);
  });
});