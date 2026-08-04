"use client";

import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { GlassCard, CardDescription, CardHeader, CardTitle } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToolIcon } from "@/components/ui/tool-icon";
import { cn } from "@/lib/utils";
import type { Tool } from "@/types";

export function Shell({ tool, children, description }: { tool: Tool; children: ReactNode; description?: string }) {
  return (
    <div className="space-y-6">
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_color-mix(in_srgb,var(--primary)_16%,transparent),transparent_40%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <ToolIcon icon={tool.icon} accent={tool.accent} className="size-10 rounded-2xl" />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{tool.name}</h1>
                <p className="text-sm text-muted-foreground">{description ?? tool.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tool.popular && <Badge variant="info">Popular</Badge>}
              {tool.featured && <Badge variant="success">Featured</Badge>}
              <Badge variant="outline">{tool.category}</Badge>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Admin-managed content. User input stays local and temporary.
          </div>
        </div>
      </GlassCard>
      {children}
    </div>
  );
}

export function Panel({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <GlassCard className={cn("space-y-4", className)}>
      <CardHeader className="mb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children}
    </GlassCard>
  );
}

export function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <Icon icon={icon} className="size-4 text-muted-foreground" />
      <span>{label}</span>
    </div>
  );
}

export function EditorSkeleton() {
  return <Skeleton className="min-h-[320px] w-full rounded-xl" />;
}

export function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 break-all text-sm font-medium">{value}</div>
    </div>
  );
}
