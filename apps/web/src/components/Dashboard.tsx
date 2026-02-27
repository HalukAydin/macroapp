import { useProfileStore } from "../store/useProfileStore";

export default function Dashboard() {
  const profile = useProfileStore((s) => s.profile);
  const tdee = useProfileStore((s) => s.tdee);
  const targetCalories = useProfileStore((s) => s.targetCalories);
  const macros = useProfileStore((s) => s.macros);
  const reset = useProfileStore((s) => s.reset);

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
      </div>

      <button onClick={reset} style={{ marginTop: 16 }}>
        Reset Profile
      </button>
    </div>
  );
}