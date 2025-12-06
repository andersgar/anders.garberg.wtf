import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { getAnalytics, AnalyticsStats } from "../lib/analytics";
import {
  getAllProfiles,
  updateAccessLevel,
  Profile,
  AccessLevel,
} from "../lib/profiles";
import { BackgroundBlobs } from "../components/BackgroundBlobs";

export function AdminPage() {
  const { t } = useLanguage();
  const { toggleTheme } = useTheme();
  const { toggleLanguage } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { profile, loading: profileLoading, hasAccess } = useProfile();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stats" | "users">("stats");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !profileLoading && profile && !hasAccess("admin")) {
      navigate("/");
    }
  }, [authLoading, profileLoading, profile, hasAccess, navigate]);

  useEffect(() => {
    async function loadData() {
      const [analyticsData, usersData] = await Promise.all([
        getAnalytics(),
        getAllProfiles(),
      ]);
      setStats(analyticsData);
      setUsers(usersData);
      setIsLoading(false);
    }
    if (isAuthenticated && hasAccess("admin")) {
      loadData();
    }
  }, [isAuthenticated, hasAccess]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleAccessLevelChange = async (
    userId: string,
    newLevel: AccessLevel
  ) => {
    const success = await updateAccessLevel(userId, newLevel);
    if (success) {
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, access_level: newLevel } : u
        )
      );
    }
  };

  const getAccessLevelColor = (level: AccessLevel): string => {
    const colors: Record<AccessLevel, string> = {
      user: "var(--muted)",
      moderator: "#3b82f6",
      admin: "#f59e0b",
      owner: "#ef4444",
    };
    return colors[level];
  };

  if (authLoading || profileLoading) {
    return (
      <div className="loading-container">
        <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
      </div>
    );
  }

  if (!isAuthenticated || !hasAccess("admin")) {
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
            <span
              className="access-badge"
              style={{
                backgroundColor: `color-mix(in oklab, ${getAccessLevelColor(
                  profile?.access_level || "user"
                )} 15%, transparent)`,
                color: getAccessLevelColor(profile?.access_level || "user"),
                borderColor: getAccessLevelColor(
                  profile?.access_level || "user"
                ),
              }}
            >
              {profile?.access_level}
            </span>
          </p>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            <i className="fa-solid fa-chart-line"></i> {t("statistics")}
          </button>
          <button
            className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <i className="fa-solid fa-users"></i> {t("users")} ({users.length})
          </button>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
            <p>{t("loading")}</p>
          </div>
        ) : activeTab === "stats" ? (
          stats ? (
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
              <i className="fa-solid fa-circle-exclamation"></i>{" "}
              {t("statsError")}
            </div>
          )
        ) : (
          <div className="users-list">
            <table className="users-table">
              <thead>
                <tr>
                  <th>{t("user")}</th>
                  <th>{t("email")}</th>
                  <th>{t("accessLevel")}</th>
                  <th>{t("memberSince")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className={u.id === user?.id ? "current-user" : ""}
                  >
                    <td className="user-cell">
                      <div className="user-avatar-tiny">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" />
                        ) : (
                          <i className="fa-solid fa-user"></i>
                        )}
                      </div>
                      <span>{u.full_name || u.username || "—"}</span>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      {hasAccess("owner") && u.id !== user?.id ? (
                        <select
                          value={u.access_level}
                          onChange={(e) =>
                            handleAccessLevelChange(
                              u.id,
                              e.target.value as AccessLevel
                            )
                          }
                          className="access-select"
                          style={{ color: getAccessLevelColor(u.access_level) }}
                        >
                          <option value="user">{t("accessLevelUser")}</option>
                          <option value="moderator">
                            {t("accessLevelMod")}
                          </option>
                          <option value="admin">{t("accessLevelAdmin")}</option>
                          <option value="owner">{t("accessLevelOwner")}</option>
                        </select>
                      ) : (
                        <span
                          className="access-badge"
                          style={{
                            backgroundColor: `color-mix(in oklab, ${getAccessLevelColor(
                              u.access_level
                            )} 15%, transparent)`,
                            color: getAccessLevelColor(u.access_level),
                            borderColor: getAccessLevelColor(u.access_level),
                          }}
                        >
                          {u.access_level}
                        </span>
                      )}
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <a href="/" className="back-link">
          <i className="fa-solid fa-arrow-left"></i> {t("backToHome")}
        </a>
      </main>
    </>
  );
}
