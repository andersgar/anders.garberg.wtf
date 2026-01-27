import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signup: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    redirectUrl?: string | null,
    appName?: string | null,
  ) => Promise<{ error: AuthError | null; needsConfirmation: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleHashTokens = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        console.log("[Auth] Setting session from hash tokens");
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }
    };

    handleHashTokens().then(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log("[Auth] Initial session:", session?.user?.id);
        setUser(session?.user ?? null);
        setIsLoading(false);
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[Auth] State change:", _event, session?.user?.id);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    console.log("[Auth] Attempting login for:", email);
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log("[Auth] Login result:", { error, userId: data.user?.id });
    return { error };
  };

  const signup = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    redirectUrl?: string | null,
    appName?: string | null,
  ) => {
    // Build callback URL with redirect info for external apps
    let callbackUrl = `${window.location.origin}/auth/callback`;
    const params = new URLSearchParams();
    if (appName) params.set("app", appName);
    if (redirectUrl) params.set("redirect", redirectUrl);
    if (params.toString()) callbackUrl += `?${params.toString()}`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    if (error) {
      return { error, needsConfirmation: false };
    }

    return { error: null, needsConfirmation: !data.session };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
