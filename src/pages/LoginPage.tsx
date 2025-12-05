import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { BackgroundBlobs } from "../components/BackgroundBlobs";

export function LoginPage() {
  const { t } = useLanguage();
  const { toggleTheme } = useTheme();
  const { toggleLanguage } = useLanguage();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to admin
  if (isAuthenticated) {
    navigate("/admin");
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await login(email, password);

    if (error) {
      setError(t("loginError"));
      setIsLoading(false);
    } else {
      navigate("/admin");
    }
  };

  return (
    <>
      <BackgroundBlobs />
      <nav aria-label="Primary">
        <div className="container nav-inner">
          <div className="brand">
            <div className="brand-badge" aria-hidden="true">
              AG
            </div>
            <a href="/" aria-label="Hjem">
              <span>Anders Garberg</span>
            </a>
          </div>

          <div className="nav-links">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Bytt tema"
              title="Bytt tema"
            >
              <i className="fa-solid fa-circle-half-stroke"></i>
            </button>

            <button
              className="theme-toggle"
              onClick={toggleLanguage}
              aria-label="Bytt språk"
              title="Bytt språk"
            >
              <i className="fa-solid fa-globe"></i>
            </button>
          </div>
        </div>
      </nav>

      <main className="container login-container">
        <div className="login-card">
          <h1>
            <i className="fa-solid fa-lock"></i> {t("login")}
          </h1>

          {error && (
            <div className="error-message">
              <i className="fa-solid fa-circle-exclamation"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">{t("email")}</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t("email")}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t("password")}</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t("password")}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>{" "}
                  {t("loggingIn")}
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket"></i> {t("login")}
                </>
              )}
            </button>
          </form>

          <a href="/" className="back-link">
            <i className="fa-solid fa-arrow-left"></i> {t("backToHome")}
          </a>
        </div>
      </main>
    </>
  );
}
