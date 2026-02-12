import { createClient } from "@supabase/supabase-js";

type AuthStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  key: (index: number) => string | null;
  readonly length: number;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const cookieDomain = import.meta.env.VITE_AUTH_COOKIE_DOMAIN?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const authStorageKey = (() => {
  try {
    const hostname = new URL(supabaseUrl).hostname;
    const projectRef = hostname.split(".")[0];
    return `sb-${projectRef}-auth-token`;
  } catch {
    return "supabase-auth-token";
  }
})();

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
const shouldUseSecureCookie = () =>
  isBrowser && window.location.protocol === "https:";

const getCookieValue = (key: string) => {
  if (!isBrowser) return null;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const entry of cookies) {
    const [name, ...valueParts] = entry.split("=");
    if (name === key) {
      return decodeURIComponent(valueParts.join("="));
    }
  }
  return null;
};

const setCookieValue = (key: string, value: string) => {
  if (!isBrowser) return;
  const maxAge = 60 * 60 * 24 * 365;
  const parts = [
    `${key}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "SameSite=Lax",
  ];
  if (cookieDomain) {
    parts.push(`Domain=${cookieDomain}`);
  }
  if (shouldUseSecureCookie()) {
    parts.push("Secure");
  }
  document.cookie = parts.join("; ");
};

const removeCookieValue = (key: string) => {
  if (!isBrowser) return;
  const parts = [`${key}=`, "Path=/", "Max-Age=0", "SameSite=Lax"];
  if (cookieDomain) {
    parts.push(`Domain=${cookieDomain}`);
  }
  if (shouldUseSecureCookie()) {
    parts.push("Secure");
  }
  document.cookie = parts.join("; ");
};

// Cookie-based storage keeps auth shared across subdomains.
const cookieStorage: AuthStorage = {
  get length() {
    return getCookieValue(authStorageKey) ? 1 : 0;
  },
  key: (index) => (index === 0 && getCookieValue(authStorageKey) ? authStorageKey : null),
  getItem: (key) => getCookieValue(key),
  setItem: (key, value) => setCookieValue(key, value),
  removeItem: (key) => removeCookieValue(key),
  clear: () => removeCookieValue(authStorageKey),
};

const migrateLocalStorageSession = () => {
  if (!isBrowser) return;
  try {
    const legacyValue = window.localStorage.getItem(authStorageKey);
    if (legacyValue && !cookieStorage.getItem(authStorageKey)) {
      cookieStorage.setItem(authStorageKey, legacyValue);
      window.localStorage.removeItem(authStorageKey);
    }
  } catch {
    // Ignore storage migration errors.
  }
};

migrateLocalStorageSession();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: cookieStorage,
    storageKey: authStorageKey,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
