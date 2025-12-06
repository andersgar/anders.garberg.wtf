import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Theme = "dark" | "light";
type ColorTheme =
  | "aurora"
  | "cinema"
  | "sunset"
  | "cyber"
  | "space"
  | "volcanic"
  | "icefire"
  | "candy";

interface ThemeContextType {
  theme: Theme;
  colorTheme: ColorTheme;
  setTheme: (theme: Theme) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getThemeFromURL(): Theme | null {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get("theme");
  if (theme === "light" || theme === "dark") return theme;
  return null;
}

function getColorThemeFromURL(): ColorTheme | null {
  const params = new URLSearchParams(window.location.search);
  const colorTheme = params.get("color");
  if (
    [
      "aurora",
      "cinema",
      "sunset",
      "cyber",
      "space",
      "volcanic",
      "icefire",
      "candy",
    ].includes(colorTheme || "")
  ) {
    return colorTheme as ColorTheme;
  }
  return null;
}

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (
      getThemeFromURL() ||
      (localStorage.getItem("theme") as Theme) ||
      getSystemTheme()
    );
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    return (
      getColorThemeFromURL() ||
      (localStorage.getItem("colorTheme") as ColorTheme) ||
      "aurora"
    );
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    const root = document.documentElement;
    root.setAttribute("data-theme", newTheme);
    if (newTheme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }

    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set("theme", newTheme);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
  };

  const setColorTheme = (newColorTheme: ColorTheme) => {
    setColorThemeState(newColorTheme);
    localStorage.setItem("colorTheme", newColorTheme);

    const root = document.documentElement;
    root.setAttribute("data-color-theme", newColorTheme);

    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set("color", newColorTheme);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-color-theme", colorTheme);
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [theme, colorTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme, colorTheme, setTheme, setColorTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export type { ColorTheme };
