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
import * as api from "../lib/api";
import { TOKEN_KEY } from "../lib/api";
import { useAuthStore } from "./useAuthStore";

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

export type DailyFoodEntry = {
  id: string;
  apiId?: number;
  foodName: string;
  quantityText?: string;
  sourceText: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
};

export type DailyLog = {
  date: string;
  entries: DailyFoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
};

type NewFoodEntryInput = {
  foodName: string;
  quantityText?: string;
  sourceText?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt?: string;
};

type LegacyDailyFoodLogEntry = {
  date: string;
  rawInput: string;
  totals: FoodMacroBreakdown;
};

type PersistedState = {
  profile: StoredProfile | null;
  weightEntries: WeightEntry[];
  dailyLog: DailyLog;
  foodLog?: LegacyDailyFoodLogEntry[];
};

type State = {
  profile: StoredProfile | null;
  weightEntries: WeightEntry[];
  weightTrend: WeightTrendPoint[];
  dailyLog: DailyLog;
  lastFoodEstimate: ParsedFoodResult | null;
  lastFoodEstimateInput: string;
  setProfile: (p: StoredProfile) => void;
  addWeightEntry: (entry: WeightEntry) => void;
  estimateFood: (input: string) => ParsedFoodResult;
  addFoodEntry: (entry: NewFoodEntryInput) => void;
  removeFoodEntry: (id: string) => void;
  clearTodayLog: () => void;
  getTodayLog: () => DailyLog;
  reset: () => void;
  hydrateFromApi: () => Promise<void>;

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

function todayIsoDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function round1(value: number): number {
  return Number(value.toFixed(1));
}

function toSafeNumber(value: unknown): number {
  const asNumber = Number(value);
  if (!Number.isFinite(asNumber)) return 0;
  return round1(asNumber);
}

function computeDailyTotals(entries: DailyFoodEntry[]) {
  return entries.reduce(
    (sum, entry) => ({
      totalCalories: round1(sum.totalCalories + entry.calories),
      totalProtein: round1(sum.totalProtein + entry.protein),
      totalCarbs: round1(sum.totalCarbs + entry.carbs),
      totalFat: round1(sum.totalFat + entry.fat)
    }),
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    }
  );
}

function createEntryId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createEmptyDailyLog(date = todayIsoDate()): DailyLog {
  return {
    date,
    entries: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  };
}

function sanitizeDailyEntry(value: unknown, fallbackDate: string): DailyFoodEntry | null {
  if (!value || typeof value !== "object") return null;

  const asRecord = value as Partial<DailyFoodEntry>;
  const foodName = String(asRecord.foodName ?? "").trim();
  const sourceText = String(asRecord.sourceText ?? asRecord.foodName ?? "").trim();
  if (!foodName || !sourceText) return null;

  const quantityText = String(asRecord.quantityText ?? "").trim();
  const createdAt = String(asRecord.createdAt ?? `${fallbackDate}T00:00:00.000Z`);

  const apiId = typeof asRecord.apiId === "number" ? asRecord.apiId : undefined;
  return {
    id: String(asRecord.id ?? createEntryId()),
    ...(apiId !== undefined ? { apiId } : {}),
    foodName,
    sourceText,
    quantityText: quantityText || undefined,
    calories: toSafeNumber(asRecord.calories),
    protein: toSafeNumber(asRecord.protein),
    carbs: toSafeNumber(asRecord.carbs),
    fat: toSafeNumber(asRecord.fat),
    createdAt
  };
}

function sanitizeDailyLog(value: unknown): DailyLog | null {
  if (!value || typeof value !== "object") return null;
  const asRecord = value as Partial<DailyLog>;
  const date = String(asRecord.date ?? "").trim();
  if (!date) return null;

  const rawEntries = Array.isArray(asRecord.entries) ? asRecord.entries : [];
  const entries = rawEntries
    .map((entry) => sanitizeDailyEntry(entry, date))
    .filter((entry): entry is DailyFoodEntry => Boolean(entry));
  const totals = computeDailyTotals(entries);

  return {
    date,
    entries,
    ...totals
  };
}

function ensureTodayDailyLog(log: DailyLog): DailyLog {
  const today = todayIsoDate();
  if (log.date === today) return log;
  return createEmptyDailyLog(today);
}

