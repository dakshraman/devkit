import type { CopyHistoryItem, HistoryItem, Settings } from "@/types";

const PREFIX = "devkit:";

const KEYS = {
  theme: `${PREFIX}theme`,
  favorites: `${PREFIX}favorites`,
  recent: `${PREFIX}recent`,
  copyHistory: `${PREFIX}copy-history`,
  settings: `${PREFIX}settings`,
  lastUsedTool: `${PREFIX}last-used-tool`,
} as const;

/* ------------------------------------------------------------------ */
/* LocalStorage — the ONLY persistence DevKit uses.                    */
/* ------------------------------------------------------------------ */

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — fail silently */
  }
}

export const storage = {
  /* ---- Theme ---- */
  getTheme: () => read<"light" | "dark">(KEYS.theme, "dark"),
  setTheme: (t: "light" | "dark") => write(KEYS.theme, t),

  /* ---- Settings ---- */
  getSettings: () => read<Settings>(KEYS.settings, {
    theme: "dark",
    reduceMotion: false,
    compactMode: false,
    historyLimit: 50,
    sidebarCollapsed: false,
  }),
  setSettings: (s: Settings) => write(KEYS.settings, s),

  /* ---- Favorites ---- */
  getFavorites: () => read<string[]>(KEYS.favorites, []),
  setFavorites: (list: string[]) => write(KEYS.favorites, list),

  /* ---- Recently used tools ---- */
  getRecent: () => read<HistoryItem[]>(KEYS.recent, []),
  setRecent: (list: HistoryItem[]) => write(KEYS.recent, list),

  /* ---- Copy history ---- */
  getCopyHistory: () => read<CopyHistoryItem[]>(KEYS.copyHistory, []),
  setCopyHistory: (list: CopyHistoryItem[]) => write(KEYS.copyHistory, list),

  /* ---- Last used tool ---- */
  getLastUsedTool: () => read<string | null>(KEYS.lastUsedTool, null),
  setLastUsedTool: (slug: string | null) => write(KEYS.lastUsedTool, slug),
};

export const STORAGE_KEYS = KEYS;
