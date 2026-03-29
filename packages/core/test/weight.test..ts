import { describe, it, expect } from "vitest";
import { upsertWeightEntry, emaTrend } from "../src/domain/weight";

describe("weight", () => {
  it("upserts weight entry by date", () => {
    const entries = [
      { date: "2026-02-20", weightKg: 80 },
      { date: "2026-02-21", weightKg: 79.5 }
    ];

    const updated = upsertWeightEntry(entries, {
      date: "2026-02-21",
      weightKg: 79
    });

    expect(updated.length).toBe(2);
    expect(updated.find(e => e.date === "2026-02-21")?.weightKg).toBe(79);
  });

  it("calculates EMA trend", () => {
    const entries = [
      { date: "2026-02-20", weightKg: 80 },
      { date: "2026-02-21", weightKg: 79 },
      { date: "2026-02-22", weightKg: 78 }
    ];

    const trend = emaTrend(entries, 0.5);

    expect(trend.length).toBe(3);
    expect(trend[0].trendKg).toBe(80);
    expect(trend[1].trendKg).toBe(79.5);
    expect(trend[2].trendKg).toBe(78.75);
  });
});