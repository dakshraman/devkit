"use client";

import { useEffect, useRef } from "react";

type Handler = (e: KeyboardEvent) => void;

function normalizeCombo(combo: string): string {
  const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);
  return combo
    .toLowerCase()
    .replace(/\bmod\b/, isMac ? "meta" : "ctrl")
    .replace(/\s+/g, "")
    .split("+")
    .sort()
    .join("+");
}

function matches(e: KeyboardEvent, combo: string): boolean {
  const key = e.key.toLowerCase();
  const parts = normalizeCombo(combo).split("+");
  const mods = ["meta", "ctrl", "alt", "shift"];
  if (parts.includes("meta") !== e.metaKey) return false;
  if (parts.includes("ctrl") !== e.ctrlKey) return false;
  if (parts.includes("alt") !== e.altKey) return false;
  if (parts.includes("shift") !== e.shiftKey) return false;
  const main = parts.find((p) => !mods.includes(p));
  if (!main) return true;
  return key === main;
}

export function useHotkeys(combo: string, handler: Handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const normalized = normalizeCombo(combo);
    const listener = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (matches(e, normalized)) {
        e.preventDefault();
        handlerRef.current(e);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [combo]);
}