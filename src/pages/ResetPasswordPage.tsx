import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../context/LanguageContext";
import "../styles/auth.css";

type ResetMode = "request" | "update";

export function ResetPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Determine mode based on URL parameters
  const [mode, setMode] = useState<ResetMode>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Check if we have a token in the URL (redirected from Supabase email)
    const accessToken = searchParams.get("access_token");
    const type = searchParams.get("type");

    // Also check hash fragments (Supabase sometimes uses these)
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.replace("#", ""));
    const hashAccessToken = hashParams.get("access_token");
    const hashType = hashParams.get("type");

    if (
      (accessToken && type === "recovery") ||
      (hashAccessToken && hashType === "recovery")
    ) {
      setMode("update");

      // Set the session from the token
      const token = accessToken || hashAccessToken;
      const refreshToken =
        searchParams.get("refresh_token") ||
        hashParams.get("refresh_token") ||
        "";

      if (token) {
        supabase.auth.setSession({
          access_token: token,
          refresh_token: refreshToken,
        });
      }
    }
  }, [searchParams]);

  const handleRequestReset = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setShowMessage(false);
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(t("resetRequestError"));
      setShowMessage(true);
    } else {
      setSuccess(t("resetEmailSent"));
      setShowMessage(true);
    }

    setIsLoading(false);

    // Hide message after 5 seconds
    setTimeout(() => {
      setShowMessage(false);
    }, 5000);
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setShowMessage(false);

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      setShowMessage(true);
      return;
    }

    if (password.length < 6) {
      setError(t("passwordTooShort"));
      setShowMessage(true);
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(t("resetUpdateError"));
      setShowMessage(true);
    } else {
      setSuccess(t("passwordUpdated"));
      setShowMessage(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }

    setIsLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="brand-badge" aria-hidden="true">
              AG
            </div>
            <h2 className="login-title">
              {mode === "request" ? t("forgotPassword") : t("setNewPassword")}
            </h2>
            <p className="login-subtitle">
              {mode === "request"
                ? t("forgotPasswordSubtitle")
                : t("setNewPasswordSubtitle")}
            </p>
          </div>

          {mode === "request" ? (
            <form onSubmit={handleRequestReset}>
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

              <div
                className={`error-message ${
                  showMessage && error ? "show" : ""
                }`}
              >
                {error}
              </div>

              <div
                className={`success-message ${
                  showMessage && success ? "show" : ""
                }`}
              >
                {success}
              </div>

              <button
                type="submit"
                className="btn login-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>{" "}
                    {t("sending")}
                  </>
                ) : (
                  t("sendResetLink")
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label htmlFor="password">{t("newPassword")}</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">{t("confirmPassword")}</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <div
                className={`error-message ${
                  showMessage && error ? "show" : ""
                }`}
              >
                {error}
              </div>

              <div
                className={`success-message ${
                  showMessage && success ? "show" : ""
                }`}
              >
                {success}
              </div>

              <button
                type="submit"
                className="btn login-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>{" "}
                    {t("updating")}
                  </>
                ) : (
                  t("updatePassword")
                )}
              </button>
            </form>
          )}

          <div className="back-link">
            <a href="/login">
              <i className="fa-solid fa-arrow-left"></i> {t("backToLogin")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
