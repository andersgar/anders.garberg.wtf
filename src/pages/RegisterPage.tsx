import { useState, FormEvent, useEffect } from "react";
import { useMarkdownModal } from "../components/useMarkdownModal";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getAuthErrorKey } from "../lib/authErrors";

export function RegisterPage() {
  const { t } = useLanguage();
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Terms modal
  const termsModal = useMarkdownModal("/terms-privacy.md", t("privacyTermsLink"));
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

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      setShowError(true);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError(t("passwordTooShort"));
      setShowError(true);
      return;
    }

    // Require terms acceptance
    if (!acceptedTerms) {
      setError(t("mustAcceptTerms"));
      setShowError(true);
      return;
    }

    setIsLoading(true);

    const { error, needsConfirmation } = await signup(email, password);

    if (error) {
      const errorKey = getAuthErrorKey(error);
      setError(t(errorKey));
      setShowError(true);
      setPassword("");
      setConfirmPassword("");
      setIsLoading(false);

      // Hide error after 5 seconds
      setTimeout(() => {
        setShowError(false);
      }, 5000);
    } else if (needsConfirmation) {
      // Show success message for email confirmation
      setShowSuccess(true);
      setIsLoading(false);
    } else {
      // Direct login (no email confirmation required)
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

  if (showSuccess) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="success-icon">
                <i className="fa-solid fa-envelope-circle-check"></i>
              </div>
              <h2 className="login-title">{t("checkYourEmail")}</h2>
              <p className="login-subtitle">{t("confirmationSent")}</p>
            </div>

            <div className="success-message">
              <p>{t("confirmationInstructions")}</p>
              <p className="email-sent-to">{email}</p>
            </div>

            <div className="back-link">
              <Link to="/login">
                <i className="fa-solid fa-arrow-left"></i> {t("backToLogin")}
              </Link>
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
            <h2 className="login-title">{t("registerTitle")}</h2>
            <p className="login-subtitle">{t("registerSubtitle")}</p>
          </div>

          <form id="registerForm" onSubmit={handleSubmit}>
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
                autoComplete="new-password"
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
                placeholder="********"
                autoComplete="new-password"
              />
            </div>

            <div className="form-group terms-agreement">
              <label htmlFor="acceptTerms" className="terms-check">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="terms-checkbox"
                />
                <span>
                  {t("acceptTermsLabel")}{" "}
                  <button
                    type="button"
                    className="link-button terms-link"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      termsModal.open();
                    }}
                  >
                    {t("privacyTermsLink")}
                  </button>
                </span>
              </label>
            </div>

            <div className={`error-message ${showError ? "show" : ""}`}>
              {error || t("registerError")}
            </div>

            <button
              type="submit"
              className="btn login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>{" "}
                  {t("registering")}
                </>
              ) : (
                t("registerButton")
              )}
            </button>
          </form>

          <div className="divider">
            <span>{t("alreadyHaveAccount")}</span>
          </div>

          <Link to="/login" className="btn ghost">
            {t("loginButton")}
          </Link>

          <div className="back-link">
            <Link to="/">
              <i className="fa-solid fa-arrow-left"></i> {t("backToHome")}
            </Link>
          </div>
        </div>
      </div>
      {termsModal.modal}
    </div>
  );
}
