"use client";

import { Toaster } from "react-hot-toast";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandPaletteProvider } from "@/context/command-palette-context";
import { HistoryProvider } from "@/context/history-context";
import { SettingsProvider } from "@/context/settings-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <HistoryProvider>
        <CommandPaletteProvider>
          <TooltipProvider delayDuration={220}>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 1800,
                style: {
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--foreground)",
                },
              }}
            />
          </TooltipProvider>
        </CommandPaletteProvider>
      </HistoryProvider>
    </SettingsProvider>
  );
}
