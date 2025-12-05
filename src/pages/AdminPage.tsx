import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { getAnalytics, AnalyticsStats } from "../lib/analytics";
import { BackgroundBlobs } from "../components/BackgroundBlobs";

export function AdminPage() {
  const { t } = useLanguage();
  const { toggleTheme } = useTheme();
  const { toggleLanguage } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    async function loadStats() {
      const data = await getAnalytics();
      setStats(data);
      setIsLoading(false);
    }
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="loading-container">
        <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <BackgroundBlobs />
      <nav aria-label="Primary">
        <div className="container nav-inner">
          <div className="brand">
            <div className="brand-badge" aria-hidden="true">
              AG
            </div>
            <a href="/" aria-label="Hjem">
              <span>Anders Garberg</span>
            </a>
          </div>

          <div className="nav-links">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Bytt tema"
            >
              <i className="fa-solid fa-circle-half-stroke"></i>
            </button>

            <button
              className="theme-toggle"
              onClick={toggleLanguage}
              aria-label="Bytt språk"
            >
              <i className="fa-solid fa-globe"></i>
            </button>

            <button className="btn btn-secondary" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket"></i> {t("logout")}
            </button>
          </div>
        </div>
      </nav>

      <main className="container admin-container">
        <div className="admin-header">
          <h1>
            <i className="fa-solid fa-chart-line"></i> {t("adminDashboard")}
          </h1>
          <p className="user-info">
            <i className="fa-solid fa-user"></i> {user?.email}
          </p>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
            <p>{t("loading")}</p>
          </div>
        ) : stats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fa-solid fa-eye"></i>
              </div>
              <div className="stat-content">
                <h3>{t("totalVisits")}</h3>
                <p className="stat-value">{stats.totalVisits}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <div className="stat-content">
                <h3>{t("totalContacts")}</h3>
                <p className="stat-value">{stats.totalContacts}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fa-solid fa-file-arrow-down"></i>
              </div>
              <div className="stat-content">
                <h3>{t("cvDownloads")}</h3>
                <p className="stat-value">{stats.totalCVDownloads}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="error-message">
            <i className="fa-solid fa-circle-exclamation"></i> {t("statsError")}
          </div>
        )}

        <a href="/" className="back-link">
          <i className="fa-solid fa-arrow-left"></i> {t("backToHome")}
        </a>
      </main>
    </>
  );
}
