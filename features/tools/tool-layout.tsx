"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { GlassCard, CardDescription, CardHeader, CardTitle } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToolIcon } from "@/components/ui/tool-icon";
import { cn } from "@/lib/utils";
import type { Tool } from "@/types";
import { Reveal } from "@/components/ui/motion";
import { TOOLS, CATEGORIES } from "@/data/tools";

export const Shell = memo(function Shell({
  tool,
  children,
  description,
}: {
  tool: Tool;
  children: ReactNode;
  description?: string;
}) {
  const categoryMeta = useMemo(
    () => CATEGORIES.find((c) => c.id === tool.category),
    [tool.category]
  );

  const relatedTools = useMemo(() => {
    return TOOLS.filter(
      (t) => t.category === tool.category && t.slug !== tool.slug
    ).slice(0, 4);
  }, [tool.category, tool.slug]);

  return (
    <div className="space-y-6">
      {/* Accessible Breadcrumbs for Search Engines & Users */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-foreground transition-colors">
          Tools
        </Link>
        <span>/</span>
        <Link
          href={`/tools?category=${tool.category}`}
          className="hover:text-foreground transition-colors capitalize"
        >
          {categoryMeta?.label ?? tool.category}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]" aria-current="page">
          {tool.name}
        </span>
      </nav>

      {/* Main Tool Header Card */}
      <Reveal y={14}>
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
                <Badge variant="outline">{categoryMeta?.label ?? tool.category}</Badge>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  0 B Egress • Local V8
                </Badge>
              </div>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              100% in-browser processing. Zero telemetry or data storage.
            </div>
          </div>
        </GlassCard>
      </Reveal>

      {/* Primary Tool Viewport */}
      {children}

      {/* Hub-and-Spoke Contextual Internal Linking */}
      {relatedTools.length > 0 && (
        <section aria-label="Related tools" className="pt-8 border-t border-border/70 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Related {categoryMeta?.label ?? "Developer"} Utilities
              </h2>
              <p className="text-xs text-muted-foreground">
                Explore contextually related tools in the {categoryMeta?.label?.toLowerCase() ?? "developer"} category.
              </p>
            </div>
            <Link
              href={`/tools?category=${tool.category}`}
              className="text-xs text-primary hover:underline font-medium"
            >
              View all {categoryMeta?.label} tools →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {relatedTools.map((rel) => (
              <Link key={rel.slug} href={`/tools/${rel.slug}`} className="group block h-full">
                <article className="rounded-lg border border-border bg-card p-3.5 transition-colors group-hover:border-border/80 group-hover:bg-muted/30 shadow-xs flex flex-col justify-between h-full space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <ToolIcon icon={rel.icon} accent={rel.accent} className="size-6" />
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        {rel.category}
                      </span>
                    </div>
                    <h3 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                      <span>{rel.name}</span>
                      <Icon
                        icon="lucide:arrow-right"
                        className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-hidden="true"
                      />
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {rel.description}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/50">
                    /tools/{rel.slug}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
});

export const Panel = memo(function Panel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <GlassCard className={cn("space-y-4", className)}>
      <CardHeader className="mb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children}
    </GlassCard>
  );
});

export const SectionLabel = memo(function SectionLabel({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <Icon icon={icon} className="size-4 text-muted-foreground" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
});

export function EditorSkeleton() {
  return <Skeleton className="min-h-[320px] w-full rounded-xl" />;
}

export const InfoTile = memo(function InfoTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 break-all text-sm font-medium">{value}</div>
    </div>
  );
});
