"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { useHistory } from "@/context/history-context";
import { TOOLS } from "@/data/tools";
import { formatDate, relativeTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const router = useRouter();
  const { copyHistory, recentTools, favorites, clearCopyHistory, clearRecent } = useHistory();
  return (
    <AppShell>
      <div className="space-y-6">
        <GlassCard className="p-8">
          <Badge variant="secondary">History</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Recent activity</h1>
          <p className="mt-2 text-muted-foreground">
            Copy history and recently used tools are stored only in your browser.
          </p>
        </GlassCard>
        <div className="grid gap-6 xl:grid-cols-2">
          <GlassCard className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Copy history</h2>
              <Button variant="outline" size="sm" onClick={clearCopyHistory}>Clear</Button>
            </div>
            <div className="space-y-3">
              {copyHistory.length ? copyHistory.map((item) => (
                <div key={`${item.toolSlug}-${item.at}`} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{item.toolName}</div>
                    <div className="text-xs text-muted-foreground">{relativeTime(item.at)}</div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.preview}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">No copied items yet.</p>}
            </div>
          </GlassCard>
          <GlassCard className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recently used</h2>
              <Button variant="outline" size="sm" onClick={clearRecent}>Clear</Button>
            </div>
            <div className="space-y-3">
              {recentTools.length ? recentTools.map((item) => {
                const tool = TOOLS.find((entry) => entry.slug === item.toolSlug);
                return (
                  <button
                    key={`${item.toolSlug}-${item.at}`}
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-4 text-left"
                    onClick={() => router.push(`/tools/${item.toolSlug}`)}
                  >
                    <div>
                      <div className="font-medium">{item.toolName}</div>
                      <div className="text-xs text-muted-foreground">{tool?.category ?? "tool"}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDate(item.at)}</div>
                  </button>
                );
              }) : <p className="text-sm text-muted-foreground">No recent tools yet.</p>}
            </div>
          </GlassCard>
        </div>
        <GlassCard className="space-y-3 p-6">
          <h2 className="text-lg font-semibold">Favorites</h2>
          <div className="flex flex-wrap gap-2">
            {favorites.length ? favorites.map((slug) => (
              <Badge key={slug} variant="outline">
                {TOOLS.find((tool) => tool.slug === slug)?.name ?? slug}
              </Badge>
            )) : <p className="text-sm text-muted-foreground">No favorites saved yet.</p>}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