function migrateLegacyFoodLog(legacyLog: LegacyDailyFoodLogEntry[] | undefined): DailyLog {
  const today = todayIsoDate();
  if (!Array.isArray(legacyLog) || legacyLog.length === 0) {
    return createEmptyDailyLog(today);
  }

  const entries = legacyLog
    .filter((entry) => entry?.date === today && entry?.rawInput)
    .map((entry) => {
      const sourceText = String(entry.rawInput).trim();
      const totals = entry.totals ?? { calories: 0, proteinG: 0, carbG: 0, fatG: 0 };
      return {
        id: createEntryId(),
        foodName: sourceText,
        sourceText,
        calories: toSafeNumber(totals.calories),
        protein: toSafeNumber(totals.proteinG),
        carbs: toSafeNumber(totals.carbG),
        fat: toSafeNumber(totals.fatG),
        createdAt: `${today}T00:00:00.000Z`
      };
    });

  return {
    date: today,
    entries,
    ...computeDailyTotals(entries)
  };
}

const initial = loadState<Partial<PersistedState>>();
const initialWeightEntries = Array.isArray(initial?.weightEntries) ? initial.weightEntries : [];
const initialDailyLog = (() => {
  const sanitized = sanitizeDailyLog(initial?.dailyLog);
  if (sanitized) return ensureTodayDailyLog(sanitized);
  return migrateLegacyFoodLog(initial?.foodLog);
})();

function persist(profile: StoredProfile | null, weightEntries: WeightEntry[], dailyLog: DailyLog) {
  const cleanEntries = weightEntries.map((entry) => ({
    date: entry.date,
    weightKg: entry.weightKg
  }));
  const cleanDailyEntries = dailyLog.entries.map((entry) => ({
    id: entry.id,
    ...(entry.apiId !== undefined ? { apiId: entry.apiId } : {}),
    foodName: entry.foodName,
    quantityText: entry.quantityText,
    sourceText: entry.sourceText,
    calories: toSafeNumber(entry.calories),
    protein: toSafeNumber(entry.protein),
    carbs: toSafeNumber(entry.carbs),
    fat: toSafeNumber(entry.fat),
    createdAt: entry.createdAt
  }));
  const cleanDailyLog: DailyLog = {
    date: dailyLog.date,
    entries: cleanDailyEntries,
    ...computeDailyTotals(cleanDailyEntries)
  };
  saveState<PersistedState>({ profile, weightEntries: cleanEntries, dailyLog: cleanDailyLog });
}

