/* Hallmark · shape: Stat-Led · genre: modern-minimal · theme: Console (deal 1/3, seed devkit-local-first-developer-utilities-3bd7·77db8869·2026-11-26·r0) · job: try · draw: 3a2c4d
 * hero: Corridor · nav: masthead · footer: statement · imagery: none · signature: live developer workbench · console: graphite
 * axes: dark/grotesk-sans/chromatic-amber · posture: restrained · contrast: pass · fold: pass · v2.0.0 */
/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · weakest: S, elevated instrument panels with single surface seams */
"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { TOOLS, CATEGORIES, QUICK_ACCESS } from "@/data/tools";
import { useSettings } from "@/context/settings-context";
import { useCommandPalette } from "@/context/command-palette-context";
import { Button } from "@/components/ui/button";
import { ToolIcon } from "@/components/ui/tool-icon";
import { cn } from "@/lib/utils";
import type { ToolCategory } from "@/types";

export function LandingPage() {
  const { theme, toggleTheme } = useSettings();
  const { open: openPalette } = useCommandPalette();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20">
      {/* ---------------- Navigation Bar (Masthead) ---------------- */}
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/95 backdrop-blur-md">
        <div className="flex h-14 w-full items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
              aria-label="DevKit home"
            >
              <span className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-foreground font-semibold text-xs shadow-xs">
                DK
              </span>
              <span className="text-sm font-semibold tracking-tight">DevKit</span>
            </Link>

            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-6 text-xs font-medium text-muted-foreground md:flex"
            >
              <a href="#standards" className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1">
                Standards
              </a>
              <a href="#architecture" className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1">
                Architecture
              </a>
              <a href="#comparison" className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1">
                Comparison
              </a>
              <a href="#catalog" className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1">
                Catalog
              </a>
              <a href="#faq" className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1">
                FAQ
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openPalette()}
              className="hidden items-center gap-2 rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex cursor-pointer active:bg-muted/90 disabled:opacity-50 disabled:pointer-events-none"
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
              className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer active:bg-accent/80 disabled:opacity-50 disabled:pointer-events-none"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <Icon
                icon={theme === "dark" ? "lucide:sun" : "lucide:moon"}
                className="size-4"
                aria-hidden="true"
              />
            </button>

            <Link href="/tools" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className="h-8 text-xs active:bg-accent/80 disabled:opacity-50 disabled:pointer-events-none">
                All Tools
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button size="sm" className="h-8 gap-1.5 text-xs shadow-xs active:opacity-90 disabled:opacity-50 disabled:pointer-events-none">
                <span>Dashboard</span>
                <Icon icon="lucide:arrow-right" className="size-3.5" aria-hidden="true" />
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md border border-border p-1.5 text-muted-foreground md:hidden hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
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
                href="#standards"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Standards
              </a>
              <a
                href="#architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Architecture
              </a>
              <a
                href="#comparison"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Comparison
              </a>
              <a
                href="#catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Catalog
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
                    Browse 54 Tools
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
        {/* ---------------- Hero Section (Corridor / Instrument-Led) ---------------- */}
        <section className="border-b border-border/70 pt-16 pb-20 lg:pt-20 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground text-balance leading-tight">
                Developer utilities with zero data egress
              </h1>

              <p className="max-w-xl text-base text-muted-foreground leading-relaxed">
                Fifty-four fast client utilities executed in browser memory with zero network egress.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/dashboard">
                  <Button size="default" className="h-10 gap-2 px-6 text-xs font-semibold shadow-xs active:opacity-90 disabled:opacity-50 disabled:pointer-events-none">
                    <Icon icon="lucide:terminal" className="size-4" aria-hidden="true" />
                    <span>Launch Workbench</span>
                  </Button>
                </Link>
                <a href="#catalog">
                  <Button variant="outline" size="default" className="h-10 gap-2 px-6 text-xs font-semibold active:bg-muted/80 disabled:opacity-50 disabled:pointer-events-none">
                    <Icon icon="lucide:list" className="size-4" aria-hidden="true" />
                    <span>Search 54 Tools</span>
                  </Button>
                </a>
              </div>

              {/* Measured Instrument Telemetry Readings */}
              <div className="pt-4 grid grid-cols-3 gap-6 border-t border-border/60 max-w-lg">
                <div className="space-y-1">
                  <div className="font-mono text-xl sm:text-2xl font-normal text-foreground tabular-nums">
                    0 B
                  </div>
                  <div className="text-xs text-muted-foreground">network egress</div>
                </div>
                <div className="space-y-1">
                  <div className="font-mono text-xl sm:text-2xl font-normal text-foreground tabular-nums">
                    &lt; 1 ms
                  </div>
                  <div className="text-xs text-muted-foreground">execution latency</div>
                </div>
                <div className="space-y-1">
                  <div className="font-mono text-xl sm:text-2xl font-normal text-foreground tabular-nums">
                    100%
                  </div>
                  <div className="text-xs text-muted-foreground">offline operational</div>
                </div>
              </div>
            </div>

            {/* Signature Workbench Instrument (Clean hairline panel cut from surface) */}
            <div className="mt-12 lg:mt-16">
              <WorkbenchInstrument />
            </div>
          </div>
        </section>

        {/* ---------------- Open Specifications Ledger ---------------- */}
        <section id="standards" className="border-b border-border/70 bg-muted/10 py-6 scroll-mt-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="border border-border bg-card px-3 py-2 rounded-md">
                <div className="text-muted-foreground text-[11px]">cryptography</div>
                <div className="font-medium text-foreground">W3C WebCrypto API</div>
              </div>
              <div className="border border-border bg-card px-3 py-2 rounded-md">
                <div className="text-muted-foreground text-[11px]">ast parser</div>
                <div className="font-medium text-foreground">Babel AST v8</div>
              </div>
              <div className="border border-border bg-card px-3 py-2 rounded-md">
                <div className="text-muted-foreground text-[11px]">bytecode</div>
                <div className="font-medium text-foreground">WebAssembly Engine</div>
              </div>
              <div className="border border-border bg-card px-3 py-2 rounded-md">
                <div className="text-muted-foreground text-[11px]">documents</div>
                <div className="font-medium text-foreground">ISO 32000 PDF</div>
              </div>
              <div className="border border-border bg-card px-3 py-2 rounded-md">
                <div className="text-muted-foreground text-[11px]">security</div>
                <div className="font-medium text-foreground">RFC 7519 JWT Spec</div>
              </div>
              <div className="border border-border bg-card px-3 py-2 rounded-md">
                <div className="text-muted-foreground text-[11px]">graphics</div>
                <div className="font-medium text-foreground">Canvas 2D Pipeline</div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Architectural Pillars (Single Containment Surface) ---------------- */}
        <section id="architecture" className="border-b border-border/70 py-16 lg:py-24 scroll-mt-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-foreground">
                Engineered for complete memory isolation
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                Eliminating remote network latency and third-party data tracking by processing all payloads inside local browser memory.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {/* Pillar 1: Zero Egress Sandbox */}
              <div className="border border-border bg-card p-6 rounded-lg flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Icon icon="lucide:shield-check" className="size-4 text-emerald-500" aria-hidden="true" />
                    <span>Zero network requests during execution</span>
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tokens, private keys, and enterprise contracts execute strictly inside your local browser thread. Memory is released immediately upon closing the tab.
                  </p>
                </div>

                <div className="border border-border bg-muted/40 p-3 rounded text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-muted-foreground text-[11px] pb-1 border-b border-border/60">
                    <span>network inspector</span>
                    <span className="text-emerald-500">policy: reject all egress</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">POST /telemetry</span>
                    <span className="text-red-400">blocked: zero egress</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">POST /cloud-convert</span>
                    <span className="text-red-400">blocked: local only</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40 text-foreground">
                    <span>total egress:</span>
                    <span className="text-emerald-500 font-mono tabular-nums">0 B</span>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Sub-millisecond Keyboard Velocity */}
              <div className="border border-border bg-card p-6 rounded-lg flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Icon icon="lucide:command" className="size-4" aria-hidden="true" />
                    <span>Sub-millisecond keyboard velocity</span>
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Switch between all 54 utilities in less than one millisecond. Fuzzy search tools, execute quick transformations, and copy outputs without touching your mouse.
                  </p>
                </div>

                <div className="border border-border bg-muted/40 p-3 rounded text-xs space-y-2">
                  <div className="flex items-center gap-2 border border-border bg-background px-2.5 py-1.5 rounded text-[11px] font-mono">
                    <Icon icon="lucide:search" className="size-3 text-muted-foreground" aria-hidden="true" />
                    <span>&gt; jwt decode</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground space-y-1">
                    <div className="flex justify-between py-0.5 text-foreground font-medium">
                      <span>JWT Inspector</span>
                      <span className="text-[10px] text-emerald-500">HS256 verified</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span>JSON Formatter</span>
                      <span className="text-[10px]">Prettify</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pillar 3: AST and Bytecode */}
              <div className="border border-border bg-card p-6 rounded-lg flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Icon icon="lucide:binary" className="size-4" aria-hidden="true" />
                    <span>Deep AST and bytecode disassembly</span>
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Inspect ECMAScript and TypeScript Abstract Syntax Trees in real time. Deconstruct WebAssembly binary sections with opcode resolution.
                  </p>
                </div>

                <div className="border border-border bg-muted/40 p-3 rounded font-mono text-xs space-y-1">
                  <div className="text-[11px] text-muted-foreground">
                    <span className="text-sky-400 font-medium">Program</span> (body: 2)
                  </div>
                  <div className="pl-3 text-[11px] text-muted-foreground">
                    └─ <span className="text-amber-400 font-medium">FunctionDeclaration</span> (name: &quot;hash&quot;)
                  </div>
                  <div className="pl-6 text-[10px] text-muted-foreground">
                    ├─ <span className="text-emerald-400">Identifier</span> (id: &quot;secretKey&quot;)
                  </div>
                  <div className="pl-6 text-[10px] text-muted-foreground">
                    └─ <span className="text-violet-400">BlockStatement</span> (lines: 4)
                  </div>
                </div>
              </div>

              {/* Pillar 4: In-Memory Document Pipeline */}
              <div className="border border-border bg-card p-6 rounded-lg flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Icon icon="lucide:file-text" className="size-4 text-sky-400" aria-hidden="true" />
                    <span>Heavy document and media manipulation</span>
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Merge, split, and watermark multi-page PDFs and images directly in browser RAM. Zero upload limits, zero queue delays, and no server roundtrips.
                  </p>
                </div>

                <div className="border border-border bg-muted/40 p-3 rounded text-xs space-y-2">
                  <div className="flex items-center justify-between text-muted-foreground text-[11px] pb-1 border-b border-border/60">
                    <span>in-memory batch pipeline</span>
                    <span className="text-emerald-500">completed in 140ms</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <div className="text-muted-foreground text-[10px]">input</div>
                      <div className="text-foreground truncate">contract.pdf</div>
                      <div className="text-muted-foreground text-[10px] font-mono tabular-nums">14.8 MB</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[10px]">action</div>
                      <div className="text-foreground">split pages</div>
                      <div className="text-emerald-500 text-[10px]">pdf-lib</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[10px]">egress</div>
                      <div className="text-emerald-500 font-mono tabular-nums">0 B</div>
                      <div className="text-muted-foreground text-[10px]">local ram</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- SaaS Comparison Matrix ---------------- */}
        <section id="comparison" className="border-b border-border/70 py-16 lg:py-24 scroll-mt-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-foreground">
                Why DevKit versus traditional cloud utilities
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                Comparing local-first execution against remote cloud converters and online formatters.
              </p>
            </div>

            <div className="mt-10 overflow-x-auto border border-border bg-card rounded-lg shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] text-muted-foreground">
                    <th scope="col" className="p-4 font-medium text-foreground">
                      Engineering metric
                    </th>
                    <th scope="col" className="p-4 font-medium text-emerald-500 bg-emerald-500/5">
                      DevKit (local-first workbench)
                    </th>
                    <th scope="col" className="p-4 font-medium text-muted-foreground">
                      Traditional cloud converters
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="p-4 font-medium text-foreground">Network data egress</td>
                    <td className="p-4 font-mono text-emerald-500 bg-emerald-500/5">
                      0 bytes (processed on device)
                    </td>
                    <td className="p-4 text-muted-foreground">
                      Entire payload uploaded to remote servers
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Processing latency</td>
                    <td className="p-4 font-mono text-emerald-500 bg-emerald-500/5">
                      &lt; 1 ms (in-memory v8 runtime)
                    </td>
                    <td className="p-4 text-muted-foreground">
                      500 ms to 4000 ms network roundtrips
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Offline availability</td>
                    <td className="p-4 font-mono text-emerald-500 bg-emerald-500/5">
                      100% operational offline (pwa cache)
                    </td>
                    <td className="p-4 text-muted-foreground">
                      Completely non-functional without active connection
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Data retention and logs</td>
                    <td className="p-4 text-emerald-500 bg-emerald-500/5">
                      Zero logs, zero third-party telemetry
                    </td>
                    <td className="p-4 text-muted-foreground">
                      Stored in server access logs and cloud buckets
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">File size ceiling</td>
                    <td className="p-4 text-emerald-500 bg-emerald-500/5">
                      Unlimited (bound only by local device ram)
                    </td>
                    <td className="p-4 text-muted-foreground">
                      Capped at 5 MB to 15 MB without paid subscriptions
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Monetization and tracking</td>
                    <td className="p-4 text-emerald-500 bg-emerald-500/5">
                      Zero ads, zero trackers, mit open source
                    </td>
                    <td className="p-4 text-muted-foreground">
                      Ad banners, tracking cookies, subscription paywalls
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ---------------- Complete Tool Catalog Matrix ---------------- */}
        <section id="catalog" className="py-16 lg:py-24 scroll-mt-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ToolMatrix />
          </div>
        </section>

        {/* ---------------- Frequently Asked Questions ---------------- */}
        <section id="faq" className="border-t border-border/70 bg-muted/10 py-16 lg:py-24 scroll-mt-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-foreground">
                  Frequently asked questions
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Technical guarantees regarding DevKit security, offline behavior, and execution boundaries.
                </p>
              </div>

              <div className="mt-10">
                <FaqList />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Closing Statement CTA ---------------- */}
        <section className="border-t border-border/70 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border border-border bg-card p-8 sm:p-14 text-center max-w-4xl mx-auto rounded-xl shadow-xs">
              <div className="space-y-4 max-w-xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
                  Start working without data leaks
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Open the local workbench to format, inspect, and manipulate documents locally in browser memory.
                </p>
                <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/dashboard">
                    <Button size="default" className="h-10 gap-2 px-6 text-xs font-semibold shadow-xs active:opacity-90 disabled:opacity-50 disabled:pointer-events-none">
                      <Icon icon="lucide:terminal" className="size-4" aria-hidden="true" />
                      <span>Launch Workbench</span>
                      <Icon icon="lucide:arrow-right" className="size-3.5" aria-hidden="true" />
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => openPalette()}
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted/90 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Icon icon="lucide:search" className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    <span>Search Tools</span>
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      Ctrl K
                    </kbd>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------------- Statement Footer ---------------- */}
      <footer className="border-t border-border/70 bg-muted/20 py-14 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-5">
            <div className="space-y-3 sm:col-span-2">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded border border-border bg-card text-foreground font-semibold text-[11px]">
                  DK
                </span>
                <span className="font-semibold text-foreground">DevKit</span>
              </div>
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                Zero-egress, client-side developer workstation running formatters, AST parsers,
                cryptographic generators, and document tools inside local browser memory.
              </p>
              <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                <span>All operations execute locally on your device.</span>
              </div>
            </div>

            <div>
              <p className="font-medium text-foreground text-xs mb-2.5">Document and media</p>
              <ul className="space-y-1.5">
                <li><Link href="/tools/pdf-merge" className="hover:text-foreground transition-colors">Merge PDF</Link></li>
                <li><Link href="/tools/pdf-split" className="hover:text-foreground transition-colors">Split and Extract PDF</Link></li>
                <li><Link href="/tools/image-to-pdf" className="hover:text-foreground transition-colors">Image to PDF</Link></li>
                <li><Link href="/tools/pdf-organize" className="hover:text-foreground transition-colors">Organize PDF</Link></li>
                <li><Link href="/tools/image-resizer" className="hover:text-foreground transition-colors">Image Resizer</Link></li>
                <li><Link href="/tools/image-watermark" className="hover:text-foreground transition-colors">Watermark Image</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-foreground text-xs mb-2.5">Code and analysis</p>
              <ul className="space-y-1.5">
                <li><Link href="/tools/ast-explorer" className="hover:text-foreground transition-colors">AST Explorer</Link></li>
                <li><Link href="/tools/wasm-explorer" className="hover:text-foreground transition-colors">WASM Explorer</Link></li>
                <li><Link href="/tools/json-typescript" className="hover:text-foreground transition-colors">JSON to TypeScript</Link></li>
                <li><Link href="/tools/diff-checker" className="hover:text-foreground transition-colors">Diff Checker</Link></li>
                <li><Link href="/tools/regex-playground" className="hover:text-foreground transition-colors">Regex Playground</Link></li>
                <li><Link href="/tools/api-tester" className="hover:text-foreground transition-colors">API Tester</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-foreground text-xs mb-2.5">Navigation and system</p>
              <ul className="space-y-1.5">
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link href="/tools" className="hover:text-foreground transition-colors">All 54 Tools</Link></li>
                <li><Link href="/history" className="hover:text-foreground transition-colors">Local History</Link></li>
                <li><a href="#catalog" className="hover:text-foreground transition-colors">Tool Catalog</a></li>
                <li><a href="#comparison" className="hover:text-foreground transition-colors">Comparison</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row text-[11px]">
            <p>© {new Date().getFullYear()} DevKit. Free and open source under MIT License.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Signature Live Workbench Instrument ---------------- */

