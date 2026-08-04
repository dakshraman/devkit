"use client";

import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/context/settings-context";
import { HistoryProvider } from "@/context/history-context";
import { CommandPaletteProvider } from "@/context/command-palette-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <HistoryProvider>
        <CommandPaletteProvider>
          <TooltipProvider delayDuration={250}>
            {children}
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--foreground)",
                  fontSize: "13px",
                },
              }}
            />
          </TooltipProvider>
        </CommandPaletteProvider>
      </HistoryProvider>
    </SettingsProvider>
  );
}