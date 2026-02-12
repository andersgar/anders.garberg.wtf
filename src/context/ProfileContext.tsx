import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  Profile,
  UserSettings,
  getProfile,
  updateProfile as updateProfileApi,
  updateSettings as updateSettingsApi,
  uploadAvatar as uploadAvatarApi,
  hasAccess,
  AccessLevel,
} from "../lib/profiles";

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  updateProfile: (
    updates: Partial<
      Omit<Profile, "id" | "created_at" | "updated_at" | "access_level">
    >
  ) => Promise<boolean>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string | null>;
  hasAccess: (requiredLevel: AccessLevel) => boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    fetchProfile();
  }, [user?.id, authLoading]); // Use user.id instead of user to avoid unnecessary refetches

  const updateProfile = async (
    updates: Partial<
      Omit<Profile, "id" | "created_at" | "updated_at" | "access_level">
    >
  ): Promise<boolean> => {
    const updated = await updateProfileApi(updates);
    if (updated) {
      setProfile(updated);
      return true;
    }
    return false;
  };

  const updateSettings = async (
    settings: Partial<UserSettings>
  ): Promise<boolean> => {
    const updated = await updateSettingsApi(settings);
    if (updated) {
      setProfile(updated);
      return true;
    }
    return false;
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const url = await uploadAvatarApi(file);
      if (url) {
        await fetchProfile();
      }
      return url;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return null;
    }
  };

  const checkAccess = (requiredLevel: AccessLevel): boolean => {
    if (!profile) return false;
    return hasAccess(profile.access_level, requiredLevel);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        updateProfile,
        updateSettings,
        uploadAvatar,
        hasAccess: checkAccess,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
