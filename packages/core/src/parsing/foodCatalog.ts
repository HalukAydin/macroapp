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
  displayNameTr: string;
  displayNameEn: string;
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
    displayNameTr: "Yumurta",
    displayNameEn: "Egg",
    aliases: ["egg", "eggs", "yumurta", "yumurtalar"],
    per100g: {
      proteinG: 13,
      fatG: 11,
      carbG: 1.1,
      calories: 155
    },
    pieceToGram: 60
  },
  {
    id: "whey_protein",
    displayName: "Whey Protein",
    displayNameTr: "Whey Protein",
    displayNameEn: "Whey Protein",
    aliases: [
      "whey",
      "whey protein",
      "protein powder",
      "protein tozu",
      "whey powder",
      "whey isolate"
    ],
    per100g: {
      proteinG: 75,
      fatG: 6,
      carbG: 4,
      calories: 360
    },
    scoopToGram: 30
  },
  {
    id: "oats",
    displayName: "Oats",
    displayNameTr: "Yulaf",
    displayNameEn: "Oats",
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
      proteinG: 13,
      fatG: 7,
      carbG: 66,
      calories: 389
    }
  },
  {
    id: "peanut_butter",
    displayName: "Peanut Butter",
    displayNameTr: "Fıstık Ezmesi",
    displayNameEn: "Peanut Butter",
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
    displayNameTr: "Tavuk Göğsü",
    displayNameEn: "Chicken Breast",
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
    displayNameTr: "Pilav",
    displayNameEn: "Cooked Rice",
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
    displayNameTr: "Yoğurt",
    displayNameEn: "Yogurt",
    aliases: ["yogurt", "yoghurt", "yoğurt"],
    per100g: {
      proteinG: 4,
      fatG: 1.5,
      carbG: 6,
      calories: 59
    },
    mlToGram: 1
  },
  {
    id: "greek_yogurt",
    displayName: "Greek Yogurt",
    displayNameTr: "Süzme Yoğurt",
    displayNameEn: "Greek Yogurt",
    aliases: ["greek yogurt", "greek yoghurt", "suzme yogurt", "süzme yoğurt"],
    per100g: {
      proteinG: 10,
      fatG: 0.4,
      carbG: 4,
      calories: 59
    },
    mlToGram: 1
  },
  {
    id: "banana",
    displayName: "Banana",
    displayNameTr: "Muz",
    displayNameEn: "Banana",
    aliases: ["banana", "bananas", "muz"],
    per100g: {
      proteinG: 1.1,
      fatG: 0.3,
      carbG: 23,
      calories: 89
    },
    pieceToGram: 120
  },
  {
    id: "bread",
    displayName: "Bread",
    displayNameTr: "Ekmek",
    displayNameEn: "Bread",
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
    displayNameTr: "Peynir",
    displayNameEn: "Cheese",
    aliases: ["cheese", "peynir", "kasar", "kasar peyniri"],
    per100g: {
      proteinG: 25,
      fatG: 33,
      carbG: 1.3,
      calories: 402
    }
  },
  {
    id: "milk",
    displayName: "Milk",
    displayNameTr: "Süt",
    displayNameEn: "Milk",
    aliases: ["milk", "sut", "süt"],
    per100g: {
      proteinG: 3.4,
      fatG: 3.6,
      carbG: 5,
      calories: 61
    },
    mlToGram: 1
  },
  {
    id: "beef",
    displayName: "Beef",
    displayNameTr: "Dana Eti",
    displayNameEn: "Beef",
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
    displayNameTr: "Dana Kıyma",
    displayNameEn: "Ground Beef",
    aliases: ["ground beef", "minced beef", "kiyma", "kıyma", "dana kiyma", "dana kıyma"],
    per100g: {
      proteinG: 26,
      fatG: 15,
      carbG: 0,
      calories: 250
    }
  },
  {
    id: "tuna",
    displayName: "Tuna",
    displayNameTr: "Ton Balığı",
    displayNameEn: "Tuna",
    aliases: ["tuna", "tuna fish", "ton baligi", "ton balığı"],
    per100g: {
      proteinG: 30,
      fatG: 1,
      carbG: 0,
      calories: 132
    }
  },
  {
    id: "watermelon",
    displayName: "Watermelon",
    displayNameTr: "Karpuz",
    displayNameEn: "Watermelon",
    aliases: ["watermelon", "karpuz"],
    per100g: {
      proteinG: 0.6,
      fatG: 0.2,
      carbG: 8,
      calories: 30
    }
  },
  {
    id: "apple",
    displayName: "Apple",
    displayNameTr: "Elma",
    displayNameEn: "Apple",
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
    displayNameTr: "Haşlanmış Patates",
    displayNameEn: "Boiled Potato",
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
    displayNameTr: "Makarna",
    displayNameEn: "Cooked Pasta",
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
    displayNameTr: "Zeytinyağı",
    displayNameEn: "Olive Oil",
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
    displayNameTr: "Haşlanmış Mercimek",
    displayNameEn: "Cooked Lentils",
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
    displayNameTr: "Haşlanmış Nohut",
    displayNameEn: "Cooked Chickpeas",
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
    displayNameTr: "Somon",
    displayNameEn: "Salmon",
    aliases: ["salmon", "somon"],
    per100g: {
      proteinG: 20.4,
      fatG: 13.4,
      carbG: 0,
      calories: 208
    }
  }
];
