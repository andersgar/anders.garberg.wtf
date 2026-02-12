import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      // Get redirect info from query params (passed through email link)
      const redirectUrl = searchParams.get("redirect");
      const appName = searchParams.get("app");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("Error setting session:", error);
          const loginPath = `/login${appName || redirectUrl ? "?" : ""}${appName ? `app=${appName}` : ""}${appName && redirectUrl ? "&" : ""}${redirectUrl ? `redirect=${encodeURIComponent(redirectUrl)}` : ""}&error=auth_failed`;
          navigate(loginPath);
        } else {
          window.history.replaceState(null, "", window.location.pathname);
          // Redirect to external app or home
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            navigate("/#admin");
          }
        }
      } else {
        const loginPath = `/login${appName || redirectUrl ? "?" : ""}${appName ? `app=${appName}` : ""}${appName && redirectUrl ? "&" : ""}${redirectUrl ? `redirect=${encodeURIComponent(redirectUrl)}` : ""}`;
        navigate(loginPath);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="loading-container" style={{ minHeight: "100vh" }}>
      <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
      <p>Authenticating...</p>
    </div>
  );
}
