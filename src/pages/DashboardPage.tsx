import { useState, useEffect, useRef } from "react";
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
  updateUserApps,
  Profile,
  AccessLevel,
} from "../lib/profiles";
import { UserApp, getAppById, ensureProtocol } from "../lib/apps";
import "../styles/dashboard.css";
import { QRCodeSVG } from "qrcode.react";

export function DashboardPage() {
  // QR modal state
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrValue, setQrValue] = useState("https://garberg.wtf");
  const [qrFgColor, setQrFgColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#ffffff");
  const [qrSize, setQrSize] = useState(192);
  const qrRef = useRef<SVGSVGElement | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [manageOwnApps, setManageOwnApps] = useState(false);
  const { t } = useLanguage();
  const { profile, refreshProfile, hasAccess } = useProfile();
  const { user, isAuthenticated } = useAuth();

  // App modal state
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<UserApp | null>(null);

  // Admin user app editing state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUserApps, setEditingUserApps] = useState<UserApp[]>([]);
  const [editingUserName, setEditingUserName] = useState<string>("");

  // Admin state
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<"stats" | "users">(
    "stats"
  );

  const isAdmin = hasAccess("admin");
  const handleDownloadQr = () => {
    if (!qrRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(qrRef.current);
    const blob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-code.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetQr = () => {
    setQrValue("https://garberg.wtf");
    setQrFgColor("#000000");
    setQrBgColor("#ffffff");
    setQrSize(192);
  };

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

  // Prevent background scroll when QR modal is open
  useEffect(() => {
    if (showQrModal) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [showQrModal]);

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
  const displayedApps = (showHidden ? userApps : visibleApps).sort(
    (a, b) => a.order - b.order
  );

  // Recommended Apps: all custom apps (appId === 'custom')
  // Add QR generator app to recommended apps
  const qrApp = {
    id: "qr_app",
    appId: "qr_app",
    url: "",
    customName: "QR Generator",
    customIcon: "fa-solid fa-qrcode",
    visible: true,
    order: 999,
  };
  // Recommended apps are explicitly curated; for now only the QR generator
  const recommendedApps = [qrApp];

  const handleOpenAddApp = () => {
    if (!isAuthenticated) return;
    setEditingApp(null);
    setIsAppModalOpen(true);
  };

  const handleOpenManageOwnApps = () => {
    setManageOwnApps(true);
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

  const handleReorderOwnApps = async (apps: UserApp[]) => {
    const reIndexed = apps.map((app, index) => ({ ...app, order: index }));
    const success = await updateApps(reIndexed);
    if (success) {
      refreshProfile();
    }
  };

  // Admin user app editing functions
  const handleEditUserApps = (targetUser: Profile) => {
    setEditingUserId(targetUser.id);
    setEditingUserApps(targetUser.apps || []);
    setEditingUserName(
      targetUser.full_name || targetUser.username || targetUser.email || "User"
    );
    setEditingApp(null);
    setIsAppModalOpen(true);
  };

  const handleSaveUserApp = async (app: UserApp) => {
    if (!editingUserId) return;

    const existingIndex = editingUserApps.findIndex((a) => a.id === app.id);
    let newApps: UserApp[];

    if (existingIndex >= 0) {
      newApps = editingUserApps.map((a) => (a.id === app.id ? app : a));
    } else {
      newApps = [...editingUserApps, { ...app, order: editingUserApps.length }];
    }

    const success = await updateUserApps(editingUserId, newApps);
    if (success) {
      setEditingUserApps(newApps);
      // Update local users state
      setUsers(
        users.map((u) => (u.id === editingUserId ? { ...u, apps: newApps } : u))
      );
    }
  };

  const handleDeleteUserApp = async (appId: string) => {
    if (!editingUserId) return;

    const newApps = editingUserApps
      .filter((a) => a.id !== appId)
      .map((app, index) => ({ ...app, order: index }));

    const success = await updateUserApps(editingUserId, newApps);
    if (success) {
      setEditingUserApps(newApps);
      setUsers(
        users.map((u) => (u.id === editingUserId ? { ...u, apps: newApps } : u))
      );
    }
  };

  const handleReorderUserApps = async (apps: UserApp[]) => {
    if (!editingUserId) return;
    const reIndexed = apps.map((app, index) => ({ ...app, order: index }));
    const success = await updateUserApps(editingUserId, reIndexed);
    if (success) {
      setEditingUserApps(reIndexed);
      setUsers(
        users.map((u) => (u.id === editingUserId ? { ...u, apps: reIndexed } : u))
      );
    }
  };

  const handleCloseModal = () => {
    setIsAppModalOpen(false);
    setEditingUserId(null);
    setEditingUserApps([]);
    setEditingUserName("");
    setEditingApp(null);
    setManageOwnApps(false);
  };

  const getAppDisplay = (app: UserApp) => {
    const appDef = getAppById(app.appId);
    if (appDef && !appDef.isCustom) {
      const isFontIcon =
        appDef.icon.includes("fa-") || appDef.icon.startsWith("fa");
      return {
        name: appDef.name,
        icon: appDef.icon,
        color: appDef.color,
        isImage: !isFontIcon,
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
    (isAuthenticated ? user?.email?.split("@")[0] : t("user"));

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
            <p className="dashboard-subtitle">
              {isAuthenticated
                ? t("dashboardSubtitleLoggedIn")
                : t("dashboardSubtitleLoggedOut")}
            </p>
          </header>
          <section className="dashboard-section" id="apps">
            <div className="apps-header">
              <h2>{t("yourApps")}</h2>
              <div className="apps-actions">
                <button
                  type="button"
                  className="apps-action-btn"
                  onClick={handleOpenManageOwnApps}
                  aria-label={t("edit")}
                  title={t("edit")}
                  disabled={!isAuthenticated}
                >
                  <i className="fa-solid fa-pen"></i>
                </button>
                <button
                  type="button"
                  className={`apps-action-btn ${showHidden ? "active" : ""}`}
                  onClick={() => setShowHidden((v) => !v)}
                  aria-label={showHidden ? t("hide") : t("showHidden")}
                  title={showHidden ? t("hide") : t("showHidden")}
                  disabled={!isAuthenticated}
                >
                  <i
                    className={`fa-solid ${
                      showHidden ? "fa-eye" : "fa-eye-slash"
                    }`}
                  ></i>
                </button>
              </div>
            </div>
            <div className="app-grid">
              {!isAuthenticated && displayedApps.length === 0 ? (
                <div className="app-tile app-placeholder" aria-hidden="true">
                  <div className="app-placeholder-text">
                    <span className="app-placeholder-sub">
                      {t("loginToEdit")}
                    </span>
                  </div>
                </div>
              ) : displayedApps.length === 0 ? (
                <div className="app-grid-empty">
                  <i className="fa-solid fa-grid-2"></i>
                  <p>{t("noAppsYet")}</p>
                  <span>{t("addApp")}</span>
                </div>
              ) : (
                displayedApps.map((app) => {
                  const display = getAppDisplay(app);
                  const isHidden = !app.visible;
                  if (app.appId === "qr_app") {
                    return (
                      <button
                        key={app.id}
                        className={`app-tile ${isHidden ? "app-tile-hidden" : ""}`}
                        style={
                          { "--app-color": display.color } as React.CSSProperties
                        }
                        onClick={() => setShowQrModal(true)}
                        onContextMenu={(e) => {
                          if (!isAuthenticated) return;
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
                      </button>
                    );
                  }
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
                        if (!isAuthenticated) return;
                        if (e.ctrlKey || e.metaKey) {
                          e.preventDefault();
                          handleEditApp(app);
                        }
                      }}
                      onContextMenu={(e) => {
                        if (!isAuthenticated) return;
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
              {isAuthenticated && (
                <button
                  className="app-tile app-tile-add"
                  onClick={handleOpenAddApp}
                  style={
                    { "--app-color": "var(--muted)" } as React.CSSProperties
                  }
                >
                  <div className="app-tile-icon">
                    <i className="fa-solid fa-plus"></i>
                  </div>
                  <span className="app-tile-name">{t("addApp")}</span>
                </button>
              )}
            </div>
          </section>
          {recommendedApps.length > 0 && (
            <section className="dashboard-section">
              <h2>{t("recommendedApps")}</h2>
              <div className="app-grid">
                {recommendedApps.map((app) => {
                  const display = getAppDisplay(app);
                  if (app.appId === "qr_app") {
                    return (
                      <button
                        key={app.id}
                        className="app-tile"
                        style={
                          { "--app-color": "var(--fg)" } as React.CSSProperties
                        }
                        onClick={() => setShowQrModal(true)}
                      >
                        <div className="app-tile-icon">
                          <i className={display.icon}></i>
                        </div>
                        <span className="app-tile-name">{t("qrAppName")}</span>
                        <span className="app-tile-desc">
                          {t("qrAppDescription")}
                        </span>
                      </button>
                    );
                  }
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
                      <span className="app-tile-desc">
                        {app.customName || app.url}
                      </span>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

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
                        <th>{t("actions")}</th>
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
                          <td>
                            <button
                              className="admin-action-btn"
                              onClick={() => handleEditUserApps(u)}
                              title={t("editUserApps")}
                            >
                              <i className="fa-solid fa-grid-2"></i>
                              <span>{(u.apps || []).length}</span>
                            </button>
                          </td>
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

      {/* QR Modal - moved here to avoid dashboard section styling issues */}
      {showQrModal && (
        <div
          className="app-modal-overlay"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="app-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="app-modal-header">
              <div className="app-modal-title">
                <h2 id="qr-modal-title">{t("qrAppName")}</h2>
              </div>
              <button
                className="app-modal-close"
                onClick={() => setShowQrModal(false)}
                type="button"
                aria-label="Close QR modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div
              className="app-modal-content"
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
            >
              <div className="qr-generator-grid">
                <div className="qr-generator-form">
                  <label className="qr-label">
                    <span>{t("qrContentLabel")}</span>
                    <input
                      type="text"
                      value={qrValue}
                      onChange={(e) => setQrValue(e.target.value)}
                      placeholder={t("qrContentPlaceholder")}
                    />
                  </label>
                  <div className="qr-label-row">
                    <label className="qr-label">
                      <span>{t("qrForeground")}</span>
                      <input
                        type="color"
                        value={qrFgColor}
                        onChange={(e) => setQrFgColor(e.target.value)}
                      />
                    </label>
                    <label className="qr-label">
                      <span>{t("qrBackground")}</span>
                      <input
                        type="color"
                        value={qrBgColor}
                        onChange={(e) => setQrBgColor(e.target.value)}
                      />
                    </label>
                  </div>
                  <label className="qr-label">
                    <span>
                      {t("qrSize")} ({qrSize}px)
                    </span>
                    <input
                      type="range"
                      min={128}
                      max={320}
                      step={8}
                      value={qrSize}
                      onChange={(e) => setQrSize(Number(e.target.value))}
                    />
                  </label>
                </div>
                <div className="qr-preview-card">
                  <span className="qr-preview-title">{t("qrPreview")}</span>
                  <div className="qr-code-box">
                    {/* @ts-ignore */}
                    <QRCodeSVG
                      ref={qrRef}
                      value={qrValue || " "}
                      size={qrSize}
                      level="H"
                      bgColor={qrBgColor}
                      fgColor={qrFgColor}
                    />
                  </div>
                  <p className="qr-preview-url">
                    {qrValue || t("qrEmptyPlaceholder")}
                  </p>
                  <div className="qr-actions">
                    <button
                      type="button"
                      className="qr-btn"
                      onClick={handleDownloadQr}
                    >
                      <i className="fa-solid fa-download"></i>
                      {t("qrDownload")}
                    </button>
                    <button
                      type="button"
                      className="qr-btn ghost"
                      onClick={handleResetQr}
                    >
                      <i className="fa-solid fa-rotate-left"></i>
                      {t("qrReset")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AppModal
        isOpen={isAppModalOpen}
        onClose={handleCloseModal}
        onSave={editingUserId ? handleSaveUserApp : handleSaveApp}
        onDelete={editingUserId ? handleDeleteUserApp : handleDeleteApp}
        editingApp={editingApp}
        existingAppIds={(editingUserId ? editingUserApps : userApps).map(
          (a) => a.appId
        )}
        adminEditingUser={
          editingUserId
            ? editingUserName
            : manageOwnApps
            ? displayName || t("yourApps")
            : undefined
        }
        adminUserApps={
          editingUserId
            ? editingUserApps
            : manageOwnApps
            ? userApps
            : undefined
        }
        onReorderUserApps={
          editingUserId
            ? handleReorderUserApps
            : manageOwnApps
            ? handleReorderOwnApps
            : undefined
        }
      />
    </>
  );
}

