import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";

export function AdminPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasAccess, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to load
    if (authLoading || profileLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Redirect to dashboard - admin section is now there
    navigate("/");
  }, [authLoading, profileLoading, isAuthenticated, hasAccess, navigate]);

  // Show loading while redirecting
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
