import { useState, useEffect, useRef, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const { t, lang, toggleLanguage } = useLanguage();
  const location = useLocation();
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
  const [mobileSheet, setMobileSheet] = useState<"theme" | "user" | null>(null);
  const [navHidden, setNavHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);

  // Determine if we're on the about page (with sections) or dashboard
  const isAboutPage =
    location.pathname === "/about" || location.pathname === "/om-meg";
  const aboutPath = lang === "no" ? "/om-meg" : "/about";
  const appsLink = isAuthenticated ? "/#apps" : "/?guest=1#apps";

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
        setMobileSheet(null);
      }
    };

    if (
      showUserDropdown ||
      showQrPopup ||
      showColorDropdown ||
      showProfilePopup ||
      mobileSheet
    ) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [showUserDropdown, showQrPopup, showColorDropdown, showProfilePopup, mobileSheet]);

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

    if (showUserDropdown || showColorDropdown || mobileSheet) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserDropdown, showColorDropdown, mobileSheet]);

  const handleLogout = async () => {
    await logout();
    setShowUserDropdown(false);
    setMobileSheet(null);
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
            <Link to={isAuthenticated ? "/" : aboutPath} aria-label="Hjem">
              <span>Anders Garberg</span>
            </Link>
          </div>

          <div className="nav-links">
            {/* Show different links based on auth status and current page */}
            {!isAboutPage && <Link to={aboutPath}>{t("aboutMe")}</Link>}
            <a href={isAboutPage ? "#contact" : aboutPath + "#contact"}>
              {t("contact")}
            </a>
            {/* Removed text login link in favor of icon button */}

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
              aria-label="Bytt spr?k"
              title="Bytt spr?k"
            >
            <i className="fa-solid fa-globe"></i>
            </button>
            <Link to={appsLink} className="nav-apps-btn" aria-label={t("apps")} title={t("apps")}>
              <i className="fa-solid fa-grip"></i><span>{t("apps")}</span>
              <span>{t("apps")}</span>
            </Link>

            {isAuthenticated ? (
              <>
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
          <MobileMenu
            isAuthenticated={isAuthenticated}
            isAboutPage={isAboutPage}
            aboutPath={aboutPath}
            appsLink={appsLink}
            hasAdminAccess={hasAccess("admin")}
            onOpenUserMenu={() => setMobileSheet("user")}
            onOpenThemeMenu={() => setMobileSheet("theme")}
            onLogout={handleLogout}
          />
        </div>
      </nav>

      {/* Mobile sheets */}
      <MobileSheet
        isOpen={mobileSheet === "theme"}
        title={t("colorTheme")}
        onClose={() => setMobileSheet(null)}
      >
        <div className="sheet-section">
          <div className="sheet-subtitle">{t("colorTheme")}</div>
          <div className="color-theme-grid">
            {colorThemes.map((themeItem) => (
              <button
                key={themeItem.id}
                className={`color-theme-tile ${
                  colorTheme === themeItem.id ? "active" : ""
                }`}
                onClick={() => handleColorThemeChange(themeItem.id)}
                title={getThemeTranslation(themeItem.id)}
              >
                <div
                  className="color-theme-gradient"
                  style={{ background: themeItem.gradient }}
                />
                {colorTheme === themeItem.id && (
                  <div className="color-theme-active-indicator">
                    <i className="fa-solid fa-check"></i>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="sheet-section">
          <div className="sheet-subtitle">Mode</div>
          <div className="theme-mode-toggle sheet-mode-toggle">
            <button
              className={`theme-mode-btn ${theme === "light" ? "active" : ""}`}
              onClick={() => setTheme("light")}
              aria-label="Light mode"
            >
              <i className="fa-solid fa-sun"></i>
            </button>
            <button
              className={`theme-mode-btn ${theme === "dark" ? "active" : ""}`}
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
        </div>

        <div className="sheet-section">
          <div className="sheet-subtitle">{t("blobs")}</div>
          <div className="blob-count-control sheet-blob-control">
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
      </MobileSheet>

      <MobileSheet
        isOpen={mobileSheet === "user"}
        title={user?.email || t("profile")}
        onClose={() => setMobileSheet(null)}
      >
        <div className="sheet-user-header">
          <div className="user-avatar-small">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" />
            ) : (
              <i className="fa-solid fa-user"></i>
            )}
          </div>
          <div className="sheet-user-meta">
            <span className="user-email">
              {profile?.full_name || profile?.username || user?.email}
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

        <button
          className="sheet-action"
          onClick={() => {
            setShowProfilePopup(true);
            setMobileSheet(null);
          }}
        >
          <i className="fa-solid fa-user-pen"></i>
          {t("profile")}
        </button>
        {hasAccess("admin") && (
          <Link
            to="/admin"
            className="sheet-action"
            onClick={() => setMobileSheet(null)}
          >
            <i className="fa-solid fa-chart-line"></i>
            {t("adminDashboard")}
          </Link>
        )}
        <button className="sheet-action logout" onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          {t("logout")}
        </button>
      </MobileSheet>

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

type MobileMenuProps = {
  isAuthenticated: boolean;
  isAboutPage: boolean;
  aboutPath: string;
  appsLink: string;
  hasAdminAccess: boolean;
  onOpenUserMenu: () => void;
  onOpenThemeMenu: () => void;
  onLogout: () => void;
};

function MobileMenu({
  isAuthenticated,
  isAboutPage,
  aboutPath,
  appsLink,
  hasAdminAccess,
  onOpenUserMenu,
  onOpenThemeMenu,
  onLogout,
}: MobileMenuProps) {
  const { t, toggleLanguage } = useLanguage();

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
        {/* Show different links based on auth status and current page */}
        {isAuthenticated && !isAboutPage && (
          <Link to={aboutPath} onClick={closeMenu}>
            {t("aboutMe")}
          </Link>
        )}
        {isAuthenticated && isAboutPage && (
          <Link to="/" onClick={closeMenu}>
            {t("dashboard")}
          </Link>
        )}
        {isAboutPage && (
          <>
            <a href="#experience" onClick={closeMenu}>
              {t("experience")}
            </a>
            <a href="#about" onClick={closeMenu}>
              {t("about")}
            </a>
          </>
        )}
        {!isAuthenticated && !isAboutPage && (
          <Link to={aboutPath} onClick={closeMenu}>
            {t("aboutMe")}
          </Link>
        )}
        <a
          href={isAboutPage ? "#contact" : aboutPath + "#contact"}
          onClick={closeMenu}
        >
          {t("contact")}
        </a>

        <div className="mobile-buttons">
          <button
            className="theme-toggle"
            onClick={() => {
              onOpenThemeMenu();
              closeMenu();
            }}
            aria-label="Bytt tema"
          >
            <i className="fa-solid fa-palette"></i>
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
          <Link
            to={appsLink}
            className="theme-toggle apps-toggle apps-toggle--wide"
            onClick={closeMenu}
            aria-label={t("apps")}
            title={t("apps")}
          >
            <i className="fa-solid fa-grip"></i><span>{t("apps")}</span>
          </Link>
          {isAuthenticated ? (
            <button
              className="theme-toggle user-toggle"
              onClick={() => {
                onOpenUserMenu();
                closeMenu();
              }}
              aria-label={t("profile")}
              title={t("profile")}
            >
              <i className="fa-solid fa-user"></i>
            </button>
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

type MobileSheetProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

function MobileSheet({ isOpen, title, onClose, children }: MobileSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="mobile-sheet-overlay" role="presentation" onClick={onClose}>
      <div
        className="mobile-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-sheet__header">
          <span className="mobile-sheet__title">{title}</span>
          <button className="theme-toggle" aria-label="Close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="mobile-sheet__content">{children}</div>
      </div>
    </div>
  );
}
