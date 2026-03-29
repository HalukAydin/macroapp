import { useProfileStore } from "../store/useProfileStore";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Dashboard() {
  const profile = useProfileStore((s) => s.profile);
  const tdee = useProfileStore((s) => s.tdee);
  const targetCalories = useProfileStore((s) => s.targetCalories);
  const macros = useProfileStore((s) => s.macros);
  const weightTrend = useProfileStore((s) => s.weightTrend);
  const foodLog = useProfileStore((s) => s.foodLog);
  const lastFoodEstimate = useProfileStore((s) => s.lastFoodEstimate);
  const estimateFood = useProfileStore((s) => s.estimateFood);
  const reset = useProfileStore((s) => s.reset);
  const [quickAddInput, setQuickAddInput] = useState("");

  const latestPoint = weightTrend.at(-1) ?? null;
  const firstPoint = weightTrend[0] ?? null;
  const trendDelta =
    latestPoint && firstPoint ? Number((latestPoint.trendKg - firstPoint.trendKg).toFixed(2)) : null;
  const recentFoodLog = foodLog.slice(-5).reverse();

  if (!profile) {
    return <div style={{ marginTop: 16 }}>No profile saved yet.</div>;
  }

  const onEstimate = () => {
    estimateFood(quickAddInput);
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h2>Dashboard</h2>

      <div style={{ display: "grid", gap: 8 }}>
        <div>TDEE: <b>{tdee}</b> kcal</div>
        <div>Target: <b>{targetCalories}</b> kcal</div>
        <div>
          Macros:{" "}
          <b>
            P {macros?.proteinG}g / F {macros?.fatG}g / C {macros?.carbG}g
          </b>
        </div>
        <div>
          Weight trend:{" "}
          {latestPoint ? (
            <b>
              {latestPoint.trendKg} kg ({trendDelta && trendDelta > 0 ? "+" : ""}
              {trendDelta} kg)
            </b>
          ) : (
            <span>
              No data yet. <Link to="/log">Add weight entries</Link>.
            </span>
          )}
        </div>
      </div>

      <button onClick={reset} style={{ marginTop: 16 }}>
        Reset Profile
      </button>

      <section style={{ marginTop: 28, display: "grid", gap: 10, maxWidth: 620 }}>
        <h3 style={{ margin: 0 }}>Quick Add (Estimate)</h3>
        <textarea
          value={quickAddInput}
          onChange={(e) => setQuickAddInput(e.target.value)}
          rows={3}
          placeholder="2 yumurta, 80g yulaf, 150g tavuk"
          style={{ width: "100%", padding: 10, resize: "vertical" }}
        />
        <button onClick={onEstimate} style={{ width: 120 }}>
          Estimate
        </button>

        {lastFoodEstimate ? (
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              Protein: <b>{lastFoodEstimate.totals.proteinG} g</b>
            </div>
            <div>
              Fat: <b>{lastFoodEstimate.totals.fatG} g</b>
            </div>
            <div>
              Carb: <b>{lastFoodEstimate.totals.carbG} g</b>
            </div>
            <div>
              Calories: <b>{lastFoodEstimate.totals.calories} kcal</b>
            </div>
            {lastFoodEstimate.issues.length > 0 ? (
              <div style={{ color: "#eab308" }}>
                {lastFoodEstimate.issues.map((issue) => issue.segment).join(", ")} could not be parsed.
              </div>
            ) : null}
          </div>
        ) : null}

        <div style={{ marginTop: 6 }}>
          <h4 style={{ margin: "0 0 8px 0" }}>Daily Log</h4>
          {recentFoodLog.length === 0 ? (
            <div>No food estimate added yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {recentFoodLog.map((entry, index) => (
                <div
                  key={`${entry.date}-${entry.rawInput}-${index}`}
                  style={{ border: "1px solid #333", borderRadius: 8, padding: 10 }}
                >
                  <div>
                    <b>{entry.date}</b> - {entry.rawInput}
                  </div>
                  <div>
                    P {entry.totals.proteinG}g / F {entry.totals.fatG}g / C {entry.totals.carbG}g /{" "}
                    {entry.totals.calories} kcal
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
