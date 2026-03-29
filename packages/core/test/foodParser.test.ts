import { describe, expect, it } from "vitest";
import { parseFoodInput } from "../src/parsing/foodParser";

describe("food parser", () => {
  it("parses Turkish quick-add input and calculates macro totals", () => {
    const result = parseFoodInput("2 yumurta, 80g yulaf");

    expect(result.issues).toHaveLength(0);
    expect(result.items).toHaveLength(2);
    expect(result.totals).toEqual({
      proteinG: 26.5,
      fatG: 16.5,
      carbG: 54.1,
      calories: 466.2
    });
  });

  it("applies piece-to-gram conversion for eggs", () => {
    const result = parseFoodInput("3 adet yumurta");

    expect(result.issues).toHaveLength(0);
    expect(result.items[0]?.grams).toBe(150);
    expect(result.items[0]?.macros).toEqual({
      proteinG: 19.5,
      fatG: 16.5,
      carbG: 1.7,
      calories: 232.5
    });
  });

  it("returns issues for unknown foods and unsupported units", () => {
    const result = parseFoodInput("200ml rice, 100g salmon");

    expect(result.items).toHaveLength(0);
    expect(result.issues).toHaveLength(2);
  });

  it("defaults to grams for foods without piece conversion", () => {
    const result = parseFoodInput("150 chicken breast");

    expect(result.issues).toHaveLength(0);
    expect(result.items[0]?.grams).toBe(150);
    expect(result.totals).toEqual({
      proteinG: 46.5,
      fatG: 5.4,
      carbG: 0,
      calories: 247.5
    });
  });
});
