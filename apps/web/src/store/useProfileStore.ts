import { create } from "zustand";
import { calculateTdee, calculateMacroTargets } from "@macro/core";
import type { ActivityLevel, Sex } from "@macro/core";
import { loadState, saveState } from "../lib/storage";
import type { ProfileFormValues } from "../app/profileSchema";

type Goal = "cut" | "maintain" | "bulk";

type StoredProfile = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
  proteinGPerKg: number;
  fatMinGPerKg: number;
};

type State = {
  profile: StoredProfile | null;
  setProfile: (p: StoredProfile) => void;
  reset: () => void;

  // derived
  tdee: number | null;
  targetCalories: number | null;
  macros: { proteinG: number; fatG: number; carbG: number; calories: number } | null;
  recalc: () => void;
};

function computeTargetCalories(tdee: number, goal: Goal) {
  if (goal === "cut") return tdee - 300;
  if (goal === "bulk") return tdee + 250;
  return tdee;
}

const initial = loadState<{ profile: StoredProfile | null }>();

export const useProfileStore = create<State>((set, get) => ({
  profile: initial?.profile ?? null,

  tdee: null,
  targetCalories: null,
  macros: null,

  setProfile: (p) => {
    const clean = {
      sex: p.sex,
      age: p.age,
      heightCm: p.heightCm,
      weightKg: p.weightKg,
      activity: p.activity,
      goal: p.goal,
      proteinGPerKg: p.proteinGPerKg,
      fatMinGPerKg: p.fatMinGPerKg
    };
    set({ profile: clean });
    saveState({ profile: clean });
    get().recalc();
  },

  reset: () => {
    set({ profile: null, tdee: null, targetCalories: null, macros: null });
    saveState({ profile: null });
  },

  recalc: () => {
    const p = get().profile;
    if (!p) return;

    const tdee = calculateTdee({
      sex: p.sex,
      age: p.age,
      heightCm: p.heightCm,
      weightKg: p.weightKg,
      activity: p.activity
    });

    const targetCalories = computeTargetCalories(tdee, p.goal);

    const macros = calculateMacroTargets({
      weightKg: p.weightKg,
      targetCalories,
      rules: {
        proteinGPerKg: p.proteinGPerKg,
        fatMinGPerKg: p.fatMinGPerKg
      }
    });

    set({ tdee, targetCalories, macros });
  }
}));

// App açılınca (hydrate sonrası) derived hesapla
export function hydrateProfileCalculations() {
  const s = useProfileStore.getState();
  if (s.profile) s.recalc();
}

// Form default values için yardımcı
export function toDefaults(p: StoredProfile | null): ProfileFormValues {
  return p ?? {
    sex: "male",
    age: 24,
    heightCm: 175,
    weightKg: 78,
    activity: "moderate",
    goal: "maintain",
    proteinGPerKg: 2,
    fatMinGPerKg: 0.8
  };
}