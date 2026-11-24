"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { TOOLS, CATEGORIES, QUICK_ACCESS } from "@/data/tools";
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
              <span className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-foreground font-mono font-semibold text-xs shadow-xs">
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
              <a href="#studio" className="transition hover:text-foreground">
                Studio
              </a>
              <a href="#standards" className="transition hover:text-foreground">
                Standards
              </a>
              <a href="#bento" className="transition hover:text-foreground">
                Architecture
              </a>
              <a href="#comparison" className="transition hover:text-foreground">
                Why DevKit
              </a>
              <a href="#catalog" className="transition hover:text-foreground">
                Catalog
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
              className="hidden items-center gap-2 rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground transition hover:border-border hover:bg-muted hover:text-foreground sm:flex cursor-pointer"
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
                href="#studio"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Studio
              </a>
              <a
                href="#standards"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Standards
              </a>
              <a
                href="#bento"
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
                Why DevKit
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
        {/* ---------------- SaaS Flagship Hero Section ---------------- */}
        <section id="studio" className="relative border-b border-border/70 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="mx-auto max-w-4xl text-center space-y-6">
              {/* Product Release Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs text-muted-foreground shadow-xs backdrop-blur-sm transition hover:border-border">
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                <span className="font-mono text-[11px] font-semibold text-foreground">DevKit 2.0</span>
                <span className="text-border">|</span>
                <span className="text-[11px]">The Local Developer Cloud</span>
                <Icon icon="lucide:arrow-right" className="size-3 text-muted-foreground" aria-hidden="true" />
              </div>

              {/* Commanding SaaS Headline */}
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1] sm:leading-[1.1]">
                All your developer tools.
                <span className="block text-muted-foreground">None of your data leaving.</span>
              </h1>

              {/* Sub-headline */}
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                54 instant, client-side engineering utilities for formatting, cryptographic hashing,
                AST inspection, and document manipulation. Executed entirely inside your browser memory
                with zero network egress.
              </p>

              {/* Dual Action CTAs */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link href="/dashboard">
                  <Button size="default" className="h-10 gap-2 px-6 text-xs font-semibold shadow-xs">
                    <Icon icon="lucide:layout-grid" className="size-4" aria-hidden="true" />
                    <span>Launch Studio</span>
                    <kbd className="hidden sm:inline-flex items-center rounded bg-primary-foreground/20 px-1.5 py-0.5 font-mono text-[10px] text-primary-foreground">
                      ⌘K
                    </kbd>
                  </Button>
                </Link>
                <a href="#catalog">
                  <Button variant="outline" size="default" className="h-10 gap-2 px-6 text-xs font-semibold">
                    <Icon icon="lucide:list" className="size-4" aria-hidden="true" />
                    <span>Explore 54 Tools</span>
                  </Button>
                </a>
              </div>

              {/* Technical Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-mono">
                <div className="flex items-center gap-1.5">
                  <Icon icon="lucide:shield-check" className="size-3.5 text-emerald-500" aria-hidden="true" />
                  <span>0 B Network Egress</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon icon="lucide:zap" className="size-3.5 text-amber-500" aria-hidden="true" />
                  <span>Sub-millisecond Latency</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon icon="lucide:wifi-off" className="size-3.5 text-sky-500" aria-hidden="true" />
                  <span>100% Offline PWA</span>
                </div>
              </div>
            </div>

            {/* Interactive DevKit Studio Application Window */}
            <div className="mt-12 lg:mt-16 max-w-5xl mx-auto">
              <StudioMockupWindow />
            </div>
          </div>
        </section>

        {/* ---------------- Open Standards & Specifications Row ---------------- */}
        <section id="standards" className="border-b border-border/70 bg-muted/20 py-8">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground shrink-0">
                Powered by Open Specifications
              </span>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
                <span className="rounded-md border border-border bg-card px-2.5 py-1 text-foreground">
                  W3C WebCrypto API
                </span>
                <span className="rounded-md border border-border bg-card px-2.5 py-1 text-foreground">
                  Babel AST v8
                </span>
                <span className="rounded-md border border-border bg-card px-2.5 py-1 text-foreground">
                  WebAssembly (WASM)
                </span>
                <span className="rounded-md border border-border bg-card px-2.5 py-1 text-foreground">
                  ISO 32000 PDF
                </span>
                <span className="rounded-md border border-border bg-card px-2.5 py-1 text-foreground">
                  RFC 7519 JWT
                </span>
                <span className="rounded-md border border-border bg-card px-2.5 py-1 text-foreground">
                  Canvas 2D Engine
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- High-Impact Bento Architecture Showcase ---------------- */}
        <section id="bento" className="border-b border-border/70 py-16 lg:py-24 scroll-mt-14">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Icon icon="lucide:layers" className="size-3.5 text-emerald-500" aria-hidden="true" />
                <span>Architecture & Ergonomics</span>
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                Engineered for security, velocity, and zero cloud dependency
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                DevKit is fundamentally architected to eliminate the privacy risks, latency bottlenecks, and
                paywalls of traditional online utility websites.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Bento Card 1: Zero Egress Sandbox (Col span 2 on LG) */}
              <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono text-emerald-500">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Zero-Egress Sandbox
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">Air-Gapped Compliant</span>
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    Zero network requests. 100% in-browser memory isolation.
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                    Every routine—from hashing JWT secrets to merging confidential multi-page contracts—executes
                    strictly inside your browser V8 heap. Memory is immediately released upon closing the tab.
                  </p>
                </div>

                {/* Micro-UI: Live Sandbox Telemetry */}
                <div className="rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-muted-foreground border-b border-border/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:shield" className="size-3.5 text-emerald-500" />
                      <span className="text-[11px] text-foreground font-semibold">Browser Network Monitor</span>
                    </div>
                    <span className="text-[10px] text-emerald-500">POLICY: REJECT_ALL_EGRESS</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">POST https://analytics.remote/v1</span>
                      <span className="text-red-500 font-semibold">[BLOCKED: ZERO_EGRESS]</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">POST https://api.cloud-converter.com/upload</span>
                      <span className="text-red-500 font-semibold">[BLOCKED: LOCAL_FIRST]</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-foreground font-semibold">
                      <span>Total Network Bytes Egressed:</span>
                      <span className="text-emerald-500 font-mono">0 Bytes (0 pkts)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento Card 2: Command Palette Velocity */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-mono text-foreground">
                      <Icon icon="lucide:command" className="size-3" />
                      Command Center
                    </span>
                    <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      Ctrl K
                    </kbd>
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    Sub-millisecond keyboard velocity
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Switch between all 54 utilities in <span className="font-mono text-foreground">0.1ms</span>.
                    Fuzzy search tools, trigger formatting commands, and jump directly to work.
                  </p>
                </div>

                {/* Micro-UI: Interactive Palette Preview */}
                <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs space-y-1.5">
                  <div className="flex items-center gap-2 rounded border border-border/80 bg-background px-2.5 py-1.5 text-[11px] text-foreground">
                    <Icon icon="lucide:search" className="size-3 text-muted-foreground" />
                    <span>&gt; jwt decode</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-muted-foreground pl-1">
                    <div className="flex items-center justify-between py-1 px-1.5 rounded bg-card text-foreground font-semibold">
                      <span>JWT Inspector</span>
                      <span className="text-[10px] text-emerald-500 font-normal">HS256 / RS256</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1.5">
                      <span>JSON Formatter</span>
                      <span className="text-[10px]">Prettify & Diff</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento Card 3: Deep AST & Bytecode Inspection */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-mono text-foreground">
                      <Icon icon="lucide:binary" className="size-3" />
                      Compilers & AST
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">Babel / WASM</span>
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    Deep AST & bytecode disassembly
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Inspect ECMAScript and TypeScript Abstract Syntax Trees in real time. Deconstruct WebAssembly
                    binary sections with opcode resolution.
                  </p>
                </div>

                {/* Micro-UI: AST Node Tree Preview */}
                <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs space-y-1">
                  <div className="text-[11px] text-muted-foreground">
                    <span className="text-sky-500 font-semibold">Program</span> (body: 2)
                  </div>
                  <div className="pl-3 text-[11px] text-muted-foreground">
                    └─ <span className="text-amber-500 font-semibold">FunctionDeclaration</span> (name: &quot;hash&quot;)
                  </div>
                  <div className="pl-6 text-[10px] text-muted-foreground">
                    ├─ <span className="text-emerald-500">Identifier</span> (id: &quot;secretKey&quot;)
                  </div>
                  <div className="pl-6 text-[10px] text-muted-foreground">
                    └─ <span className="text-violet-500">BlockStatement</span> (lines: 4)
                  </div>
                </div>
              </div>

              {/* Bento Card 4: Document & Media Studio (Col span 2 on LG) */}
              <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-mono text-sky-500">
                      <Icon icon="lucide:file-text" className="size-3" />
                      Document Engine
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">pdf-lib • jszip • Canvas</span>
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    Heavy document & media manipulation. No cloud limits.
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                    Merge, split, compress, and watermark multi-megabyte PDFs and images directly in browser RAM.
                    No 5 MB paywalls, no queue delays, and zero document uploads to third-party cloud servers.
                  </p>
                </div>

                {/* Micro-UI: Local PDF Pipeline */}
                <div className="rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-muted-foreground border-b border-border/60 pb-2">
                    <span className="text-[11px] text-foreground font-semibold">In-Memory Batch Pipeline</span>
                    <span className="text-[10px] text-emerald-500">COMPLETED IN 140ms</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                    <div className="rounded border border-border bg-card p-2 space-y-1">
                      <div className="text-muted-foreground text-[10px]">Input Document</div>
                      <div className="font-semibold text-foreground truncate">contract-full.pdf</div>
                      <div className="text-muted-foreground text-[10px]">14.8 MB (24 pages)</div>
                    </div>
                    <div className="rounded border border-border bg-card p-2 space-y-1">
                      <div className="text-muted-foreground text-[10px]">Transformation</div>
                      <div className="font-semibold text-foreground">Split Pages 1-5</div>
                      <div className="text-emerald-500 text-[10px]">In-Memory pdf-lib</div>
                    </div>
                    <div className="rounded border border-border bg-card p-2 space-y-1">
                      <div className="text-muted-foreground text-[10px]">Output Bundle</div>
                      <div className="font-semibold text-foreground truncate">extracted-bundle.zip</div>
                      <div className="text-emerald-500 text-[10px]">0 B Uploaded</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- SaaS Comparison Matrix (DevKit vs Cloud Converters) ---------------- */}
        <section id="comparison" className="border-b border-border/70 py-16 lg:py-24 scroll-mt-14">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="max-w-3xl">
              <span className="text-xs font-medium text-muted-foreground">Architectural Benchmark</span>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                Why DevKit vs Legacy Cloud Converters
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                How DevKit compares to traditional online formatters, cloud PDF converters, and web decoders.
              </p>
            </div>

            <div className="mt-10 overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-mono text-[11px] text-muted-foreground">
                    <th scope="col" className="p-4 font-semibold text-foreground">
                      Engineering Metric
                    </th>
                    <th scope="col" className="p-4 font-semibold text-emerald-500 bg-emerald-500/5">
                      DevKit (Local-First Cloud)
                    </th>
                    <th scope="col" className="p-4 font-semibold text-muted-foreground">
                      Traditional Web Utilities (Cloud)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Network Data Egress</td>
                    <td className="p-4 font-mono text-emerald-500 bg-emerald-500/5 font-semibold">
                      0 Bytes (Never leaves device)
                    </td>
                    <td className="p-4 text-muted-foreground">
                      100% of payload uploaded to remote servers
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Execution Latency</td>
                    <td className="p-4 font-mono text-emerald-500 bg-emerald-500/5 font-semibold">
                      &lt; 1ms (Native V8 / WebCrypto)
                    </td>
                    <td className="p-4 text-muted-foreground">
                      500ms – 4,000ms (Network roundtrips & queues)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Air-Gapped & Offline Support</td>
                    <td className="p-4 font-mono text-emerald-500 bg-emerald-500/5 font-semibold">
                      100% Operational Offline (PWA)
                    </td>
                    <td className="p-4 text-muted-foreground">
                      Completely non-functional without active Wi-Fi
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Data Retention & Logs</td>
                    <td className="p-4 font-mono text-emerald-500 bg-emerald-500/5 font-semibold">
                      Zero logs, zero third-party telemetry
                    </td>
                    <td className="p-4 text-muted-foreground">
                      Stored in server access logs and cloud S3 buckets
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">File Size Limits & Quotas</td>
                    <td className="p-4 font-mono text-emerald-500 bg-emerald-500/5 font-semibold">
                      Unlimited (Bound only by local device RAM)
                    </td>
                    <td className="p-4 text-muted-foreground">
                      Capped at 5 MB – 15 MB unless you pay monthly
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Monetization & Tracking</td>
                    <td className="p-4 font-mono text-emerald-500 bg-emerald-500/5 font-semibold">
                      0 Ads, 0 Trackers, MIT Open Source
                    </td>
                    <td className="p-4 text-muted-foreground">
                      Ad banners, cross-site trackers, paywalls
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ---------------- Complete Tool Catalog Matrix ---------------- */}
        <section id="catalog" className="py-16 lg:py-24 scroll-mt-14">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
            <ToolMatrix />
          </div>
        </section>

        {/* ---------------- Frequently Asked Questions ---------------- */}
        <section id="faq" className="border-t border-border/70 bg-muted/10 py-16 lg:py-24 scroll-mt-14">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="max-w-3xl mx-auto">
              <div className="text-center">
                <span className="text-xs font-medium text-muted-foreground font-mono uppercase tracking-wider">
                  Technical Specifications
                </span>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                  Frequently Asked Questions
                </h2>
                <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                  Technical guarantees regarding DevKit security, offline behavior, and execution boundaries.
                </p>
              </div>

              <div className="mt-10">
                <FaqList />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- SaaS Bottom Call to Action ---------------- */}
        <section className="border-t border-border/70 py-16 lg:py-24">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="rounded-2xl border border-border bg-card p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-xs relative overflow-hidden">
              <div className="space-y-4 max-w-xl mx-auto">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-0.5 text-xs font-mono text-muted-foreground">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Instant & Free Forever
                </span>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Start building with zero data egress.
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Never paste proprietary tokens or upload company contracts to untrusted web servers again.
                  Launch the local studio immediately.
                </p>
                <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/dashboard">
                    <Button size="default" className="h-10 gap-2 px-6 text-xs font-semibold shadow-xs">
                      <Icon icon="lucide:layout-grid" className="size-4" aria-hidden="true" />
                      <span>Launch Studio</span>
                      <Icon icon="lucide:arrow-right" className="size-3.5" aria-hidden="true" />
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => openPalette()}
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-5 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
                  >
                    <Icon icon="lucide:search" className="size-3.5 text-muted-foreground" />
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

      {/* ---------------- Enterprise SaaS Footer ---------------- */}
      <footer className="border-t border-border/70 bg-muted/20 py-14 text-xs text-muted-foreground">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-5">
            <div className="space-y-3 sm:col-span-2">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded border border-border bg-card text-foreground font-mono font-semibold text-[11px]">
                  DK
                </span>
                <span className="font-semibold text-foreground">DevKit</span>
                <span className="rounded border border-border bg-muted px-1.5 py-0.2 font-mono text-[10px]">
                  local-first • v2.0
                </span>
              </div>
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                Zero-egress, client-side developer workstation running formatters, AST parsers,
                cryptographic generators, and document tools inside local browser memory.
              </p>
              <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span>All operations execute locally on your device.</span>
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
              <p className="font-semibold text-foreground text-xs mb-2.5">Code & Analysis</p>
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
                <li><a href="#comparison" className="hover:text-foreground transition">Why DevKit</a></li>
                <li><a href="#faq" className="hover:text-foreground transition">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row text-[11px]">
            <p>© {new Date().getFullYear()} DevKit. Free and open source under MIT License.</p>
            <div className="flex items-center gap-3">
              <span>Runtime: <span className="font-mono text-foreground">In-Memory / V8</span></span>
              <span>•</span>
              <span>Command Bar: <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">Ctrl+K</kbd></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Interactive DevKit Studio Mockup Window ---------------- */

