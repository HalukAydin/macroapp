import type { FoodMacroBreakdown } from "@macro/core";

export type ExternalFoodSource = "open_food_facts";

export type FoodSearchCandidate = {
  id: string;
  source: ExternalFoodSource;
  name: string;
  brand?: string;
  per100g: FoodMacroBreakdown;
};

export type FoodSearchResult = {
  query: string;
  items: FoodSearchCandidate[];
  fromCache: boolean;
};
