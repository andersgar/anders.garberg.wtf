import { useState, FormEvent, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getAuthErrorKey } from "../lib/authErrors";
import { AuthLayout, AuthLoading } from "../components/AuthLayout";
import { getAppBranding } from "../lib/appBranding";

export function LoginPage() {
  const { t } = useLanguage();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const appName = searchParams.get("app");
  const appBranding = getAppBranding(appName);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        navigate("/");
      }
    }
  }, [authLoading, isAuthenticated, navigate, redirectUrl]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowError(false);
    setIsLoading(true);

    const { error: authError } = await login(email, password);

    if (authError) {
      const errorKey = getAuthErrorKey(authError);
      setError(t(errorKey));
      setShowError(true);
      setPassword("");
      setIsLoading(false);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    // Redirect to external URL or dashboard
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      navigate("/");
    }
  };

  if (authLoading) {
    return <AuthLoading />;
  }

  return (
    <AuthLayout
      title={t("loginTitle")}
      subtitle={t("loginSubtitle")}
      appBranding={appBranding}
      backLink={{
        to: "/",
        label: t("backToHome"),
        icon: "fa-solid fa-arrow-left",
      }}
    >
      <form id="loginForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">{t("emailLabel")}</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="din@epost.no"
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t("passwordLabel")}</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="********"
            autoComplete="current-password"
          />
        </div>

        <div className={`error-message ${showError ? "show" : ""}`}>
          {error || t("loginError")}
        </div>

        <div className="forgot-password-link">
          <a href="/reset-password">{t("forgotPassword")}</a>
        </div>

        <button type="submit" className="btn login-btn" disabled={isLoading}>
          {isLoading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i> {t("loggingIn")}
            </>
          ) : (
            t("loginButton")
          )}
        </button>
      </form>

      <div className="divider">
        <span>{t("noAccount")}</span>
      </div>

      <Link
        to={`/register${redirectUrl || appName ? "?" : ""}${
          appName ? `app=${appName}` : ""
        }${appName && redirectUrl ? "&" : ""}${
          redirectUrl ? `redirect=${encodeURIComponent(redirectUrl)}` : ""
        }`}
        className="btn ghost"
      >
        {t("createAccount")}
      </Link>
    </AuthLayout>
  );
}
