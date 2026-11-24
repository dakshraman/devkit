"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CATEGORIES, TOOLS } from "@/data/tools";
import { useHistory } from "@/context/history-context";
import { useCommandPalette } from "@/context/command-palette-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarBrand />
      </SidebarHeader>
      <Suspense fallback={null}>
        <SidebarNav />
      </Suspense>
      <SidebarFooter>
        <CollapseToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function SidebarBrand() {
  const { setOpenMobile } = useSidebar();

  return (
    <div className="flex h-14 items-center justify-between px-3">
      <Link
        href="/"
        className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        onClick={() => setOpenMobile(false)}
      >
        <span className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-foreground font-mono font-bold text-xs shadow-xs">
          DK
        </span>
        <span className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
          DevKit
        </span>
      </Link>
      <button
        className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:hidden cursor-pointer"
        onClick={() => setOpenMobile(false)}
        aria-label="Close sidebar"
      >
        <Icon icon="lucide:x" className="size-4" />
      </button>
    </div>
  );
}

function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const { favorites } = useHistory();
  const { open: openPalette } = useCommandPalette();
  const favoriteTools = TOOLS.filter((t) => favorites.includes(t.slug));

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard"}
                tooltip="Dashboard"
              >
                <Link href="/dashboard">
                  <Icon icon="lucide:layout-grid" className="size-4 shrink-0" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/tools"}
                tooltip="All Tools"
              >
                <Link href="/tools">
                  <Icon icon="lucide:zap" className="size-4 shrink-0" />
                  <span>All Tools</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Search"
                onClick={() => {
                  openPalette();
                }}
              >
                <Icon icon="lucide:search" className="size-4 shrink-0" />
                <span>Search</span>
                <kbd className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-sidebar-foreground/70">
                  Ctrl K
                </kbd>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {favoriteTools.length > 0 && (
        <>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-medium text-sidebar-foreground/70">
              Favorites
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {favoriteTools.map((tool) => (
                  <SidebarMenuItem key={tool.slug}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/tools/${tool.slug}`}
                      tooltip={tool.name}
                    >
                      <Link href={`/tools/${tool.slug}`}>
                        <Icon
                          icon="lucide:star"
                          className="size-4 shrink-0 text-amber-400"
                        />
                        <span>{tool.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </>
      )}

      <SidebarSeparator />
      <SidebarGroup>
        <SidebarGroupLabel className="text-[11px] font-medium text-sidebar-foreground/70">
          Categories
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {CATEGORIES.map((c) => {
              const active =
                pathname === "/tools" &&
                category !== null &&
                category.toLowerCase() === c.id;
              return (
                <SidebarMenuItem key={c.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={c.label}
                    className="pr-8"
                  >
                    <Link href={`/tools?category=${c.id}`}>
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: `var(--tw-cat-${c.id}, #a1a1aa)` }}
                      />
                      <span>{c.label}</span>
                      <SidebarMenuBadge>
                        {TOOLS.filter((t) => t.category === c.id).length}
                      </SidebarMenuBadge>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

function CollapseToggle() {
  const { toggleSidebar, state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={toggleSidebar}
          tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden md:flex"
        >
          <Icon
            icon={
              collapsed ? "lucide:panel-left-open" : "lucide:panel-left-close"
            }
            className="size-4 shrink-0"
          />
          <span>{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}