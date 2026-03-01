import { useProfileStore } from "../store/useProfileStore";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const profile = useProfileStore((s) => s.profile);
  const tdee = useProfileStore((s) => s.tdee);
  const targetCalories = useProfileStore((s) => s.targetCalories);
  const macros = useProfileStore((s) => s.macros);
  const weightTrend = useProfileStore((s) => s.weightTrend);
  const reset = useProfileStore((s) => s.reset);

  const latestPoint = weightTrend.at(-1) ?? null;
  const firstPoint = weightTrend[0] ?? null;
  const trendDelta =
    latestPoint && firstPoint ? Number((latestPoint.trendKg - firstPoint.trendKg).toFixed(2)) : null;

  if (!profile) {
    return <div style={{ marginTop: 16 }}>No profile saved yet.</div>;
  }

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
    </div>
  );
}
