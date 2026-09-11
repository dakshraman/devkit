"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import { ToolIcon } from "@/components/ui/tool-icon";
import { useHistory } from "@/context/history-context";
import { TOOLS } from "@/data/tools";
import { formatDate, relativeTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function HistoryClientPage() {
  const router = useRouter();
  const {
    copyHistory,
    recentTools,
    favorites,
    clearCopyHistory,
    clearRecent,
    toggleFavorite,
  } = useHistory();

  return (
    <AppShell>
      <div className="space-y-6">
        <Reveal>
          <GlassCard className="p-8">
            <Badge variant="secondary">History</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">Recent activity</h1>
            <p className="mt-2 text-muted-foreground">
              Copy history and recently used tools are stored only in your browser.
            </p>
          </GlassCard>
        </Reveal>
        <StaggerGroup className="grid gap-6 xl:grid-cols-2">
          <StaggerItem>
            <GlassCard className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Copy history</h2>
                <Button variant="outline" size="sm" onClick={clearCopyHistory}>Clear</Button>
              </div>
              <div className="space-y-3">
                {copyHistory.length ? copyHistory.slice(0, 12).map((item) => (
                  <div key={`${item.toolSlug}-${item.at}`} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{item.toolName}</div>
                      <div className="text-xs text-muted-foreground">{relativeTime(item.at)}</div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.preview}</p>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No copied items yet.</p>}
                {copyHistory.length > 12 && (
                  <p className="text-xs text-muted-foreground">Showing the latest 12 of {copyHistory.length}.</p>
                )}
              </div>
            </GlassCard>
          </StaggerItem>
          <StaggerItem>
            <GlassCard className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recently used</h2>
                <Button variant="outline" size="sm" onClick={clearRecent}>Clear</Button>
              </div>
              <div className="space-y-3">
                {recentTools.length ? recentTools.slice(0, 10).map((item) => {
                  const tool = TOOLS.find((entry) => entry.slug === item.toolSlug);
                  return (
                    <button
                      key={`${item.toolSlug}-${item.at}`}
                      className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-border/80 hover:bg-accent"
                      onClick={() => router.push(`/tools/${item.toolSlug}`)}
                    >
                      <ToolIcon
                        icon={tool?.icon ?? "lucide:wrench"}
                        accent={tool?.accent ?? "#6366f1"}
                        className="size-9"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{item.toolName}</div>
                        <div className="text-xs capitalize text-muted-foreground">{tool?.category ?? "tool"}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{formatDate(item.at)}</div>
                    </button>
                  );
                }) : <p className="text-sm text-muted-foreground">No recent tools yet.</p>}
              </div>
            </GlassCard>
          </StaggerItem>
        </StaggerGroup>
        <Reveal>
          <GlassCard className="space-y-3 p-6">
            <h2 className="text-lg font-semibold">Favorites</h2>
            {favorites.length ? (
              <div className="flex flex-wrap gap-2">
                {favorites.map((slug) => {
                  const tool = TOOLS.find((entry) => entry.slug === slug);
                  if (!tool) return null;
                  return (
                    <button
                      key={slug}
                      onClick={() => router.push(`/tools/${tool.slug}`)}
                      className="group inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:border-ring/50 hover:bg-accent"
                      title={`Open ${tool.name}`}
                    >
                      <ToolIcon icon={tool.icon} accent={tool.accent} className="size-4" />
                      {tool.name}
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`Remove ${tool.name} from favorites`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(tool.slug);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            toggleFavorite(tool.slug);
                          }
                        }}
                        className="hidden rounded-full p-0.5 text-muted-foreground hover:text-red-500 group-hover:inline-flex"
                      >
                        <span className="sr-only">Remove</span>×
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No favorites saved yet. Star tools from the dashboard or sidebar to keep them here.
              </p>
            )}
          </GlassCard>
        </Reveal>
      </div>
    </AppShell>
  );
}