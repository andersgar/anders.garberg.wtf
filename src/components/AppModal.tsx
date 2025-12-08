import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  APP_LIBRARY,
  AppDefinition,
  UserApp,
  validateUrl,
  generateAppId,
  getAppById,
} from "../lib/apps";
import "../styles/app-modal.css";

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: UserApp) => void;
  onDelete?: (appId: string) => void;
  editingApp?: UserApp | null;
  existingAppIds?: string[]; // App IDs user already has
  adminEditingUser?: string; // When admin is editing another user's apps
  adminUserApps?: UserApp[]; // The user's apps when admin is editing
}

type ModalView = "library" | "configure" | "userApps";

export function AppModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingApp,
  existingAppIds = [],
  adminEditingUser,
  adminUserApps = [],
}: AppModalProps) {
  const { t } = useLanguage();
  const [view, setView] = useState<ModalView>("library");
  const [selectedApp, setSelectedApp] = useState<AppDefinition | null>(null);
  const [url, setUrl] = useState("");
  const [customName, setCustomName] = useState("");
  const [customIcon, setCustomIcon] = useState("fa-solid fa-link");
  const [urlError, setUrlError] = useState("");
  const [visible, setVisible] = useState(true);

  // Reset state when modal opens/closes or editing app changes
  useEffect(() => {
    if (isOpen) {
      if (editingApp) {
        // Editing existing app
        const appDef = getAppById(editingApp.appId);
        setSelectedApp(appDef || null);
        setUrl(editingApp.url);
        setCustomName(editingApp.customName || "");
        setCustomIcon(editingApp.customIcon || "fa-solid fa-link");
        setVisible(editingApp.visible);
        setView("configure");
      } else if (adminEditingUser) {
        // Admin viewing user's apps
        setSelectedApp(null);
        setUrl("");
        setCustomName("");
        setCustomIcon("fa-solid fa-link");
        setVisible(true);
        setView("userApps");
      } else {
        // Adding new app
        setSelectedApp(null);
        setUrl("");
        setCustomName("");
        setCustomIcon("fa-solid fa-link");
        setVisible(true);
        setView("library");
      }
      setUrlError("");
    }
  }, [isOpen, editingApp, adminEditingUser]);

  const handleSelectApp = (app: AppDefinition) => {
    setSelectedApp(app);
    setUrl("");
    setCustomName(app.isCustom ? "" : app.name);
    setUrlError("");
    setView("configure");
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value && !validateUrl(value)) {
      setUrlError(t("invalidUrl"));
    } else {
      setUrlError("");
    }
  };

  const handleSave = () => {
    if (!selectedApp) return;
    if (!url.trim()) {
      setUrlError(t("urlRequired"));
      return;
    }
    if (!validateUrl(url)) {
      setUrlError(t("invalidUrl"));
      return;
    }

    const appToEdit = adminEditingUser ? internalEditingApp : editingApp;
    const userApp: UserApp = {
      id: appToEdit?.id || generateAppId(),
      appId: selectedApp.id,
      url: url.trim(),
      customName: selectedApp.isCustom
        ? customName.trim() || "Custom Link"
        : undefined,
      customIcon: selectedApp.isCustom ? customIcon : undefined,
      visible: visible,
      order: appToEdit?.order ?? 999,
    };

    onSave(userApp);
    // Don't close modal if admin is editing - go back to userApps view
    if (adminEditingUser) {
      setView("userApps");
      setSelectedApp(null);
      setEditingApp(null);
    } else {
      onClose();
    }
  };

  // Internal state for editing app within admin flow
  const [internalEditingApp, setInternalEditingApp] = useState<UserApp | null>(
    null
  );

  // Use internal editing app for admin flow, prop for normal flow
  const currentEditingApp = adminEditingUser ? internalEditingApp : editingApp;

  const setEditingApp = (app: UserApp | null) => {
    if (adminEditingUser) {
      setInternalEditingApp(app);
    }
  };

  const handleDelete = () => {
    const appToDelete = currentEditingApp;
    if (appToDelete && onDelete) {
      onDelete(appToDelete.id);
      if (adminEditingUser) {
        setView("userApps");
        setInternalEditingApp(null);
      } else {
        onClose();
      }
    }
  };

  const handleBack = () => {
    if (adminEditingUser) {
      if (view === "configure") {
        setView(internalEditingApp ? "userApps" : "library");
        setSelectedApp(null);
        setInternalEditingApp(null);
      } else if (view === "library") {
        setView("userApps");
      } else {
        onClose();
      }
    } else if (editingApp) {
      onClose();
    } else {
      setView("library");
      setSelectedApp(null);
    }
  };

  const handleEditUserApp = (app: UserApp) => {
    setInternalEditingApp(app);
    const appDef = getAppById(app.appId);
    setSelectedApp(appDef || null);
    setUrl(app.url);
    setCustomName(app.customName || "");
    setCustomIcon(app.customIcon || "fa-solid fa-link");
    setVisible(app.visible);
    setView("configure");
  };

  const handleAddNewApp = () => {
    setInternalEditingApp(null);
    setSelectedApp(null);
    setUrl("");
    setCustomName("");
    setCustomIcon("fa-solid fa-link");
    setVisible(true);
    setView("library");
  };

  const getAppDisplayInfo = (app: UserApp) => {
    const appDef = getAppById(app.appId);
    if (appDef && !appDef.isCustom) {
      return {
        name: appDef.name,
        icon: appDef.icon,
        color: appDef.color,
        isImage: true,
      };
    }
    return {
      name: app.customName || "Custom Link",
      icon: app.customIcon || "fa-solid fa-link",
      color: "var(--brand)",
      isImage: false,
    };
  };

  if (!isOpen) return null;

  // Filter out apps user already has (except when editing)
  const availableApps = APP_LIBRARY.filter(
    (app) =>
      app.isCustom || // Custom links always available
      !existingAppIds.includes(app.id) ||
      (editingApp && editingApp.appId === app.id)
  );

  return (
    <div className="app-modal-overlay" onClick={onClose}>
      <div className="app-modal" onClick={(e) => e.stopPropagation()}>
        <div className="app-modal-header">
          {(view === "configure" ||
            (adminEditingUser && view === "library")) && (
            <button className="app-modal-back" onClick={handleBack}>
              <i className="fa-solid fa-arrow-left"></i>
            </button>
          )}
          <div className="app-modal-title">
            <h2>
              {view === "userApps"
                ? t("manageApps")
                : internalEditingApp || editingApp
                ? t("editApp")
                : view === "library"
                ? t("addApp")
                : t("configureApp")}
            </h2>
            {adminEditingUser && (
              <span className="app-modal-admin-badge">
                <i className="fa-solid fa-user-pen"></i> {adminEditingUser}
              </span>
            )}
          </div>
          <button className="app-modal-close" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="app-modal-content">
          {view === "userApps" ? (
            <>
              <div className="user-apps-header">
                <p className="app-modal-subtitle">{t("currentApps")}</p>
                <button className="user-apps-add-btn" onClick={handleAddNewApp}>
                  <i className="fa-solid fa-plus"></i> {t("addApp")}
                </button>
              </div>
              {adminUserApps.length === 0 ? (
                <div className="user-apps-empty">
                  <i className="fa-solid fa-grid-2"></i>
                  <p>{t("noAppsYet")}</p>
                </div>
              ) : (
                <div className="user-apps-list">
                  {adminUserApps.map((app) => {
                    const display = getAppDisplayInfo(app);
                    return (
                      <div
                        key={app.id}
                        className="user-app-item"
                        style={
                          {
                            "--app-color": display.color,
                          } as React.CSSProperties
                        }
                      >
                        <div className="user-app-icon">
                          {display.isImage ? (
                            <img src={display.icon} alt={display.name} />
                          ) : (
                            <i className={display.icon}></i>
                          )}
                        </div>
                        <div className="user-app-info">
                          <span className="user-app-name">{display.name}</span>
                          <span className="user-app-url">{app.url}</span>
                        </div>
                        <div className="user-app-actions">
                          <button
                            className="user-app-edit"
                            onClick={() => handleEditUserApp(app)}
                            title={t("editApp")}
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button
                            className="user-app-delete"
                            onClick={() => onDelete?.(app.id)}
                            title={t("delete")}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : view === "library" ? (
            <>
              <div className="app-modal-section-header app-modal-library-header">
                <span className="app-modal-library-title">
                  {t("selectAppFromLibrary")}
                </span>
              </div>
              {/* Recommended Apps */}
              {adminUserApps && adminUserApps.length > 0 && (
                <>
                  <div className="app-modal-section-title">Recommended</div>
                  <div className="app-library-grid">
                    {adminUserApps.map((app) => {
                      const display = getAppDisplayInfo(app);
                      return (
                        <button
                          key={app.id}
                          className="app-library-item"
                          onClick={() =>
                            handleSelectApp({
                              id: app.appId,
                              name: display.name,
                              icon: display.icon,
                              color: display.color,
                              description: "",
                              isCustom: false,
                            })
                          }
                          style={
                            {
                              "--app-color": display.color,
                            } as React.CSSProperties
                          }
                        >
                          <div className="app-library-icon">
                            {display.isImage ? (
                              <img src={display.icon} alt={display.name} />
                            ) : (
                              <i className={display.icon}></i>
                            )}
                          </div>
                          <span className="app-library-name">
                            {display.name}
                          </span>
                          <span className="app-library-desc">{app.url}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Homelab Apps */}
              <div className="app-modal-section-title">Homelab</div>
              <div className="app-library-grid">
                {availableApps
                  .filter((app) => !app.isCustom)
                  .map((app) => (
                    <button
                      key={app.id}
                      className="app-library-item"
                      onClick={() => handleSelectApp(app)}
                      style={
                        { "--app-color": app.color } as React.CSSProperties
                      }
                    >
                      <div className="app-library-icon">
                        <img src={app.icon} alt={app.name} />
                      </div>
                      <span className="app-library-name">{app.name}</span>
                      <span className="app-library-desc">
                        {app.description}
                      </span>
                    </button>
                  ))}
              </div>

              {/* Custom Link */}
              <div className="app-modal-section-title">Custom</div>
              <div className="app-library-grid">
                {availableApps
                  .filter((app) => app.isCustom)
                  .map((app) => (
                    <button
                      key={app.id}
                      className="app-library-item"
                      onClick={() => handleSelectApp(app)}
                      style={
                        { "--app-color": app.color } as React.CSSProperties
                      }
                    >
                      <div className="app-library-icon">
                        <i className={app.icon}></i>
                      </div>
                      <span className="app-library-name">{app.name}</span>
                      <span className="app-library-desc">
                        {app.description}
                      </span>
                    </button>
                  ))}
              </div>
            </>
          ) : (
            selectedApp && (
              <div className="app-configure">
                <div className="app-configure-preview">
                  <div
                    className="app-preview-icon"
                    style={
                      {
                        "--app-color": selectedApp.color,
                      } as React.CSSProperties
                    }
                  >
                    {selectedApp.isCustom ? (
                      <i className={customIcon}></i>
                    ) : (
                      <img src={selectedApp.icon} alt={selectedApp.name} />
                    )}
                  </div>
                  <span className="app-preview-name">
                    {selectedApp.isCustom
                      ? customName || "Custom Link"
                      : selectedApp.name}
                  </span>
                </div>

                {selectedApp.isCustom && (
                  <div className="app-form-group">
                    <label htmlFor="customName">{t("appName")}</label>
                    <input
                      type="text"
                      id="customName"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder={t("appNamePlaceholder")}
                    />
                  </div>
                )}

                <div className="app-form-group">
                  <label htmlFor="appUrl">
                    {t("appUrl")}
                    {selectedApp.defaultPort && (
                      <span className="app-port-hint">
                        {t("defaultPort")}: {selectedApp.defaultPort}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="appUrl"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="192.168.1.100:8096 or app.example.com"
                    className={urlError ? "error" : ""}
                  />
                  {urlError && (
                    <span className="app-form-error">{urlError}</span>
                  )}
                </div>

                <div className="app-form-group app-form-toggle">
                  <label htmlFor="appVisible">{t("showOnDashboard")}</label>
                  <button
                    type="button"
                    className={`toggle-switch ${visible ? "active" : ""}`}
                    onClick={() => setVisible(!visible)}
                    role="switch"
                    aria-checked={visible}
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {view === "configure" && (
          <div className="app-modal-footer">
            {(internalEditingApp || editingApp) && onDelete && (
              <button className="app-btn-delete" onClick={handleDelete}>
                <i className="fa-solid fa-trash"></i>
                {t("delete")}
              </button>
            )}
            <div className="app-modal-footer-right">
              <button className="app-btn-cancel" onClick={handleBack}>
                {t("cancel")}
              </button>
              <button
                className="app-btn-save"
                onClick={handleSave}
                disabled={!url.trim() || !!urlError}
              >
                <i className="fa-solid fa-check"></i>
                {t("save")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
