import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export function Navigation() {
  const { t, toggleLanguage } = useLanguage();
  const { toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only hide/show after scrolling past 100px
      if (currentScrollY > 100) {
        // Scrolling down - hide navbar
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setNavHidden(true);
        }
        // Scrolling up - show navbar
        else if (currentScrollY < lastScrollY) {
          setNavHidden(false);
        }
      } else {
        setNavHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    await logout();
    setShowUserPopup(false);
  };

  return (
    <nav aria-label="Primary" className={navHidden ? "nav-hidden" : ""}>
      <div className="container nav-inner">
        <div className="brand">
          <div className="brand-badge" aria-hidden="true">
            AG
          </div>
          <a href="#home" aria-label="Hjem">
            <span>Anders Garberg</span>
          </a>
        </div>

        <div className="nav-links">
          <a href="#experience">{t("experience")}</a>
          <a href="#about">{t("about")}</a>
          <a href="#contact">{t("contact")}</a>

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

          {isAuthenticated ? (
            <div className="user-menu">
              <button
                className="theme-toggle user-button"
                onClick={() => setShowUserPopup(!showUserPopup)}
                aria-label="User menu"
              >
                <i className="fa-solid fa-user"></i>
              </button>
              {showUserPopup && (
                <div className="user-popup">
                  <p className="user-email">{user?.email}</p>
                  <Link
                    to="/admin"
                    className="popup-link"
                    onClick={() => setShowUserPopup(false)}
                  >
                    <i className="fa-solid fa-chart-line"></i>{" "}
                    {t("adminDashboard")}
                  </Link>
                  <button
                    className="popup-link logout-btn"
                    onClick={handleLogout}
                  >
                    <i className="fa-solid fa-right-from-bracket"></i>{" "}
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="theme-toggle"
              aria-label="Login"
              title="Login"
            >
              <i className="fa-solid fa-right-to-bracket"></i>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <MobileMenu />
      </div>
    </nav>
  );
}

// Spacer component to push content below fixed navbar
export function NavSpacer() {
  return <div className="nav-spacer" />;
}

function MobileMenu() {
  const { t, toggleLanguage } = useLanguage();
  const { toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();

  const handleMenuToggle = () => {
    document.getElementById("hamburger")?.classList.toggle("active");
    document.getElementById("mobileMenu")?.classList.toggle("active");
    document.getElementById("mobileOverlay")?.classList.toggle("active");
    document.body.classList.toggle("mobile-menu-open");
  };

  const closeMenu = () => {
    document.getElementById("hamburger")?.classList.remove("active");
    document.getElementById("mobileMenu")?.classList.remove("active");
    document.getElementById("mobileOverlay")?.classList.remove("active");
    document.body.classList.remove("mobile-menu-open");
  };

  return (
    <>
      <div
        className="hamburger"
        id="hamburger"
        onClick={handleMenuToggle}
        aria-label="Åpne meny"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div
        className="mobile-overlay"
        id="mobileOverlay"
        onClick={closeMenu}
      ></div>

      <div className="mobile-menu" id="mobileMenu">
        <a href="#experience" onClick={closeMenu}>
          {t("experience")}
        </a>
        <a href="#about" onClick={closeMenu}>
          {t("about")}
        </a>
        <a href="#contact" onClick={closeMenu}>
          {t("contact")}
        </a>

        <div className="mobile-buttons">
          <button
            className="theme-toggle"
            onClick={() => {
              toggleTheme();
              closeMenu();
            }}
            aria-label="Bytt tema"
          >
            <i className="fa-solid fa-circle-half-stroke"></i>
          </button>
          <button
            className="theme-toggle"
            onClick={() => {
              toggleLanguage();
              closeMenu();
            }}
            aria-label="Bytt språk"
          >
            <i className="fa-solid fa-globe"></i>
          </button>
          {isAuthenticated ? (
            <>
              <Link to="/admin" className="theme-toggle" onClick={closeMenu}>
                <i className="fa-solid fa-chart-line"></i>
              </Link>
              <button
                className="theme-toggle"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                aria-label="Logg ut"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
              </button>
            </>
          ) : (
            <Link to="/login" className="theme-toggle" onClick={closeMenu}>
              <i className="fa-solid fa-right-to-bracket"></i>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
