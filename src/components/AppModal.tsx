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
}

type ModalView = "library" | "configure";

export function AppModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingApp,
  existingAppIds = [],
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
  }, [isOpen, editingApp]);

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

    const userApp: UserApp = {
      id: editingApp?.id || generateAppId(),
      appId: selectedApp.id,
      url: url.trim(),
      customName: selectedApp.isCustom
        ? customName.trim() || "Custom Link"
        : undefined,
      customIcon: selectedApp.isCustom ? customIcon : undefined,
      visible: visible,
      order: editingApp?.order ?? 999,
    };

    onSave(userApp);
    onClose();
  };

  const handleDelete = () => {
    if (editingApp && onDelete) {
      onDelete(editingApp.id);
      onClose();
    }
  };

  const handleBack = () => {
    if (editingApp) {
      onClose();
    } else {
      setView("library");
      setSelectedApp(null);
    }
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
          {view === "configure" && (
            <button className="app-modal-back" onClick={handleBack}>
              <i className="fa-solid fa-arrow-left"></i>
            </button>
          )}
          <h2>
            {editingApp
              ? t("editApp")
              : view === "library"
              ? t("addApp")
              : t("configureApp")}
          </h2>
          <button className="app-modal-close" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="app-modal-content">
          {view === "library" ? (
            <>
              <p className="app-modal-subtitle">{t("selectAppFromLibrary")}</p>
              <div className="app-library-grid">
                {availableApps.map((app) => (
                  <button
                    key={app.id}
                    className="app-library-item"
                    onClick={() => handleSelectApp(app)}
                    style={{ "--app-color": app.color } as React.CSSProperties}
                  >
                    <div className="app-library-icon">
                      {app.isCustom ? (
                        <i className={app.icon}></i>
                      ) : (
                        <img src={app.icon} alt={app.name} />
                      )}
                    </div>
                    <span className="app-library-name">{app.name}</span>
                    <span className="app-library-desc">{app.description}</span>
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
            {editingApp && onDelete && (
              <button className="app-btn-delete" onClick={handleDelete}>
                <i className="fa-solid fa-trash"></i>
                {t("delete")}
              </button>
            )}
            <div className="app-modal-footer-right">
              <button className="app-btn-cancel" onClick={onClose}>
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
