import { useState, useRef } from "react";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";

interface ProfileSettingsProps {
  onClose: () => void;
}

export function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
  });

  if (loading || !profile) {
    return (
      <div className="profile-settings-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
      </div>
    );
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadAvatar(file);
      if (!url) {
        alert(
          "Failed to upload avatar. Make sure the storage bucket is configured in Supabase."
        );
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      alert("Failed to upload avatar. Check console for details.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile({
      full_name: formData.full_name || null,
      bio: formData.bio || null,
    });
    setIsSaving(false);
    onClose();
  };

  const getAccessLevelLabel = (level: string): string => {
    const labels: Record<string, string> = {
      user: t("accessLevelUser"),
      moderator: t("accessLevelMod"),
      admin: t("accessLevelAdmin"),
      owner: t("accessLevelOwner"),
    };
    return labels[level] || level;
  };

  const getAccessLevelColor = (level: string): string => {
    const colors: Record<string, string> = {
      user: "var(--muted)",
      moderator: "#3b82f6",
      admin: "#f59e0b",
      owner: "#ef4444",
    };
    return colors[level] || "var(--muted)";
  };

  return (
    <div className="profile-settings">
      <div className="profile-settings-header">
        <h3>{t("profileSettings")}</h3>
        <button className="profile-settings-close" onClick={onClose}>
          <i className="fa-solid fa-times"></i>
        </button>
      </div>

      <div className="profile-settings-content">
        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div
            className="profile-avatar-large"
            onClick={handleAvatarClick}
            role="button"
            tabIndex={0}
          >
            {isUploading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" />
            ) : (
              <i className="fa-solid fa-user"></i>
            )}
            <div className="profile-avatar-overlay">
              <i className="fa-solid fa-camera"></i>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
          <span className="profile-avatar-hint">{t("clickToChange")}</span>
        </div>

        {/* Access Level Badge */}
        <div
          className="profile-access-badge"
          style={{
            backgroundColor: `color-mix(in oklab, ${getAccessLevelColor(
              profile.access_level
            )} 15%, transparent)`,
            color: getAccessLevelColor(profile.access_level),
            borderColor: getAccessLevelColor(profile.access_level),
          }}
        >
          <i className="fa-solid fa-shield"></i>
          {getAccessLevelLabel(profile.access_level)}
        </div>

        {/* Form Fields */}
        <div className="profile-form">
          <div className="profile-form-group">
            <label htmlFor="full_name">{t("fullName")}</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder={t("fullNamePlaceholder")}
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="bio">{t("bio")}</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder={t("bioPlaceholder")}
              rows={3}
            />
          </div>

          <div className="profile-form-group readonly">
            <label>{t("email")}</label>
            <div className="profile-readonly-value">
              <i className="fa-solid fa-envelope"></i>
              {profile.email}
            </div>
          </div>

          <div className="profile-form-group readonly">
            <label>{t("memberSince")}</label>
            <div className="profile-readonly-value">
              <i className="fa-solid fa-calendar"></i>
              {new Date(profile.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-settings-footer">
        <button className="profile-btn-cancel" onClick={onClose}>
          {t("cancel")}
        </button>
        <button
          className="profile-btn-save"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              {t("saving")}
            </>
          ) : (
            <>
              <i className="fa-solid fa-check"></i>
              {t("saveChanges")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
