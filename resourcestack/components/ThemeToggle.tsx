"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Theme = "system" | "light" | "dark";

const STORAGE_KEY = "rs-theme";

function getSystemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const useDark = theme === "dark" || (theme === "system" && getSystemPrefersDark());
  root.classList.toggle("dark", useDark);
  root.dataset.theme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
    const initial: Theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    // When using system theme, keep in sync with OS changes.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") applyTheme("system");
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  function choose(next: Theme) {
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  return (
    <div
      className="inline-flex items-center gap-1 rounded-2xl bg-zinc-300/30 p-1 ring-1 ring-black/10 dark:bg-zinc-900/60 dark:ring-white/10"
      role="group"
      aria-label="Theme"
    >
      <button
        type="button"
        onClick={() => choose("system")}
        className={
          theme === "system"
            ? "inline-flex items-center gap-2 rounded-xl bg-zinc-50 px-2.5 py-1.5 text-xs font-semibold text-zinc-900 ring-1 ring-black/10 dark:bg-zinc-50 dark:text-zinc-950"
            : "inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50/70 dark:text-zinc-200 dark:hover:bg-white/10"
        }
        aria-pressed={theme === "system"}
        title="System"
      >
        <Monitor className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">System</span>
      </button>

      <button
        type="button"
        onClick={() => choose("light")}
        className={
          theme === "light"
            ? "inline-flex items-center gap-2 rounded-xl bg-zinc-50 px-2.5 py-1.5 text-xs font-semibold text-zinc-900 ring-1 ring-black/10 dark:bg-zinc-50 dark:text-zinc-950"
            : "inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50/70 dark:text-zinc-200 dark:hover:bg-white/10"
        }
        aria-pressed={theme === "light"}
        title="Light"
      >
        <Sun className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        type="button"
        onClick={() => choose("dark")}
        className={
          theme === "dark"
            ? "inline-flex items-center gap-2 rounded-xl bg-zinc-50 px-2.5 py-1.5 text-xs font-semibold text-zinc-900 ring-1 ring-black/10 dark:bg-zinc-50 dark:text-zinc-950"
            : "inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50/70 dark:text-zinc-200 dark:hover:bg-white/10"
        }
        aria-pressed={theme === "dark"}
        title="Dark"
      >
        <Moon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
}
