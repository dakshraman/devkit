"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Settings } from "@/types";
import { storage } from "@/lib/storage";

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  reduceMotion: false,
  compactMode: false,
  historyLimit: 50,
  sidebarCollapsed: false,
};

interface SettingsContextValue {
  settings: Settings;
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (t: "light" | "dark") => void;
  updateSettings: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function applyTheme(t: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", t === "dark");
  root.style.colorScheme = t;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = storage.getSettings();
    return { ...DEFAULT_SETTINGS, ...stored };
  });

  const theme = settings.theme;

  useEffect(() => {
    applyTheme(theme);
    storage.setSettings(settings);
    storage.setTheme(theme);
  }, [theme, settings]);

  const setTheme = useCallback((t: "light" | "dark") => {
    setSettings((s) => ({ ...s, theme: t }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const value = useMemo(
    () => ({ settings, theme, toggleTheme, setTheme, updateSettings }),
    [settings, theme, toggleTheme, setTheme, updateSettings]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
