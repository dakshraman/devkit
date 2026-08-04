"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolIcon } from "@/components/ui/tool-icon";
import { useHistory } from "@/context/history-context";
import { CATEGORIES, TOOLS } from "@/data/tools";
import { cn, truncate } from "@/lib/utils";

export function ToolsIndexPage() {
  return (
    <AppShell>
      <ToolsIndexContent />
    </AppShell>
  );
}

function ToolsIndexContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category") ?? "all";
  const [query, setQuery] = useState("");
  const { favorites, toggleFavorite, isFavorite } = useHistory();

  const tools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      const matchesCategory = categoryParam === "all" || tool.category === categoryParam;
      const matchesQuery = !q || [tool.name, tool.description, tool.category, ...tool.keywords].join(" ").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [categoryParam, query]);

  return (
    <div className="space-y-6">
      <GlassCard className="p-8">
        <Badge variant="secondary">All tools</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Browse the full DevKit catalog</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Filter by category, search tool descriptions and open any utility instantly.
        </p>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools..." />
        <Select value={categoryParam} onValueChange={(value) => router.push(value === "all" ? "/tools" : `/tools?category=${value}`)}>
          <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((category) => <SelectItem key={category.id} value={category.id}>{category.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.slug} href={`/tools/${tool.slug}`}>
            <GlassCard className="group h-full space-y-4">
              <div className="flex items-start justify-between gap-3">
                <ToolIcon icon={tool.icon} accent={tool.accent} className="size-10 rounded-2xl" />
                <button
                  className="relative z-10 rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(tool.slug);
                  }}
                >
                  <span className={cn("text-sm", isFavorite(tool.slug) ? "text-amber-400" : "")}>★</span>
                </button>
              </div>
              <div>
                <h2 className="font-semibold">{tool.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tool.description}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline">{tool.category}</Badge>
                <span className="truncate text-xs text-muted-foreground">{truncate(tool.keywords.join(", "), 30)}</span>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>

      {favorites.length > 0 && (
        <GlassCard className="p-6">
          <div className="text-sm text-muted-foreground">{favorites.length} favorite tools saved locally.</div>
        </GlassCard>
      )}
    </div>
  );
}
