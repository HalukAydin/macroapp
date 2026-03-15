export interface FoodMacroBreakdown {
  proteinG: number;
  fatG: number;
  carbG: number;
  calories: number;
}

export interface FoodCatalogItem {
  id:
    | "egg"
    | "whey_protein"
    | "oats"
    | "peanut_butter"
    | "chicken_breast"
    | "cooked_rice"
    | "yogurt"
    | "greek_yogurt"
    | "banana"
    | "bread"
    | "cheese"
    | "milk"
    | "beef"
    | "ground_beef"
    | "tuna"
    | "watermelon"
    | "apple"
    | "potato_boiled"
    | "pasta_cooked"
    | "olive_oil"
    | "lentils_cooked"
    | "chickpeas_cooked"
    | "salmon";
  displayName: string;
  aliases: string[];
  per100g: FoodMacroBreakdown;
  pieceToGram?: number;
  mlToGram?: number;
  scoopToGram?: number;
}

export const FOOD_CATALOG: FoodCatalogItem[] = [
  {
    id: "egg",
    displayName: "Egg",
    aliases: ["egg", "eggs", "yumurta", "yumurtalar"],
    per100g: {
      proteinG: 13,
      fatG: 11,
      carbG: 1.1,
      calories: 155
    },
    pieceToGram: 50
  },
  {
    id: "whey_protein",
    displayName: "Whey Protein",
    aliases: [
      "whey",
      "whey protein",
      "protein powder",
      "protein tozu",
      "whey powder",
      "whey isolate"
    ],
    per100g: {
      proteinG: 80,
      fatG: 6,
      carbG: 8,
      calories: 400
    },
    scoopToGram: 30
  },
  {
    id: "oats",
    displayName: "Oats",
    aliases: [
      "oats",
      "oatmeal",
      "oat",
      "yulaf",
      "yulaf ezmesi",
      "eti lifalif",
      "lifalif"
    ],
    per100g: {
      proteinG: 16.9,
      fatG: 6.9,
      carbG: 66.3,
      calories: 389
    }
  },
  {
    id: "peanut_butter",
    displayName: "Peanut Butter",
    aliases: ["peanut butter", "fistik ezmesi", "fıstık ezmesi"],
    per100g: {
      proteinG: 25,
      fatG: 50,
      carbG: 20,
      calories: 588
    }
  },
  {
    id: "chicken_breast",
    displayName: "Chicken Breast",
    aliases: ["chicken breast", "chicken", "breast", "tavuk", "tavuk gogsu", "tavuk gogus"],
    per100g: {
      proteinG: 31,
      fatG: 3.6,
      carbG: 0,
      calories: 165
    }
  },
  {
    id: "cooked_rice",
    displayName: "Cooked Rice",
    aliases: [
      "rice",
      "cooked rice",
      "pilav",
      "pirinc",
      "pirinç",
      "pirinc pilavi",
      "pirinç pilavı",
      "pirinc pilavi"
    ],
    per100g: {
      proteinG: 2.7,
      fatG: 0.3,
      carbG: 28,
      calories: 130
    }
  },
  {
    id: "yogurt",
    displayName: "Yogurt",
    aliases: ["yogurt", "yoghurt", "yoğurt"],
    per100g: {
      proteinG: 3.5,
      fatG: 3.3,
      carbG: 4.7,
      calories: 61
    },
    mlToGram: 1
  },
  {
    id: "greek_yogurt",
    displayName: "Greek Yogurt",
    aliases: ["greek yogurt", "greek yoghurt", "suzme yogurt", "süzme yoğurt"],
    per100g: {
      proteinG: 10,
      fatG: 5,
      carbG: 3.6,
      calories: 97
    },
    mlToGram: 1
  },
  {
    id: "banana",
    displayName: "Banana",
    aliases: ["banana", "bananas", "muz"],
    per100g: {
      proteinG: 1.1,
      fatG: 0.3,
      carbG: 22.8,
      calories: 89
    },
    pieceToGram: 120
  },
  {
    id: "bread",
    displayName: "Bread",
    aliases: ["bread", "ekmek"],
    per100g: {
      proteinG: 9,
      fatG: 3.2,
      carbG: 49,
      calories: 265
    }
  },
  {
    id: "cheese",
    displayName: "Cheese",
    aliases: ["cheese", "peynir", "kasar", "kasar peyniri"],
    per100g: {
      proteinG: 17,
      fatG: 20,
      carbG: 2,
      calories: 264
    }
  },
  {
    id: "milk",
    displayName: "Milk",
    aliases: ["milk", "sut", "süt"],
    per100g: {
      proteinG: 3.3,
      fatG: 3.4,
      carbG: 4.8,
      calories: 61
    },
    mlToGram: 1
  },
  {
    id: "beef",
    displayName: "Beef",
    aliases: ["beef", "dana", "dana eti"],
    per100g: {
      proteinG: 26,
      fatG: 15,
      carbG: 0,
      calories: 250
    }
  },
  {
    id: "ground_beef",
    displayName: "Ground Beef",
    aliases: ["ground beef", "minced beef", "kiyma", "kıyma", "dana kiyma", "dana kıyma"],
    per100g: {
      proteinG: 26,
      fatG: 17,
      carbG: 0,
      calories: 254
    }
  },
  {
    id: "tuna",
    displayName: "Tuna",
    aliases: ["tuna", "tuna fish", "ton baligi", "ton balığı"],
    per100g: {
      proteinG: 24,
      fatG: 1,
      carbG: 0,
      calories: 116
    }
  },
  {
    id: "watermelon",
    displayName: "Watermelon",
    aliases: ["watermelon", "karpuz"],
    per100g: {
      proteinG: 0.6,
      fatG: 0.2,
      carbG: 7.6,
      calories: 30
    }
  },
  {
    id: "apple",
    displayName: "Apple",
    aliases: ["apple", "elma"],
    per100g: {
      proteinG: 0.3,
      fatG: 0.2,
      carbG: 13.8,
      calories: 52
    },
    pieceToGram: 180
  },
  {
    id: "potato_boiled",
    displayName: "Boiled Potato",
    aliases: ["boiled potato", "potato", "patates", "haslanmis patates", "haşlanmış patates"],
    per100g: {
      proteinG: 1.9,
      fatG: 0.1,
      carbG: 20.1,
      calories: 87
    }
  },
  {
    id: "pasta_cooked",
    displayName: "Cooked Pasta",
    aliases: ["pasta", "makarna", "cooked pasta", "haslanmis makarna", "haşlanmış makarna"],
    per100g: {
      proteinG: 5.8,
      fatG: 0.9,
      carbG: 30.9,
      calories: 158
    }
  },
  {
    id: "olive_oil",
    displayName: "Olive Oil",
    aliases: ["olive oil", "zeytinyagi", "zeytinyağı"],
    per100g: {
      proteinG: 0,
      fatG: 100,
      carbG: 0,
      calories: 884
    }
  },
  {
    id: "lentils_cooked",
    displayName: "Cooked Lentils",
    aliases: ["lentils", "lentil", "mercimek", "haslanmis mercimek", "haşlanmış mercimek"],
    per100g: {
      proteinG: 9,
      fatG: 0.4,
      carbG: 20,
      calories: 116
    }
  },
  {
    id: "chickpeas_cooked",
    displayName: "Cooked Chickpeas",
    aliases: ["chickpeas", "chickpea", "nohut", "haslanmis nohut", "haşlanmış nohut"],
    per100g: {
      proteinG: 8.9,
      fatG: 2.6,
      carbG: 27.4,
      calories: 164
    }
  },
  {
    id: "salmon",
    displayName: "Salmon",
    aliases: ["salmon", "somon"],
    per100g: {
      proteinG: 20.4,
      fatG: 13.4,
      carbG: 0,
      calories: 208
    }
  }
];
