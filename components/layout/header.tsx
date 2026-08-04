"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TOOLS } from "@/data/tools";
import { useCommandPalette } from "@/context/command-palette-context";
import { useSettings } from "@/context/settings-context";
import { useHotkeys } from "@/hooks/useHotkeys";
import { cn } from "@/lib/utils";
import { ToolIcon } from "@/components/ui/tool-icon";

export function Header({
  onMenuClick,
  onSearchChange,
  onNavigateToTool,
}: {
  onMenuClick: () => void;
  onSearchChange?: (query: string) => void;
  onNavigateToTool?: (slug: string) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useSettings();
  const { open: openPalette } = useCommandPalette();
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useHotkeys("ctrl+shift+c", () => router.push("/history"));

  const results = search.trim()
    ? TOOLS.filter((t) =>
        [t.name, t.description, ...t.keywords]
          .join(" ")
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const currentTool = pathname.startsWith("/tools/")
    ? TOOLS.find((t) => `/tools/${t.slug}` === pathname)
    : undefined;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted-foreground hover:bg-accent lg:hidden"
        aria-label="Open menu"
      >
        <Icon icon="lucide:menu" className="size-5" />
      </button>

      <div className="hidden min-w-0 items-center gap-2 md:flex">
        {currentTool && (
          <ToolIcon icon={currentTool.icon} accent={currentTool.accent} className="size-7" />
        )}
        <span className="truncate text-sm font-semibold">
          {currentTool?.name ?? "DevKit"}
        </span>
      </div>

      {/* Global search */}
      <div ref={boxRef} className="relative mx-auto w-full max-w-md flex-1">
        <div
          className={cn(
            "flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 shadow-sm transition-all",
            focused && "border-ring/60 ring-2 ring-ring/25"
          )}
        >
          <Icon icon="lucide:search" className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            onFocus={() => setFocused(true)}
            placeholder="Search tools…"
            className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search tools"
          />
          <button
            onClick={() => {
              setSearch("");
              openPalette();
            }}
            className="hidden shrink-0 items-center gap-1 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex"
            aria-label="Open command palette"
          >
            Ctrl K
          </button>
        </div>

        {focused && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
          >
            {results.map((tool) => (
              <button
                key={tool.slug}
                onClick={() => {
                  setSearch("");
                  setFocused(false);
                  onNavigateToTool?.(tool.slug);
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
              >
                <ToolIcon icon={tool.icon} accent={tool.accent} className="size-7" />
                <span className="flex-1 truncate font-medium">{tool.name}</span>
                <span className="text-xs capitalize text-muted-foreground">
                  {tool.category}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => router.push("/history")}
          className={cn(
            "rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            pathname === "/history" && "bg-accent text-foreground"
          )}
          aria-label="Copy history"
          title="Copy history (Ctrl+Shift+C)"
        >
          <Icon icon="lucide:clipboard-list" className="size-5" />
        </button>
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Toggle theme"
          title="Toggle theme (T)"
        >
          <AnimateIcon dark={theme === "dark"} />
        </button>
      </div>
    </header>
  );
}

function AnimateIcon({ dark }: { dark: boolean }) {
  return (
    <motion.span
      key={dark ? "dark" : "light"}
      initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
      animate={{ rotate: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="flex"
    >
      {dark ? <Icon icon="lucide:sun" className="size-5" /> : <Icon icon="lucide:moon" className="size-5" />}
    </motion.span>
  );
}
