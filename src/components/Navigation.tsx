import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "../context/LanguageContext";
import { useTheme, ColorTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { ProfileSettings } from "./ProfileSettings";

const colorThemes: { id: ColorTheme; gradient: string }[] = [
  {
    id: "aurora",
    gradient:
      "linear-gradient(135deg, #00F5D4 0%, #00BBF9 30%, #8338EC 65%, #FF006E 100%)",
  },
  {
    id: "cinema",
    gradient:
      "linear-gradient(135deg, #00E5FF 0%, #2979FF 30%, #7C4DFF 65%, #FF1744 100%)",
  },
  {
    id: "sunset",
    gradient:
      "linear-gradient(135deg, #FF7A00 0%, #FF3D77 35%, #C200FB 70%, #6A00FF 100%)",
  },
  {
    id: "cyber",
    gradient:
      "linear-gradient(135deg, #00FFA3 0%, #00F5FF 30%, #00A6FB 60%, #7400B8 100%)",
  },
  {
    id: "space",
    gradient:
      "linear-gradient(135deg, #0B1026 0%, #1F2A7C 30%, #4A00E0 60%, #B517FF 100%)",
  },
  {
    id: "volcanic",
    gradient:
      "linear-gradient(135deg, #0B0B0F 0%, #E10600 35%, #FF5400 70%, #FFA400 100%)",
  },
  {
    id: "icefire",
    gradient:
      "linear-gradient(135deg, #00F0FF 0%, #1E3AFF 50%, #FF2E2E 75%, #FF8A00 100%)",
  },
  {
    id: "candy",
    gradient:
      "linear-gradient(135deg, #BFFBFF 0%, #4DD6FF 30%, #9B5CFF 65%, #FF8AE2 100%)",
  },
];

export function Navigation() {
  const { t, toggleLanguage } = useLanguage();
  const {
    theme,
    setTheme,
    colorTheme,
    setColorTheme,
    blobCount,
    setBlobCount,
  } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { profile, hasAccess } = useProfile();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);

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

  // Handle escape key to close dropdown and QR popup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowUserDropdown(false);
        setShowColorDropdown(false);
        setShowQrPopup(false);
        setShowProfilePopup(false);
      }
    };

    if (
      showUserDropdown ||
      showQrPopup ||
      showColorDropdown ||
      showProfilePopup
    ) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [showUserDropdown, showQrPopup, showColorDropdown, showProfilePopup]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(e.target as Node)
      ) {
        setShowUserDropdown(false);
      }
      if (
        colorDropdownRef.current &&
        !colorDropdownRef.current.contains(e.target as Node) &&
        colorButtonRef.current &&
        !colorButtonRef.current.contains(e.target as Node)
      ) {
        setShowColorDropdown(false);
      }
    };

    if (showUserDropdown || showColorDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserDropdown, showColorDropdown]);

  const handleLogout = async () => {
    await logout();
    setShowUserDropdown(false);
  };

  const handleColorThemeChange = (theme: ColorTheme) => {
    setColorTheme(theme);
    setShowColorDropdown(false);
  };

  const getThemeTranslation = (themeId: ColorTheme): string => {
    const key = `theme${
      themeId.charAt(0).toUpperCase() + themeId.slice(1)
    }` as keyof typeof t;
    return t(key as any);
  };

  return (
    <>
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

            <div className="color-theme-container">
              <button
                ref={colorButtonRef}
                className="theme-toggle"
                onClick={() => setShowColorDropdown(!showColorDropdown)}
                aria-label={t("colorTheme")}
                title={t("colorTheme")}
              >
                <i className="fa-solid fa-palette"></i>
              </button>

              {showColorDropdown && (
                <div className="color-theme-dropdown" ref={colorDropdownRef}>
                  <div className="color-theme-header">{t("colorTheme")}</div>
                  <div className="color-theme-grid">
                    {colorThemes.map((theme) => (
                      <button
                        key={theme.id}
                        className={`color-theme-tile ${
                          colorTheme === theme.id ? "active" : ""
                        }`}
                        onClick={() => handleColorThemeChange(theme.id)}
                        title={getThemeTranslation(theme.id)}
                      >
                        <div
                          className="color-theme-gradient"
                          style={{ background: theme.gradient }}
                        />
                        {colorTheme === theme.id && (
                          <div className="color-theme-active-indicator">
                            <i className="fa-solid fa-check"></i>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="theme-mode-toggle">
                    <button
                      className={`theme-mode-btn ${
                        theme === "light" ? "active" : ""
                      }`}
                      onClick={() => setTheme("light")}
                      aria-label="Light mode"
                    >
                      <i className="fa-solid fa-sun"></i>
                    </button>
                    <button
                      className={`theme-mode-btn ${
                        theme === "dark" ? "active" : ""
                      }`}
                      onClick={() => setTheme("dark")}
                      aria-label="Dark mode"
                    >
                      <i className="fa-solid fa-moon"></i>
                    </button>
                    <div
                      className={`theme-mode-slider ${
                        theme === "dark" ? "dark" : "light"
                      }`}
                    />
                  </div>

                  <div className="blob-count-section">
                    <div className="blob-count-header">{t("blobs")}</div>
                    <div className="blob-count-control">
                      <button
                        className="blob-count-btn"
                        onClick={() => setBlobCount(blobCount - 1)}
                        disabled={blobCount <= 0}
                        aria-label="Decrease blobs"
                      >
                        <i className="fa-solid fa-minus"></i>
                      </button>
                      <span className="blob-count-value">{blobCount}</span>
                      <button
                        className="blob-count-btn"
                        onClick={() => setBlobCount(blobCount + 1)}
                        disabled={blobCount >= 10}
                        aria-label="Increase blobs"
                      >
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              className="theme-toggle"
              onClick={toggleLanguage}
              aria-label="Bytt språk"
              title="Bytt språk"
            >
              <i className="fa-solid fa-globe"></i>
            </button>

            {isAuthenticated ? (
              <>
                <button
                  className="theme-toggle"
                  onClick={() => setShowQrPopup(true)}
                  aria-label="Show QR Code"
                  title={t("showQR")}
                >
                  <i className="fa-solid fa-qrcode"></i>
                </button>
                <div className="user-menu-container">
                  <button
                    ref={userButtonRef}
                    className="theme-toggle user-button active"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    aria-label="User menu"
                    style={{ color: "var(--brand)" }}
                  >
                    <i className="fa-solid fa-user"></i>
                  </button>

                  {/* User Dropdown */}
                  {showUserDropdown && (
                    <div className="user-dropdown" ref={dropdownRef}>
                      <div className="user-dropdown-header">
                        <div className="user-avatar-small">
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" />
                          ) : (
                            <i className="fa-solid fa-user"></i>
                          )}
                        </div>
                        <div className="user-dropdown-info">
                          <span className="user-email">
                            {profile?.full_name ||
                              profile?.username ||
                              user?.email ||
                              "Loading..."}
                          </span>
                          <span className="user-role">
                            {profile?.access_level === "owner"
                              ? t("accessLevelOwner")
                              : profile?.access_level === "admin"
                              ? t("accessLevelAdmin")
                              : profile?.access_level === "moderator"
                              ? t("accessLevelMod")
                              : t("accessLevelUser")}
                          </span>
                        </div>
                      </div>
                      <div className="user-dropdown-divider"></div>
                      <button
                        className="user-dropdown-item"
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowProfilePopup(true);
                        }}
                      >
                        <i className="fa-solid fa-user-pen"></i>
                        {t("profile")}
                      </button>
                      {hasAccess("admin") && (
                        <Link
                          to="/admin"
                          className="user-dropdown-item"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <i className="fa-solid fa-chart-line"></i>
                          {t("adminDashboard")}
                        </Link>
                      )}
                      <div className="user-dropdown-divider"></div>
                      <button
                        className="user-dropdown-item logout"
                        onClick={handleLogout}
                      >
                        <i className="fa-solid fa-right-from-bracket"></i>
                        {t("logout")}
                      </button>
                    </div>
                  )}
                </div>
              </>
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

      {/* QR Code Popup */}
      {showQrPopup && (
        <div
          className="qr-popup-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowQrPopup(false);
            }
          }}
        >
          <div className="qr-popup">
            <button
              className="qr-popup-close"
              onClick={() => setShowQrPopup(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3>{t("scanQR")}</h3>
            <div className="qr-code-container">
              <QRCodeSVG
                value="https://garberg.wtf"
                size={256}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <p className="qr-url">garberg.wtf</p>
          </div>
        </div>
      )}

      {/* Profile Settings Popup */}
      {showProfilePopup && (
        <div
          className="profile-popup-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProfilePopup(false);
            }
          }}
        >
          <ProfileSettings onClose={() => setShowProfilePopup(false)} />
        </div>
      )}
    </>
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
