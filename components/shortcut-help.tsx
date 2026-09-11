"use client";

import { useState, useCallback } from "react";
import { SHORTCUTS } from "@/data/shortcuts";
import { useShortcut } from "@/hooks/useShortcutRegistry";
import { Button } from "@/components/ui/button";

export function ShortcutHelp() {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useShortcut("help", "?", toggle);
  useShortcut("escape", "Escape", () => setOpen(false));

  if (!open) return null;

  const categories = SHORTCUTS.reduce((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {} as Record<string, typeof SHORTCUTS>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Close</Button>
        </div>
        {Object.entries(categories).map(([cat, items]) => (
          <div key={cat} className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat}</h3>
            <div className="space-y-1">
              {items.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent">
                  <span>{s.label}</span>
                  <kbd className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-mono">{s.keys}</kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
