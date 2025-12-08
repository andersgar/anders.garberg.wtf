import { Navigation, NavSpacer } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { BackgroundBlobs } from "../components/BackgroundBlobs";
import { Contact } from "../components/Contact";
import { useLanguage } from "../context/LanguageContext";
import { useProfile } from "../context/ProfileContext";
import "../styles/dashboard.css";

// Placeholder apps for the dashboard grid
const placeholderApps = [
  { id: 1, icon: "fa-solid fa-chart-line", name: "Analytics", color: "#3b82f6" },
  { id: 2, icon: "fa-solid fa-calendar", name: "Calendar", color: "#10b981" },
  { id: 3, icon: "fa-solid fa-file-alt", name: "Documents", color: "#f59e0b" },
  { id: 4, icon: "fa-solid fa-cog", name: "Settings", color: "#6366f1" },
  { id: 5, icon: "fa-solid fa-envelope", name: "Messages", color: "#ec4899" },
  { id: 6, icon: "fa-solid fa-plus", name: "Add App", color: "var(--muted)", isAdd: true },
];

export function DashboardPage() {
  const { t } = useLanguage();
  const { profile } = useProfile();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("goodMorning");
    if (hour < 18) return t("goodAfternoon");
    return t("goodEvening");
  };

  const displayName = profile?.full_name || profile?.username || profile?.email?.split("@")[0] || "";

  return (
    <>
      <BackgroundBlobs />
      <Navigation />
      <NavSpacer />
      <main className="dashboard">
        <div className="container">
          <header className="dashboard-header">
            <h1>
              {getGreeting()}{displayName ? `, ${displayName}` : ""}
            </h1>
            <p className="dashboard-subtitle">{t("dashboardSubtitle")}</p>
          </header>

          <section className="dashboard-section">
            <h2>{t("yourApps")}</h2>
            <div className="app-grid">
              {placeholderApps.map((app) => (
                <button
                  key={app.id}
                  className={`app-tile ${app.isAdd ? "app-tile-add" : ""}`}
                  style={{ "--app-color": app.color } as React.CSSProperties}
                >
                  <div className="app-tile-icon">
                    <i className={app.icon}></i>
                  </div>
                  <span className="app-tile-name">{app.isAdd ? t("addApp") : app.name}</span>
                </button>
              ))}
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

          <Contact />
        </div>
      </main>
      <Footer />
    </>
  );
}
