import { useMemo, useState, type FormEvent } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useProfileStore } from "../store/useProfileStore";

function todayIsoDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function WeightLog() {
  const weightEntries = useProfileStore((s) => s.weightEntries);
  const weightTrend = useProfileStore((s) => s.weightTrend);
  const addWeightEntry = useProfileStore((s) => s.addWeightEntry);

  const [date, setDate] = useState(todayIsoDate());
  const [weightInput, setWeightInput] = useState("");

  const latest = weightEntries.at(-1);
  const sortedDesc = useMemo(() => [...weightEntries].reverse(), [weightEntries]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedWeight = Number(weightInput);
    if (!date || Number.isNaN(parsedWeight) || parsedWeight <= 0) return;

    addWeightEntry({
      date,
      weightKg: parsedWeight
    });

    setWeightInput("");
  };

  return (
    <div style={{ display: "grid", gap: 20, marginTop: 24 }}>
      <section style={{ border: "1px solid #2f3542", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Weight Log</h2>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 380 }}>
          <label style={{ display: "grid", gap: 6 }}>
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            Weight (kg)
            <input
              type="number"
              step="0.1"
              min="20"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              required
            />
          </label>

          <button type="submit" style={{ width: "fit-content" }}>
            Save Entry
          </button>
        </form>
      </section>

      <section style={{ border: "1px solid #2f3542", borderRadius: 12, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Trend Chart</h3>
        {weightTrend.length === 0 ? (
          <div>No entries yet.</div>
        ) : (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={weightTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weightKg"
                  stroke="#2ed573"
                  strokeWidth={2}
                  name="Weight (kg)"
                />
                <Line
                  type="monotone"
                  dataKey="trendKg"
                  stroke="#1e90ff"
                  strokeWidth={2}
                  dot={false}
                  name="EMA Trend (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section style={{ border: "1px solid #2f3542", borderRadius: 12, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Entries</h3>
        {sortedDesc.length === 0 ? (
          <div>No weight entries yet.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
            {sortedDesc.map((entry) => (
              <li key={entry.date}>
                {entry.date}: <b>{entry.weightKg.toFixed(1)} kg</b>
              </li>
            ))}
          </ul>
        )}

        {latest && (
          <div style={{ marginTop: 12 }}>
            Latest: <b>{latest.date}</b> at <b>{latest.weightKg.toFixed(1)} kg</b>
          </div>
        )}
      </section>
    </div>
  );
}
