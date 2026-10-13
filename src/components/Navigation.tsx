import { useState, useEffect, useRef, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CaretDown,
  CaretUp,
  ChartLine,
  Check,
  CheckCircle,
  CircleHalf,
  DotsThree,
  Gear,
  List,
  Lock,
  SignIn,
  QrCode,
  SignOut,
  SquaresFour,
  User,
  UserCircle,
  UserMinus,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { ProfileSettings } from "./ProfileSettings";
import { SiteQrModal } from "./SiteQrModal";
import { supabase } from "../lib/supabase";

export function Navigation() {
  const { t, lang, toggleLanguage } = useLanguage();
  const location = useLocation();
  const { toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { profile, hasAccess } = useProfile();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showUserSettingsPopup, setShowUserSettingsPopup] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [mobileNavType, setMobileNavType] = useState<"hamburger" | "bottom">(
    () =>
      (localStorage.getItem("mobileNavType") as "hamburger" | "bottom") ||
      "bottom"
  );

  const toggleMobileSheet = (target: "user") => {
    setMobileSheet((prev) => (prev === target ? null : target));
  };
  const [mobileSheet, setMobileSheet] = useState<"user" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  const isAboutPage =
    location.pathname === "/about" || location.pathname === "/om-meg";
  const aboutPath = lang === "no" ? "/om-meg" : "/about";
  const appsLink = isAuthenticated ? "/#apps" : "/?guest=1#apps";

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowUserDropdown(false);
        setShowProfilePopup(false);
        setShowUserSettingsPopup(false);
        setMobileSheet(null);
      }
    };

    if (
      showUserDropdown ||
      showProfilePopup ||
      showUserSettingsPopup ||
      mobileSheet
    ) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [
    showUserDropdown,
    showProfilePopup,
    showUserSettingsPopup,
    mobileSheet,
  ]);

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
    };

    if (showUserDropdown || mobileSheet) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserDropdown, mobileSheet]);

  const handleLogout = async () => {
    await logout();
    setShowUserDropdown(false);
    setMobileSheet(null);
  };

  const handleMobileNavChange = (type: "hamburger" | "bottom") => {
    setMobileNavType(type);
    localStorage.setItem("mobileNavType", type);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setDeleteError(null);
    setDeleteSuccess(null);
    setResetLoading(false);

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

  const handleSendResetLink = async () => {
    if (!user?.email) {
      setPasswordError(t("loginError"));
      return;
    }
    setPasswordError(null);
    setPasswordSuccess(null);
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetLoading(false);
    if (error) {
      setPasswordError(t("resetRequestError"));
    } else {
      setPasswordSuccess(t("resetEmailSent"));
    }
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

  const accessLabel =
    profile?.access_level === "owner"
      ? t("accessLevelOwner")
      : profile?.access_level === "admin"
      ? t("accessLevelAdmin")
      : profile?.access_level === "moderator"
      ? t("accessLevelMod")
      : t("accessLevelUser");

  return (
    <>
      <nav className="site-nav" aria-label="Primary">
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
            {!isAboutPage && <Link to={aboutPath}>{t("aboutMe")}</Link>}
            <a href={isAboutPage ? "#contact" : aboutPath + "#contact"}>
              {t("contact")}
            </a>

            <button
              className="theme-toggle lang-toggle"
              onClick={toggleLanguage}
              aria-label={t("language")}
              title={t("language")}
            >
              {lang.toUpperCase()}
            </button>

            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={t("themeToggle")}
              title={t("themeToggle")}
            >
              <CircleHalf aria-hidden="true" />
            </button>

            <Link
              to={appsLink}
              className="nav-apps-btn"
              aria-label={t("apps")}
              title={t("apps")}
            >
              <SquaresFour aria-hidden="true" />
              <span>{t("apps")}</span>
            </Link>

            {isAuthenticated ? (
              <div className="user-menu-container">
                <button
                  ref={userButtonRef}
                  className="theme-toggle active"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  aria-label="User menu"
                  aria-expanded={showUserDropdown}
                >
                  <User aria-hidden="true" />
                </button>

                {showUserDropdown && (
                  <div className="user-dropdown" ref={dropdownRef}>
                    <div className="user-dropdown-header">
                      <div className="user-avatar-small">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="Avatar" />
                        ) : (
                          <User aria-hidden="true" />
                        )}
                      </div>
                      <div className="user-dropdown-info">
                        <span className="user-email">
                          {profile?.full_name || user?.email || "Loading..."}
                        </span>
                        <span className="user-role">{accessLabel}</span>
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
                      <UserCircle aria-hidden="true" />
                      {t("profile")}
                    </button>
                    <button
                      className="user-dropdown-item"
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowUserSettingsPopup(true);
                      }}
                    >
                      <Gear aria-hidden="true" />
                      {t("userSettings")}
                    </button>
                    {hasAccess("admin") && (
                      <Link
                        to="/#admin"
                        className="user-dropdown-item"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <ChartLine aria-hidden="true" />
                        {t("adminDashboard")}
                      </Link>
                    )}
                    <div className="user-dropdown-divider"></div>
                    <button
                      className="user-dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <SignOut aria-hidden="true" />
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
                <SignIn aria-hidden="true" />
              </Link>
            )}
          </div>

          {mobileNavType === "hamburger" && (
            <MobileMenu
              isAuthenticated={isAuthenticated}
              isAboutPage={isAboutPage}
              aboutPath={aboutPath}
              appsLink={appsLink}
              onOpenUserMenu={() => toggleMobileSheet("user")}
              onToggleLanguage={toggleLanguage}
              onToggleTheme={toggleTheme}
              onCloseSheet={() => setMobileSheet(null)}
            />
          )}
        </div>
      </nav>

      {mobileNavType === "bottom" && (
        <MobileBottomBar
          isAuthenticated={isAuthenticated}
          isAboutPage={isAboutPage}
          aboutPath={aboutPath}
          appsLink={appsLink}
          onOpenUserMenu={() => toggleMobileSheet("user")}
          onToggleLanguage={toggleLanguage}
          onToggleTheme={toggleTheme}
          onCloseSheet={() => setMobileSheet(null)}
        />
      )}

      <MobileSheet
        isOpen={mobileSheet === "user"}
        title={lang === "no" ? "Profil" : "Profile"}
        onClose={() => setMobileSheet(null)}
        offsetBottomBar={mobileNavType === "bottom"}
      >
        <div className="sheet-user-header">
          <div className="user-avatar-small">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" />
            ) : (
              <User aria-hidden="true" />
            )}
          </div>
          <div className="sheet-user-meta">
            <span className="user-email">
              {profile?.full_name || user?.email}
            </span>
            <span className="user-role">{accessLabel}</span>
          </div>
        </div>

        <button
          className="sheet-action"
          onClick={() => {
            setShowProfilePopup(true);
            setMobileSheet(null);
          }}
        >
          <UserCircle aria-hidden="true" />
          {t("profile")}
        </button>
        <button
          className="sheet-action"
          onClick={() => {
            setShowUserSettingsPopup(true);
            setMobileSheet(null);
          }}
        >
          <Gear aria-hidden="true" />
          {t("userSettings")}
        </button>
        {hasAccess("admin") && (
          <Link
            to="/#admin"
            className="sheet-action"
            onClick={() => setMobileSheet(null)}
          >
            <ChartLine aria-hidden="true" />
            {t("adminDashboard")}
          </Link>
        )}
        <button className="sheet-action logout" onClick={handleLogout}>
          <SignOut aria-hidden="true" />
          {t("logout")}
        </button>
      </MobileSheet>

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
                <X aria-hidden="true" />
              </button>
            </div>
            <div className="profile-settings-content">
              <div className="profile-form">
                <div className="profile-form-group">
                  <label>{t("mobileMenuType")}</label>
                  <div className="mobile-nav-options">
                    <button
                      type="button"
                      className={`mobile-nav-option ${
                        mobileNavType === "hamburger" ? "active" : ""
                      }`}
                      onClick={() => handleMobileNavChange("hamburger")}
                    >
                      <span className="mobile-nav-option__icon-text">
                        <List aria-hidden="true" />
                        {t("mobileNavHamburger")}
                      </span>
                      {mobileNavType === "hamburger" && (
                        <span className="mobile-nav-option__check">
                          <Check aria-hidden="true" />
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      className={`mobile-nav-option ${
                        mobileNavType === "bottom" ? "active" : ""
                      }`}
                      onClick={() => handleMobileNavChange("bottom")}
                    >
                      <span className="mobile-nav-option__icon-text">
                        <DotsThree aria-hidden="true" />
                        {t("mobileNavBottom")}
                      </span>
                      {mobileNavType === "bottom" && (
                        <span className="mobile-nav-option__check">
                          <Check aria-hidden="true" />
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="sheet-subtitle">{t("accountManagement")}</div>

                <div className="collapsible-section">
                  <button
                    type="button"
                    className="collapsible-header"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    aria-expanded={showPasswordSection}
                  >
                    <span>
                      <Lock aria-hidden="true" /> {t("updatePassword")}
                    </span>
                    {showPasswordSection ? (
                      <CaretUp aria-hidden="true" />
                    ) : (
                      <CaretDown aria-hidden="true" />
                    )}
                  </button>
                  {showPasswordSection && (
                    <form
                      className="collapsible-body"
                      onSubmit={handlePasswordChange}
                    >
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={t("currentPassword")}
                        aria-label={t("currentPassword")}
                        required
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t("newPassword")}
                        aria-label={t("newPassword")}
                        required
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t("confirmPassword")}
                        aria-label={t("confirmPassword")}
                        required
                      />
                      <button
                        type="button"
                        className="profile-btn-cancel"
                        onClick={handleSendResetLink}
                        disabled={resetLoading}
                        style={{ width: "100%" }}
                      >
                        {resetLoading ? t("sending") : t("sendResetLink")}
                      </button>
                      {passwordError && (
                        <div
                          className="profile-readonly-value"
                          style={{ color: "var(--danger)" }}
                        >
                          <WarningCircle aria-hidden="true" /> {passwordError}
                        </div>
                      )}
                      {passwordSuccess && (
                        <div className="profile-readonly-value">
                          <CheckCircle aria-hidden="true" /> {passwordSuccess}
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
                    className="collapsible-header danger"
                    onClick={() => setShowDeleteSection(!showDeleteSection)}
                    aria-expanded={showDeleteSection}
                  >
                    <span>
                      <UserMinus aria-hidden="true" /> {t("deleteAccount")}
                    </span>
                    {showDeleteSection ? (
                      <CaretUp aria-hidden="true" />
                    ) : (
                      <CaretDown aria-hidden="true" />
                    )}
                  </button>
                  {showDeleteSection && (
                    <form
                      className="collapsible-body"
                      onSubmit={handleDeleteAccount}
                    >
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder={t("currentPassword")}
                        aria-label={t("currentPassword")}
                        required
                      />
                      {deleteError && (
                        <div
                          className="profile-readonly-value"
                          style={{ color: "var(--danger)" }}
                        >
                          <WarningCircle aria-hidden="true" /> {deleteError}
                        </div>
                      )}
                      {deleteSuccess && (
                        <div className="profile-readonly-value">
                          <CheckCircle aria-hidden="true" /> {deleteSuccess}
                        </div>
                      )}
                      <button
                        className="profile-btn-save"
                        type="submit"
                        disabled={deleteLoading}
                        style={{
                          width: "100%",
                          background: "var(--danger)",
                          borderColor: "var(--danger)",
                          color: "var(--text)",
                        }}
                      >
                        {deleteLoading
                          ? t("deletingAccount")
                          : t("confirmDelete")}
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

export function NavSpacer() {
  return <div className="nav-spacer" />;
}

type MobileMenuProps = {
  isAuthenticated: boolean;
  isAboutPage: boolean;
  aboutPath: string;
  appsLink: string;
  onOpenUserMenu: () => void;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  onCloseSheet?: () => void;
};

function MobileMenu({
  isAuthenticated,
  isAboutPage,
  aboutPath,
  appsLink,
  onOpenUserMenu,
  onToggleLanguage,
  onToggleTheme,
  onCloseSheet,
}: MobileMenuProps) {
  const { t, lang } = useLanguage();

  const closeMenu = () => {
    document.getElementById("hamburger")?.classList.remove("active");
    document.getElementById("mobileMenu")?.classList.remove("active");
    document.getElementById("mobileOverlay")?.classList.remove("active");
    document.body.classList.remove("mobile-menu-open");
  };

  // The menu is driven by DOM classes rather than React state, so if this
  // component unmounts while the menu is open (e.g. switching to the bottom
  // bar from inside it) the scroll lock would be left on body forever.
  useEffect(() => closeMenu, []);

  const handleMenuToggle = () => {
    onCloseSheet?.();
    const isOpening = !document.body.classList.contains("mobile-menu-open");
    document
      .getElementById("hamburger")
      ?.classList.toggle("active", isOpening);
    document
      .getElementById("mobileMenu")
      ?.classList.toggle("active", isOpening);
    document
      .getElementById("mobileOverlay")
      ?.classList.toggle("active", isOpening);
    document.body.classList.toggle("mobile-menu-open", isOpening);
  };

  return (
    <>
      <button
        type="button"
        className="hamburger"
        id="hamburger"
        onClick={handleMenuToggle}
        aria-label="Åpne meny"
        aria-controls="mobileMenu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div
        className="mobile-overlay"
        id="mobileOverlay"
        onClick={closeMenu}
      ></div>

      <div className="mobile-menu" id="mobileMenu">
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
            <a href="#projects" onClick={closeMenu}>
              {t("projects")}
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

        <div className="mobile-menu-actions">
          <Link
            to={appsLink}
            className="mobile-menu-action apps-highlight"
            onClick={closeMenu}
          >
            <SquaresFour aria-hidden="true" />
            <span>{t("apps")}</span>
          </Link>
          <button className="mobile-menu-action" onClick={onToggleLanguage}>
            <span className="mono lang-code" aria-hidden="true">
              {lang.toUpperCase()}
            </span>
            <span>{t("language")}</span>
          </button>
          <button className="mobile-menu-action" onClick={onToggleTheme}>
            <CircleHalf aria-hidden="true" />
            <span>{t("themeToggle")}</span>
          </button>
          {isAuthenticated ? (
            <button
              className="mobile-menu-action"
              onClick={() => {
                onOpenUserMenu();
                closeMenu();
              }}
            >
              <User aria-hidden="true" />
              <span>{t("profile")}</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="mobile-menu-action"
              onClick={closeMenu}
            >
              <SignIn aria-hidden="true" />
              <span>{t("login")}</span>
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
  offsetBottomBar?: boolean;
};

function MobileSheet({
  isOpen,
  title,
  onClose,
  children,
  offsetBottomBar = false,
}: MobileSheetProps) {
  if (!isOpen) return null;

  return (
    <div
      className={`mobile-sheet-overlay ${
        offsetBottomBar ? "bottom-offset" : ""
      }`}
      role="presentation"
      onClick={onClose}
    >
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
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="mobile-sheet__content">{children}</div>
      </div>
    </div>
  );
}

type MobileBottomBarProps = {
  isAuthenticated: boolean;
  isAboutPage: boolean;
  aboutPath: string;
  appsLink: string;
  onOpenUserMenu: () => void;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  onCloseSheet: () => void;
};

function MobileBottomBar({
  isAuthenticated,
  isAboutPage,
  aboutPath,
  appsLink,
  onOpenUserMenu,
  onToggleLanguage,
  onToggleTheme,
  onCloseSheet,
}: MobileBottomBarProps) {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".mobile-bottom-bar") &&
        !target.closest(".mobile-bottom-menu")
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <>
      <div className="mobile-bottom-bar">
        <div className="bottom-bar-section left">
          <button
            className="theme-toggle lang-toggle"
            onClick={onToggleLanguage}
            aria-label={t("language")}
          >
            {lang.toUpperCase()}
          </button>
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={t("themeToggle")}
          >
            <CircleHalf aria-hidden="true" />
          </button>
        </div>
        <div className="bottom-bar-section center">
          <button
            className={`theme-toggle ${open ? "active" : ""}`}
            onClick={() => {
              setOpen(!open);
              onCloseSheet();
            }}
            aria-label="Åpne meny"
            aria-expanded={open}
          >
            <List aria-hidden="true" />
          </button>
        </div>
        <div className="bottom-bar-section right">
          <button
            className="theme-toggle"
            onClick={() => {
              setOpen(false);
              setShowQr(true);
            }}
            aria-label={t("siteQr")}
            title={t("siteQr")}
          >
            <QrCode aria-hidden="true" />
          </button>
          {isAuthenticated ? (
            <button
              className="theme-toggle user-toggle"
              onClick={() => onOpenUserMenu()}
              aria-label={t("profile")}
              title={t("profile")}
            >
              <User aria-hidden="true" />
            </button>
          ) : (
            <Link to="/login" className="theme-toggle" aria-label="Login">
              <SignIn aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
      {showQr && <SiteQrModal onClose={() => setShowQr(false)} />}

      {open && (
        <div className="mobile-bottom-menu">
          {isAuthenticated && !isAboutPage && (
            <Link to={aboutPath} onClick={() => setOpen(false)}>
              {t("aboutMe")}
            </Link>
          )}
          {isAboutPage && (
            <>
              <a href="#experience" onClick={() => setOpen(false)}>
                {t("experience")}
              </a>
              <a href="#projects" onClick={() => setOpen(false)}>
                {t("projects")}
              </a>
              <a href="#about" onClick={() => setOpen(false)}>
                {t("about")}
              </a>
            </>
          )}
          {!isAuthenticated && !isAboutPage && (
            <Link to={aboutPath} onClick={() => setOpen(false)}>
              {t("aboutMe")}
            </Link>
          )}
          <a
            href={isAboutPage ? "#contact" : aboutPath + "#contact"}
            onClick={() => setOpen(false)}
          >
            {t("contact")}
          </a>
          <Link
            to={appsLink}
            onClick={() => setOpen(false)}
            className="mobile-menu-apps-link"
          >
            <SquaresFour aria-hidden="true" />
            <span>{t("apps")}</span>
          </Link>
        </div>
      )}
    </>
  );
}
