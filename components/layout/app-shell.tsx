"use client";

import { useState, type ReactNode } from "react";
import { createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/layout/command-palette";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSettings } from "@/context/settings-context";
import { PageTransition } from "@/components/ui/motion";

const DashContext = createContext("");

export function useDashQuery() {
  return useContext(DashContext);
}

export function AppShell({ children }: { children: ReactNode }) {
  const [dashQuery, setDashQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const { settings, updateSettings } = useSettings();
  const sidebarOpen = !settings.sidebarCollapsed;

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={(open) => updateSettings({ sidebarCollapsed: !open })}
    >
      <AppSidebar />
      <SidebarInset>
        <Header
          onSearchChange={(q) => {
            if (pathname === "/") setDashQuery(q);
          }}
          onNavigateToTool={(slug) => router.push(`/tools/${slug}`)}
        />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <DashContext.Provider value={dashQuery}>
            <PageTransition pathname={pathname} reduced={settings.reduceMotion}>
              {children}
            </PageTransition>
          </DashContext.Provider>
        </div>
      </SidebarInset>
      <CommandPalette />
    </SidebarProvider>
  );
}