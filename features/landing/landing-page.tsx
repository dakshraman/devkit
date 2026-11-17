"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { TOOLS, CATEGORIES } from "@/data/tools";
import { useSettings } from "@/context/settings-context";
import { useCommandPalette } from "@/context/command-palette-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolIcon } from "@/components/ui/tool-icon";
import { cn } from "@/lib/utils";
import type { ToolCategory } from "@/types";

export function LandingPage() {
  const { theme, toggleTheme } = useSettings();
  const { open: openPalette } = useCommandPalette();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20">
      {/* ---------------- Navigation Bar ---------------- */}
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/95 backdrop-blur-md">
        <div className="flex h-14 w-full items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
              aria-label="DevKit home"
            >
              <span className="flex size-8 items-center justify-center rounded-md border border-border bg-card text-foreground font-mono font-semibold text-xs shadow-xs">
                DK
              </span>
              <div className="leading-tight">
                <span className="block text-sm font-semibold tracking-tight">DevKit</span>
                <span className="block text-[10px] text-muted-foreground font-mono">
                  local-first • 54 tools
                </span>
              </div>
            </Link>

            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-6 text-xs font-medium text-muted-foreground md:flex"
            >
              <a href="#catalog" className="transition hover:text-foreground">
                Catalog
              </a>
              <a href="#architecture" className="transition hover:text-foreground">
                Architecture
              </a>
              <a href="#suites" className="transition hover:text-foreground">
                Suites
              </a>
              <a href="#faq" className="transition hover:text-foreground">
                FAQ
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openPalette()}
              className="hidden items-center gap-2 rounded-md border border-border bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-border hover:bg-muted hover:text-foreground sm:flex cursor-pointer"
              aria-label="Search tools with command palette"
            >
              <Icon icon="lucide:search" className="size-3.5" aria-hidden="true" />
              <span>Search tools</span>
              <kbd className="inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-xs">
                Ctrl K
              </kbd>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md border border-border p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground cursor-pointer"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <Icon
                icon={theme === "dark" ? "lucide:sun" : "lucide:moon"}
                className="size-4"
                aria-hidden="true"
              />
            </button>

            <Link href="/tools" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                All Tools
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button size="sm" className="h-8 gap-1.5 text-xs shadow-xs">
                <span>Dashboard</span>
                <Icon icon="lucide:arrow-right" className="size-3.5" aria-hidden="true" />
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md border border-border p-1.5 text-muted-foreground md:hidden hover:bg-accent cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Icon
                icon={mobileMenuOpen ? "lucide:x" : "lucide:menu"}
                className="size-4"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-background px-4 py-3 md:hidden">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-2 text-xs">
              <a
                href="#catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Catalog
              </a>
              <a
                href="#architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Architecture
              </a>
              <a
                href="#suites"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Suites
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                FAQ
              </a>
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-2">
                <Link href="/tools" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                    Browse All 54 Tools
                  </Button>
                </Link>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full justify-center text-xs">
                    Open Dashboard
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="w-full">
        {/* ---------------- Hero Section ---------------- */}
        <section className="border-b border-border/70 py-16 lg:py-24">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              {/* Telemetry Guarantee Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-muted/60 px-3 py-1 font-mono text-[11px] text-muted-foreground">
                <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
                <span>100% Client-Side • 0 B Egress • PWA Ready</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Developer utilities that never leave your browser
              </h1>

              {/* Subtitle */}
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
                An offline, local-first workbench with 54 formatters, AST analyzers, WebCrypto
                generators, and document converters. Executed in-memory with zero server transmissions.
              </p>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/dashboard">
                  <Button size="default" className="gap-2 px-6 h-10 text-xs font-medium">
                    <Icon icon="lucide:layout-grid" className="size-4" aria-hidden="true" />
                    <span>Open Dashboard</span>
                  </Button>
                </Link>

                <a href="#catalog">
                  <Button variant="outline" size="default" className="gap-2 px-6 h-10 text-xs font-medium">
                    <Icon icon="lucide:list" className="size-4" aria-hidden="true" />
                    <span>Explore 54 Tools</span>
                  </Button>
                </a>
              </div>

              {/* Shortcut helper */}
              <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>Press</span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                  Ctrl
                </kbd>
                <span>+</span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                  K
                </kbd>
                <span>to search and jump to any tool instantly</span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Engineering Guarantees (Metrics) ---------------- */}
        <section aria-label="Engineering guarantees" className="border-b border-border/70 bg-muted/20 py-8">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <MetricItem
                value="54"
                label="Built-in Utilities"
                detail="PDF, AST, WASM, Crypto & Network"
              />
              <MetricItem
                value="0 ms"
                label="Server Latency"
                detail="Runs in local V8 execution thread"
              />
              <MetricItem
                value="0 B"
                label="Network Egress"
                detail="Zero telemetry or remote logging"
              />
              <MetricItem
                value="100%"
                label="Offline Capable"
                detail="Service Worker with local cache"
              />
            </div>
          </div>
        </section>

        {/* ---------------- Local-First Architecture Blueprint ---------------- */}
        <section id="architecture" className="border-b border-border/70 py-16 scroll-mt-14">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Icon icon="lucide:shield-check" className="size-3.5 text-emerald-500" aria-hidden="true" />
                <span>Security Guarantee</span>
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Client-Side Sandbox Architecture
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Unlike traditional web tools that upload sensitive credentials, tokens, or documents to
                remote servers, DevKit executes every routine strictly in browser memory.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ArchitectureCard
                icon="lucide:cpu"
                title="In-Memory V8 Execution"
                description="JSON parsing, AST generation, and diff computation run in the active browser tab. Memory is freed on tab disposal."
              />
              <ArchitectureCard
                icon="lucide:key"
                title="Hardware WebCrypto API"
                description="SHA-256, HMAC, and UUID generation use native SubtleCrypto primitives with cryptographic entropy and hardware acceleration."
              />
              <ArchitectureCard
                icon="lucide:hard-drive"
                title="Origin-Isolated Storage"
                description="Tool history, pinned favorites, and appearance preferences stay strictly within your browser's private localStorage sandbox."
              />
              <ArchitectureCard
                icon="lucide:wifi-off"
                title="Zero Third-Party Telemetry"
                description="No remote tracking pixels, Google Analytics, or third-party ad scripts are loaded. Fully compliant with enterprise data protection."
              />
            </div>
          </div>
        </section>

        {/* ---------------- Specialized Suites Spotlight ---------------- */}
        <section id="suites" className="border-b border-border/70 py-16 scroll-mt-14">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="max-w-3xl">
              <span className="text-xs font-medium text-muted-foreground">Deep-Dive Workbenches</span>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Specialized Tool Suites
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Beyond standard encoders and formatters, DevKit includes full-featured client-side suites for
                documents, binary inspection, network debugging, and media manipulation.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SuiteCard
                title="PDF & Document Suite"
                badge="Client-Side PDF"
                icon="lucide:file-text"
                description="Merge multiple PDFs, split page ranges into ZIP archives, convert images to PDF, and rotate pages."
                tools={["pdf-merge", "pdf-split", "image-to-pdf", "pdf-organize"]}
              />
              <SuiteCard
                title="AST & Binary Inspector"
                badge="Code Analysis"
                icon="lucide:binary"
                description="Parse JavaScript and TypeScript into interactive Babel AST node hierarchies, and inspect WebAssembly sections."
                tools={["ast-explorer", "wasm-explorer", "json-typescript"]}
              />
              <SuiteCard
                title="Network & Benchmark Suite"
                badge="API Debugging"
                icon="lucide:network"
                description="Execute client-side HTTP requests with cURL import, test real-time WebSocket frames, and run load benchmarks."
                tools={["api-tester", "websocket-tester", "load-tester"]}
              />
              <SuiteCard
                title="Client-Side Media Studio"
                badge="Image Tools"
                icon="lucide:image"
                description="Resize by exact pixels or percentage, stamp text watermarks with 9-point grid placement, and convert formats."
                tools={["image-resizer", "image-watermark", "image-converter", "bg-remover"]}
              />
            </div>
          </div>
        </section>

        {/* ---------------- Complete Tool Catalog Matrix ---------------- */}
        <section id="catalog" className="py-16 scroll-mt-14">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
            <ToolMatrix />
          </div>
        </section>

        {/* ---------------- Frequently Asked Questions ---------------- */}
        <section id="faq" className="border-t border-border/70 bg-muted/10 py-16 scroll-mt-14">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="max-w-3xl mx-auto">
              <div className="text-center">
                <span className="text-xs font-medium text-muted-foreground">Direct Answers</span>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Frequently Asked Questions
                </h2>
                <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                  Technical details regarding DevKit security, offline behavior, and execution boundaries.
                </p>
              </div>

              <div className="mt-8">
                <FaqList />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Bottom Call to Action ---------------- */}
        <section className="border-t border-border/70 py-16">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="rounded-xl border border-border bg-card p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
              <h2 className="text-2xl font-semibold tracking-tight">
                Ready to work with zero-latency utilities?
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Access all 54 utilities directly in your browser. Install as a PWA for offline access.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/dashboard">
                  <Button size="default" className="gap-2 px-5 text-xs">
                    <span>Launch Dashboard</span>
                    <Icon icon="lucide:arrow-right" className="size-3.5" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/tools">
                  <Button variant="outline" size="default" className="gap-2 px-5 text-xs">
                    <span>Browse Catalog</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-border/70 bg-muted/30 py-12 text-xs text-muted-foreground">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-5">
            <div className="space-y-3 sm:col-span-2">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded border border-border bg-card text-foreground font-mono font-semibold text-[11px]">
                  DK
                </span>
                <span className="font-semibold text-foreground">DevKit</span>
                <span className="rounded border border-border bg-muted px-1.5 py-0.2 font-mono text-[10px]">
                  local-first
                </span>
              </div>
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                Zero-egress, client-side developer toolkit running formatters, AST parsers,
                cryptographic generators, and document tools inside local browser memory.
              </p>
              <div className="text-[11px] font-mono text-muted-foreground">
                All data remains on your machine.
              </div>
            </div>

            <div>
              <p className="font-semibold text-foreground text-xs mb-2.5">Document & Media</p>
              <ul className="space-y-1.5">
                <li><Link href="/tools/pdf-merge" className="hover:text-foreground transition">Merge PDF</Link></li>
                <li><Link href="/tools/pdf-split" className="hover:text-foreground transition">Split & Extract PDF</Link></li>
                <li><Link href="/tools/image-to-pdf" className="hover:text-foreground transition">Image to PDF</Link></li>
                <li><Link href="/tools/pdf-organize" className="hover:text-foreground transition">Organize PDF</Link></li>
                <li><Link href="/tools/image-resizer" className="hover:text-foreground transition">Image Resizer</Link></li>
                <li><Link href="/tools/image-watermark" className="hover:text-foreground transition">Watermark Image</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-foreground text-xs mb-2.5">Analysis & Code</p>
              <ul className="space-y-1.5">
                <li><Link href="/tools/ast-explorer" className="hover:text-foreground transition">AST Explorer</Link></li>
                <li><Link href="/tools/wasm-explorer" className="hover:text-foreground transition">WASM Explorer</Link></li>
                <li><Link href="/tools/json-typescript" className="hover:text-foreground transition">JSON to TypeScript</Link></li>
                <li><Link href="/tools/diff-checker" className="hover:text-foreground transition">Diff Checker</Link></li>
                <li><Link href="/tools/regex-playground" className="hover:text-foreground transition">Regex Playground</Link></li>
                <li><Link href="/tools/api-tester" className="hover:text-foreground transition">API Tester</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-foreground text-xs mb-2.5">Navigation & System</p>
              <ul className="space-y-1.5">
                <li><Link href="/dashboard" className="hover:text-foreground transition">Dashboard</Link></li>
                <li><Link href="/tools" className="hover:text-foreground transition">All 54 Tools</Link></li>
                <li><Link href="/history" className="hover:text-foreground transition">Local History</Link></li>
                <li><a href="#catalog" className="hover:text-foreground transition">Tool Catalog</a></li>
                <li><a href="#architecture" className="hover:text-foreground transition">Architecture</a></li>
                <li><a href="#faq" className="hover:text-foreground transition">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row text-[11px]">
            <p>© {new Date().getFullYear()} DevKit. Free and open source under MIT License.</p>
            <div className="flex items-center gap-3">
              <span>Execution: <span className="font-mono text-foreground">In-Memory / V8</span></span>
              <span>•</span>
              <span>Shortcut: <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">Ctrl+K</kbd></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Metric Item ---------------- */

