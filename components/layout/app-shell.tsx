"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/layout/command-palette";
import { cn } from "@/lib/utils";

const DashContext = createContext("");

export function useDashQuery() {
  return useContext(DashContext);
}

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashQuery, setDashQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-col lg:pl-72">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onSearchChange={(q) => {
            if (pathname === "/") setDashQuery(q);
          }}
          onNavigateToTool={(slug) => router.push(`/tools/${slug}`)}
        />
        <main
          className={cn("mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8")}
        >
          <DashContext.Provider value={dashQuery}>
            {children}
          </DashContext.Provider>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}