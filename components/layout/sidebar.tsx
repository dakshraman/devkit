"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CATEGORIES, TOOLS } from "@/data/tools";
import { useHistory } from "@/context/history-context";
import { useCommandPalette } from "@/context/command-palette-context";
import { cn } from "@/lib/utils";
import { SidebarNavButton } from "@/components/layout/sidebar-nav-button";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />

      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Sidebar navigation"
      >
        <SidebarBrand onClose={onClose} />
        <Suspense fallback={null}>
          <SidebarNav onClose={onClose} />
        </Suspense>
        <SidebarFooter />
      </motion.aside>
    </>
  );
}

function SidebarBrand({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-16 items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
          <Icon icon="lucide:zap" className="size-5 text-white" />
          </span>
        <div className="leading-tight">
          <span className="block text-[15px] font-bold tracking-tight">DevKit</span>
          <span className="block text-[11px] text-muted-foreground">
            developer toolkit
          </span>
        </div>
      </Link>
      <button
        className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent lg:hidden"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <Icon icon="lucide:x" className="size-4" />
      </button>
    </div>
  );
}

function SidebarNav({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const { favorites } = useHistory();
  const { open: openPalette } = useCommandPalette();
  const favoriteTools = TOOLS.filter((t) => favorites.includes(t.slug));

  return (
    <div className="flex-1 space-y-5 overflow-y-auto px-3 py-4 cmd-scroll">
      <div className="space-y-0.5">
        <SidebarNavButton href="/" active={pathname === "/"} onNavigate={onClose}>
          <Icon icon="lucide:layout-grid" className="size-4" />
          Dashboard
        </SidebarNavButton>
        <SidebarNavButton href="/tools" active={pathname === "/tools"} onNavigate={onClose}>
          <Icon icon="lucide:zap" className="size-4" />
          All Tools
        </SidebarNavButton>

        <button
          onClick={() => {
            openPalette();
            onClose();
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
          )}
        >
          <Icon icon="lucide:search" className="size-4" />
          Search
          <kbd className="ml-auto rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            Ctrl K
          </kbd>
        </button>
      </div>

      {favoriteTools.length > 0 && (
        <section>
          <h3 className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Favorites
          </h3>
          <div className="space-y-0.5">
            {favoriteTools.map((tool) => (
              <SidebarNavButton
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                active={pathname === `/tools/${tool.slug}`}
                onNavigate={onClose}
              >
                <Icon icon="lucide:star" className="size-4 text-amber-400" />
                <span className="truncate">{tool.name}</span>
              </SidebarNavButton>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </h3>
        <div className="space-y-0.5">
          {CATEGORIES.map((c) => {
            const active =
              pathname === "/tools" &&
              category !== null &&
              category.toLowerCase() === c.id;
            return (
              <SidebarNavButton
                key={c.id}
                href={`/tools?category=${c.id}`}
                active={active}
                onNavigate={onClose}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: `var(--tw-cat-${c.id}, #a1a1aa)` }}
                />
                {c.label}
                <span className="ml-auto font-mono text-[10px] text-muted-foreground/70">
                  {TOOLS.filter((t) => t.category === c.id).length}
                </span>
              </SidebarNavButton>
            );
          })}
        </div>
      </section>

      <div className="space-y-0.5 border-t border-border pt-3">
        <SidebarNavButton
          href="/docs"
          active={pathname.startsWith("/docs")}
          onNavigate={onClose}
        >
          <Icon icon="lucide:book-open" className="size-4" />
          Documentation
        </SidebarNavButton>
        <SidebarNavButton
          href="/changelog"
          active={pathname === "/changelog"}
          onNavigate={onClose}
        >
          <Icon icon="lucide:newspaper" className="size-4" />
          Changelog
        </SidebarNavButton>
        <SidebarNavButton
          href="/help"
          active={pathname === "/help"}
          onNavigate={onClose}
        >
          <Icon icon="lucide:life-buoy" className="size-4" />
          Help & FAQ
        </SidebarNavButton>
      </div>
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-sidebar-border px-5 py-3.5">
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {TOOLS.length} tools · 100% local
      </p>
      <p className="text-[11px] text-muted-foreground/70">
        Your data never leaves this browser.
      </p>
    </div>
  );
}
