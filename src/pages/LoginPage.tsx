import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export function LoginPage() {
  const { t } = useLanguage();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  // If already authenticated, redirect to home
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowError(false);
    setIsLoading(true);

    const { error } = await login(email, password);

    if (error) {
      setError(t("loginError"));
      setShowError(true);
      setPassword("");
      setIsLoading(false);

      // Hide error after 3 seconds
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    } else {
      navigate("/");
    }
  };

  if (authLoading) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="loading-spinner">
              <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="brand-badge" aria-hidden="true">
              AG
            </div>
            <h2 className="login-title">{t("loginTitle")}</h2>
            <p className="login-subtitle">{t("loginSubtitle")}</p>
          </div>

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
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className={`error-message ${showError ? "show" : ""}`}>
              {error || t("loginError")}
            </div>

            <div className="forgot-password-link">
              <a href="/reset-password">{t("forgotPassword")}</a>
            </div>

            <button
              type="submit"
              className="btn login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>{" "}
                  {t("loggingIn")}
                </>
              ) : (
                t("loginButton")
              )}
            </button>
          </form>

          <div className="divider">
            <span>{t("notAnders")}</span>
          </div>

          <a
            href="mailto:anders@garberg.wtf?subject=Tilgang til admin-panel"
            className="btn ghost"
          >
            {t("requestAccess")}
          </a>

          <div className="back-link">
            <a href="/">
              <i className="fa-solid fa-arrow-left"></i> {t("backToHome")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
