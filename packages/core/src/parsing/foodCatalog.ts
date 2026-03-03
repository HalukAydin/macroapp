export interface FoodMacroBreakdown {
  proteinG: number;
  fatG: number;
  carbG: number;
  calories: number;
}

export interface FoodCatalogItem {
  id: "egg" | "oats" | "chicken_breast" | "rice";
  displayName: string;
  aliases: string[];
  per100g: FoodMacroBreakdown;
  pieceToGram?: number;
}

export const FOOD_CATALOG: FoodCatalogItem[] = [
  {
    id: "egg",
    displayName: "Egg",
    aliases: ["egg", "eggs", "yumurta"],
    per100g: {
      proteinG: 13,
      fatG: 11,
      carbG: 1.1,
      calories: 155
    },
    pieceToGram: 50
  },
  {
    id: "oats",
    displayName: "Oats",
    aliases: ["oats", "oatmeal", "yulaf"],
    per100g: {
      proteinG: 16.9,
      fatG: 6.9,
      carbG: 66.3,
      calories: 389
    }
  },
  {
    id: "chicken_breast",
    displayName: "Chicken Breast",
    aliases: ["chicken breast", "chicken", "tavuk", "tavuk gogsu"],
    per100g: {
      proteinG: 31,
      fatG: 3.6,
      carbG: 0,
      calories: 165
    }
  },
  {
    id: "rice",
    displayName: "Rice",
    aliases: ["rice", "pirinc"],
    per100g: {
      proteinG: 2.7,
      fatG: 0.3,
      carbG: 28,
      calories: 130
    }
  }
];
