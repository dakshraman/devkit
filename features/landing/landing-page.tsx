"use client";

import Link from "next/link";
import { useState, useId } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { TOOLS, CATEGORIES } from "@/data/tools";
import { useSettings } from "@/context/settings-context";
import { useCommandPalette } from "@/context/command-palette-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { ToolIcon } from "@/components/ui/tool-icon";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";
import type { ToolCategory } from "@/types";

export function LandingPage() {
  const { theme, toggleTheme } = useSettings();
  const { open: openPalette } = useCommandPalette();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* ---------------- Navigation Bar ---------------- */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-md shadow-indigo-500/25">
                <Icon icon="lucide:zap" className="size-5 text-white" />
              </span>
              <div className="leading-tight">
                <span className="block text-base font-bold tracking-tight">DevKit</span>
                <span className="block text-[11px] text-muted-foreground font-mono">100% client-side</span>
              </div>
            </Link>

            <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground md:flex">
              <a href="#features" className="transition hover:text-foreground">Features</a>
              <a href="#playground" className="transition hover:text-foreground">Interactive Demo</a>
              <a href="#tools" className="transition hover:text-foreground">50+ Tools</a>
              <a href="#privacy" className="transition hover:text-foreground">Privacy</a>
              <a href="#comparison" className="transition hover:text-foreground">Comparison</a>
              <a href="#faq" className="transition hover:text-foreground">FAQ</a>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openPalette()}
              className="hidden items-center gap-2 rounded-lg border border-border bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-muted sm:flex"
              aria-label="Open command palette"
            >
              <Icon icon="lucide:search" className="size-3.5" />
              <span>Search tools</span>
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                Ctrl K
              </kbd>
            </button>

            <button
              onClick={toggleTheme}
              className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <Icon icon={theme === "dark" ? "lucide:sun" : "lucide:moon"} className="size-4" />
            </button>

            <Link href="/tools" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">
                Explore Tools
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button size="sm" className="gap-1.5 shadow-sm shadow-primary/20">
                <span>Dashboard</span>
                <Icon icon="lucide:arrow-right" className="size-3.5" />
              </Button>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-muted-foreground md:hidden hover:bg-accent"
              aria-label="Toggle menu"
            >
              <Icon icon={mobileMenuOpen ? "lucide:x" : "lucide:menu"} className="size-5" />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-border bg-background px-4 py-4 md:hidden"
            >
              <nav className="flex flex-col gap-3 text-sm">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Features
                </a>
                <a
                  href="#playground"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Interactive Demo
                </a>
                <a
                  href="#tools"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  50+ Tools Directory
                </a>
                <a
                  href="#privacy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Privacy Guarantee
                </a>
                <a
                  href="#comparison"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Comparison
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  FAQ
                </a>
                <div className="pt-2 border-t border-border flex flex-col gap-2">
                  <Link href="/tools" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">
                      Browse All Tools
                    </Button>
                  </Link>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-center">
                      Open Dashboard
                    </Button>
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ---------------- Hero Section ---------------- */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div className="size-[540px] rounded-full bg-indigo-500/10 blur-[130px] dark:bg-indigo-500/15" />
          <div className="size-[420px] rounded-full bg-fuchsia-500/10 blur-[140px] dark:bg-fuchsia-500/15 -translate-y-24 translate-x-32" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 backdrop-blur-md mb-6">
              <span className="flex size-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>50+ Developer Utilities • 100% Local • Zero Cloud Telemetry</span>
            </div>

            {/* Main Title */}
            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              The Developer Toolkit That{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Never Touches the Cloud
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-xl">
              Stop pasting sensitive JSON, JWT tokens, and private hashes into suspicious online tools. DevKit runs completely in your browser with zero latency, zero ads, and offline PWA support.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 px-7 text-base shadow-lg shadow-primary/25">
                  <Icon icon="lucide:layout-grid" className="size-5" />
                  <span>Launch Dashboard</span>
                  <Icon icon="lucide:arrow-right" className="size-4" />
                </Button>
              </Link>

              <Link href="/tools">
                <Button size="lg" variant="outline" className="gap-2 px-6 text-base">
                  <Icon icon="lucide:sparkles" className="size-5 text-indigo-500" />
                  <span>Explore 50+ Tools</span>
                </Button>
              </Link>
            </div>

            {/* Hint */}
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Icon icon="lucide:command" className="size-3.5" />
              <span>Press</span>
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                Ctrl + K
              </kbd>
              <span>or</span>
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                ⌘K
              </kbd>
              <span>anywhere to navigate instantly</span>
            </div>
          </div>

          {/* Interactive Hero Playground */}
          <div id="playground" className="mt-14 scroll-mt-24">
            <InteractiveHeroPlayground />
          </div>
        </div>
      </section>

      {/* ---------------- Key Metrics Banner ---------------- */}
      <section className="border-y border-border/60 bg-muted/30 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
            <MetricItem value="50+" label="Developer Utilities" detail="From JSON to WASM analysis" />
            <MetricItem value="0 Bytes" label="Data Uploaded" detail="Strictly local-first execution" />
            <MetricItem value="0 ms" label="Network Latency" detail="Instant client-side execution" />
            <MetricItem value="100%" label="Free & Offline" detail="Full PWA desktop installable" />
          </div>
        </div>
      </section>

      {/* ---------------- Value Pillars / Features ---------------- */}
      <section id="features" className="py-20 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-3">
              Built for Modern Developers
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Engineered for Speed, Privacy & Precision
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Everything you need in your daily workflow without the friction of ads, paywalls, or third-party servers storing your inputs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="lucide:shield-check"
              accent="#10b981"
              title="100% Client-Side Privacy"
              description="Your proprietary code, production JWT tokens, passwords, and JSON payloads never leave your browser. Zero backend storage or logs."
            />
            <FeatureCard
              icon="lucide:zap"
              accent="#f59e0b"
              title="Instant Zero-Latency Execution"
              description="No server roundtrips, cold starts, or rate limits. Formats, decodes, hashes, and parses instantly using client V8 and WebAssembly."
            />
            <FeatureCard
              icon="lucide:command"
              accent="#6366f1"
              title="Keyboard-First Command Palette"
              description="Navigate, search, and jump into any utility in milliseconds using the built-in Ctrl+K / ⌘K command bar and registered hotkeys."
            />
            <FeatureCard
              icon="lucide:wifi-off"
              accent="#ec4899"
              title="Offline & PWA Ready"
              description="Working on a flight or with spotty Wi-Fi? DevKit installs as a standalone Progressive Web App that works seamlessly fully offline."
            />
            <FeatureCard
              icon="lucide:database"
              accent="#8b5cf6"
              title="Local-First History & Favorites"
              description="Pin your go-to tools to your sidebar. Revisit past transformations safely stored only in your machine's browser localStorage."
            />
            <FeatureCard
              icon="lucide:code-2"
              accent="#06b6d4"
              title="Deep AST & Code Analysis"
              description="Go beyond basic string tools. Inspect Babel AST trees, explore WebAssembly binary structures, format SQL, and diff code changes."
            />
          </div>
        </div>
      </section>

      {/* ---------------- Tool Category Showcase ---------------- */}
      <section id="tools" className="py-20 bg-muted/20 border-t border-border/60 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <div>
              <Badge variant="secondary" className="mb-3">
                Complete Toolset
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Explore All 50+ Specialized Utilities
              </h2>
              <p className="mt-2 text-muted-foreground max-w-xl">
                Grouped neatly into logical categories so you can quickly reach the right tool.
              </p>
            </div>
            <Link href="/tools">
              <Button variant="outline" className="gap-2">
                <span>View Full Catalog</span>
                <Icon icon="lucide:arrow-right" className="size-4" />
              </Button>
            </Link>
          </div>

          <ToolCategoryExplorer />
        </div>
      </section>

      {/* ---------------- Deep Capabilities Spotlight ---------------- */}
      <section className="py-20 border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-3">
              Advanced Power Tools
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              More than Just String Formatters
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              DevKit bundles sophisticated developer utilities usually requiring dedicated desktop applications or CLI binaries.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <SpotlightCard
              title="AST & WebAssembly Explorer"
              badge="Code Analysis"
              icon="lucide:binary"
              accent="#8b5cf6"
              description="Parse JavaScript and TypeScript into interactive Babel AST node hierarchies. Disassemble and inspect WebAssembly binary opcodes with instant visual syntax highlighting."
              tools={["ast-explorer", "wasm-explorer", "json-typescript"]}
            />
            <SpotlightCard
              title="API, WebSocket & Load Tester"
              badge="Network Suite"
              icon="lucide:network"
              accent="#06b6d4"
              description="Execute HTTP requests with Postman collection and cURL import/export. Connect and stream bidirectional live WebSocket messages, and benchmark endpoints client-side."
              tools={["api-tester", "websocket-tester", "load-tester"]}
            />
            <SpotlightCard
              title="In-Browser AI & Media Lab"
              badge="Visual & Media"
              icon="lucide:sparkles"
              accent="#ec4899"
              description="Remove image backgrounds using in-browser neural networks with zero cloud uploads. Compress PNG/JPEG files, test device frame mockups, and convert image formats."
              tools={["bg-remover", "image-compressor", "device-simulator"]}
            />
          </div>
        </div>
      </section>

      {/* ---------------- Privacy Architecture Section ---------------- */}
      <section id="privacy" className="py-20 bg-muted/20 border-t border-border/60 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="secondary" className="mb-3">
                Zero Cloud Transmission
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Why Client-Side Privacy Matters
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                When you paste a production JSON with customer details or an authentication token into an unknown website, your data is often transmitted to a remote server, logged in access logs, and potentially exposed to breaches.
              </p>

              <div className="mt-6 space-y-4">
                <PrivacyItem
                  icon="lucide:lock"
                  title="Local Execution Only"
                  desc="Calculations, formatting, encryption, and conversions occur entirely inside your browser tab's JavaScript runtime."
                />
                <PrivacyItem
                  icon="lucide:database-zap"
                  title="Zero Remote Database"
                  desc="We have no user database, no sign-in requirement, and no cloud-side persistence. Nothing to leak."
                />
                <PrivacyItem
                  icon="lucide:eye-off"
                  title="No Tracking or Ad Scripts"
                  desc="No third-party trackers, affiliate cookies, or fingerprinting scripts. A pure, clean developer environment."
                />
              </div>
            </div>

            <div className="relative">
              <GlassCard className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-red-500/80" />
                    <span className="size-3 rounded-full bg-amber-500/80" />
                    <span className="size-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-xs text-muted-foreground">data-flow.diagram</span>
                  </div>
                  <Badge variant="success">100% Isolated</Badge>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                      <span>STEP 1: SENSITIVE INPUT</span>
                      <span className="text-emerald-500 font-bold">CLIENT</span>
                    </div>
                    <p className="text-foreground">Your Private JWT / JSON / Certificates</p>
                  </div>

                  <div className="flex justify-center text-muted-foreground">
                    <Icon icon="lucide:arrow-down" className="size-4 animate-bounce" />
                  </div>

                  <div className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 p-4">
                    <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 mb-1">
                      <span>STEP 2: SANDBOX EXECUTION</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">BROWSER RUNTIME</span>
                    </div>
                    <p className="text-foreground">Processed in memory via WebAssembly & V8</p>
                  </div>

                  <div className="flex justify-center text-muted-foreground">
                    <Icon icon="lucide:arrow-down" className="size-4 animate-bounce" />
                  </div>

                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                      <span>STEP 3: INSTANT RESULT</span>
                      <span className="text-emerald-500 font-bold">READY</span>
                    </div>
                    <p className="text-foreground">Formatted output displayed with zero network calls</p>
                  </div>

                  <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-red-600 dark:text-red-400 flex items-center gap-2">
                    <Icon icon="lucide:ban" className="size-4 shrink-0" />
                    <span>External Cloud Servers: <strong>BLOCKED & UNUSED</strong></span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Comparison Table ---------------- */}
      <section id="comparison" className="py-20 border-t border-border/60 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-3">
              The Difference
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              DevKit vs. Typical Online Dev Tools
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Why engineers choose DevKit over scattered, ad-infested single-purpose websites.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="p-4 font-semibold text-foreground">Capability</th>
                  <th className="p-4 font-semibold text-indigo-600 dark:text-indigo-400">
                    <div className="flex items-center gap-1.5">
                      <Icon icon="lucide:zap" className="size-4" />
                      <span>DevKit</span>
                    </div>
                  </th>
                  <th className="p-4 font-semibold text-muted-foreground">Random Online Tools</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <ComparisonRow
                  feature="Data Privacy & Security"
                  devkit="100% Local (Never leaves device)"
                  others="Sent to 3rd-party servers & logs"
                  positive
                />
                <ComparisonRow
                  feature="Ads & Distractions"
                  devkit="Zero Ads, Clean Interface"
                  others="Heavy banner ads, popups & clickbait"
                  positive
                />
                <ComparisonRow
                  feature="Execution Latency"
                  devkit="0 ms (Instant client-side)"
                  others="Hundreds of ms server roundtrip"
                  positive
                />
                <ComparisonRow
                  feature="Offline Availability"
                  devkit="Full PWA Offline Support"
                  others="Completely broken without internet"
                  positive
                />
                <ComparisonRow
                  feature="Keyboard Shortcuts"
                  devkit="Global Ctrl+K Command Palette"
                  others="None (manual clicking only)"
                  positive
                />
                <ComparisonRow
                  feature="Tool Breadth"
                  devkit="50+ Unified Utilities in 1 App"
                  others="Scattered across 20+ separate websites"
                  positive
                />
                <ComparisonRow
                  feature="History & Favorites"
                  devkit="Stored in local browser storage"
                  others="Requires paid account or not supported"
                  positive
                />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ Accordion ---------------- */}
      <section id="faq" className="py-20 bg-muted/20 border-t border-border/60 scroll-mt-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-3">
              Got Questions?
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-muted-foreground">
              Everything you need to know about DevKit and how it operates.
            </p>
          </div>

          <FaqAccordion />
        </div>
      </section>

      {/* ---------------- Bottom Call to Action ---------------- */}
      <section className="py-20 border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <GlassCard className="relative overflow-hidden p-8 sm:p-14 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 -z-10" />
            <div className="max-w-2xl mx-auto space-y-6">
              <Badge variant="secondary" className="w-fit mx-auto">
                Free • Open • Local
              </Badge>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                Supercharge Your Daily Engineering Flow
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg">
                No sign-up required. Pin your favorite tools, use the command palette, and keep all your developer utilities in one fast, private place.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/25">
                    <span>Open Dashboard</span>
                    <Icon icon="lucide:arrow-right" className="size-4" />
                  </Button>
                </Link>
                <Link href="/tools">
                  <Button size="lg" variant="outline" className="gap-2 px-7">
                    <span>Browse All Tools</span>
                  </Button>
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-border/60 bg-muted/40 py-12 text-sm text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            <div className="space-y-3 sm:col-span-2">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                  <Icon icon="lucide:zap" className="size-4" />
                </span>
                <span className="text-base font-bold tracking-tight text-foreground">DevKit</span>
              </div>
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                All-in-one developer productivity toolkit. 50+ utilities for formatting, crypto, AST analysis, and network debugging running 100% in your browser.
              </p>
              <div className="flex items-center gap-3 pt-2 text-xs">
                <Badge variant="outline" className="text-[10px]">PWA Ready</Badge>
                <Badge variant="outline" className="text-[10px]">Zero Tracking</Badge>
                <Badge variant="outline" className="text-[10px]">Open Source</Badge>
              </div>
            </div>

            <div>
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">Popular Tools</p>
              <ul className="space-y-2 text-xs">
                <li><Link href="/tools/json-formatter" className="hover:text-foreground transition">JSON Formatter</Link></li>
                <li><Link href="/tools/jwt-decoder" className="hover:text-foreground transition">JWT Decoder</Link></li>
                <li><Link href="/tools/uuid-generator" className="hover:text-foreground transition">UUID Generator</Link></li>
                <li><Link href="/tools/base64" className="hover:text-foreground transition">Base64 Encoder</Link></li>
                <li><Link href="/tools/hash-generator" className="hover:text-foreground transition">Hash Generator</Link></li>
                <li><Link href="/tools/regex-playground" className="hover:text-foreground transition">Regex Playground</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">Advanced Utilities</p>
              <ul className="space-y-2 text-xs">
                <li><Link href="/tools/ast-explorer" className="hover:text-foreground transition">AST Explorer</Link></li>
                <li><Link href="/tools/wasm-explorer" className="hover:text-foreground transition">WASM Explorer</Link></li>
                <li><Link href="/tools/api-tester" className="hover:text-foreground transition">API Tester</Link></li>
                <li><Link href="/tools/websocket-tester" className="hover:text-foreground transition">WebSocket Tester</Link></li>
                <li><Link href="/tools/bg-remover" className="hover:text-foreground transition">AI BG Remover</Link></li>
                <li><Link href="/tools/diff-checker" className="hover:text-foreground transition">Diff Checker</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">Navigation</p>
              <ul className="space-y-2 text-xs">
                <li><Link href="/dashboard" className="hover:text-foreground transition">Dashboard</Link></li>
                <li><Link href="/tools" className="hover:text-foreground transition">All 50+ Tools</Link></li>
                <li><Link href="/history" className="hover:text-foreground transition">History & Favorites</Link></li>
                <li><a href="#faq" className="hover:text-foreground transition">FAQ</a></li>
                <li><a href="#privacy" className="hover:text-foreground transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs sm:flex-row">
            <p>© {new Date().getFullYear()} DevKit. Built for privacy, speed, and developer joy.</p>
            <div className="flex items-center gap-4">
              <span>Press <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">Ctrl+K</kbd> anytime</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Interactive Hero Playground Component ---------------- */

