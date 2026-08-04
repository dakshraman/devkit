"use client";

import Link from "next/link";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface SidebarNavButtonProps extends ComponentProps<typeof Link> {
  active?: boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
}

export function SidebarNavButton({
  active,
  onNavigate,
  collapsed,
  className,
  children,
  ...props
}: SidebarNavButtonProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        onNavigate?.();
        props.onClick?.(e);
      }}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        active && "bg-accent text-foreground",
        collapsed && "lg:justify-center lg:px-0",
        className
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
      )}
      {children}
    </Link>
  );
}