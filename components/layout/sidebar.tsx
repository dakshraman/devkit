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

export function Sidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapsed,
}: {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapsed: () => void;
}) {
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
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 lg:translate-x-0",
          collapsed ? "lg:w-16" : "lg:w-72",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Sidebar navigation"
      >
        <SidebarBrand onClose={onClose} collapsed={collapsed} />
        <Suspense fallback={null}>
          <SidebarNav onClose={onClose} collapsed={collapsed} />
        </Suspense>
        <SidebarFooter collapsed={collapsed} onToggleCollapsed={onToggleCollapsed} />
      </motion.aside>
    </>
  );
}

function SidebarBrand({ onClose, collapsed }: { onClose: () => void; collapsed: boolean }) {
  return (
    <div
      className={cn(
        "flex h-16 items-center justify-between px-5",
        collapsed && "lg:justify-center lg:px-0"
      )}
    >
      <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
          <Icon icon="lucide:zap" className="size-5 text-white" />
        </span>
        <div className={cn("leading-tight", collapsed && "lg:hidden")}>
          <span className="block text-[15px] font-bold tracking-tight">DevKit</span>
          <span className="block text-[11px] text-muted-foreground">
            developer toolkit
          </span>
        </div>
      </Link>
      <button
        className={cn("rounded-lg p-1.5 text-muted-foreground hover:bg-accent lg:hidden", collapsed && "lg:hidden")}
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <Icon icon="lucide:x" className="size-4" />
      </button>
    </div>
  );
}

function SidebarNav({ onClose, collapsed }: { onClose: () => void; collapsed: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const { favorites } = useHistory();
  const { open: openPalette } = useCommandPalette();
  const favoriteTools = TOOLS.filter((t) => favorites.includes(t.slug));

  return (
    <div
      className={cn(
        "flex-1 space-y-5 overflow-y-auto px-3 py-4 cmd-scroll",
        collapsed && "lg:px-2"
      )}
    >
      <div className="space-y-0.5">
        <SidebarNavButton href="/" active={pathname === "/"} onNavigate={onClose} collapsed={collapsed} title="Dashboard">
          <Icon icon="lucide:layout-grid" className="size-4 shrink-0" />
          <span className={cn("truncate", collapsed && "lg:hidden")}>Dashboard</span>
        </SidebarNavButton>
        <SidebarNavButton href="/tools" active={pathname === "/tools"} onNavigate={onClose} collapsed={collapsed} title="All Tools">
          <Icon icon="lucide:zap" className="size-4 shrink-0" />
          <span className={cn("truncate", collapsed && "lg:hidden")}>All Tools</span>
        </SidebarNavButton>

        <button
          onClick={() => {
            openPalette();
            onClose();
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            collapsed && "lg:justify-center lg:px-0"
          )}
          title="Search"
        >
          <Icon icon="lucide:search" className="size-4 shrink-0" />
          <span className={cn("truncate", collapsed && "lg:hidden")}>Search</span>
          <kbd
            className={cn(
              "ml-auto rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground",
              collapsed && "lg:hidden"
            )}
          >
            Ctrl K
          </kbd>
        </button>
      </div>

      {favoriteTools.length > 0 && (
        <section>
          <h3 className={cn("mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", collapsed && "lg:hidden")}>
            Favorites
          </h3>
          <div className="space-y-0.5">
            {favoriteTools.map((tool) => (
              <SidebarNavButton
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                active={pathname === `/tools/${tool.slug}`}
                onNavigate={onClose}
                collapsed={collapsed}
                title={tool.name}
              >
                <Icon icon="lucide:star" className="size-4 shrink-0 text-amber-400" />
                <span className={cn("truncate", collapsed && "lg:hidden")}>{tool.name}</span>
              </SidebarNavButton>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className={cn("mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", collapsed && "lg:hidden")}>
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
                collapsed={collapsed}
                title={c.label}
              >
                <span
                  className={cn("size-2 shrink-0 rounded-full", collapsed && "lg:size-2")}
                  style={{ background: `var(--tw-cat-${c.id}, #a1a1aa)` }}
                />
                <span className={cn("truncate", collapsed && "lg:hidden")}>{c.label}</span>
                <span className={cn("ml-auto font-mono text-[10px] text-muted-foreground/70", collapsed && "lg:hidden")}>
                  {TOOLS.filter((t) => t.category === c.id).length}
                </span>
              </SidebarNavButton>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SidebarFooter({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  return (
    <div className="border-t border-sidebar-border px-3 py-3">
      <button
        onClick={onToggleCollapsed}
        className={cn(
          "hidden w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:flex",
          collapsed && "lg:justify-center lg:px-0"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Icon
          icon={collapsed ? "lucide:panel-left-open" : "lucide:panel-left-close"}
          className="size-4 shrink-0"
        />
        <span className={cn("truncate", collapsed && "lg:hidden")}>Collapse sidebar</span>
      </button>
    </div>
  );
}
