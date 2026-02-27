export interface MacroRules {
  proteinGPerKg: number; // e.g. 1.8
  fatMinGPerKg: number;  // e.g. 0.7
}

export interface MacroTargets {
  calories: number;
  proteinG: number;
  fatG: number;
  carbG: number;
}

export function calculateMacroTargets(params: {
  weightKg: number;
  targetCalories: number;
  rules: MacroRules;
}): MacroTargets {
  const { weightKg, targetCalories, rules } = params;

  const proteinG = Math.round(weightKg * rules.proteinGPerKg);
  const fatG = Math.round(weightKg * rules.fatMinGPerKg);

  const proteinCals = proteinG * 4;
  const fatCals = fatG * 9;

  const remainingCals = targetCalories - (proteinCals + fatCals);
  const carbG = Math.max(0, Math.round(remainingCals / 4));

  return {
    calories: Math.round(targetCalories),
    proteinG,
    fatG,
    carbG
  };
}