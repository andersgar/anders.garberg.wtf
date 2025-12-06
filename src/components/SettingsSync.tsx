import { useEffect, useRef } from "react";
import { useProfile } from "../context/ProfileContext";
import { useTheme, ColorTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

/**
 * Component that syncs user profile settings with local theme/language preferences.
 *
 * Behavior:
 * - On login: Loads settings from profile and applies them locally
 * - On setting change: Saves changes to profile (if logged in)
 */
export function SettingsSync() {
  const { user } = useAuth();
  const { profile, loading, updateSettings } = useProfile();
  const {
    theme,
    colorTheme,
    blobCount,
    setTheme,
    setColorTheme,
    setBlobCount,
  } = useTheme();
  const { lang, setLang } = useLanguage();

  const hasLoadedFromProfile = useRef(false);
  const isApplyingFromProfile = useRef(false);

  // Load settings from profile on login
  useEffect(() => {
    if (user && profile && !loading && !hasLoadedFromProfile.current) {
      hasLoadedFromProfile.current = true;
      isApplyingFromProfile.current = true;

      // Apply profile settings locally
      if (profile.settings) {
        if (profile.settings.theme && profile.settings.theme !== theme) {
          setTheme(profile.settings.theme);
        }
        if (
          profile.settings.colorTheme &&
          profile.settings.colorTheme !== colorTheme
        ) {
          setColorTheme(profile.settings.colorTheme as ColorTheme);
        }
        if (profile.settings.language && profile.settings.language !== lang) {
          setLang(profile.settings.language);
        }
        if (
          typeof profile.settings.blobCount === "number" &&
          profile.settings.blobCount !== blobCount
        ) {
          setBlobCount(profile.settings.blobCount);
        }
      }

      // Reset flag after a short delay to allow state to settle
      setTimeout(() => {
        isApplyingFromProfile.current = false;
      }, 100);
    }
  }, [user, profile, loading]);

  // Reset loaded flag on logout
  useEffect(() => {
    if (!user) {
      hasLoadedFromProfile.current = false;
    }
  }, [user]);

  // Sync local changes to profile
  useEffect(() => {
    // Skip if not logged in, still loading, or applying from profile
    if (!user || !profile || loading || isApplyingFromProfile.current) {
      return;
    }

    // Skip initial load
    if (!hasLoadedFromProfile.current) {
      return;
    }

    // Check if settings differ from profile
    const profileSettings = profile.settings || {};
    const hasChanges =
      profileSettings.theme !== theme ||
      profileSettings.colorTheme !== colorTheme ||
      profileSettings.language !== lang ||
      profileSettings.blobCount !== blobCount;

    if (hasChanges) {
      // Debounce the save
      const timer = setTimeout(() => {
        updateSettings({
          theme,
          colorTheme,
          language: lang,
          blobCount,
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    theme,
    colorTheme,
    lang,
    blobCount,
    user,
    profile,
    loading,
    updateSettings,
  ]);

  return null;
}
