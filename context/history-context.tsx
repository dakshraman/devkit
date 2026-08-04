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
import type { CopyHistoryItem, HistoryItem } from "@/types";
import { storage } from "@/lib/storage";
import { useSettings } from "@/context/settings-context";

interface HistoryContextValue {
  favorites: string[];
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  recentTools: HistoryItem[];
  recordUsage: (slug: string, name: string) => void;
  clearRecent: () => void;
  copyHistory: CopyHistoryItem[];
  recordCopy: (toolSlug: string, toolName: string, text: string) => void;
  clearCopyHistory: () => void;
  clearAll: () => void;
  lastUsedTool: string | null;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [favorites, setFavorites] = useState<string[]>(() => storage.getFavorites());
  const [recentTools, setRecentTools] = useState<HistoryItem[]>(() =>
    storage.getRecent()
  );
  const [copyHistory, setCopyHistory] = useState<CopyHistoryItem[]>(() =>
    storage.getCopyHistory()
  );
  const [lastUsedTool, setLastUsedTool] = useState<string | null>(() =>
    storage.getLastUsedTool()
  );

  useEffect(() => {
    storage.setFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    storage.setRecent(recentTools);
  }, [recentTools]);

  useEffect(() => {
    storage.setCopyHistory(copyHistory);
  }, [copyHistory]);

  useEffect(() => {
    storage.setLastUsedTool(lastUsedTool);
  }, [lastUsedTool]);

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (slug: string) => {
      setFavorites((prev) =>
        prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
      );
    },
    []
  );

  const clearRecent = useCallback(() => setRecentTools([]), []);

  const recordUsage = useCallback(
    (slug: string, name: string) => {
      setLastUsedTool(slug);
      setRecentTools((prev) => {
        const next = [
          { toolSlug: slug, toolName: name, at: Date.now() },
          ...prev.filter((i) => i.toolSlug !== slug),
        ];
        return next.slice(0, Math.max(4, settings.historyLimit));
      });
    },
    [settings.historyLimit]
  );

  const recordCopy = useCallback(
    (toolSlug: string, toolName: string, text: string) => {
      const preview =
        text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
      setCopyHistory((prev) => {
        const next = [
          { toolSlug, toolName, preview, at: Date.now() },
          ...prev,
        ].slice(0, Math.max(4, settings.historyLimit));
        return next;
      });
    },
    [settings.historyLimit]
  );

  const clearCopyHistory = useCallback(() => setCopyHistory([]), []);

  const clearAll = useCallback(() => {
    setRecentTools([]);
    setCopyHistory([]);
    setFavorites([]);
    setLastUsedTool(null);
  }, []);

  const value = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite,
      recentTools,
      recordUsage,
      clearRecent,
      copyHistory,
      recordCopy,
      clearCopyHistory,
      clearAll,
      lastUsedTool,
    }),
    [
      favorites,
      toggleFavorite,
      isFavorite,
      recentTools,
      recordUsage,
      clearRecent,
      copyHistory,
      recordCopy,
      clearCopyHistory,
      clearAll,
      lastUsedTool,
    ]
  );

  return (
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
}

export function useHistory(): HistoryContextValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
  return ctx;
}
