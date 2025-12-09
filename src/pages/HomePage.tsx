import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { DashboardPage } from "./DashboardPage";

export function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { lang } = useLanguage();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const allowGuest = searchParams.get("guest") === "1";

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <i
          className="fa-solid fa-spinner fa-spin"
          style={{ fontSize: "2rem" }}
        ></i>
      </div>
    );
  }

  // Redirect non-authenticated users to about page
  if (!isAuthenticated && !allowGuest) {
    const aboutPath = lang === "no" ? "/om-meg" : "/about";
    return <Navigate to={aboutPath} replace />;
  }

  // Show dashboard for authenticated users or guest-allowed visits
  return <DashboardPage />;
}
