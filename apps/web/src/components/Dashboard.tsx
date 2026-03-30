import type { FoodMacroBreakdown } from "@macro/core";
import { useProfileStore } from "../store/useProfileStore";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchOpenFoodFactsFoods } from "../lib/foodSearch/openFoodFacts";
import type { FoodSearchCandidate } from "../lib/foodSearch/types";
import Card from "./ui/Card";
import SectionTitle from "./ui/SectionTitle";

type FeedbackKind = "success" | "info" | "warn";
type ExternalLookupStatus = "idle" | "loading" | "ready" | "no_results" | "error";

function round1(value: number): number {
  return Number(value.toFixed(1));
}

function scalePer100g(per100g: FoodMacroBreakdown, grams: number): FoodMacroBreakdown {
  const ratio = grams / 100;
  return {
    proteinG: round1(per100g.proteinG * ratio),
    fatG: round1(per100g.fatG * ratio),
    carbG: round1(per100g.carbG * ratio),
    calories: round1(per100g.calories * ratio)
  };
}

function toPercent(consumed: number, target: number | null): number {
  if (!target || target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((consumed / target) * 100)));
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const profile = useProfileStore((s) => s.profile);
  const tdee = useProfileStore((s) => s.tdee);
  const targetCalories = useProfileStore((s) => s.targetCalories);
  const macros = useProfileStore((s) => s.macros);
  const weightTrend = useProfileStore((s) => s.weightTrend);
  const dailyLog = useProfileStore((s) => s.dailyLog);
  const getTodayLog = useProfileStore((s) => s.getTodayLog);
  const lastFoodEstimate = useProfileStore((s) => s.lastFoodEstimate);
  const lastFoodEstimateInput = useProfileStore((s) => s.lastFoodEstimateInput);
  const estimateFood = useProfileStore((s) => s.estimateFood);
  const addFoodEntry = useProfileStore((s) => s.addFoodEntry);
  const removeFoodEntry = useProfileStore((s) => s.removeFoodEntry);
  const clearTodayLog = useProfileStore((s) => s.clearTodayLog);
  const [quickAddInput, setQuickAddInput] = useState("");
  const [quickAddFeedback, setQuickAddFeedback] = useState<{ kind: FeedbackKind; message: string } | null>(null);
  const [externalStatus, setExternalStatus] = useState<ExternalLookupStatus>("idle");
  const [externalQuery, setExternalQuery] = useState("");
  const [externalCandidates, setExternalCandidates] = useState<FoodSearchCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<FoodSearchCandidate | null>(null);
  const [selectedGrams, setSelectedGrams] = useState("100");
  const [hadPartialLocalMatch, setHadPartialLocalMatch] = useState(false);

  const latestPoint = weightTrend.at(-1) ?? null;
  const firstPoint = weightTrend[0] ?? null;
  const trendDelta =
    latestPoint && firstPoint ? Number((latestPoint.trendKg - firstPoint.trendKg).toFixed(2)) : null;
  const todayEntries = [...dailyLog.entries].reverse();
  const trendDeltaText = trendDelta === null ? "-" : `${trendDelta > 0 ? "+" : ""}${trendDelta}`;
  const gramsValue = Number(selectedGrams);
  const hasValidGrams = Number.isFinite(gramsValue) && gramsValue > 0;
  const selectedPreview =
    selectedCandidate && hasValidGrams ? scalePer100g(selectedCandidate.per100g, gramsValue) : null;
  const isSearchingExternal = externalStatus === "loading";
  const canAddEstimateToToday = Boolean(lastFoodEstimate && lastFoodEstimate.items.length > 0 && lastFoodEstimateInput);
  const progressItems = [
    {
      key: "calories",
      label: t("dashboard.progress.calories"),
      unit: "kcal",
      consumed: dailyLog.totalCalories,
      target: targetCalories
    },
    {
      key: "protein",
      label: t("dashboard.progress.protein"),
      unit: "g",
      consumed: dailyLog.totalProtein,
      target: macros?.proteinG ?? null
    },
    {
      key: "carbs",
      label: t("dashboard.progress.carbs"),
      unit: "g",
      consumed: dailyLog.totalCarbs,
      target: macros?.carbG ?? null
    },
    {
      key: "fat",
      label: t("dashboard.progress.fat"),
      unit: "g",
      consumed: dailyLog.totalFat,
      target: macros?.fatG ?? null
    }
  ];

  useEffect(() => {
    if (!quickAddFeedback) return;
    const timer = window.setTimeout(() => setQuickAddFeedback(null), 2800);
    return () => window.clearTimeout(timer);
  }, [quickAddFeedback]);

  useEffect(() => {
    getTodayLog();
  }, [getTodayLog]);

  const goalLabel = profile ? t(`dashboard.modes.${profile.goal}`) : "";

  const clearExternalLookup = () => {
    setExternalStatus("idle");
    setExternalQuery("");
    setExternalCandidates([]);
    setSelectedCandidate(null);
    setSelectedGrams("100");
    setHadPartialLocalMatch(false);
  };

  if (!profile) {
    return (
      <div className="page-stack">
        <SectionTitle title={t("dashboard.title")} subtitle={t("dashboard.empty.subtitle")} />
        <Card>
          <div className="card-stack">
            <p>Makrolarını hesaplamak için önce profilini tamamla.</p>
            <Link to="/profile">
              <button type="button">Profili Tamamla</button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const onEstimate = async () => {
    const input = quickAddInput.trim();
    if (!input) {
      setQuickAddFeedback({
        kind: "warn",
        message: t("dashboard.quickAdd.feedback.enterFood")
      });
      return;
    }

    const locale = i18n.resolvedLanguage?.startsWith("tr") ? "tr" : "en";
    const result = estimateFood(input, locale);

    if (result.items.length > 0 && result.issues.length === 0) {
      setQuickAddFeedback({
        kind: "success",
        message: t("dashboard.quickAdd.feedback.estimateReady")
      });
      setHadPartialLocalMatch(false);
      clearExternalLookup();
      return;
    }

    const partialLocalMatch = result.items.length > 0 && result.issues.length > 0;
    setHadPartialLocalMatch(partialLocalMatch);

    if (partialLocalMatch) {
      setQuickAddFeedback({
        kind: "info",
        message: t("dashboard.quickAdd.feedback.estimateWithWarnings", { count: result.issues.length })
      });
    } else {
      setQuickAddFeedback({
        kind: "warn",
        message: t("dashboard.quickAdd.feedback.parseFailed")
      });
    }

    const fallbackQuery = result.issues[0]?.segment?.trim() || input;
    setExternalQuery(fallbackQuery);
    setExternalStatus("loading");
    setSelectedCandidate(null);
    setExternalCandidates([]);

    try {
      const lookup = await searchOpenFoodFactsFoods(fallbackQuery);
      if (lookup.items.length === 0) {
        setExternalStatus("no_results");
        return;
      }

      setExternalCandidates(lookup.items);
      setSelectedCandidate(lookup.items[0]);
      setSelectedGrams("100");
      setExternalStatus("ready");
      setQuickAddFeedback({
        kind: "info",
        message: t("dashboard.quickAdd.feedback.externalSuggestionsReady", {
          count: lookup.items.length
        })
      });
    } catch {
      setExternalStatus("error");
      setQuickAddFeedback({
        kind: "warn",
        message: t("dashboard.quickAdd.feedback.apiFailed")
      });
    }
  };

  const onAddEstimatedToToday = () => {
    if (!lastFoodEstimate || lastFoodEstimate.items.length === 0 || !lastFoodEstimateInput) {
      setQuickAddFeedback({
        kind: "warn",
        message: t("dashboard.quickAdd.feedback.noEstimateToAdd")
      });
      return;
    }

    // Re-estimate with the current UI locale so the food name always matches
    // the active language, regardless of what locale was active when the user
    // first clicked "Estimate".
    const locale = i18n.resolvedLanguage?.startsWith("tr") ? "tr" : "en";
    const localizedEstimate = estimateFood(lastFoodEstimateInput, locale);

    if (localizedEstimate.items.length === 0) {
      setQuickAddFeedback({
        kind: "warn",
        message: t("dashboard.quickAdd.feedback.noEstimateToAdd")
      });
      return;
    }

    let foodName: string;
    if (localizedEstimate.items.length === 1) {
      const item = localizedEstimate.items[0]!;
      const localizedName = item.foodName;
      if (item.unit === "piece") {
        foodName = `${item.quantity} ${localizedName}`;
      } else if (item.unit === "ml") {
        foodName = `${item.quantity}ml ${localizedName}`;
      } else if (item.unit === "scoop") {
        foodName = `${item.quantity} scoop ${localizedName}`;
      } else {
        foodName = `${item.grams}g ${localizedName}`;
      }
    } else {
      foodName = t("dashboard.quickAdd.estimatedMealName", { count: localizedEstimate.items.length });
    }

    addFoodEntry({
      foodName,
      sourceText: localizedEstimate.items.length === 1 ? foodName : lastFoodEstimateInput,
      quantityText: lastFoodEstimateInput,
      calories: localizedEstimate.totals.calories,
      protein: localizedEstimate.totals.proteinG,
      carbs: localizedEstimate.totals.carbG,
      fat: localizedEstimate.totals.fatG
    });

    setQuickAddFeedback({
      kind: "success",
      message: t("dashboard.quickAdd.feedback.addedToToday")
    });
    setQuickAddInput("");
    clearExternalLookup();
  };

  const onAddSelectedExternal = () => {
    if (!selectedCandidate || !selectedPreview || !hasValidGrams) {
      setQuickAddFeedback({
        kind: "warn",
        message: t("dashboard.quickAdd.feedback.invalidSelectedAmount")
      });
      return;
    }

    const quantityText = `${round1(gramsValue)}g`;
    addFoodEntry({
      foodName: selectedCandidate.name,
      sourceText: `${quantityText} ${selectedCandidate.name}`,
      quantityText,
      calories: selectedPreview.calories,
      protein: selectedPreview.proteinG,
      carbs: selectedPreview.carbG,
      fat: selectedPreview.fatG
    });

    setQuickAddFeedback({
      kind: "success",
      message: t("dashboard.quickAdd.feedback.externalAdded")
    });

    setQuickAddInput("");
    clearExternalLookup();
  };

  return (
    <div className="page-stack">
      <SectionTitle title={t("dashboard.title")} subtitle={t("dashboard.subtitle")} />

      <section className="summary-grid">
        <Card title={t("dashboard.summary.tdeeTitle")}>
          <div className="metric-value">{tdee ?? "-"}</div>
          <p className="muted-text">{t("dashboard.summary.kcalPerDay")}</p>
        </Card>

        <Card title={t("dashboard.summary.targetCaloriesTitle")}>
          <div className="metric-value">{targetCalories ?? "-"}</div>
          <p className="muted-text">{t("dashboard.summary.kcalPerDay")}</p>
        </Card>

        <Card title={t("dashboard.summary.macroSummaryTitle")}>
          <div className="macro-line">
            <strong>P</strong> {macros?.proteinG ?? "-"}g
          </div>
          <div className="macro-line">
            <strong>F</strong> {macros?.fatG ?? "-"}g
          </div>
          <div className="macro-line">
            <strong>C</strong> {macros?.carbG ?? "-"}g
          </div>
        </Card>

        <Card title={t("dashboard.summary.weightTrendTitle")}>
          {weightTrend.length >= 2 && latestPoint ? (
            <>
              <div className="metric-value">{latestPoint.trendKg} kg</div>
              <p className="muted-text">
                {t("dashboard.summary.trendVsFirst", { delta: trendDeltaText })}
              </p>
            </>
          ) : weightTrend.length === 1 ? (
            <p className="muted-text">
              {t("dashboard.summary.oneEntry")}
            </p>
          ) : (
            <p className="muted-text">
              {t("dashboard.summary.noWeighIns")} <Link to="/log">{t("dashboard.summary.addFirstEntry")}</Link>.
            </p>
          )}
        </Card>

        <Card title={t("dashboard.summary.todaySummaryTitle")} className="summary-wide">
          <div className="card-stack">
            <p className="muted-text">
              {t("dashboard.today.modeSentence", {
                mode: goalLabel,
                calories: targetCalories ?? "-"
              })}
            </p>
            <p className="muted-text">
              {t("dashboard.today.macroSentence", {
                protein: macros?.proteinG ?? "-",
                fat: macros?.fatG ?? "-",
                carb: macros?.carbG ?? "-"
              })}
            </p>
          </div>
        </Card>

        <Card title={t("dashboard.progress.title")} className="summary-wide">
          <div className="progress-list">
            {progressItems.map((item) => {
              const progressPercent = toPercent(item.consumed, item.target);
              return (
                <div key={item.key} className="progress-item">
                  <div className="progress-head">
                    <span>{item.label}</span>
                    <strong>
                      {round1(item.consumed)}
                      {item.unit} / {item.target ?? "-"}
                      {item.unit}
                    </strong>
                  </div>
                  <div className="progress-track" aria-hidden="true">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="muted-text">{t("dashboard.progress.percent", { percent: progressPercent })}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="dashboard-bottom-grid">
        <Card title={t("dashboard.quickAdd.title")}>
          <div className="card-stack">
            <label htmlFor="quick-add-input" className="field-label">
              {t("dashboard.quickAdd.mealInputLabel")}
              <textarea
                id="quick-add-input"
                value={quickAddInput}
                onChange={(e) => setQuickAddInput(e.target.value)}
                rows={3}
                placeholder={t("dashboard.quickAdd.placeholder")}
              />
            </label>

            <p className="muted-text">{t("dashboard.quickAdd.helper")}</p>

            <div>
              <button onClick={onEstimate} style={{ width: "120px" }} disabled={isSearchingExternal}>
                {isSearchingExternal ? t("dashboard.quickAdd.buttonLoading") : t("dashboard.quickAdd.button")}
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={onAddEstimatedToToday}
                className="button-secondary"
                disabled={!canAddEstimateToToday}
              >
                {t("dashboard.quickAdd.addToToday")}
              </button>
            </div>

            {quickAddFeedback ? (
              <p
                className={`feedback feedback-${quickAddFeedback.kind}`}
                role="status"
                aria-live="polite"
              >
                {quickAddFeedback.message}
              </p>
            ) : null}

            {!lastFoodEstimate ? (
              <p className="muted-text">{t("dashboard.quickAdd.noEstimate")}</p>
            ) : null}

            {lastFoodEstimate ? (
              <div className="estimate-grid">
                <div>
                  {t("dashboard.quickAdd.labels.protein")}: <strong>{lastFoodEstimate.totals.proteinG} g</strong>
                </div>
                <div>
                  {t("dashboard.quickAdd.labels.fat")}: <strong>{lastFoodEstimate.totals.fatG} g</strong>
                </div>
                <div>
                  {t("dashboard.quickAdd.labels.carb")}: <strong>{lastFoodEstimate.totals.carbG} g</strong>
                </div>
                <div>
                  {t("dashboard.quickAdd.labels.calories")}: <strong>{lastFoodEstimate.totals.calories} kcal</strong>
                </div>
                {lastFoodEstimate.issues.length > 0 ? (
                  <div className="warning-text">
                    {lastFoodEstimate.issues.slice(0, 3).map((issue, index) => (
                      <div key={`${issue.segment}-${index}`}>
                        {t("dashboard.quickAdd.issueUnparsed", { segment: issue.segment })}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {hadPartialLocalMatch ? (
              <p className="feedback feedback-info">{t("dashboard.quickAdd.external.partialLocalMatch")}</p>
            ) : null}

            {externalStatus === "loading" ? (
              <p className="muted-text">
                {t("dashboard.quickAdd.external.loading", { query: externalQuery })}
              </p>
            ) : null}

            {externalStatus === "no_results" ? (
              <div className="card-stack">
                <p className="muted-text">
                  {t("dashboard.quickAdd.external.noResults", { query: externalQuery })}
                </p>
                <p className="muted-text">{t("dashboard.quickAdd.external.noResultsHint")}</p>
              </div>
            ) : null}

            {externalStatus === "error" ? (
              <p className="feedback feedback-warn">{t("dashboard.quickAdd.external.apiFailure")}</p>
            ) : null}

            {externalStatus === "ready" && externalCandidates.length > 0 ? (
              <div className="card-stack">
                <h4 className="subsection-title">{t("dashboard.quickAdd.external.resultsTitle")}</h4>
                <p className="muted-text">{t("dashboard.quickAdd.external.selectPrompt")}</p>

                <div className="candidate-list">
                  {externalCandidates.map((candidate) => (
                    <button
                      key={`${candidate.source}-${candidate.id}`}
                      type="button"
                      className={
                        selectedCandidate?.id === candidate.id
                          ? "candidate-item candidate-item-selected"
                          : "candidate-item"
                      }
                      onClick={() => setSelectedCandidate(candidate)}
                    >
                      <span className="candidate-title">{candidate.name}</span>
                      {candidate.brand ? (
                        <span className="candidate-subtitle">{candidate.brand}</span>
                      ) : null}
                      <span className="candidate-subtitle">
                        {t("dashboard.quickAdd.external.per100", {
                          protein: candidate.per100g.proteinG,
                          fat: candidate.per100g.fatG,
                          carb: candidate.per100g.carbG,
                          calories: candidate.per100g.calories
                        })}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedCandidate ? (
                  <div className="selected-preview">
                    <h4 className="subsection-title">
                      {t("dashboard.quickAdd.external.previewTitle", { food: selectedCandidate.name })}
                    </h4>
                    <label htmlFor="selected-food-grams" className="field-label">
                      {t("dashboard.quickAdd.external.amountLabel")}
                      <input
                        id="selected-food-grams"
                        type="number"
                        step="1"
                        min="1"
                        value={selectedGrams}
                        onChange={(event) => setSelectedGrams(event.target.value)}
                      />
                    </label>
                    {selectedPreview ? (
                      <div className="estimate-grid">
                        <div>
                          {t("dashboard.quickAdd.labels.protein")}: <strong>{selectedPreview.proteinG} g</strong>
                        </div>
                        <div>
                          {t("dashboard.quickAdd.labels.fat")}: <strong>{selectedPreview.fatG} g</strong>
                        </div>
                        <div>
                          {t("dashboard.quickAdd.labels.carb")}: <strong>{selectedPreview.carbG} g</strong>
                        </div>
                        <div>
                          {t("dashboard.quickAdd.labels.calories")}: <strong>{selectedPreview.calories} kcal</strong>
                        </div>
                      </div>
                    ) : (
                      <p className="muted-text">{t("dashboard.quickAdd.external.invalidAmount")}</p>
                    )}
                    <button type="button" onClick={onAddSelectedExternal}>
                      {t("dashboard.quickAdd.external.addSelected")}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </Card>

        <Card title={t("dashboard.dailyLog.title")}>
          {todayEntries.length === 0 ? (
            <div className="card-stack">
              <p className="muted-text">{t("dashboard.dailyLog.emptyLine1")}</p>
              <p className="muted-text">{t("dashboard.dailyLog.emptyLine2")}</p>
            </div>
          ) : (
            <div className="card-stack">
              <p className="muted-text">
                {t("dashboard.dailyLog.totalsLine", {
                  protein: dailyLog.totalProtein,
                  fat: dailyLog.totalFat,
                  carb: dailyLog.totalCarbs,
                  calories: dailyLog.totalCalories
                })}
              </p>
              <div className="entry-list">
                {todayEntries.map((entry) => (
                  <div key={entry.id} className="log-item">
                    <div className="log-item-header">
                      <div className="log-item-title">
                        <strong>{entry.foodName}</strong>
                      </div>
                      <button
                        type="button"
                        className="button-quiet"
                        onClick={() => removeFoodEntry(entry.id)}
                      >
                        {t("dashboard.dailyLog.remove")}
                      </button>
                    </div>
                    {entry.sourceText !== entry.foodName ? (
                      <div className="muted-text">{entry.sourceText}</div>
                    ) : null}
                    <div className="muted-text">
                      {t("dashboard.dailyLog.entryTotals", {
                        protein: entry.protein,
                        fat: entry.fat,
                        carb: entry.carbs,
                        calories: entry.calories
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <button type="button" className="button-secondary" onClick={clearTodayLog}>
                  {t("dashboard.dailyLog.clearToday")}
                </button>
              </div>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
