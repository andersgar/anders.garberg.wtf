import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("Error setting session:", error);
          navigate("/login?error=auth_failed");
        } else {
          window.history.replaceState(null, "", window.location.pathname);
          navigate("/#admin");
        }
      } else {
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="loading-container" style={{ minHeight: "100vh" }}>
      <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
      <p>Authenticating...</p>
    </div>
  );
}
