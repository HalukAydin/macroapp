import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { AppLanguage } from "../i18n";
import { useProfileStore } from "../store/useProfileStore";
import PageContainer from "./ui/PageContainer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const reset = useProfileStore((s) => s.reset);
  const hasProfile = useProfileStore((s) => Boolean(s.profile));
  const weightEntryCount = useProfileStore((s) => s.weightEntries.length);
  const foodLogCount = useProfileStore((s) => s.dailyLog.entries.length);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const currentLanguage: AppLanguage = i18n.resolvedLanguage?.startsWith("tr") ? "tr" : "en";

  useEffect(() => {
    if (!resetFeedback) return;
    const timer = window.setTimeout(() => setResetFeedback(null), 2600);
    return () => window.clearTimeout(timer);
  }, [resetFeedback]);

  const onReset = () => {
    const hadData = hasProfile || weightEntryCount > 0 || foodLogCount > 0;
    reset();
    setResetFeedback(
      hadData ? t("app.resetFeedback.resetDone") : t("app.resetFeedback.nothing")
    );
  };

  const onLanguageChange = (value: AppLanguage) => {
    i18n.changeLanguage(value);
  };

  return (
    <div>
      <PageContainer>
        <header className="app-header">
          <Link to="/dashboard" className="app-brand">
            {t("app.brand")}
          </Link>

          <nav className="app-nav" aria-label={t("app.navAria")}>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "app-nav-link is-active" : "app-nav-link")}>
              {t("app.nav.dashboard")}
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? "app-nav-link is-active" : "app-nav-link")}>
              {t("app.nav.profile")}
            </NavLink>
            <NavLink to="/log" className={({ isActive }) => (isActive ? "app-nav-link is-active" : "app-nav-link")}>
              {t("app.nav.weightLog")}
            </NavLink>
          </nav>

          <label className="app-language-switch">
            <span>{t("app.language")}</span>
            <select
              className="app-language-select"
              value={currentLanguage}
              onChange={(event) => onLanguageChange(event.target.value as AppLanguage)}
            >
              <option value="en">{t("app.languages.en")}</option>
              <option value="tr">{t("app.languages.tr")}</option>
            </select>
          </label>

          <button onClick={onReset} className="app-reset-btn">
            {t("app.reset")}
          </button>
        </header>
        {resetFeedback ? (
          <p className="feedback feedback-success" role="status" aria-live="polite">
            {resetFeedback}
          </p>
        ) : null}

        <main className="app-main">{children}</main>
      </PageContainer>
    </div>
  );
}