function InteractiveHeroPlayground() {
  const [activeTab, setActiveTab] = useState<"json" | "base64" | "uuid" | "hash" | "jwt">("json");

  // JSON state
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(
      {
        project: "DevKit",
        privacy: { localOnly: true, serverLogs: false },
        utilities: 50,
        tags: ["fast", "offline", "zero-latency"]
      },
      null,
      2
    )
  );
  const [jsonError, setJsonError] = useState("");

  const handleJsonFormat = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setJsonError("");
    } catch (e) {
      setJsonError((e as Error).message);
    }
  };

  const handleJsonMinify = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed));
      setJsonError("");
    } catch (e) {
      setJsonError((e as Error).message);
    }
  };

  // Base64 state
  const [b64Input, setB64Input] = useState("Hello from DevKit! 100% client-side privacy.");
  const b64Output = (() => {
    try {
      return btoa(unescape(encodeURIComponent(b64Input)));
    } catch {
      return "";
    }
  })();

  // UUID state
  const [uuid, setUuid] = useState("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d");
  const generateUuid = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      setUuid(crypto.randomUUID());
    } else {
      setUuid("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      }));
    }
  };

  // Hash state
  const [hashInput, setHashInput] = useState("DevKit rocks");
  const [sha256Hash, setSha256Hash] = useState("a1523ddaa7a59a7ee1d8d34bcf1b5930c1be7fa831969a5a3a5f98cf4a17ceae");

  const updateHash = async (val: string) => {
    setHashInput(val);
    if (!val) {
      setSha256Hash("");
      return;
    }
    if (typeof crypto !== "undefined" && crypto.subtle) {
      try {
        const enc = new TextEncoder().encode(val);
        const buf = await crypto.subtle.digest("SHA-256", enc);
        const hex = Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        setSha256Hash(hex);
      } catch {
        // ignore
      }
    }
  };

  // JWT sample
  const sampleJwtHeader = JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2);
  const sampleJwtPayload = JSON.stringify(
    { sub: "usr_9981", name: "Ada Lovelace", role: "lead_architect", exp: 1893456000 },
    null,
    2
  );

  return (
    <GlassCard className="mx-auto max-w-4xl overflow-hidden border-border/80 shadow-2xl p-0">
      {/* Playground Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/40 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-red-500/80" />
          <span className="size-3 rounded-full bg-amber-500/80" />
          <span className="size-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 font-mono text-xs font-semibold text-muted-foreground">
            Live Browser Playground
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-background p-1 border border-border">
          <PlaygroundTabBtn active={activeTab === "json"} onClick={() => setActiveTab("json")} label="JSON" icon="lucide:braces" />
          <PlaygroundTabBtn active={activeTab === "base64"} onClick={() => setActiveTab("base64")} label="Base64" icon="lucide:binary" />
          <PlaygroundTabBtn active={activeTab === "uuid"} onClick={() => setActiveTab("uuid")} label="UUID" icon="lucide:hash" />
          <PlaygroundTabBtn active={activeTab === "hash"} onClick={() => setActiveTab("hash")} label="Hash" icon="lucide:shield" />
          <PlaygroundTabBtn active={activeTab === "jwt"} onClick={() => setActiveTab("jwt")} label="JWT" icon="lucide:key" />
        </div>
      </div>

      {/* Playground Content Area */}
      <div className="p-4 sm:p-6 bg-card/60">
        {activeTab === "json" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">Edit JSON in real-time:</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={handleJsonFormat} className="h-7 text-xs">
                  Prettify
                </Button>
                <Button size="sm" variant="secondary" onClick={handleJsonMinify} className="h-7 text-xs">
                  Minify
                </Button>
                <CopyButton text={jsonInput} />
                <Link href="/tools/json-formatter">
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-primary gap-1">
                    <span>Full Tool</span>
                    <Icon icon="lucide:external-link" className="size-3" />
                  </Button>
                </Link>
              </div>
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setJsonError("");
              }}
              rows={8}
              className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 resize-y"
              spellCheck={false}
            />
            {jsonError ? (
              <p className="text-xs text-red-500 font-mono">Syntax Error: {jsonError}</p>
            ) : (
              <p className="text-xs text-emerald-500 font-mono flex items-center gap-1.5">
                <Icon icon="lucide:check-circle" className="size-3.5" />
                <span>Valid JSON structure parsed client-side</span>
              </p>
            )}
          </div>
        )}

        {activeTab === "base64" && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                  <span>Plain Text:</span>
                </div>
                <textarea
                  value={b64Input}
                  onChange={(e) => setB64Input(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs text-foreground outline-none focus:border-ring"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                  <span>Base64 Encoded:</span>
                  <CopyButton text={b64Output} />
                </div>
                <textarea
                  readOnly
                  value={b64Output}
                  rows={6}
                  className="w-full rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-foreground outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Link href="/tools/base64">
                <Button size="sm" variant="ghost" className="text-xs text-primary gap-1">
                  <span>Open Base64 Converter Tool</span>
                  <Icon icon="lucide:external-link" className="size-3" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "uuid" && (
          <div className="space-y-6 text-center py-4">
            <div className="max-w-md mx-auto space-y-2">
              <span className="text-xs text-muted-foreground font-medium">Generated UUID v4 (RFC 4122):</span>
              <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm font-semibold tracking-wide">
                <span>{uuid}</span>
                <CopyButton text={uuid} />
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button size="sm" onClick={generateUuid} className="gap-2">
                <Icon icon="lucide:refresh-cw" className="size-3.5" />
                <span>Generate Another</span>
              </Button>
              <Link href="/tools/uuid-generator">
                <Button size="sm" variant="outline">
                  Bulk Generator →
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "hash" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Input Text:</span>
              <input
                type="text"
                value={hashInput}
                onChange={(e) => updateHash(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-ring"
                placeholder="Type anything to compute hash in real time..."
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">SHA-256 Digest (Client WebCrypto):</span>
                <CopyButton text={sha256Hash} />
              </div>
              <div className="break-all rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-primary">
                {sha256Hash || "—"}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link href="/tools/hash-generator">
                <Button size="sm" variant="ghost" className="text-xs text-primary gap-1">
                  <span>Open Full Hash Suite (MD5, SHA-512, HMAC)</span>
                  <Icon icon="lucide:external-link" className="size-3" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "jwt" && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="text-xs font-medium text-violet-600 dark:text-violet-400">Header:</span>
                <pre className="rounded-lg border border-border bg-background p-3 font-mono text-xs text-foreground overflow-x-auto">
                  {sampleJwtHeader}
                </pre>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">Payload:</span>
                  <Badge variant="success" className="text-[10px]">Valid Signature</Badge>
                </div>
                <pre className="rounded-lg border border-border bg-background p-3 font-mono text-xs text-foreground overflow-x-auto">
                  {sampleJwtPayload}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">No token details sent to any server</span>
              <Link href="/tools/jwt-decoder">
                <Button size="sm" variant="ghost" className="text-xs text-primary gap-1">
                  <span>Full JWT Decoder & Signer</span>
                  <Icon icon="lucide:external-link" className="size-3" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

function PlaygroundTabBtn({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition cursor-pointer select-none",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon icon={icon} className="size-3.5" />
      <span>{label}</span>
    </button>
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
    <div className="text-center space-y-1">
      <div className="text-2xl font-black tracking-tight sm:text-4xl bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-sm font-semibold text-foreground">{label}</div>
      <div className="text-xs text-muted-foreground">{detail}</div>
    </div>
  );
}

/* ---------------- Feature Card ---------------- */

function FeatureCard({
  icon,
  accent,
  title,
  description,
}: {
  icon: string;
  accent: string;
  title: string;
  description: string;
}) {
  return (
    <GlassCard className="p-6 space-y-4 hover:border-border/90 transition duration-200">
      <div
        className="flex size-11 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `color-mix(in srgb, ${accent} 15%, transparent)`,
          color: accent,
        }}
      >
        <Icon icon={icon} className="size-5" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </GlassCard>
  );
}

/* ---------------- Tool Category Explorer ---------------- */

function ToolCategoryExplorer() {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");

  const displayedTools = selectedCategory === "all"
    ? TOOLS.filter((t) => t.popular || t.featured).slice(0, 12)
    : TOOLS.filter((t) => t.category === selectedCategory).slice(0, 12);

  return (
    <div className="space-y-8">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer select-none",
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          All Highlights ({TOOLS.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = TOOLS.filter((t) => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer select-none",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Tools Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedTools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group block transition"
          >
            <GlassCard className="h-full p-4 hover:border-primary/50 transition-all duration-200 group-hover:-translate-y-1">
              <div className="flex items-start justify-between gap-3">
                <ToolIcon icon={tool.icon} accent={tool.accent} className="size-9" />
                <Badge variant="secondary" className="text-[10px] capitalize">
                  {tool.category}
                </Badge>
              </div>
              <div className="mt-3 space-y-1">
                <h4 className="text-sm font-semibold group-hover:text-primary transition-colors flex items-center gap-1">
                  <span>{tool.name}</span>
                  <Icon icon="lucide:arrow-up-right" className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Spotlight Card ---------------- */

function SpotlightCard({
  title,
  badge,
  icon,
  accent,
  description,
  tools,
}: {
  title: string;
  badge: string;
  icon: string;
  accent: string;
  description: string;
  tools: string[];
}) {
  return (
    <GlassCard className="p-6 flex flex-col justify-between space-y-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `color-mix(in srgb, ${accent} 15%, transparent)`,
              color: accent,
            }}
          >
            <Icon icon={icon} className="size-5" />
          </div>
          <Badge variant="outline">{badge}</Badge>
        </div>
        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>

      <div className="pt-2 border-t border-border">
        <div className="flex flex-wrap gap-2">
          {tools.map((slug) => {
            const tool = TOOLS.find((t) => t.slug === slug);
            if (!tool) return null;
            return (
              <Link key={slug} href={`/tools/${slug}`}>
                <Badge
                  variant="secondary"
                  className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer py-1"
                >
                  <Icon icon={tool.icon} className="size-3 mr-1" />
                  <span>{tool.name}</span>
                </Badge>
              </Link>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

/* ---------------- Privacy Item ---------------- */

function PrivacyItem({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mt-0.5">
        <Icon icon={icon} className="size-4" />
      </div>
      <div>
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ---------------- Comparison Row ---------------- */

function ComparisonRow({
  feature,
  devkit,
  others,
  positive,
}: {
  feature: string;
  devkit: string;
  others: string;
  positive: boolean;
}) {
  return (
    <tr className="hover:bg-muted/20 transition-colors">
      <td className="p-4 font-medium text-foreground">{feature}</td>
      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
        <Icon icon="lucide:check-circle" className="size-4 shrink-0" />
        <span>{devkit}</span>
      </td>
      <td className="p-4 text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Icon icon="lucide:x-circle" className="size-4 shrink-0 text-red-500/70" />
          <span>{others}</span>
        </div>
      </td>
    </tr>
  );
}

/* ---------------- FAQ Accordion ---------------- */

const FAQS = [
  {
    q: "Does DevKit send any of my data, tokens, or code to a remote server?",
    a: "No. DevKit is engineered as a local-first application. When you format JSON, decode JWTs, generate hashes, remove image backgrounds, or parse ASTs, all computation runs entirely within your browser's V8 engine and WebAssembly runtime. No telemetry or request bodies are transmitted to any server.",
  },
  {
    q: "Can I use DevKit completely offline?",
    a: "Yes! DevKit includes a configured Service Worker and Web App Manifest. You can install it directly to your operating system (Mac, Windows, Linux, iOS, Android) as a standalone Progressive Web App (PWA) and use every tool even while on a flight or in low-connectivity environments.",
  },
  {
    q: "How does DevKit compare to separate web tools like jsonlint or base64encode?",
    a: "Most single-purpose online utilities are riddled with intrusive advertising, tracking scripts, and slow network roundtrips. DevKit provides a cohesive, unified keyboard-friendly UI with zero ads, instantaneous response times, and an omnipresent Command Palette (Ctrl+K).",
  },
  {
    q: "Are there any usage limits, subscription tiers, or paywalls?",
    a: "None. DevKit is 100% free and open-source. There are no rate limits, no daily caps, and no premium features locked behind paywalls.",
  },
  {
    q: "Where are my favorites and history stored?",
    a: "All favorites, recent tool usage, and custom settings are stored locally on your device in your browser's localStorage. You can clear your history anytime from the History tab with a single click.",
  },
  {
    q: "How do I navigate quickly with keyboard shortcuts?",
    a: "Press Ctrl+K (or ⌘K on macOS) anywhere to open the instant Command Palette. You can type tool names, categories, or keywords to jump straight into any utility without clicking through menus.",
  },
];

function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {FAQS.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <GlassCard
            key={faq.q}
            className="overflow-hidden border-border/80 transition-colors p-0"
          >
            <button
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="flex w-full items-center justify-between p-5 text-left font-medium text-foreground hover:bg-muted/30 transition-colors"
            >
              <span className="text-sm sm:text-base font-semibold">{faq.q}</span>
              <Icon
                icon="lucide:chevron-down"
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180 text-primary"
                )}
              />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3"
                >
                  {faq.a}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        );
      })}
    </div>
  );
}
