import { FOOD_CATALOG, type FoodCatalogItem, type FoodMacroBreakdown } from "./foodCatalog.js";

type ParsedUnit = "g" | "piece" | "ml" | "scoop";

export interface ParsedFoodItem {
  rawSegment: string;
  foodId: FoodCatalogItem["id"];
  foodName: string;
  quantity: number;
  unit: ParsedUnit;
  grams: number;
  macros: FoodMacroBreakdown;
}

export interface ParseIssue {
  segment: string;
  reason: string;
}

export interface ParsedFoodResult {
  items: ParsedFoodItem[];
  totals: FoodMacroBreakdown;
  issues: ParseIssue[];
}

const GRAM_UNITS = new Set(["g", "gr", "gram", "grams"]);
const PIECE_UNITS = new Set(["piece", "pieces", "pc", "pcs", "adet"]);
const ML_UNITS = new Set(["ml", "mililitre", "mililiter", "milliliter", "millilitre"]);
const SCOOP_UNITS = new Set(["scoop", "scoops", "olcek"]);

const EXPLICIT_ALIAS_TO_ID: Record<string, FoodCatalogItem["id"]> = {
  whey: "whey_protein",
  "whey protein": "whey_protein",
  "protein powder": "whey_protein",
  "protein tozu": "whey_protein",
  "kıyma": "ground_beef",
  "dana kıyma": "ground_beef",
  pilav: "cooked_rice",
  "pirinç pilavı": "cooked_rice",
  muz: "banana",
  "yoğurt": "yogurt",
  karpuz: "watermelon",
  süt: "milk"
};

const ALIAS_TO_FOOD = buildAliasMap();

function buildAliasMap(): Map<string, FoodCatalogItem> {
  const map = new Map<string, FoodCatalogItem>();
  const foodById = new Map<FoodCatalogItem["id"], FoodCatalogItem>(
    FOOD_CATALOG.map((item) => [item.id, item])
  );

  for (const item of FOOD_CATALOG) {
    for (const alias of item.aliases) {
      map.set(normalize(alias), item);
    }
  }

  for (const [alias, foodId] of Object.entries(EXPLICIT_ALIAS_TO_ID)) {
    const item = foodById.get(foodId);
    if (item) {
      map.set(normalize(alias), item);
    }
  }

  return map;
}

function normalize(value: string): string {
  const lowered = value.trim().toLocaleLowerCase("tr-TR");
  const asciiFriendly = lowered
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u");

  return asciiFriendly
    .replace(/['’`´"]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function round1(value: number): number {
  return Number(value.toFixed(1));
}

function scaleMacros(per100g: FoodMacroBreakdown, grams: number): FoodMacroBreakdown {
  const ratio = grams / 100;

  return {
    proteinG: round1(per100g.proteinG * ratio),
    fatG: round1(per100g.fatG * ratio),
    carbG: round1(per100g.carbG * ratio),
    calories: round1(per100g.calories * ratio)
  };
}

function addMacros(a: FoodMacroBreakdown, b: FoodMacroBreakdown): FoodMacroBreakdown {
  return {
    proteinG: round1(a.proteinG + b.proteinG),
    fatG: round1(a.fatG + b.fatG),
    carbG: round1(a.carbG + b.carbG),
    calories: round1(a.calories + b.calories)
  };
}

function parseSegment(
  segment: string
): { quantity: number; unitRaw: string; foodRaw: string; assumedQuantity: boolean } | null {
  const trimmed = segment.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) {
    // Try "food_name qty[unit]" format, e.g. "pilav 150g" or "tavuk 200 gr"
    const foodFirstMatch = trimmed.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)?\s*$/);
    if (foodFirstMatch) {
      const foodStr = foodFirstMatch[1] ?? "";
      const qty = Number((foodFirstMatch[2] ?? "100").replace(",", "."));
      const unitStr = normalize(foodFirstMatch[3] ?? "");
      const foodRaw = normalize(foodStr);
      if (foodRaw && Number.isFinite(qty) && qty > 0) {
        return { quantity: qty, unitRaw: unitStr, foodRaw, assumedQuantity: false };
      }
    }

    const foodRaw = normalize(trimmed);
    if (!foodRaw) return null;
    return {
      quantity: 1,
      unitRaw: "",
      foodRaw,
      assumedQuantity: true
    };
  }

  const quantity = Number(match[1].replace(",", "."));
  const remainder = (match[2] ?? "").trim();

  if (!remainder) return null;

  const firstSpaceIndex = remainder.indexOf(" ");
  const firstToken = normalize(firstSpaceIndex === -1 ? remainder : remainder.slice(0, firstSpaceIndex));
  const isUnitToken =
    GRAM_UNITS.has(firstToken) ||
    PIECE_UNITS.has(firstToken) ||
    ML_UNITS.has(firstToken) ||
    SCOOP_UNITS.has(firstToken);
  const restAfterUnit =
    isUnitToken && firstSpaceIndex !== -1 ? remainder.slice(firstSpaceIndex + 1) : "";

  const unitRaw = isUnitToken ? firstToken : "";
  const foodRaw = normalize(isUnitToken ? restAfterUnit : remainder);

  if (!Number.isFinite(quantity) || quantity <= 0 || !foodRaw) return null;

  return { quantity, unitRaw, foodRaw, assumedQuantity: false };
}

