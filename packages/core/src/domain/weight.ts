export interface WeightEntry {
  date: string; // ISO: "2026-02-24"
  weightKg: number;
}

export interface WeightTrendPoint {
  date: string;
  weightKg: number;
  trendKg: number;
}

export function sortEntries(entries: WeightEntry[]): WeightEntry[] {
  return [...entries].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

export function upsertWeightEntry(
  entries: WeightEntry[],
  entry: WeightEntry
): WeightEntry[] {
  const filtered = entries.filter(e => e.date !== entry.date);
  return sortEntries([...filtered, entry]);
}

// Exponential Moving Average
export function emaTrend(
  entries: WeightEntry[],
  alpha = 0.3
): WeightTrendPoint[] {
  const sorted = sortEntries(entries);

  let prevTrend: number | null = null;

  return sorted.map(e => {
    if (prevTrend === null) {
      prevTrend = e.weightKg;
    } else {
      prevTrend = alpha * e.weightKg + (1 - alpha) * prevTrend;
    }

    return {
      date: e.date,
      weightKg: e.weightKg,
      trendKg: Number(prevTrend.toFixed(2))
    };
  });
}