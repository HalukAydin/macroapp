import type { FoodMacroBreakdown } from "@macro/core";
import type { FoodSearchCandidate, FoodSearchResult } from "./types";

const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
const searchCache = new Map<string, { expiresAt: number; items: FoodSearchCandidate[] }>();

type OpenFoodFactsProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  nutriments?: Record<string, unknown>;
};

type OpenFoodFactsResponse = {
  products?: OpenFoodFactsProduct[];
};

function normalizeQuery(value: string): string {
  return value.trim().toLocaleLowerCase("tr-TR");
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function round1(value: number): number {
  return Number(value.toFixed(1));
}

function mapMacros(nutriments: Record<string, unknown> | undefined): FoodMacroBreakdown | null {
  if (!nutriments) return null;

  const protein = toNumber(nutriments.proteins_100g);
  const fat = toNumber(nutriments.fat_100g);
  const carb = toNumber(nutriments.carbohydrates_100g);
  const caloriesDirect = toNumber(nutriments["energy-kcal_100g"]);
  const energyKj = toNumber(nutriments.energy_100g);
  const caloriesFromKj = energyKj !== null ? energyKj / 4.184 : null;
  const calories = caloriesDirect ?? caloriesFromKj;

  if (protein === null || fat === null || carb === null || calories === null) return null;
  if (protein < 0 || fat < 0 || carb < 0 || calories < 0) return null;

  return {
    proteinG: round1(protein),
    fatG: round1(fat),
    carbG: round1(carb),
    calories: round1(calories)
  };
}

function mapProduct(product: OpenFoodFactsProduct): FoodSearchCandidate | null {
  const name = product.product_name?.trim();
  if (!name) return null;

  const macros = mapMacros(product.nutriments);
  if (!macros) return null;

  const id = product.code?.trim() || `${name.toLocaleLowerCase("tr-TR")}-${product.brands ?? "unknown"}`;
  return {
    id,
    source: "open_food_facts",
    name,
    brand: product.brands?.trim() || undefined,
    per100g: macros
  };
}

export async function searchOpenFoodFactsFoods(query: string): Promise<FoodSearchResult> {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return {
      query: normalizedQuery,
      items: [],
      fromCache: false
    };
  }

  const now = Date.now();
  const cached = searchCache.get(normalizedQuery);
  if (cached && cached.expiresAt > now) {
    return {
      query: normalizedQuery,
      items: cached.items,
      fromCache: true
    };
  }

  const endpoint = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  endpoint.searchParams.set("search_terms", normalizedQuery);
  endpoint.searchParams.set("search_simple", "1");
  endpoint.searchParams.set("action", "process");
  endpoint.searchParams.set("json", "1");
  endpoint.searchParams.set("page_size", "8");
  endpoint.searchParams.set(
    "fields",
    "code,product_name,brands,nutriments,energy-kcal_100g,energy_100g,proteins_100g,fat_100g,carbohydrates_100g"
  );

  const response = await fetch(endpoint.toString());
  if (!response.ok) {
    throw new Error(`Open Food Facts request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as OpenFoodFactsResponse;
  const rawProducts = Array.isArray(payload.products) ? payload.products : [];
  const mappedItems = rawProducts
    .map(mapProduct)
    .filter((item): item is FoodSearchCandidate => item !== null);
  const uniqueItems: FoodSearchCandidate[] = [];
  const seenIds = new Set<string>();

  for (const item of mappedItems) {
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    uniqueItems.push(item);
  }

  searchCache.set(normalizedQuery, {
    expiresAt: now + SEARCH_CACHE_TTL_MS,
    items: uniqueItems
  });

  return {
    query: normalizedQuery,
    items: uniqueItems,
    fromCache: false
  };
}
