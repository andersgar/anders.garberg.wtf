import { AppBranding } from "../components/AuthLayout";

export const APP_BRANDINGS: Record<string, AppBranding> = {
  informize: {
    name: "Informize",
    logo: "/assets/apps/informize.svg",
    colors: {
      primary: "#f59e0b",
      primaryForeground: "#000000",
      accent: "#fffbeb",
      background: "#ffffff",
    },
  },
};

export function getAppBranding(appName?: string | null): AppBranding | undefined {
  if (!appName) return undefined;
  return APP_BRANDINGS[appName.toLowerCase()];
}
