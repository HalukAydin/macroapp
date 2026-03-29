import { describe, expect, it } from "vitest";
import { parseFoodInput } from "../src/parsing/foodParser";

function round1(value: number): number {
  return Number(value.toFixed(1));
}

function sumItemMacros(input: ReturnType<typeof parseFoodInput>) {
  return input.items.reduce(
    (sum, item) => ({
      proteinG: round1(sum.proteinG + item.macros.proteinG),
      fatG: round1(sum.fatG + item.macros.fatG),
      carbG: round1(sum.carbG + item.macros.carbG),
      calories: round1(sum.calories + item.macros.calories)
    }),
    { proteinG: 0, fatG: 0, carbG: 0, calories: 0 }
  );
}

describe("food parser", () => {
  describe("quantity format normalization", () => {
    it("parses 100gr / 100 gr / 100g / 100 g consistently", () => {
      const inputs = ["100gr tavuk", "100 gr tavuk", "100g tavuk", "100 g tavuk"];
      const baseline = parseFoodInput(inputs[0]).items[0];

      expect(baseline).toBeDefined();

      for (const input of inputs) {
        const result = parseFoodInput(input);
        expect(result.issues).toHaveLength(0);
        expect(result.items).toHaveLength(1);
        expect(result.items[0]?.foodId).toBe(baseline?.foodId);
        expect(result.items[0]?.unit).toBe(baseline?.unit);
        expect(result.items[0]?.grams).toBe(baseline?.grams);
        expect(result.items[0]?.macros).toEqual(baseline?.macros);
        expect(result.totals).toEqual({
          proteinG: 31,
          fatG: 3.6,
          carbG: 0,
          calories: 165
        });
      }
    });
  });

  describe("Turkish alias resolution", () => {
    it("resolves key Turkish aliases", () => {
      const cases: Array<{ input: string; foodId: string; grams: number }> = [
        { input: "75gr kıyma", foodId: "ground_beef", grams: 75 },
        { input: "100g dana kıyma", foodId: "ground_beef", grams: 100 },
        { input: "100g pilav", foodId: "cooked_rice", grams: 100 },
        { input: "100g pirinç pilavı", foodId: "cooked_rice", grams: 100 },
        { input: "100gr karpuz", foodId: "watermelon", grams: 100 },
        { input: "1 yumurta", foodId: "egg", grams: 50 },
        { input: "100g yoğurt", foodId: "yogurt", grams: 100 }
      ];

      for (const testCase of cases) {
        const result = parseFoodInput(testCase.input);
        expect(result.issues).toHaveLength(0);
        expect(result.items).toHaveLength(1);
        expect(result.items[0]?.foodId).toBe(testCase.foodId);
        expect(result.items[0]?.grams).toBe(testCase.grams);
      }
    });
  });

  describe("English alias resolution", () => {
    it("resolves common English food names", () => {
      const cases: Array<{ input: string; foodId: string; grams: number }> = [
        { input: "100g ground beef", foodId: "ground_beef", grams: 100 },
        { input: "100g cooked rice", foodId: "cooked_rice", grams: 100 },
        { input: "100g watermelon", foodId: "watermelon", grams: 100 },
        { input: "1 egg", foodId: "egg", grams: 50 },
        { input: "100g yogurt", foodId: "yogurt", grams: 100 },
        { input: "100g oats", foodId: "oats", grams: 100 },
        { input: "100g chicken", foodId: "chicken_breast", grams: 100 }
      ];

      for (const testCase of cases) {
        const result = parseFoodInput(testCase.input);
        expect(result.issues).toHaveLength(0);
        expect(result.items).toHaveLength(1);
        expect(result.items[0]?.foodId).toBe(testCase.foodId);
        expect(result.items[0]?.grams).toBe(testCase.grams);
      }
    });
  });

  describe("piece-based parsing", () => {
    it("parses piece-based eggs", () => {
      const result = parseFoodInput("2 yumurta");

      expect(result.issues).toHaveLength(0);
      expect(result.items[0]?.grams).toBe(100);
      expect(result.items[0]?.macros).toEqual({
        proteinG: 13,
        fatG: 11,
        carbG: 1.1,
        calories: 155
      });
    });

    it("parses piece-based banana", () => {
      const result = parseFoodInput("1 muz");

      expect(result.issues).toHaveLength(0);
      expect(result.items[0]?.grams).toBe(120);
      expect(result.items[0]?.macros).toEqual({
        proteinG: 1.3,
        fatG: 0.4,
        carbG: 27.4,
        calories: 106.8
      });
    });
  });

  describe("multi-item parsing and aggregation", () => {
    it("parses mixed Turkish multi-item input", () => {
      const result = parseFoodInput("2 yumurta, 80g yulaf, 150g tavuk");

      expect(result.issues).toHaveLength(0);
      expect(result.items).toHaveLength(3);
      expect(result.totals).toEqual({
        proteinG: 73,
        fatG: 21.9,
        carbG: 54.1,
        calories: 713.7
      });
    });

    it("parses pilav + kıyma combo", () => {
      const result = parseFoodInput("100g pilav, 150g kıyma");

      expect(result.issues).toHaveLength(0);
      expect(result.items).toHaveLength(2);
      expect(result.totals).toEqual({
        proteinG: 41.7,
        fatG: 25.8,
        carbG: 28,
        calories: 511
      });
    });

    it("totals are exactly the sum of parsed item macros", () => {
      const result = parseFoodInput("100g pilav, 150g kıyma, 100g yoğurt");
      expect(result.issues).toHaveLength(0);
      expect(result.totals).toEqual(sumItemMacros(result));
    });
  });

  describe("low-confidence and unknown input behavior", () => {
    it("returns clear issue for random text", () => {
      const result = parseFoodInput("rastgele anlamsiz ifade");

      expect(result.items).toHaveLength(0);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]?.reason).toContain("Unknown food");
    });

    it("returns issue for unsupported product names", () => {
      const result = parseFoodInput("100g uzay meyvesi");

      expect(result.items).toHaveLength(0);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]?.reason).toContain("Unknown food");
    });

    it("keeps recognized items and reports unrecognized segments", () => {
      const result = parseFoodInput("100g tavuk, random text");

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.foodId).toBe("chicken_breast");
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]?.segment).toBe("random text");
    });
  });

  describe("brand-like input behavior", () => {
    it("handles Eti Lifalif with clear fallback behavior", () => {
      const result = parseFoodInput("Eti Lifalif");

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.foodId).toBe("oats");
      expect(result.items[0]?.grams).toBe(100);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]?.reason).toBe("Missing quantity. Assumed 100 g.");
    });
  });
});
