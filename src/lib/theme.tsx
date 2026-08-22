"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { isReadingPage } from "@/lib/routes";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
  dark: number;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
  dark: 1,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("dark");
  const reading = isReadingPage(pathname);
  const effectiveTheme: Theme = reading ? theme : "dark";

  useEffect(() => {
    const saved = window.localStorage.getItem("shvrku-theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  useLayoutEffect(() => {
    const effective = reading ? theme : "dark";
    document.documentElement.dataset.theme = effective;
    if (reading) {
      document.documentElement.dataset.reading = "true";
    } else {
      delete document.documentElement.dataset.reading;
    }
  }, [reading, theme]);

  useEffect(() => {
    window.localStorage.setItem("shvrku-theme", theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggle,
      dark: effectiveTheme === "dark" ? 1 : 0,
    }),
    [theme, toggle, effectiveTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
