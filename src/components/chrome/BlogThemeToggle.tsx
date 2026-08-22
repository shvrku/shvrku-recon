"use client";

import { useTheme } from "@/lib/theme";

export function BlogThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className="hit-dash font-mono text-[13px] uppercase tracking-[0.08em]"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
