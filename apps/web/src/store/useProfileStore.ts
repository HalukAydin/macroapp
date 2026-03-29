import { create } from "zustand";
import { calculateTdee, calculateMacroTargets, upsertWeightEntry, emaTrend } from "@macro/core";
import type { ActivityLevel, Sex, WeightEntry, WeightTrendPoint } from "@macro/core";
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

type PersistedState = {
  profile: StoredProfile | null;
  weightEntries: WeightEntry[];
};

type State = {
  profile: StoredProfile | null;
  weightEntries: WeightEntry[];
  weightTrend: WeightTrendPoint[];
  setProfile: (p: StoredProfile) => void;
  addWeightEntry: (entry: WeightEntry) => void;
  reset: () => void;

  // derived
  tdee: number | null;
  targetCalories: number | null;
  macros: { proteinG: number; fatG: number; carbG: number; calories: number } | null;
  recalc: () => void;
  recalcWeightTrend: () => void;
};

function computeTargetCalories(tdee: number, goal: Goal) {
  if (goal === "cut") return tdee - 300;
  if (goal === "bulk") return tdee + 250;
  return tdee;
}

const initial = loadState<Partial<PersistedState>>();
const initialWeightEntries = Array.isArray(initial?.weightEntries) ? initial.weightEntries : [];

function persist(profile: StoredProfile | null, weightEntries: WeightEntry[]) {
  const cleanEntries = weightEntries.map((entry) => ({
    date: entry.date,
    weightKg: entry.weightKg
  }));
  saveState<PersistedState>({ profile, weightEntries: cleanEntries });
}

export const useProfileStore = create<State>((set, get) => ({
  profile: initial?.profile ?? null,
  weightEntries: initialWeightEntries,
  weightTrend: emaTrend(initialWeightEntries),

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
    persist(clean, get().weightEntries);
    get().recalc();
  },

  addWeightEntry: (entry) => {
    const cleanEntry: WeightEntry = {
      date: entry.date,
      weightKg: entry.weightKg
    };
    const updatedEntries = upsertWeightEntry(get().weightEntries, cleanEntry);
    set({
      weightEntries: updatedEntries,
      weightTrend: emaTrend(updatedEntries)
    });
    persist(get().profile, updatedEntries);
  },

  reset: () => {
    set({
      profile: null,
      weightEntries: [],
      weightTrend: [],
      tdee: null,
      targetCalories: null,
      macros: null
    });
    persist(null, []);
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
  },

  recalcWeightTrend: () => {
    const entries = get().weightEntries;
    set({ weightTrend: emaTrend(entries) });
  }
}));

// App açılınca (hydrate sonrası) derived hesapla
export function hydrateProfileCalculations() {
  const s = useProfileStore.getState();
  if (s.profile) s.recalc();
  s.recalcWeightTrend();
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
