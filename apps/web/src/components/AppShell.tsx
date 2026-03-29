import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { AppLanguage } from "../i18n";
import { useAuthStore } from "../store/useAuthStore";
import PageContainer from "./ui/PageContainer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const currentLanguage: AppLanguage = i18n.resolvedLanguage?.startsWith("tr") ? "tr" : "en";

  const onLogout = () => {
    logout();
    navigate("/login");
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

          <button onClick={onLogout} className="app-reset-btn">
            {t("app.logout")}
          </button>
        </header>
        <main className="app-main">{children}</main>
      </PageContainer>
    </div>
  );
}
