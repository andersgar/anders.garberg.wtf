import { useState, FormEvent, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useMarkdownModal } from "../components/useMarkdownModal";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getAuthErrorKey } from "../lib/authErrors";
import { AuthLayout, AuthLoading } from "../components/AuthLayout";

export function RegisterPage() {
  const { t } = useLanguage();
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const termsModal = useMarkdownModal(
    "/terms-privacy.md",
    t("privacyTermsLink")
  );

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowError(false);

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      setShowError(true);
      return;
    }

    if (password.length < 6) {
      setError(t("passwordTooShort"));
      setShowError(true);
      return;
    }

    if (!acceptedTerms) {
      setError(t("mustAcceptTerms"));
      setShowError(true);
      return;
    }

    setIsLoading(true);

    const { error: authError, needsConfirmation } = await signup(
      email,
      password
    );

    if (authError) {
      const errorKey = getAuthErrorKey(authError);
      setError(t(errorKey));
      setShowError(true);
      setPassword("");
      setConfirmPassword("");
      setIsLoading(false);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    if (needsConfirmation) {
      setShowSuccess(true);
      setIsLoading(false);
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

  if (showSuccess) {
    return (
      <AuthLayout
        title={t("checkYourEmail")}
        subtitle={t("confirmationSent")}
        headerBadge={
          <div className="success-icon">
            <i className="fa-solid fa-envelope-circle-check"></i>
          </div>
        }
        backLink={{
          to: "/login",
          label: t("backToLogin"),
          icon: "fa-solid fa-arrow-left",
        }}
      >
        <div className="success-message">
          <p>{t("confirmationInstructions")}</p>
          <p className="email-sent-to">{email}</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <>
      <AuthLayout
        title={t("registerTitle")}
        subtitle={t("registerSubtitle")}
        backLink={{
          to: "/",
          label: t("backToHome"),
          icon: "fa-solid fa-arrow-left",
        }}
      >
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

          <button type="submit" className="btn login-btn" disabled={isLoading}>
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
      </AuthLayout>
      {termsModal.modal}
    </>
  );
}
