import { supabase } from "./supabase";

export type AccessLevel = "user" | "moderator" | "admin" | "owner";

export interface UserSettings {
  theme: "dark" | "light";
  colorTheme: string;
  language: "no" | "en";
  blobCount: number;
}

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  access_level: AccessLevel;
  settings: UserSettings;
  created_at: string;
  updated_at: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: "dark",
  colorTheme: "aurora",
  language: "no",
  blobCount: 3,
};

/**
 * Create a profile for the current user if it doesn't exist
 */
export async function createProfileIfMissing(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Check if profile exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    // Profile exists, fetch and return it
    return getProfile();
  }

  // Create new profile
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email,
      access_level: "user",
      settings: DEFAULT_SETTINGS,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating profile:", error);
    return null;
  }

  return {
    ...data,
    settings: { ...DEFAULT_SETTINGS, ...data.settings },
  } as Profile;
}

/**
 * Get the current user's profile
 */
export async function getProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  // No profile found - create one
  if (!data) {
    return createProfileIfMissing();
  }

  return {
    ...data,
    settings: { ...DEFAULT_SETTINGS, ...data.settings },
  } as Profile;
}

/**
 * Get a profile by user ID
 */
export async function getProfileById(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return {
    ...data,
    settings: { ...DEFAULT_SETTINGS, ...data.settings },
  } as Profile;
}

/**
 * Update the current user's profile
 */
export async function updateProfile(
  updates: Partial<
    Omit<Profile, "id" | "created_at" | "updated_at" | "access_level">
  >
): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return null;
  }

  return {
    ...data,
    settings: { ...DEFAULT_SETTINGS, ...data.settings },
  } as Profile;
}

/**
 * Update user settings
 */
export async function updateSettings(
  settings: Partial<UserSettings>
): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // First get current settings
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("settings")
    .eq("id", user.id)
    .single();

  const currentSettings = currentProfile?.settings || {};
  const newSettings = { ...DEFAULT_SETTINGS, ...currentSettings, ...settings };

  const { data, error } = await supabase
    .from("profiles")
    .update({ settings: newSettings })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating settings:", error);
    return null;
  }

  return {
    ...data,
    settings: newSettings,
  } as Profile;
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(file: File): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/avatar.${fileExt}`;

  // Delete old avatar first
  await supabase.storage.from("avatars").remove([fileName]);

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(fileName);

  // Update profile with new avatar URL
  await updateProfile({ avatar_url: publicUrl });

  return publicUrl;
}

/**
 * Check if user has required access level
 */
export function hasAccess(
  userLevel: AccessLevel,
  requiredLevel: AccessLevel
): boolean {
  const levels: AccessLevel[] = ["user", "moderator", "admin", "owner"];
  return levels.indexOf(userLevel) >= levels.indexOf(requiredLevel);
}

/**
 * Get all profiles (admin only)
 */
export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }

  return data.map((profile) => ({
    ...profile,
    settings: { ...DEFAULT_SETTINGS, ...profile.settings },
  })) as Profile[];
}

/**
 * Update user access level (admin/owner only)
 */
export async function updateAccessLevel(
  userId: string,
  accessLevel: AccessLevel
): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ access_level: accessLevel })
    .eq("id", userId);

  if (error) {
    console.error("Error updating access level:", error);
    return false;
  }

  return true;
}