export const useProfileStore = create<State>((set, get) => ({
  profile: initial?.profile ?? null,
  weightEntries: initialWeightEntries,
  weightTrend: emaTrend(initialWeightEntries),
  dailyLog: initialDailyLog,
  lastFoodEstimate: null,
  lastFoodEstimateInput: "",

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
    persist(clean, get().weightEntries, get().dailyLog);
    get().recalc();
    if (useAuthStore.getState().isAuthenticated) {
      api.saveProfile({
        age: clean.age,
        gender: clean.sex,
        heightCm: clean.heightCm,
        weightKg: clean.weightKg,
        activityLevel: clean.activity,
        goal: clean.goal
      }).catch(() => {});
    }
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
    persist(get().profile, updatedEntries, get().dailyLog);
    if (useAuthStore.getState().isAuthenticated) {
      api.addWeightEntry({ weightKg: cleanEntry.weightKg, date: cleanEntry.date }).catch(() => {});
    }
  },

  estimateFood: (input) => {
    const result = parseFoodInput(input);
    set({
      lastFoodEstimate: result,
      lastFoodEstimateInput: input.trim()
    });
    return result;
  },

  addFoodEntry: (entry) => {
    const foodName = entry.foodName.trim();
    const sourceText = (entry.sourceText ?? entry.foodName).trim();
    if (!foodName || !sourceText) return;

    const baseLog = ensureTodayDailyLog(get().dailyLog);
    const nextEntry: DailyFoodEntry = {
      id: createEntryId(),
      foodName,
      quantityText: entry.quantityText?.trim() || undefined,
      sourceText,
      calories: toSafeNumber(entry.calories),
      protein: toSafeNumber(entry.protein),
      carbs: toSafeNumber(entry.carbs),
      fat: toSafeNumber(entry.fat),
      createdAt: entry.createdAt ?? new Date().toISOString()
    };
    const nextEntries = [...baseLog.entries, nextEntry];
    const nextLog: DailyLog = {
      date: baseLog.date,
      entries: nextEntries,
      ...computeDailyTotals(nextEntries)
    };

    set({ dailyLog: nextLog });
    persist(get().profile, get().weightEntries, nextLog);
    if (useAuthStore.getState().isAuthenticated) {
      api.addFoodEntry({
        foodName: nextEntry.foodName,
        calories: nextEntry.calories,
        protein: nextEntry.protein,
        carbs: nextEntry.carbs,
        fat: nextEntry.fat,
        grams: 0,
        date: baseLog.date
      }).then((res) => {
        const log = get().dailyLog;
        const updatedEntries = log.entries.map((e) =>
          e.id === nextEntry.id ? { ...e, apiId: res.id } : e
        );
        const updatedLog = { ...log, entries: updatedEntries };
        set({ dailyLog: updatedLog });
        persist(get().profile, get().weightEntries, updatedLog);
      }).catch(() => {});
    }
  },

  removeFoodEntry: (id) => {
    if (!id) return;
    const baseLog = ensureTodayDailyLog(get().dailyLog);
    const entryToRemove = baseLog.entries.find((e) => e.id === id);
    const nextEntries = baseLog.entries.filter((entry) => entry.id !== id);
    if (nextEntries.length === baseLog.entries.length) return;

    const nextLog: DailyLog = {
      date: baseLog.date,
      entries: nextEntries,
      ...computeDailyTotals(nextEntries)
    };
    set({ dailyLog: nextLog });
    persist(get().profile, get().weightEntries, nextLog);
    if (entryToRemove?.apiId != null && useAuthStore.getState().isAuthenticated) {
      api.deleteFoodEntry(entryToRemove.apiId).catch(() => {});
    }
  },

  hydrateFromApi: async () => {
    if (!useAuthStore.getState().isAuthenticated) return;
    const today = todayIsoDate();
    const [profileRes, weightRes, foodRes] = await Promise.allSettled([
      api.getProfile(),
      api.getWeightEntries(),
      api.getFoodEntries(today)
    ]);

    if (profileRes.status === "fulfilled") {
      const p = profileRes.value;
      const existing = get().profile;
      const merged: StoredProfile = {
        sex: p.gender,
        age: p.age,
        heightCm: p.heightCm,
        weightKg: p.weightKg,
        activity: p.activityLevel,
        goal: p.goal,
        proteinGPerKg: existing?.proteinGPerKg ?? 2,
        fatMinGPerKg: existing?.fatMinGPerKg ?? 0.8
      };
      set({ profile: merged });
      get().recalc();
    }

    if (weightRes.status === "fulfilled") {
      const entries: WeightEntry[] = weightRes.value.map((e) => ({
        date: e.date,
        weightKg: e.weightKg
      }));
      set({ weightEntries: entries, weightTrend: emaTrend(entries) });
    }

    if (foodRes.status === "fulfilled") {
      const apiEntries = foodRes.value;
      const entries: DailyFoodEntry[] = apiEntries.map((e) => ({
        id: createEntryId(),
        apiId: e.id,
        foodName: e.foodName,
        sourceText: e.foodName,
        calories: e.calories,
        protein: e.protein,
        carbs: e.carbs,
        fat: e.fat,
        createdAt: e.createdAt
      }));
      const nextLog: DailyLog = { date: today, entries, ...computeDailyTotals(entries) };
      set({ dailyLog: nextLog });
    }

    const s = get();
    persist(s.profile, s.weightEntries, s.dailyLog);
  },

  clearTodayLog: () => {
    const nextLog = createEmptyDailyLog();
    set({ dailyLog: nextLog });
    persist(get().profile, get().weightEntries, nextLog);
  },

  getTodayLog: () => {
    const current = get().dailyLog;
    const next = ensureTodayDailyLog(current);
    if (next.date !== current.date) {
      set({ dailyLog: next });
      persist(get().profile, get().weightEntries, next);
    }
    return next;
  },

  reset: () => {
    const emptyLog = createEmptyDailyLog();
    set({
      profile: null,
      weightEntries: [],
      weightTrend: [],
      dailyLog: emptyLog,
      lastFoodEstimate: null,
      lastFoodEstimateInput: "",
      tdee: null,
      targetCalories: null,
      macros: null
    });
    persist(null, [], emptyLog);
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
