import { useState, useEffect, useRef } from "react";
import {
  ArrowCounterClockwise,
  ChartLine,
  DownloadSimple,
  EnvelopeSimple,
  Eye,
  FileArrowDown,
  ShieldCheck,
  User,
  Users,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { AppIcon, Spinner } from "../lib/icons";
import { Navigation, NavSpacer } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { Contact } from "../components/Contact";
import { useLanguage } from "../context/LanguageContext";
import { useProfile } from "../context/ProfileContext";
import { useAuth } from "../context/AuthContext";
import { getAnalytics, AnalyticsStats } from "../lib/analytics";
import {
  getAllProfiles,
  updateAccessLevel,
  Profile,
  AccessLevel,
} from "../lib/profiles";
import { UserApp, getAppById, ensureProtocol } from "../lib/apps";
import "../styles/app-modal.css";
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
  const { t } = useLanguage();
  const { profile, hasAccess } = useProfile();
  const { user, isAuthenticated } = useAuth();

  // Admin state
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<"stats" | "users">(
    "stats"
  );
  const [logModal, setLogModal] = useState<
    null | "visits" | "contacts" | "downloads"
  >(null);

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

  const getUserLabel = (userId?: string | null) => {
    if (!userId) return "anon";
    const u = users.find((usr) => usr.id === userId);
    return (
      u?.full_name ||
      u?.full_name ||
      u?.email ||
      (userId.length > 8 ? `${userId.slice(0, 8)}…` : userId)
    );
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
  const infoScreensApp = {
    id: "info_screens",
    appId: "info_screens",
    url: "https://screens.garberg.wtf",
    customName: "Informize",
    customIcon: "/assets/apps/informize.svg",
    visible: true,
    order: 1000,
  };
  const vorslyApp = {
    id: "vorsly",
    appId: "vorsly",
    url: "https://vorsly.garberg.wtf",
    customName: "Vorsly",
    customIcon: "/assets/apps/vorsly.svg",
    visible: true,
    order: 1001,
  };
  // Recommended apps are explicitly curated.
  const recommendedApps = [infoScreensApp, vorslyApp, qrApp];

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
    profile?.full_name ||
    profile?.email?.split("@")[0] ||
    (isAuthenticated ? user?.email?.split("@")[0] : t("user"));

  return (
    <>
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
          {recommendedApps.length > 0 && (
            <section
              className="dashboard-section"
              id="apps"
            >
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
                          <AppIcon icon={display.icon} alt={display.name} />
                        </div>
                        <span className="app-tile-name">{t("qrAppName")}</span>
                        <span className="app-tile-desc">
                          {t("qrAppDescription")}
                        </span>
                      </button>
                    );
                  }
                  if (app.appId === "vorsly") {
                    return (
                      <a
                        key={app.id}
                        className="app-tile"
                        style={
                          {
                            "--app-color": display.color,
                          } as React.CSSProperties
                        }
                        href={ensureProtocol(app.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="app-tile-icon">
                          <AppIcon icon={display.icon} alt={display.name} />
                        </div>
                        <span className="app-tile-name">
                          {t("vorslyName")}
                        </span>
                        <span className="app-tile-desc">
                          {t("vorslyDescription")}
                        </span>
                      </a>
                    );
                  }
                  if (app.appId === "info_screens") {
                    return (
                      <a
                        key={app.id}
                        className="app-tile"
                        style={
                          {
                            "--app-color": display.color,
                          } as React.CSSProperties
                        }
                        href={ensureProtocol(app.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="app-tile-icon">
                          <AppIcon icon={display.icon} alt={display.name} />
                        </div>
                        <span className="app-tile-name">
                          {t("infoScreensName")}
                        </span>
                        <span className="app-tile-desc">
                          {t("infoScreensDescription")}
                        </span>
                      </a>
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
                    >
                      <div className="app-tile-icon">
                        <AppIcon icon={display.icon} alt={display.name} />
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
                <User aria-hidden="true" />
                <span>{t("viewAboutPage")}</span>
              </a>
              <a href="#contact" className="quick-action-card">
                <EnvelopeSimple aria-hidden="true" />
                <span>{t("contact")}</span>
              </a>
            </div>
          </section>
          {/* Admin Section - Only visible for admins */}
          {isAdmin && (
            <section className="dashboard-section admin-section">
              <div className="admin-section-header">
                <h2>
                  <ShieldCheck aria-hidden="true" /> {t("adminDashboard")}
                </h2>
                <div className="admin-tabs">
                  <button
                    className={`admin-tab ${
                      activeAdminTab === "stats" ? "active" : ""
                    }`}
                    onClick={() => setActiveAdminTab("stats")}
                  >
                    <ChartLine aria-hidden="true" /> {t("statistics")}
                  </button>
                  <button
                    className={`admin-tab ${
                      activeAdminTab === "users" ? "active" : ""
                    }`}
                    onClick={() => setActiveAdminTab("users")}
                  >
                    <Users aria-hidden="true" /> {t("users")} (
                    {users.length})
                  </button>
                </div>
              </div>

              {adminLoading ? (
                <div className="admin-loading">
                  <Spinner />
                  <span>{t("loading")}</span>
                </div>
              ) : activeAdminTab === "stats" ? (
                stats ? (
                  <div className="stats-grid">
                    <button
                      className="stat-card"
                      type="button"
                      onClick={() => setLogModal("visits")}
                    >
                      <div className="stat-icon">
                        <Eye aria-hidden="true" />
                      </div>
                      <div className="stat-content">
                        <h3>{t("totalVisits")}</h3>
                        <p className="stat-value">{stats.totalVisits}</p>
                      </div>
                    </button>

                    <button
                      className="stat-card"
                      type="button"
                      onClick={() => setLogModal("contacts")}
                    >
                      <div className="stat-icon">
                        <EnvelopeSimple aria-hidden="true" />
                      </div>
                      <div className="stat-content">
                        <h3>{t("totalContacts")}</h3>
                        <p className="stat-value">{stats.totalContacts}</p>
                      </div>
                    </button>

                    <button
                      className="stat-card"
                      type="button"
                      onClick={() => setLogModal("downloads")}
                    >
                      <div className="stat-icon">
                        <FileArrowDown aria-hidden="true" />
                      </div>
                      <div className="stat-content">
                        <h3>{t("cvDownloads")}</h3>
                        <p className="stat-value">{stats.totalCVDownloads}</p>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="error-message">
                    <WarningCircle aria-hidden="true" />{" "}
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
                                <User aria-hidden="true" />
                              )}
                            </div>
                            <span>{u.full_name || "—"}</span>
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
                <X aria-hidden="true" />
              </button>
            </div>
            <div
              className="app-modal-content"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
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
                      <DownloadSimple aria-hidden="true" />
                      {t("qrDownload")}
                    </button>
                    <button
                      type="button"
                      className="qr-btn ghost"
                      onClick={handleResetQr}
                    >
                      <ArrowCounterClockwise aria-hidden="true" />
                      {t("qrReset")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {logModal && (
        <div className="app-modal-overlay" onClick={() => setLogModal(null)}>
          <div
            className="app-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="log-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="app-modal-header">
              <div className="app-modal-title">
                <h2 id="log-modal-title">
                  {logModal === "visits"
                    ? t("totalVisits")
                    : logModal === "contacts"
                    ? t("totalContacts")
                    : t("cvDownloads")}
                </h2>
              </div>
              <button
                className="app-modal-close"
                onClick={() => setLogModal(null)}
                aria-label="Close"
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <div className="app-modal-content">
              <div className="admin-log-table">
                {logModal === "visits" && (
                  <table>
                    <thead>
                      <tr>
                        <th>Page</th>
                        <th>Referrer</th>
                        <th>User</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats?.recentVisits || []).map((v, idx) => (
                        <tr key={idx}>
                          <td>{v.page_url || "-"}</td>
                          <td>{v.referrer || "-"}</td>
                          <td>{getUserLabel(v.user_id)}</td>
                          <td>
                            {v.created_at
                              ? new Date(v.created_at).toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {logModal === "contacts" && (
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Message</th>
                        <th>User</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats?.recentContacts || []).map((c, idx) => (
                        <tr key={idx}>
                          <td>{c.name || "-"}</td>
                          <td>{c.email || "-"}</td>
                          <td>{c.message || "-"}</td>
                          <td>{getUserLabel(c.user_id)}</td>
                          <td>
                            {c.created_at
                              ? new Date(c.created_at).toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {logModal === "downloads" && (
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats?.recentDownloads || []).map((d, idx) => (
                        <tr key={idx}>
                          <td>{getUserLabel(d.user_id)}</td>
                          <td>
                            {d.downloaded_at
                              ? new Date(d.downloaded_at).toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