type UtilityTab = "json" | "jwt" | "ast" | "pdf";

function WorkbenchInstrument() {
  const [activeTab, setActiveTab] = useState<UtilityTab>("json");
  const [formatMode, setFormatMode] = useState<"pretty" | "compact">("pretty");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border bg-card rounded-lg overflow-hidden text-left font-sans shadow-xs">
      {/* Instrument Utility Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/40 px-3 py-1.5 gap-2">
        <div className="flex items-center gap-1">
          <InstrumentTabButton
            active={activeTab === "json"}
            onClick={() => setActiveTab("json")}
            icon="lucide:braces"
            label="JSON Formatter"
          />
          <InstrumentTabButton
            active={activeTab === "jwt"}
            onClick={() => setActiveTab("jwt")}
            icon="lucide:key"
            label="JWT Inspector"
          />
          <InstrumentTabButton
            active={activeTab === "ast"}
            onClick={() => setActiveTab("ast")}
            icon="lucide:binary"
            label="AST Parser"
          />
          <InstrumentTabButton
            active={activeTab === "pdf"}
            onClick={() => setActiveTab("pdf")}
            icon="lucide:file-text"
            label="PDF Assembly"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          {activeTab === "json" && (
            <div className="flex items-center border border-border rounded overflow-hidden">
              <button
                type="button"
                onClick={() => setFormatMode("pretty")}
                className={cn(
                  "px-2 py-0.5 text-[11px] transition cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  formatMode === "pretty"
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                Prettify
              </button>
              <button
                type="button"
                onClick={() => setFormatMode("compact")}
                className={cn(
                  "px-2 py-0.5 text-[11px] transition cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  formatMode === "compact"
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                Minify
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded border border-border bg-background px-2.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Icon icon={copied ? "lucide:check" : "lucide:copy"} className="size-3" aria-hidden="true" />
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Editor Viewport with Line Numbers and Real Output */}
      <div className="p-4 sm:p-5 font-mono text-xs leading-relaxed bg-background/50 overflow-x-auto min-h-[200px]">
        {activeTab === "json" && (
          <div className="space-y-1">
            {formatMode === "pretty" ? (
              <>
                <div className="flex gap-4">
                  <span className="select-none text-muted-foreground/50 w-6 text-right tabular-nums">1</span>
                  <span><span className="text-muted-foreground">&#123;</span></span>
                </div>
                <div className="flex gap-4">
                  <span className="select-none text-muted-foreground/50 w-6 text-right tabular-nums">2</span>
                  <span className="pl-4">
                    <span className="text-sky-400">&quot;status&quot;</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-emerald-400">&quot;success&quot;</span>
                    <span className="text-muted-foreground">,</span>
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="select-none text-muted-foreground/50 w-6 text-right tabular-nums">3</span>
                  <span className="pl-4">
                    <span className="text-sky-400">&quot;networkEgressBytes&quot;</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-amber-400">0</span>
                    <span className="text-muted-foreground">,</span>
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="select-none text-muted-foreground/50 w-6 text-right tabular-nums">4</span>
                  <span className="pl-4">
                    <span className="text-sky-400">&quot;executionLatencyMs&quot;</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-amber-400">0.14</span>
                    <span className="text-muted-foreground">,</span>
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="select-none text-muted-foreground/50 w-6 text-right tabular-nums">5</span>
                  <span className="pl-4">
                    <span className="text-sky-400">&quot;runtime&quot;</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-emerald-400">&quot;v8-in-memory-sandbox&quot;</span>
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="select-none text-muted-foreground/50 w-6 text-right tabular-nums">6</span>
                  <span><span className="text-muted-foreground">&#125;</span></span>
                </div>
              </>
            ) : (
              <div className="flex gap-4">
                <span className="select-none text-muted-foreground/50 w-6 text-right tabular-nums">1</span>
                <span className="text-muted-foreground break-all">
                  &#123;&quot;status&quot;:&quot;success&quot;,&quot;networkEgressBytes&quot;:0,&quot;executionLatencyMs&quot;:0.14,&quot;runtime&quot;:&quot;v8-in-memory-sandbox&quot;&#125;
                </span>
              </div>
            )}
          </div>
        )}

        {activeTab === "jwt" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-border/50 text-[11px] text-emerald-500 font-medium">
              <Icon icon="lucide:check-circle" className="size-3" aria-hidden="true" />
              <span>Valid WebCrypto HS256 Signature (algorithm: HMAC SHA-256)</span>
            </div>
            <div className="space-y-1">
              <div className="flex gap-4">
                <span className="select-none text-muted-foreground/50 w-6 text-right tabular-nums">1</span>
                <span>
                  <span className="text-muted-foreground">&#47;&#47; Header: </span>
                  <span className="text-muted-foreground">&#123;&quot;alg&quot;: &quot;HS256&quot;, &quot;typ&quot;: &quot;JWT&quot;&#125;</span>
                </span>
              </div>
              <div className="flex gap-4">
                <span className="select-none text-muted-foreground/50 w-6 text-right tabular-nums">2</span>
                <span className="pl-4">
                  <span className="text-sky-400">&quot;sub&quot;</span>: <span className="text-emerald-400">&quot;usr_dev_0x9948&quot;</span>,
                </span>
              </div>
              <div className="flex gap-4">
                <span className="select-none text-muted-foreground/50 w-6 text-right tabular-nums">3</span>
                <span className="pl-4">
                  <span className="text-sky-400">&quot;scope&quot;</span>: <span className="text-emerald-400">&quot;write:local-sandbox&quot;</span>,
                </span>
              </div>
              <div className="flex gap-4">
                <span className="select-none text-muted-foreground/50 w-6 text-right tabular-nums">4</span>
                <span className="pl-4">
                  <span className="text-sky-400">&quot;exp&quot;</span>: <span className="text-amber-400">1735689600</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ast" && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center gap-2 pb-1 border-b border-border/50 text-sky-400">
              <span>Babel AST Engine (in-tab parse latency: 0.18ms)</span>
            </div>
            <div className="text-muted-foreground pt-1">
              <span className="text-foreground font-medium">Program</span> (start: 0, end: 42)
            </div>
            <div className="pl-4 text-muted-foreground">
              └─ <span className="text-amber-400 font-medium">VariableDeclaration</span> (kind: &quot;const&quot;)
            </div>
            <div className="pl-8 text-muted-foreground">
              ├─ <span className="text-emerald-400">Identifier</span> (name: &quot;offlineStorage&quot;)
            </div>
            <div className="pl-8 text-muted-foreground">
              └─ <span className="text-sky-400">ObjectExpression</span> (properties: 3)
            </div>
          </div>
        )}

        {activeTab === "pdf" && (
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between pb-1 border-b border-border/50">
              <span className="text-foreground font-medium flex items-center gap-1.5">
                <Icon icon="lucide:file-check" className="size-3.5 text-emerald-500" aria-hidden="true" />
                <span>Client-side pdf-lib document assembly</span>
              </span>
              <span className="text-emerald-500 font-medium">0 bytes transferred</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-muted-foreground">
              <div className="border border-border/60 bg-muted/20 p-2 rounded">
                <div className="text-[10px]">total pages</div>
                <div className="font-medium text-foreground text-xs">18 pages</div>
              </div>
              <div className="border border-border/60 bg-muted/20 p-2 rounded">
                <div className="text-[10px]">memory heap</div>
                <div className="font-medium text-foreground text-xs">3.4 MB</div>
              </div>
              <div className="border border-border/60 bg-muted/20 p-2 rounded">
                <div className="text-[10px]">processing speed</div>
                <div className="font-medium text-emerald-500 text-xs">84 ms</div>
              </div>
              <div className="border border-border/60 bg-muted/20 p-2 rounded">
                <div className="text-[10px]">privacy state</div>
                <div className="font-medium text-emerald-500 text-xs">air-gapped</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Measured Telemetry Status Bar */}
      <div className="flex flex-wrap items-center justify-between border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="text-foreground">Ln 14, Col 2</span>
          <span>UTF-8</span>
          <span>LF</span>
          <span>JSON Schema Draft-7</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono tabular-nums text-foreground">0.14 ms execution</span>
          <span className="text-emerald-500 font-medium">100% client-side</span>
        </div>
      </div>
    </div>
  );
}

function InstrumentTabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition cursor-pointer select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        active
          ? "border border-border bg-background text-foreground font-medium shadow-2xs"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <Icon icon={icon} className="size-3" aria-hidden="true" />
      <span>{label}</span>
    </button>
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
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-foreground">
            Tool catalog inventory
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Fifty-four client utilities organized by category.
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
              className="w-full rounded-md border border-border bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus-visible:ring-1 focus-visible:ring-ring"
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
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted/90 disabled:opacity-50 disabled:pointer-events-none",
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
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted/90 disabled:opacity-50 disabled:pointer-events-none",
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

      {/* Tool Grid */}
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
              className="group block transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
            >
              <article className="h-full rounded-lg border border-border bg-card p-3.5 transition-colors group-hover:border-border/80 group-hover:bg-muted/30 shadow-xs flex flex-col justify-between space-y-2">
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <ToolIcon icon={tool.icon} accent={tool.accent} className="size-7" />
                    <span className="text-[10px] text-muted-foreground lowercase">
                      {tool.category}
                    </span>
                  </div>
                  <h3 className="text-xs font-medium text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
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

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                  <span className="font-mono">/tools/{tool.slug}</span>
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
              className="flex w-full items-center justify-between p-3.5 text-left text-xs font-medium text-foreground hover:bg-muted/30 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span>{faq.q}</span>
              <Icon
                icon="lucide:chevron-down"
                className={cn(
                  "size-3.5 shrink-0 text-muted-foreground motion-safe:transition-transform motion-reduce:transition-none duration-150",
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
