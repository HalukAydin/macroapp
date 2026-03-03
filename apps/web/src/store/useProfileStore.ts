import { create } from "zustand";
import {
  calculateTdee,
  calculateMacroTargets,
  upsertWeightEntry,
  emaTrend,
  parseFoodInput
} from "@macro/core";
import type { ActivityLevel, Sex, WeightEntry, WeightTrendPoint } from "@macro/core";
import type { FoodMacroBreakdown, ParsedFoodResult } from "@macro/core";
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
  foodLog: DailyFoodLogEntry[];
};

type DailyFoodLogEntry = {
  date: string;
  rawInput: string;
  totals: FoodMacroBreakdown;
};

type State = {
  profile: StoredProfile | null;
  weightEntries: WeightEntry[];
  weightTrend: WeightTrendPoint[];
  foodLog: DailyFoodLogEntry[];
  lastFoodEstimate: ParsedFoodResult | null;
  setProfile: (p: StoredProfile) => void;
  addWeightEntry: (entry: WeightEntry) => void;
  estimateFood: (input: string) => ParsedFoodResult;
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
const initialFoodLog = Array.isArray(initial?.foodLog) ? initial.foodLog : [];

function persist(profile: StoredProfile | null, weightEntries: WeightEntry[], foodLog: DailyFoodLogEntry[]) {
  const cleanEntries = weightEntries.map((entry) => ({
    date: entry.date,
    weightKg: entry.weightKg
  }));
  const cleanFoodLog = foodLog.map((entry) => ({
    date: entry.date,
    rawInput: entry.rawInput,
    totals: {
      proteinG: entry.totals.proteinG,
      fatG: entry.totals.fatG,
      carbG: entry.totals.carbG,
      calories: entry.totals.calories
    }
  }));
  saveState<PersistedState>({ profile, weightEntries: cleanEntries, foodLog: cleanFoodLog });
}

export const useProfileStore = create<State>((set, get) => ({
  profile: initial?.profile ?? null,
  weightEntries: initialWeightEntries,
  weightTrend: emaTrend(initialWeightEntries),
  foodLog: initialFoodLog,
  lastFoodEstimate: null,

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
    persist(clean, get().weightEntries, get().foodLog);
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
    persist(get().profile, updatedEntries, get().foodLog);
  },

  estimateFood: (input) => {
    const result = parseFoodInput(input);
    const trimmedInput = input.trim();
    let nextLog = get().foodLog;

    if (trimmedInput && result.items.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      const nextEntry: DailyFoodLogEntry = {
        date: today,
        rawInput: trimmedInput,
        totals: result.totals
      };
      nextLog = [...nextLog, nextEntry];
    }

    set({
      lastFoodEstimate: result,
      foodLog: nextLog
    });
    persist(get().profile, get().weightEntries, nextLog);
    return result;
  },

  reset: () => {
    set({
      profile: null,
      weightEntries: [],
      weightTrend: [],
      foodLog: [],
      lastFoodEstimate: null,
      tdee: null,
      targetCalories: null,
      macros: null
    });
    persist(null, [], []);
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
