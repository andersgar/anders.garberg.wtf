import { useState, useEffect, useRef, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme, ColorTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { ProfileSettings } from "./ProfileSettings";
import { supabase } from "../lib/supabase";

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
  const { t, lang, setLang } = useLanguage();
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
  const [showUserSettingsPopup, setShowUserSettingsPopup] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(true);
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<"theme" | "user" | "language" | null>(null);
  const [navHidden, setNavHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement>(null);

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
        setShowUserSettingsPopup(false);
        setShowLanguageDropdown(false);
        setMobileSheet(null);
      }
    };

    if (
      showUserDropdown ||
      showQrPopup ||
      showColorDropdown ||
      showProfilePopup ||
      showUserSettingsPopup ||
      showLanguageDropdown ||
      mobileSheet
    ) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [
    showUserDropdown,
    showQrPopup,
    showColorDropdown,
    showProfilePopup,
    showUserSettingsPopup,
    showLanguageDropdown,
    mobileSheet,
  ]);

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
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(e.target as Node) &&
        languageButtonRef.current &&
        !languageButtonRef.current.contains(e.target as Node)
      ) {
        setShowLanguageDropdown(false);
      }
    };

    if (showUserDropdown || showColorDropdown || showLanguageDropdown || mobileSheet) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserDropdown, showColorDropdown, showLanguageDropdown, mobileSheet]);

  const handleLogout = async () => {
    await logout();
    setShowUserDropdown(false);
    setMobileSheet(null);
  };

  const handleColorThemeChange = (theme: ColorTheme) => {
    setColorTheme(theme);
    setShowColorDropdown(false);
  };

  const handleLanguageSelect = (language: "no" | "en") => {
    setLang(language);
    setShowLanguageDropdown(false);
    setMobileSheet(null);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setDeleteError(null);
    setDeleteSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwordMismatch"));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(t("passwordTooShort"));
      return;
    }

    if (!user?.email) {
      setPasswordError(t("loginError"));
      return;
    }

    setPasswordLoading(true);
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (reauthError) {
      setPasswordError(reauthError.message);
      setPasswordLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setPasswordLoading(false);
    if (updateError) {
      setPasswordError(updateError.message);
      return;
    }

    setPasswordSuccess(t("passwordUpdatedShort"));
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setDeleteSuccess(null);
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!user?.email) {
      setDeleteError(t("loginError"));
      return;
    }

    const confirmMessage = t("deleteAccountConfirm");
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleteLoading(true);
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: deletePassword,
    });

    if (reauthError) {
      setDeleteError(reauthError.message);
      setDeleteLoading(false);
      return;
    }

    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    const deleteFunctionUrl =
      import.meta.env.VITE_DELETE_USER_FUNCTION_URL ||
      import.meta.env.VITE_SUPABASE_DELETE_USER_FUNCTION_URL;

    if (!deleteFunctionUrl) {
      setDeleteError(t("deleteFunctionMissing"));
      setDeleteLoading(false);
      return;
    }

    const resp = await fetch(deleteFunctionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken || ""}`,
      },
    });

    setDeleteLoading(false);
    if (!resp.ok) {
      const message = await resp.text();
      setDeleteError(message || t("deleteAccountFailed"));
      return;
    }

    setDeleteSuccess(t("accountDeleted"));
    setDeletePassword("");
    await logout();
    setShowUserSettingsPopup(false);
    setMobileSheet(null);
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

            <div className="language-container">
              <button
                ref={languageButtonRef}
                className="theme-toggle"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                aria-label={t("language")}
                title={t("language")}
              >
                <i className="fa-solid fa-language"></i>
              </button>

              {showLanguageDropdown && (
                <div
                  className="language-dropdown"
                  ref={languageDropdownRef}
                  role="menu"
                  aria-label={t("language")}
                >
                  <div className="language-dropdown-title">{t("language")}</div>
                  <button
                    className={`language-pill ${lang === "no" ? "active" : ""}`}
                    onClick={() => handleLanguageSelect("no")}
                  >
                    <span className="language-pill__icon">
                      {lang === "no" && <i className="fa-solid fa-check"></i>}
                    </span>
                    <div className="language-pill__labels">
                      <span className="language-pill__name">Norsk</span>
                    </div>
                  </button>
                  <button
                    className={`language-pill ${lang === "en" ? "active" : ""}`}
                    onClick={() => handleLanguageSelect("en")}
                    >
                    <span className="language-pill__icon">
                      {lang === "en" && <i className="fa-solid fa-check"></i>}
                    </span>
                    <div className="language-pill__labels">
                      <span className="language-pill__name">English</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
            <Link to={appsLink} className="nav-apps-btn" aria-label={t("apps")} title={t("apps")}>
              <i className="fa-solid fa-grip"></i>
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
                      <button
                        className="user-dropdown-item"
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowUserSettingsPopup(true);
                        }}
                      >
                        <i className="fa-solid fa-gear"></i>
                        {t("userSettings")}
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
            onOpenUserMenu={() => setMobileSheet("user")}
            onOpenLanguageMenu={() => setMobileSheet("language")}
            onOpenThemeMenu={() => setMobileSheet("theme")}
          />
        </div>
      </nav>

      {/* Mobile sheets */}
      <MobileSheet
        isOpen={mobileSheet === "theme"}
        title={lang === "no" ? "Tema" : "Theme"}
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
        isOpen={mobileSheet === "language"}
        title={t("language")}
        onClose={() => setMobileSheet(null)}
      >
        <div className="sheet-section">
          <div className="sheet-subtitle">{t("chooseLanguage")}</div>
          <div className="language-grid">
            <button
              className={`language-option ${lang === "no" ? "active" : ""}`}
              onClick={() => handleLanguageSelect("no")}
            >
              <div className="language-badge">NO</div>
              <div className="language-labels">
                <span className="language-name">Norsk</span>
              </div>
              {lang === "no" && <i className="fa-solid fa-check"></i>}
            </button>
            <button
              className={`language-option ${lang === "en" ? "active" : ""}`}
              onClick={() => handleLanguageSelect("en")}
            >
              <div className="language-badge">EN</div>
              <div className="language-labels">
                <span className="language-name">English</span>
              </div>
              {lang === "en" && <i className="fa-solid fa-check"></i>}
            </button>
          </div>
        </div>
      </MobileSheet>

      <MobileSheet
        isOpen={mobileSheet === "user"}
        title={lang === "no" ? "Profil" : "Profile"}
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
        <button
          className="sheet-action"
          onClick={() => {
            setShowUserSettingsPopup(true);
            setMobileSheet(null);
          }}
        >
          <i className="fa-solid fa-gear"></i>
          {t("userSettings")}
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

      {showUserSettingsPopup && (
        <div
          className="profile-popup-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUserSettingsPopup(false);
            }
          }}
        >
          <div className="profile-settings">
            <div className="profile-settings-header">
              <h3>{t("userSettings")}</h3>
              <button
                className="profile-settings-close"
                aria-label="Close"
                onClick={() => setShowUserSettingsPopup(false)}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="profile-settings-content">
              <div className="profile-form">
                <div className="profile-form-group">
                  <label>{t("mobileMenuType")}</label>
                  <div className="profile-readonly-value">
                    <i className="fa-solid fa-clock"></i>
                    {t("comingSoon")}
                  </div>
                </div>

                <div className="collapsible-section">
                  <button
                    type="button"
                    className="collapsible-header"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                  >
                    <span>
                      <i className="fa-solid fa-lock"></i> {t("updatePassword")}
                    </span>
                    <i
                      className={`fa-solid fa-chevron-${
                        showPasswordSection ? "up" : "down"
                      }`}
                    ></i>
                  </button>
                  {showPasswordSection && (
                    <form className="collapsible-body" onSubmit={handlePasswordChange}>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={t("currentPassword")}
                        required
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t("newPassword")}
                        required
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t("confirmPassword")}
                        required
                      />
                      {passwordError && (
                        <div className="profile-readonly-value" style={{ color: "#ef4444" }}>
                          <i className="fa-solid fa-circle-exclamation"></i> {passwordError}
                        </div>
                      )}
                      {passwordSuccess && (
                        <div className="profile-readonly-value" style={{ color: "var(--accent)" }}>
                          <i className="fa-solid fa-circle-check"></i> {passwordSuccess}
                        </div>
                      )}
                      <button
                        className="profile-btn-save"
                        type="submit"
                        disabled={passwordLoading}
                        style={{ width: "100%" }}
                      >
                        {passwordLoading ? t("updating") : t("updatePassword")}
                      </button>
                    </form>
                  )}
                </div>

                <div className="collapsible-section">
                  <button
                    type="button"
                    className="collapsible-header"
                    onClick={() => setShowDeleteSection(!showDeleteSection)}
                  >
                    <span>
                      <i className="fa-solid fa-user-slash"></i> {t("deleteAccount")}
                    </span>
                    <i
                      className={`fa-solid fa-chevron-${
                        showDeleteSection ? "up" : "down"
                      }`}
                    ></i>
                  </button>
                  {showDeleteSection && (
                    <form className="collapsible-body" onSubmit={handleDeleteAccount}>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder={t("currentPassword")}
                        required
                      />
                      {deleteError && (
                        <div className="profile-readonly-value" style={{ color: "#ef4444" }}>
                          <i className="fa-solid fa-circle-exclamation"></i> {deleteError}
                        </div>
                      )}
                      {deleteSuccess && (
                        <div className="profile-readonly-value" style={{ color: "var(--accent)" }}>
                          <i className="fa-solid fa-circle-check"></i> {deleteSuccess}
                        </div>
                      )}
                      <button
                        className="profile-btn-save"
                        type="submit"
                        disabled={deleteLoading}
                        style={{ width: "100%", background: "#ef4444" }}
                      >
                        {deleteLoading ? t("deletingAccount") : t("confirmDelete")}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
            <div className="profile-settings-footer">
              <button
                className="profile-btn-cancel"
                onClick={() => setShowUserSettingsPopup(false)}
              >
                {t("close")}
              </button>
            </div>
          </div>
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
  onOpenUserMenu: () => void;
  onOpenThemeMenu: () => void;
  onOpenLanguageMenu: () => void;
};

function MobileMenu({
  isAuthenticated,
  isAboutPage,
  aboutPath,
  appsLink,
  onOpenUserMenu,
  onOpenThemeMenu,
  onOpenLanguageMenu,
}: MobileMenuProps) {
  const { t } = useLanguage();

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
              onOpenLanguageMenu();
              closeMenu();
            }}
            aria-label={t("language")}
          >
            <i className="fa-solid fa-language"></i>
          </button>
          <Link
            to={appsLink}
            className="nav-apps-btn"
            onClick={closeMenu}
            aria-label={t("apps")}
            title={t("apps")}
          >
            <i className="fa-solid fa-grip"></i>
            <span>{t("apps")}</span>
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
