"use client";

import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export function ToolIcon({
  icon,
  accent,
  className,
  iconClassName,
}: {
  icon: string;
  accent: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg",
        className
      )}
      style={{
        background: `color-mix(in srgb, ${accent} 16%, transparent)`,
        color: accent,
      }}
    >
      <Icon icon={icon} className={cn("size-4", iconClassName)} />
    </span>
  );
}
