import { describe, it, expect } from "vitest";
import { calculateMacroTargets } from "../src/domain/macros";

describe("macros", () => {
  it("calculates macro targets correctly", () => {
    const result = calculateMacroTargets({
      weightKg: 78,
      targetCalories: 2700,
      rules: {
        proteinGPerKg: 2,
        fatMinGPerKg: 0.8
      }
    });

    // protein: 78 * 2 = 156g
    // fat: 78 * 0.8 = 62.4 -> 62g
    // protein cals: 156*4 = 624
    // fat cals: 62*9 = 558
    // remaining: 2700 - (624 + 558) = 1518
    // carb: 1518 / 4 = 379.5 -> 380g

    expect(result.proteinG).toBe(156);
    expect(result.fatG).toBe(62);
    expect(result.carbG).toBe(380);
    expect(result.calories).toBe(2700);
  });

  it("does not allow negative carbs if calories too low", () => {
    const result = calculateMacroTargets({
      weightKg: 78,
      targetCalories: 1000,
      rules: {
        proteinGPerKg: 2,
        fatMinGPerKg: 1
      }
    });

    expect(result.carbG).toBeGreaterThanOrEqual(0);
  });
});