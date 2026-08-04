"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { AppShell, useDashQuery } from "@/components/layout/app-shell";
import { CATEGORIES, QUICK_ACCESS, TOOLS } from "@/data/tools";
import { useHistory } from "@/context/history-context";
import { useSettings } from "@/context/settings-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToolIcon } from "@/components/ui/tool-icon";
import { cn, relativeTime, truncate } from "@/lib/utils";

export function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const query = useDashQuery().trim().toLowerCase();
  const router = useRouter();
  const { favorites, recentTools, copyHistory, isFavorite, toggleFavorite } = useHistory();
  const { settings, updateSettings } = useSettings();

  const featured = useMemo(
    () => TOOLS.filter((tool) => tool.featured).slice(0, 6),
    []
  );
  const popular = useMemo(
    () => TOOLS.filter((tool) => tool.popular).slice(0, 8),
    []
  );
  const favoriteTools = TOOLS.filter((tool) => favorites.includes(tool.slug));
  const recent = recentTools
    .map((item) => TOOLS.find((tool) => tool.slug === item.toolSlug))
    .filter(Boolean) as typeof TOOLS;
  const recentCopies = copyHistory.slice(0, 6);
  const filteredTools = query
    ? TOOLS.filter((tool) =>
        [tool.name, tool.description, tool.category, ...tool.keywords]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    : [];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <GlassCard className="relative overflow-hidden p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_color-mix(in_srgb,var(--primary)_15%,transparent),transparent_35%),linear-gradient(120deg,color-mix(in_srgb,var(--primary)_8%,transparent),transparent_40%)]" />
          <div className="relative max-w-2xl space-y-5">
            <Badge variant="secondary" className="w-fit">Front-end only. Local-first. No backend.</Badge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                DevKit keeps your daily developer workflows in one fast place.
              </h1>
              <p className="max-w-xl text-base text-muted-foreground">
                Search tools, pin favorites, revisit recent work, inspect copies and launch any utility with keyboard shortcuts.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push("/tools")}>Browse all tools</Button>
              <Button variant="outline" onClick={() => router.push("/docs")}>Read docs</Button>
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <StatCard label="Tools" value={String(TOOLS.length)} hint="Admin-managed utilities" icon="lucide:sparkles" />
          <StatCard label="Favorites" value={String(favorites.length)} hint="Stored in LocalStorage" icon="lucide:heart" />
          <StatCard label="Recent uses" value={String(recentTools.length)} hint="Recently used tools" icon="lucide:clock-3" />
          <StatCard label="Copies" value={String(copyHistory.length)} hint="Copy history" icon="lucide:copy" />
        </div>
      </section>

      {query ? (
        <Section title={`Search results for “${query}”`} description="Global tool search from the dashboard.">
          <ToolGrid tools={filteredTools} onFavoriteToggle={toggleFavorite} isFavorite={isFavorite} />
        </Section>
      ) : (
        <>
          <Section title="Featured tools" description="Curated admin-managed tools at the top of the dashboard.">
            <ToolGrid tools={featured} onFavoriteToggle={toggleFavorite} isFavorite={isFavorite} />
          </Section>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Section title="Popular tools" description="Most used utilities across the toolkit.">
              <ToolGrid tools={popular} onFavoriteToggle={toggleFavorite} isFavorite={isFavorite} compact />
            </Section>

            <Section title="Quick access" description="Jump into high-frequency tools.">
              <div className="grid gap-2">
                {QUICK_ACCESS.map((entry) => {
                  const tool = TOOLS.find((item) => item.slug === entry.slug);
                  if (!tool) return null;
                  return (
                    <button
                      key={entry.slug}
                      onClick={() => router.push(`/tools/${tool.slug}`)}
                      className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-left transition-colors hover:bg-accent/70"
                    >
                      <ToolIcon icon={tool.icon} accent={tool.accent} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{tool.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{tool.description}</div>
                      </div>
                      <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{entry.hint}</kbd>
                    </button>
                  );
                })}
              </div>
            </Section>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Section title="Recently used" description="Your last visited tools.">
              {recent.length ? (
                <ToolGrid tools={recent} onFavoriteToggle={toggleFavorite} isFavorite={isFavorite} compact />
              ) : (
                <EmptyState title="No recent tools yet" description="Open any tool and it will appear here." />
              )}
            </Section>
            <Section title="Favorite tools" description="Pinned tools for quick access.">
              {favoriteTools.length ? (
                <ToolGrid tools={favoriteTools} onFavoriteToggle={toggleFavorite} isFavorite={isFavorite} compact />
              ) : (
                <EmptyState title="No favorites yet" description="Use the star button on any tool card to pin it." />
              )}
            </Section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Section title="Recently copied" description="Your latest clipboard entries.">
              {recentCopies.length ? (
                <div className="space-y-3">
                  {recentCopies.map((item) => (
                    <div key={`${item.toolSlug}-${item.at}`} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium">{item.toolName}</div>
                        <span className="text-xs text-muted-foreground">{relativeTime(item.at)}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.preview}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Copy history is empty" description="Clipboard copies are tracked locally on this device." />
              )}
            </Section>

            <Section title="Tool categories" description="Browse by admin-managed group.">
              <div className="grid gap-3 sm:grid-cols-2">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category.id}
                    href={`/tools?category=${category.id}`}
                    className="rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-accent/60"
                  >
                    <div className="text-sm font-medium">{category.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{category.description}</div>
                    <div className="mt-3 text-xs text-muted-foreground">{TOOLS.filter((tool) => tool.category === category.id).length} tools</div>
                  </Link>
                ))}
              </div>
            </Section>
          </div>
        </>
      )}

      {!settings.compactMode && (
        <GlassCard className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Everything is local by default</h2>
            <p className="text-sm text-muted-foreground">
              Only theme, favorites, recent tools, copy history and preferences persist in LocalStorage.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/help")}>Help & FAQ</Button>
        </GlassCard>
      )}

      <GlassCard className="space-y-4 p-6">
        <div>
          <h2 className="text-lg font-semibold">Preferences</h2>
          <p className="text-sm text-muted-foreground">Persisted locally in your browser only.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <PreferenceRow
            label="Compact mode"
            description="Use denser cards and fewer decorative surfaces."
            control={
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
              />
            }
          />
          <PreferenceRow
            label="Reduce motion"
            description="Reserve motion-heavy interactions for when you want them."
            control={
              <Switch
                checked={settings.reduceMotion}
                onCheckedChange={(checked) => updateSettings({ reduceMotion: checked })}
              />
            }
          />
          <PreferenceRow
            label="History limit"
            description="Maximum number of recent items and copies to retain."
            control={
              <Select
                value={String(settings.historyLimit)}
                onValueChange={(value) => updateSettings({ historyLimit: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((limit) => (
                    <SelectItem key={limit} value={String(limit)}>
                      {limit} items
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
        </div>
      </GlassCard>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ToolGrid({
  tools,
  onFavoriteToggle,
  isFavorite,
  compact = false,
}: {
  tools: (typeof TOOLS)[number][];
  onFavoriteToggle: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  compact?: boolean;
}) {
  if (!tools.length) return <EmptyState title="No tools found" description="Try another search or category." />;
  return (
    <div className={cn("grid gap-4", compact ? "sm:grid-cols-2" : "xl:grid-cols-3")}>
      {tools.map((tool) => (
        <ToolCard
          key={tool.slug}
          tool={tool}
          isFavorite={isFavorite(tool.slug)}
          onFavoriteToggle={() => onFavoriteToggle(tool.slug)}
          compact={compact}
        />
      ))}
    </div>
  );
}

function ToolCard({
  tool,
  isFavorite,
  onFavoriteToggle,
  compact,
}: {
  tool: (typeof TOOLS)[number];
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  return (
    <GlassCard className={cn("group relative flex flex-col gap-4", compact && "p-4")}>
      <button
        onClick={() => router.push(`/tools/${tool.slug}`)}
        className="absolute inset-0 rounded-2xl"
        aria-label={`Open ${tool.name}`}
      />
      <div className="flex items-start justify-between gap-3">
        <ToolIcon icon={tool.icon} accent={tool.accent} className="size-10 rounded-2xl" />
        <button
          className="relative z-10 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
          aria-label={isFavorite ? `Unfavorite ${tool.name}` : `Favorite ${tool.name}`}
        >
          <Icon icon="lucide:star" className={cn("size-4", isFavorite && "text-amber-400")} />
        </button>
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight">{tool.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{tool.description}</p>
      </div>
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <Badge variant="outline">{tool.category}</Badge>
        <span className="truncate">{truncate(tool.keywords.join(", "), 28)}</span>
      </div>
    </GlassCard>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: string;
}) {
  return (
    <GlassCard className="flex items-center justify-between gap-3 p-4">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      </div>
      <Icon icon={icon} className="size-5 text-muted-foreground" />
    </GlassCard>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background p-6 text-center">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{description}</div>
    </div>
  );
}

function PreferenceRow({
  label,
  description,
  control,
}: {
  label: string;
  description: string;
  control: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="mt-1 text-xs text-muted-foreground">{description}</div>
        </div>
        {control}
      </div>
    </div>
  );
}
