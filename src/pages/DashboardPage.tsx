import { useState, useEffect } from "react";
import { Navigation, NavSpacer } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { BackgroundBlobs } from "../components/BackgroundBlobs";
import { Contact } from "../components/Contact";
import { AppModal } from "../components/AppModal";
import { useLanguage } from "../context/LanguageContext";
import { useProfile } from "../context/ProfileContext";
import { useAuth } from "../context/AuthContext";
import { getAnalytics, AnalyticsStats } from "../lib/analytics";
import {
  getAllProfiles,
  updateAccessLevel,
  updateApps,
  Profile,
  AccessLevel,
} from "../lib/profiles";
import { UserApp, getAppById, ensureProtocol } from "../lib/apps";
import "../styles/dashboard.css";

export function DashboardPage() {
  const { t } = useLanguage();
  const { profile, refreshProfile, hasAccess } = useProfile();
  const { user } = useAuth();

  // App modal state
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<UserApp | null>(null);

  // Admin state
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<"stats" | "users">(
    "stats"
  );

  const isAdmin = hasAccess("admin");

  // Load admin data
  useEffect(() => {
    async function loadAdminData() {
      if (!isAdmin) return;
      setAdminLoading(true);
      const [analyticsData, usersData] = await Promise.all([
        getAnalytics(),
        getAllProfiles(),
      ]);
      setStats(analyticsData);
      setUsers(usersData);
      setAdminLoading(false);
    }
    loadAdminData();
  }, [isAdmin]);

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

  // App management functions
  const userApps = profile?.apps || [];
  const visibleApps = userApps
    .filter((app) => app.visible)
    .sort((a, b) => a.order - b.order);

  const handleOpenAddApp = () => {
    setEditingApp(null);
    setIsAppModalOpen(true);
  };

  const handleEditApp = (app: UserApp) => {
    setEditingApp(app);
    setIsAppModalOpen(true);
  };

  const handleSaveApp = async (app: UserApp) => {
    const existingIndex = userApps.findIndex((a) => a.id === app.id);
    let newApps: UserApp[];

    if (existingIndex >= 0) {
      // Update existing app
      newApps = userApps.map((a) => (a.id === app.id ? app : a));
    } else {
      // Add new app with order at end
      newApps = [...userApps, { ...app, order: userApps.length }];
    }

    const success = await updateApps(newApps);
    if (success) {
      refreshProfile();
    }
  };

  const handleDeleteApp = async (appId: string) => {
    const newApps = userApps
      .filter((a) => a.id !== appId)
      .map((app, index) => ({ ...app, order: index })); // Reorder

    const success = await updateApps(newApps);
    if (success) {
      refreshProfile();
    }
  };

  const getAppDisplay = (app: UserApp) => {
    const appDef = getAppById(app.appId);
    if (appDef && !appDef.isCustom) {
      return {
        name: appDef.name,
        icon: appDef.icon,
        color: appDef.color,
        isImage: true,
      };
    }
    return {
      name: app.customName || "Custom Link",
      icon: app.customIcon || "fa-solid fa-link",
      color: "var(--brand)",
      isImage: false,
    };
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("goodMorning");
    if (hour < 18) return t("goodAfternoon");
    return t("goodEvening");
  };

  const displayName =
    profile?.full_name ||
    profile?.username ||
    profile?.email?.split("@")[0] ||
    "";

  return (
    <>
      <BackgroundBlobs />
      <Navigation />
      <NavSpacer />
      <main className="dashboard">
        <div className="container">
          <header className="dashboard-header">
            <h1>
              {getGreeting()}
              {displayName ? `, ${displayName}` : ""}
            </h1>
            <p className="dashboard-subtitle">{t("dashboardSubtitle")}</p>
          </header>

          <section className="dashboard-section">
            <h2>{t("yourApps")}</h2>
            <div className="app-grid">
              {visibleApps.length === 0 ? (
                <div className="app-grid-empty">
                  <i className="fa-solid fa-grid-2"></i>
                  <p>{t("noAppsYet")}</p>
                  <span>{t("addYourFirstApp")}</span>
                </div>
              ) : (
                visibleApps.map((app) => {
                  const display = getAppDisplay(app);
                  return (
                    <a
                      key={app.id}
                      href={ensureProtocol(app.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="app-tile"
                      style={
                        { "--app-color": display.color } as React.CSSProperties
                      }
                      onClick={(e) => {
                        // Right click or ctrl+click opens edit modal
                        if (e.ctrlKey || e.metaKey) {
                          e.preventDefault();
                          handleEditApp(app);
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        handleEditApp(app);
                      }}
                    >
                      <div className="app-tile-icon">
                        {display.isImage ? (
                          <img src={display.icon} alt={display.name} />
                        ) : (
                          <i className={display.icon}></i>
                        )}
                      </div>
                      <span className="app-tile-name">{display.name}</span>
                    </a>
                  );
                })
              )}
              <button
                className="app-tile app-tile-add"
                onClick={handleOpenAddApp}
                style={{ "--app-color": "var(--muted)" } as React.CSSProperties}
              >
                <div className="app-tile-icon">
                  <i className="fa-solid fa-plus"></i>
                </div>
                <span className="app-tile-name">{t("addApp")}</span>
              </button>
            </div>
          </section>

          <section className="dashboard-section">
            <h2>{t("quickActions")}</h2>
            <div className="quick-actions">
              <a href="/about" className="quick-action-card">
                <i className="fa-solid fa-user"></i>
                <span>{t("viewAboutPage")}</span>
              </a>
              <a href="#contact" className="quick-action-card">
                <i className="fa-solid fa-envelope"></i>
                <span>{t("contact")}</span>
              </a>
            </div>
          </section>

          {/* Admin Section - Only visible for admins */}
          {isAdmin && (
            <section className="dashboard-section admin-section">
              <div className="admin-section-header">
                <h2>
                  <i className="fa-solid fa-shield"></i> {t("adminDashboard")}
                </h2>
                <div className="admin-tabs">
                  <button
                    className={`admin-tab ${
                      activeAdminTab === "stats" ? "active" : ""
                    }`}
                    onClick={() => setActiveAdminTab("stats")}
                  >
                    <i className="fa-solid fa-chart-line"></i> {t("statistics")}
                  </button>
                  <button
                    className={`admin-tab ${
                      activeAdminTab === "users" ? "active" : ""
                    }`}
                    onClick={() => setActiveAdminTab("users")}
                  >
                    <i className="fa-solid fa-users"></i> {t("users")} (
                    {users.length})
                  </button>
                </div>
              </div>

              {adminLoading ? (
                <div className="admin-loading">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>{t("loading")}</span>
                </div>
              ) : activeAdminTab === "stats" ? (
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
                                style={{
                                  color: getAccessLevelColor(u.access_level),
                                }}
                              >
                                <option value="user">
                                  {t("accessLevelUser")}
                                </option>
                                <option value="moderator">
                                  {t("accessLevelMod")}
                                </option>
                                <option value="admin">
                                  {t("accessLevelAdmin")}
                                </option>
                                <option value="owner">
                                  {t("accessLevelOwner")}
                                </option>
                              </select>
                            ) : (
                              <span
                                className="access-badge"
                                style={{
                                  backgroundColor: `color-mix(in oklab, ${getAccessLevelColor(
                                    u.access_level
                                  )} 15%, transparent)`,
                                  color: getAccessLevelColor(u.access_level),
                                  borderColor: getAccessLevelColor(
                                    u.access_level
                                  ),
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
            </section>
          )}

          <Contact />
        </div>
      </main>
      <Footer />

      <AppModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onSave={handleSaveApp}
        onDelete={handleDeleteApp}
        editingApp={editingApp}
        existingAppIds={userApps.map((a) => a.appId)}
      />
    </>
  );
}