function resolveUnit(item: FoodCatalogItem, unitRaw: string): ParsedUnit | null {
  if (!unitRaw) return item.pieceToGram ? "piece" : "g";
  if (GRAM_UNITS.has(unitRaw)) return "g";
  if (PIECE_UNITS.has(unitRaw)) return "piece";
  if (ML_UNITS.has(unitRaw)) return "ml";
  if (SCOOP_UNITS.has(unitRaw)) return "scoop";
  return null;
}

export function parseFoodInput(input: string, locale: "tr" | "en" = "en"): ParsedFoodResult {
  const segments = input
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const items: ParsedFoodItem[] = [];
  const issues: ParseIssue[] = [];

  for (const rawSegment of segments) {
    const parsed = parseSegment(rawSegment);
    if (!parsed) {
      issues.push({
        segment: rawSegment,
        reason: "Could not parse quantity and food name."
      });
      continue;
    }

    const food = ALIAS_TO_FOOD.get(parsed.foodRaw);
    if (!food) {
      issues.push({
        segment: rawSegment,
        reason: `Unknown food: "${parsed.foodRaw}".`
      });
      continue;
    }

    const unit = resolveUnit(food, parsed.unitRaw);
    if (!unit) {
      issues.push({
        segment: rawSegment,
        reason: `Unsupported unit: "${parsed.unitRaw}". Use g/gr, ml, piece/adet, or scoop/olcek.`
      });
      continue;
    }

    if (unit === "piece" && !food.pieceToGram) {
      issues.push({
        segment: rawSegment,
        reason: `${food.displayName} does not support piece-based input.`
      });
      continue;
    }

    if (unit === "ml" && !food.mlToGram) {
      issues.push({
        segment: rawSegment,
        reason: `${food.displayName} does not support ml-based input.`
      });
      continue;
    }

    if (unit === "scoop" && !food.scoopToGram) {
      issues.push({
        segment: rawSegment,
        reason: `${food.displayName} does not support scoop-based input.`
      });
      continue;
    }

    // For assumed-quantity inputs, default to 100 g for gram-based foods and
    // 1 piece for piece-based foods (parseSegment returns quantity:1 / unitRaw:"").
    const quantity = parsed.assumedQuantity && unit === "g" ? 100 : parsed.quantity;

    let grams = quantity;

    if (unit === "piece") {
      grams = quantity * (food.pieceToGram as number);
    } else if (unit === "ml") {
      grams = quantity * (food.mlToGram as number);
    } else if (unit === "scoop") {
      grams = quantity * (food.scoopToGram as number);
    }

    const macros = scaleMacros(food.per100g, grams);

    items.push({
      rawSegment,
      foodId: food.id,
      foodName: locale === "tr" ? food.displayNameTr : food.displayNameEn,
      quantity,
      unit,
      grams: round1(grams),
      macros
    });

    if (parsed.assumedQuantity) {
      const assumed = unit === "piece" ? "1 piece" : "100 g";
      issues.push({
        segment: rawSegment,
        reason: `Missing quantity. Assumed ${assumed}.`
      });
    }
  }

  const totals = items.reduce<FoodMacroBreakdown>(
    (sum, item) => addMacros(sum, item.macros),
    { proteinG: 0, fatG: 0, carbG: 0, calories: 0 }
  );

  return {
    items,
    totals,
    issues
  };
}
