import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
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
import Card from "./ui/Card";
import SectionTitle from "./ui/SectionTitle";

function todayIsoDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function WeightLog() {
  const { t } = useTranslation();
  const weightEntries = useProfileStore((s) => s.weightEntries);
  const weightTrend = useProfileStore((s) => s.weightTrend);
  const addWeightEntry = useProfileStore((s) => s.addWeightEntry);

  const [date, setDate] = useState(todayIsoDate());
  const [weightInput, setWeightInput] = useState("");
  const [formMessage, setFormMessage] = useState<{ kind: "success" | "warn"; text: string } | null>(null);

  const latest = weightEntries.at(-1);
  const sortedDesc = useMemo(() => [...weightEntries].reverse(), [weightEntries]);
  const hasEnoughTrendData = weightTrend.length >= 2;

  useEffect(() => {
    if (!formMessage) return;
    const timer = window.setTimeout(() => setFormMessage(null), 2500);
    return () => window.clearTimeout(timer);
  }, [formMessage]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedWeight = Number(weightInput);
    if (!date || Number.isNaN(parsedWeight) || parsedWeight < 20 || parsedWeight > 350) {
      setFormMessage({
        kind: "warn",
        text: t("weightLog.feedback.invalid")
      });
      return;
    }

    addWeightEntry({
      date,
      weightKg: parsedWeight
    });

    setWeightInput("");
    setFormMessage({
      kind: "success",
      text: t("weightLog.feedback.saved", {
        weight: parsedWeight.toFixed(1),
        date
      })
    });
  };

  return (
    <div className="page-stack">
      <SectionTitle title={t("weightLog.title")} subtitle={t("weightLog.subtitle")} />

      <div className="weight-log-grid">
        <div className="weight-log-column">
          <Card title={t("weightLog.addEntryTitle")}>
            <form onSubmit={onSubmit} className="card-stack">
              <label htmlFor="weight-entry-date" className="field-label">
                {t("weightLog.fields.date")}
                <input
                  id="weight-entry-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </label>

              <label htmlFor="weight-entry-value" className="field-label">
                {t("weightLog.fields.weight")}
                <input
                  id="weight-entry-value"
                  type="number"
                  step="0.1"
                  min="20"
                  max="350"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder={t("weightLog.fields.weightPlaceholder")}
                  required
                />
              </label>
              <p className="field-hint">{t("weightLog.fields.weightHint")}</p>

              <button type="submit" style={{ width: "fit-content" }}>
                {t("weightLog.buttons.saveEntry")}
              </button>

              {formMessage ? (
                <p className={`feedback feedback-${formMessage.kind}`} role="status" aria-live="polite">
                  {formMessage.text}
                </p>
              ) : null}
            </form>
          </Card>

          <Card title={t("weightLog.latestTitle")}>
            {latest ? (
              <div>
                <div className="metric-value">{latest.weightKg.toFixed(1)} kg</div>
                <p className="muted-text">{latest.date}</p>
              </div>
            ) : (
              <div className="card-stack">
                <p className="muted-text">{t("weightLog.latestEmpty1")}</p>
                <p className="muted-text">{t("weightLog.latestEmpty2")}</p>
              </div>
            )}
          </Card>
        </div>

        <div className="weight-log-column">
          <Card title={t("weightLog.trendTitle")}>
            {weightTrend.length === 0 ? (
              <p className="muted-text">{t("weightLog.trendEmptyNoEntries")}</p>
            ) : !hasEnoughTrendData ? (
              <p className="muted-text">{t("weightLog.trendEmptyNeedMore")}</p>
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
                      name={t("weightLog.chart.weightLine")}
                    />
                    <Line
                      type="monotone"
                      dataKey="trendKg"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={false}
                      name={t("weightLog.chart.emaLine")}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card title={t("weightLog.entriesTitle")}>
            {sortedDesc.length === 0 ? (
              <p className="muted-text">{t("weightLog.entriesEmpty")}</p>
            ) : (
              <ul className="entry-list-plain">
                {sortedDesc.map((entry) => (
                  <li key={entry.date}>
                    <span>{entry.date}</span>
                    <strong>{entry.weightKg.toFixed(1)} kg</strong>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