type StudioTab = "json" | "jwt" | "ast" | "pdf";

function StudioMockupWindow() {
  const [activeTab, setActiveTab] = useState<StudioTab>("json");
  const [formatMode, setFormatMode] = useState<"pretty" | "compact">("pretty");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden text-left font-sans">
      {/* Studio Window Chrome Bar */}
      <div className="flex h-11 items-center justify-between border-b border-border bg-muted/40 px-4">
        <div className="flex items-center gap-2">
          {/* Traffic light dots */}
          <div className="flex items-center gap-1.5 pr-2">
            <span className="size-2.5 rounded-full bg-red-500/80" />
            <span className="size-2.5 rounded-full bg-amber-500/80" />
            <span className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>
          {/* Path pill */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground shadow-2xs">
            <Icon icon="lucide:shield-check" className="size-3 text-emerald-500" />
            <span>devkit.internal</span>
            <span className="text-border">/</span>
            <span className="text-foreground font-semibold">
              {activeTab === "json" && "payload.json"}
              {activeTab === "jwt" && "claims.jwt"}
              {activeTab === "ast" && "parser.ts"}
              {activeTab === "pdf" && "document.pdf"}
            </span>
          </div>
        </div>

        {/* Egress status badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-500 font-semibold">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            0 B Egress
          </span>
          <span className="hidden md:inline-flex text-[11px] font-mono text-muted-foreground">
            V8 In-Memory Sandbox
          </span>
        </div>
      </div>

      {/* Studio Navigation & Tab Strip */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/20 px-3 py-1 gap-2">
        <div className="flex items-center gap-1">
          <StudioTabButton
            active={activeTab === "json"}
            onClick={() => setActiveTab("json")}
            icon="lucide:braces"
            label="payload.json"
            tag="Format"
          />
          <StudioTabButton
            active={activeTab === "jwt"}
            onClick={() => setActiveTab("jwt")}
            icon="lucide:key"
            label="claims.jwt"
            tag="Verify"
          />
          <StudioTabButton
            active={activeTab === "ast"}
            onClick={() => setActiveTab("ast")}
            icon="lucide:binary"
            label="parser.ts"
            tag="AST"
          />
          <StudioTabButton
            active={activeTab === "pdf"}
            onClick={() => setActiveTab("pdf")}
            icon="lucide:file-text"
            label="contract.pdf"
            tag="PDF"
          />
        </div>

        {/* Action buttons inside studio */}
        <div className="flex items-center gap-1.5 text-xs">
          {activeTab === "json" && (
            <>
              <button
                type="button"
                onClick={() => setFormatMode("pretty")}
                className={cn(
                  "rounded px-2 py-0.5 text-[11px] font-mono transition cursor-pointer",
                  formatMode === "pretty"
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                Prettify
              </button>
              <button
                type="button"
                onClick={() => setFormatMode("compact")}
                className={cn(
                  "rounded px-2 py-0.5 text-[11px] font-mono transition cursor-pointer",
                  formatMode === "compact"
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                Minify
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded border border-border bg-background px-2 py-0.5 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
          >
            <Icon icon={copied ? "lucide:check" : "lucide:copy"} className="size-3" />
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Editor Viewport with Line Numbers and Code */}
      <div className="p-4 sm:p-5 font-mono text-xs leading-relaxed bg-background/50 overflow-x-auto min-h-[220px]">
        {activeTab === "json" && (
          <div className="space-y-1">
            {formatMode === "pretty" ? (
              <>
                <div className="flex gap-4">
                  <span className="select-none text-muted-foreground/50 w-6 text-right">1</span>
                  <span><span className="text-muted-foreground">&#123;</span></span>
                </div>
                <div className="flex gap-4">
                  <span className="select-none text-muted-foreground/50 w-6 text-right">2</span>
                  <span className="pl-4">
                    <span className="text-sky-500">&quot;status&quot;</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-emerald-500">&quot;success&quot;</span>
                    <span className="text-muted-foreground">,</span>
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="select-none text-muted-foreground/50 w-6 text-right">3</span>
                  <span className="pl-4">
                    <span className="text-sky-500">&quot;networkEgressBytes&quot;</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-amber-500">0</span>
                    <span className="text-muted-foreground">,</span>
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="select-none text-muted-foreground/50 w-6 text-right">4</span>
                  <span className="pl-4">
                    <span className="text-sky-500">&quot;executionLatencyMs&quot;</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-amber-500">0.14</span>
                    <span className="text-muted-foreground">,</span>
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="select-none text-muted-foreground/50 w-6 text-right">5</span>
                  <span className="pl-4">
                    <span className="text-sky-500">&quot;runtime&quot;</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-emerald-500">&quot;v8-in-memory-sandbox&quot;</span>
                    <span className="text-muted-foreground">,</span>
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="select-none text-muted-foreground/50 w-6 text-right">6</span>
                  <span className="pl-4">
                    <span className="text-sky-500">&quot;compliance&quot;</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-muted-foreground">[</span>
                    <span className="text-emerald-500">&quot;air-gapped&quot;</span>
                    <span className="text-muted-foreground">, </span>
                    <span className="text-emerald-500">&quot;zero-tracking&quot;</span>
                    <span className="text-muted-foreground">]</span>
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="select-none text-muted-foreground/50 w-6 text-right">7</span>
                  <span><span className="text-muted-foreground">&#125;</span></span>
                </div>
              </>
            ) : (
              <div className="flex gap-4">
                <span className="select-none text-muted-foreground/50 w-6 text-right">1</span>
                <span className="text-muted-foreground break-all">
                  &#123;&quot;status&quot;:&quot;success&quot;,&quot;networkEgressBytes&quot;:0,&quot;executionLatencyMs&quot;:0.14,&quot;runtime&quot;:&quot;v8-in-memory-sandbox&quot;,&quot;compliance&quot;:[&quot;air-gapped&quot;,&quot;zero-tracking&quot;]&#125;
                </span>
              </div>
            )}
          </div>
        )}

        {activeTab === "jwt" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-border/50 text-[11px]">
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <Icon icon="lucide:check-circle" className="size-3" />
                Valid WebCrypto HS256 Signature
              </span>
              <span className="text-muted-foreground">• Algorithm: HMAC SHA-256</span>
            </div>
            <div className="space-y-1">
              <div className="flex gap-4">
                <span className="select-none text-muted-foreground/50 w-6 text-right">1</span>
                <span>
                  <span className="text-red-400 font-semibold">&#47;&#47; Header: </span>
                  <span className="text-muted-foreground">&#123;&quot;alg&quot;: &quot;HS256&quot;, &quot;typ&quot;: &quot;JWT&quot;&#125;</span>
                </span>
              </div>
              <div className="flex gap-4">
                <span className="select-none text-muted-foreground/50 w-6 text-right">2</span>
                <span>
                  <span className="text-sky-400 font-semibold">&#47;&#47; Payload Claims:</span>
                </span>
              </div>
              <div className="flex gap-4">
                <span className="select-none text-muted-foreground/50 w-6 text-right">3</span>
                <span className="pl-4">
                  <span className="text-sky-500">&quot;sub&quot;</span>: <span className="text-emerald-500">&quot;usr_dev_0x9948&quot;</span>,
                </span>
              </div>
              <div className="flex gap-4">
                <span className="select-none text-muted-foreground/50 w-6 text-right">4</span>
                <span className="pl-4">
                  <span className="text-sky-500">&quot;scope&quot;</span>: <span className="text-emerald-500">&quot;write:local-sandbox&quot;</span>,
                </span>
              </div>
              <div className="flex gap-4">
                <span className="select-none text-muted-foreground/50 w-6 text-right">5</span>
                <span className="pl-4">
                  <span className="text-sky-500">&quot;exp&quot;</span>: <span className="text-amber-500">1735689600</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ast" && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center gap-2 pb-1 border-b border-border/50">
              <span className="text-sky-500 font-semibold">Babel AST (EcmaScript 2026 Engine)</span>
              <span className="text-muted-foreground">• In-Tab Parse Time: 0.18ms</span>
            </div>
            <div className="text-muted-foreground pt-1">
              <span className="text-foreground font-semibold">Program</span> (start: 0, end: 42)
            </div>
            <div className="pl-4 text-muted-foreground">
              └─ <span className="text-amber-500 font-semibold">VariableDeclaration</span> (kind: &quot;const&quot;)
            </div>
            <div className="pl-8 text-muted-foreground">
              ├─ <span className="text-emerald-500">Identifier</span> (name: &quot;offlineStorage&quot;)
            </div>
            <div className="pl-8 text-muted-foreground">
              └─ <span className="text-sky-500">ObjectExpression</span> (properties: 3)
            </div>
          </div>
        )}

        {activeTab === "pdf" && (
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between pb-1 border-b border-border/50">
              <span className="text-foreground font-semibold flex items-center gap-1.5">
                <Icon icon="lucide:file-check" className="size-3.5 text-emerald-500" />
                <span>Client-Side pdf-lib Document Assembly</span>
              </span>
              <span className="text-emerald-500 font-semibold">0 B Transferred</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-muted-foreground">
              <div className="rounded border border-border/60 bg-muted/20 p-2">
                <div className="text-[10px]">Total Pages</div>
                <div className="font-semibold text-foreground text-xs">18 Pages</div>
              </div>
              <div className="rounded border border-border/60 bg-muted/20 p-2">
                <div className="text-[10px]">Local Memory Heap</div>
                <div className="font-semibold text-foreground text-xs">3.4 MB</div>
              </div>
              <div className="rounded border border-border/60 bg-muted/20 p-2">
                <div className="text-[10px]">Processing Speed</div>
                <div className="font-semibold text-emerald-500 text-xs">84 ms</div>
              </div>
              <div className="rounded border border-border/60 bg-muted/20 p-2">
                <div className="text-[10px]">Privacy State</div>
                <div className="font-semibold text-emerald-500 text-xs">Air-Gapped</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Studio Status Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between border-t border-border bg-muted/30 px-4 py-2 font-mono text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span className="text-foreground font-semibold">Ln 14, Col 2</span>
          </span>
          <span>•</span>
          <span>UTF-8</span>
          <span>•</span>
          <span>LF</span>
          <span>•</span>
          <span>JSON Schema Draft-7</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-foreground font-semibold">⚡ 0.14ms execution</span>
          <span>•</span>
          <span className="text-emerald-500 font-semibold">100% Client-Side</span>
        </div>
      </div>
    </div>
  );
}

function StudioTabButton({
  active,
  onClick,
  icon,
  label,
  tag,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  tag: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono transition cursor-pointer select-none",
        active
          ? "border border-border bg-background text-foreground font-semibold shadow-xs"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <Icon icon={icon} className="size-3" />
      <span>{label}</span>
      <span className="text-[10px] text-muted-foreground font-normal">({tag})</span>
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
          <span className="text-xs font-medium text-muted-foreground font-mono uppercase tracking-wider">
            Complete Inventory
          </span>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
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