function MetricItem({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="space-y-1">
      <div className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
        {value}
      </div>
      <div className="text-xs font-semibold text-foreground">{label}</div>
      <div className="text-[11px] text-muted-foreground leading-snug">{detail}</div>
    </div>
  );
}

/* ---------------- Architecture Card ---------------- */

function ArchitectureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 space-y-2.5 shadow-xs">
      <div className="flex size-7 items-center justify-center rounded border border-border bg-muted/60 text-foreground">
        <Icon icon={icon} className="size-4" aria-hidden="true" />
      </div>
      <h3 className="text-xs font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </article>
  );
}

/* ---------------- Suite Card ---------------- */

function SuiteCard({
  title,
  badge,
  icon,
  description,
  tools,
}: {
  title: string;
  badge: string;
  icon: string;
  description: string;
  tools: string[];
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 flex flex-col justify-between space-y-3 shadow-xs">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex size-7 items-center justify-center rounded border border-border bg-muted/60 text-foreground">
            <Icon icon={icon} className="size-4" aria-hidden="true" />
          </div>
          <Badge variant="outline" className="text-[10px] py-0 font-mono">
            {badge}
          </Badge>
        </div>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>

      <div className="border-t border-border pt-2.5">
        <div className="flex flex-wrap gap-1">
          {tools.map((slug) => {
            const tool = TOOLS.find((t) => t.slug === slug);
            if (!tool) return null;
            return (
              <Link key={slug} href={`/tools/${slug}`}>
                <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground transition-colors">
                  {tool.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </article>
  );
}

/* ---------------- Tool Matrix & Catalog ---------------- */

function ToolMatrix() {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    let list = TOOLS;
    if (selectedCategory !== "all") {
      list = list.filter((t) => t.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-muted-foreground">Complete Inventory</span>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Tool Catalog Matrix
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Browse all {TOOLS.length} utilities by category or search by keywords.
          </p>
        </div>

        {/* Live Search Filter */}
        <div className="w-full md:w-80">
          <label htmlFor="catalog-search" className="sr-only">
            Filter tools
          </label>
          <div className="relative">
            <Icon
              icon="lucide:search"
              className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="catalog-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword (e.g. pdf, jwt, wasm)..."
              className="w-full rounded-md border border-border bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer select-none",
            selectedCategory === "all"
              ? "bg-foreground text-background font-semibold"
              : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          All ({TOOLS.length})
        </button>

        {CATEGORIES.map((cat) => {
          const count = TOOLS.filter((t) => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer select-none",
                selectedCategory === cat.id
                  ? "bg-foreground text-background font-semibold"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Responsive Grid that gracefully scales to widescreen */}
      {filteredTools.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center text-xs text-muted-foreground">
          No tools found matching &ldquo;{searchQuery}&rdquo;.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filteredTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group block transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
            >
              <article className="h-full rounded-lg border border-border bg-card p-3.5 transition-colors group-hover:border-border/80 group-hover:bg-muted/30 shadow-xs flex flex-col justify-between space-y-2">
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <ToolIcon icon={tool.icon} accent={tool.accent} className="size-7" />
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                      {tool.category}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{tool.name}</span>
                    <Icon
                      icon="lucide:arrow-right"
                      className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-hidden="true"
                    />
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/50">
                  <span>/tools/{tool.slug}</span>
                  {tool.popular && <span className="text-foreground">popular</span>}
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- FAQ Accordion ---------------- */

const FAQS = [
  {
    q: "How does DevKit ensure zero server transmissions?",
    a: "Every tool executes strictly inside your browser tab using native JavaScript, WebAssembly, HTML5 Canvas, and the WebCrypto API. Network requests are never initiated to process payloads, files, keys, or tokens.",
  },
  {
    q: "Does DevKit function completely offline?",
    a: "Yes. DevKit registers a Service Worker and manifest file as a Progressive Web App (PWA). Once loaded in your browser, all 54 utilities remain operational without an internet connection.",
  },
  {
    q: "Where are user settings and transformation histories stored?",
    a: "User preferences, pinned favorites, and recent executions are saved solely in your browser's private localStorage. Data is never synchronized to a cloud backend and can be purged at any time from the History view.",
  },
  {
    q: "Are there any usage quotas, account requirements, or fees?",
    a: "No. DevKit is completely free and open source under the MIT License. There are no subscriptions, API rate limits, paywalls, or accounts.",
  },
  {
    q: "How are PDF documents and images manipulated without a server?",
    a: "PDF processing is handled in-memory using pdf-lib and jszip compiled for the browser. Image resizing, format conversion, and watermarking use the native HTML5 Canvas 2D context.",
  },
];

function FaqList() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {FAQS.map((faq, idx) => {
        const isOpen = openIdx === idx;
        const buttonId = `faq-btn-${idx}`;
        const panelId = `faq-panel-${idx}`;

        return (
          <div
            key={faq.q}
            className="rounded-lg border border-border bg-card overflow-hidden shadow-xs"
          >
            <button
              type="button"
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="flex w-full items-center justify-between p-3.5 text-left text-xs font-semibold text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <span>{faq.q}</span>
              <Icon
                icon="lucide:chevron-down"
                className={cn(
                  "size-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
                  isOpen && "rotate-180 text-foreground"
                )}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="border-t border-border px-3.5 py-3 text-xs leading-relaxed text-muted-foreground bg-muted/10"
              >
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
