import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getThemeFromURL(): Theme | null {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get("theme");
  if (theme === "light" || theme === "dark") return theme;
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
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
