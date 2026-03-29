const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3002";

export const TOKEN_KEY = "macro-mvp:token";

// ---------- types ----------------------------------------------------------

export type AuthResponse = { token: string };

export type ProfileData = {
  age: number;
  gender: "male" | "female";
  heightCm: number;
  weightKg: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "cut" | "maintain" | "bulk";
};

export type ProfileResponse = ProfileData & {
  id: number;
  userId: number;
  createdAt: string;
  calculated: {
    bmr: number;
    tdee: number;
    targetCalories: number;
    macros: { proteinG: number; fatG: number; carbG: number; calories: number };
  };
};

export type WeightEntryData = { weightKg: number; date: string };

export type WeightEntryResponse = WeightEntryData & {
  id: number;
  userId: number;
  createdAt: string;
};

export type FoodEntryData = {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  grams: number;
  date: string;
};

export type FoodEntryResponse = FoodEntryData & {
  id: number;
  userId: number;
  createdAt: string;
};

// ---------- core fetch helper ----------------------------------------------

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>)
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const data: unknown = await res.json();
  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

// ---------- auth -----------------------------------------------------------

export function register(email: string, password: string) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

// ---------- profile --------------------------------------------------------

export function getProfile() {
  return request<ProfileResponse>("/profile");
}

export function saveProfile(data: ProfileData) {
  return request<ProfileResponse>("/profile", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

// ---------- weight ---------------------------------------------------------

export function getWeightEntries() {
  return request<WeightEntryResponse[]>("/weight");
}

export function addWeightEntry(data: WeightEntryData) {
  return request<WeightEntryResponse>("/weight", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

// ---------- food -----------------------------------------------------------

export function getFoodEntries(date: string) {
  return request<FoodEntryResponse[]>(`/food?date=${encodeURIComponent(date)}`);
}

export function addFoodEntry(data: FoodEntryData) {
  return request<FoodEntryResponse>("/food", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function deleteFoodEntry(id: number) {
  return request<void>(`/food/${id}`, { method: "DELETE" });
}
