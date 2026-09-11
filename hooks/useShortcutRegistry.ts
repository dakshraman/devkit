"use client";

import { useCallback, useEffect } from "react";

type Handler = (e: KeyboardEvent) => void;

const handlers = new Map<string, Handler>();

export function useShortcutRegistry() {
  const register = useCallback((id: string, handler: Handler) => {
    handlers.set(id, handler);
    return () => { handlers.delete(id); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      for (const [, handler] of handlers) {
        handler(e);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { register };
}

export function useShortcut(id: string, keys: string, handler: Handler) {
  const { register } = useShortcutRegistry();
  useEffect(() => {
    return register(id, (e) => {
      const parsed = parseKeys(keys);
      if (matchKeys(e, parsed)) {
        e.preventDefault();
        handler(e);
      }
    });
  }, [id, keys, handler, register]);
}

function parseKeys(keys: string): { ctrl: boolean; shift: boolean; alt: boolean; meta: boolean; key: string } {
  const parts = keys.toLowerCase().split("+");
  return {
    ctrl: parts.includes("ctrl"),
    shift: parts.includes("shift"),
    alt: parts.includes("alt"),
    meta: parts.includes("meta") || parts.includes("cmd"),
    key: parts.find((p) => !["ctrl", "shift", "alt", "meta", "cmd"].includes(p)) ?? "",
  };
}

function matchKeys(e: KeyboardEvent, parsed: ReturnType<typeof parseKeys>): boolean {
  if (parsed.ctrl && !e.ctrlKey && !e.metaKey) return false;
  if (parsed.shift && !e.shiftKey) return false;
  if (parsed.alt && !e.altKey) return false;
  if (parsed.meta && !e.metaKey) return false;
  if (parsed.key && e.key.toLowerCase() !== parsed.key) return false;
  return true;
}
