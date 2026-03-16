import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  onMount,
  type ParentComponent,
  type Accessor,
} from "solid-js";
import { Icon } from "@iconify-icon/solid";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Accessor<Theme>;
  resolvedTheme: Accessor<"light" | "dark">;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>();

const STORAGE_KEY = "meela-theme-preference";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return null;
}

function applyTheme(theme: "light" | "dark"): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.add("no-transitions");

  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.setAttribute("data-theme", "light");
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove("no-transitions");
    });
  });
}

export const ThemeProvider: ParentComponent = (props) => {
  const [theme, setThemeState] = createSignal<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = createSignal<"light" | "dark">(
    "light"
  );

  onMount(() => {
    document.documentElement.classList.add("no-transitions");

    const stored = getStoredTheme();
    const initialTheme = stored ?? "system";
    setThemeState(initialTheme);

    const resolved =
      initialTheme === "system" ? getSystemTheme() : initialTheme;
    setResolvedTheme(resolved);
    applyTheme(resolved);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme() === "system") {
        const newResolved = getSystemTheme();
        setResolvedTheme(newResolved);
        applyTheme(newResolved);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove("no-transitions");
      });
    });

    return () => mediaQuery.removeEventListener("change", handleChange);
  });

  createEffect(() => {
    const currentTheme = theme();
    const resolved = currentTheme === "system" ? getSystemTheme() : currentTheme;
    setResolvedTheme(resolved);
    applyTheme(resolved);
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  const toggleTheme = () => {
    const current = resolvedTheme();
    const newTheme = current === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {props.children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      class="p-2 rounded-lg bg-bg-secondary border border-border-primary text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-input-focus-ring focus:ring-offset-2 focus:ring-offset-bg-primary"
      aria-label={`Switch to ${resolvedTheme() === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${resolvedTheme() === "light" ? "dark" : "light"} mode`}
    >
      {resolvedTheme() === "light" ? (
        <Icon icon="feather:moon" width="20" height="20" class="block" />
      ) : (
        <Icon icon="feather:sun" width="20" height="20" class="block" />
      )}
    </button>
  );
}
