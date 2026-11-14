"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
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
                <span className="block text-[11px] text-muted-foreground font-mono">client-side toolkit</span>
              </div>
            </Link>

            <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground md:flex">
              <a href="#features" className="transition hover:text-foreground">Features</a>
              <a href="#playground" className="transition hover:text-foreground">Demo</a>
              <a href="#tools" className="transition hover:text-foreground">Tools</a>
              <a href="#privacy" className="transition hover:text-foreground">Architecture</a>
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
                All Tools
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
                  Demo
                </a>
                <a
                  href="#tools"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Tools
                </a>
                <a
                  href="#privacy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Architecture
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
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1 text-xs text-muted-foreground mb-6">
              <span>Open Source • 50+ Local Developer Tools</span>
            </div>

            {/* Main Title */}
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Client-Side Developer Utilities
            </h1>

            {/* Subtitle */}
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Format JSON, decode JWTs, generate hashes, inspect ASTs, and test APIs directly in your browser. All processing runs locally with no backend data storage.
            </p>

            {/* CTA Buttons */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 px-6">
                  <Icon icon="lucide:layout-grid" className="size-4" />
                  <span>Open Dashboard</span>
                </Button>
              </Link>

              <Link href="/tools">
                <Button size="lg" variant="outline" className="gap-2 px-6">
                  <span>Browse All Tools</span>
                </Button>
              </Link>
            </div>

            {/* Shortcut hint */}
            <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Press</span>
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                Ctrl + K
              </kbd>
              <span>to search and jump to any tool</span>
            </div>
          </div>

          {/* Interactive Playground */}
          <div id="playground" className="mt-12 scroll-mt-24">
            <InteractiveHeroPlayground />
          </div>
        </div>
      </section>

      {/* ---------------- Metrics Banner ---------------- */}
      <section className="border-y border-border/60 bg-muted/20 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            <MetricItem value="50+" label="Built-in Tools" detail="Formatters, generators & testers" />
            <MetricItem value="Local" label="Execution" detail="Processed in browser memory" />
            <MetricItem value="Zero" label="Server Uploads" detail="No telemetry or payload logging" />
            <MetricItem value="PWA" label="Offline Support" detail="Installable standalone application" />
          </div>
        </div>
      </section>

      {/* ---------------- Features ---------------- */}
      <section id="features" className="py-16 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Core Architecture
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Built as a focused toolkit for daily software engineering tasks.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="lucide:shield-check"
              accent="#10b981"
              title="Client-Side Processing"
              description="Payloads, tokens, and cryptographic keys remain within your local browser session. No data is sent to external servers."
            />
            <FeatureCard
              icon="lucide:zap"
              accent="#f59e0b"
              title="No Network Latency"
              description="Operations run synchronously in-memory using WebAssembly and WebCrypto without remote API round trips."
            />
            <FeatureCard
              icon="lucide:command"
              accent="#6366f1"
              title="Command Palette"
              description="Quickly search, filter, and jump between utilities using the built-in Ctrl+K / ⌘K command bar."
            />
            <FeatureCard
              icon="lucide:wifi-off"
              accent="#ec4899"
              title="Offline Capability"
              description="Configured with a Service Worker and web manifest so you can install and use every tool without an internet connection."
            />
            <FeatureCard
              icon="lucide:database"
              accent="#8b5cf6"
              title="Local History & Bookmarks"
              description="Pin frequently used tools to your sidebar. Transformation history is stored strictly in your browser's localStorage."
            />
            <FeatureCard
              icon="lucide:code-2"
              accent="#06b6d4"
              title="Code & Binary Inspection"
              description="Inspect AST structures via Babel, explore WebAssembly modules, format SQL queries, and generate diffs."
            />
          </div>
        </div>
      </section>

      {/* ---------------- Tool Category Showcase ---------------- */}
      <section id="tools" className="py-16 bg-muted/20 border-t border-border/60 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Tool Catalog
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse available utilities by category.
              </p>
            </div>
            <Link href="/tools">
              <Button variant="outline" size="sm" className="gap-1.5">
                <span>View All 50+ Tools</span>
                <Icon icon="lucide:arrow-right" className="size-3.5" />
              </Button>
            </Link>
          </div>

          <ToolCategoryExplorer />
        </div>
      </section>

      {/* ---------------- Specialized Utilities ---------------- */}
      <section className="py-16 border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Specialized Utilities
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              In addition to standard encoders and formatters, DevKit includes tools for code analysis, network debugging, and media processing.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <SpotlightCard
              title="AST & WebAssembly Explorer"
              badge="Code Analysis"
              icon="lucide:binary"
              accent="#8b5cf6"
              description="Parse JavaScript and TypeScript into interactive Babel AST node structures, or inspect WebAssembly binary opcodes and sections."
              tools={["ast-explorer", "wasm-explorer", "json-typescript"]}
            />
            <SpotlightCard
              title="API, WebSocket & Load Tester"
              badge="Network"
              icon="lucide:network"
              accent="#06b6d4"
              description="Send HTTP requests with cURL and Postman collection support, test live WebSocket connections, and run client-side load benchmarks."
              tools={["api-tester", "websocket-tester", "load-tester"]}
            />
            <SpotlightCard
              title="In-Browser Media Tools"
              badge="Visual & Media"
              icon="lucide:image"
              accent="#ec4899"
              description="Remove image backgrounds using in-browser neural networks, compress images, and convert formats."
              tools={["bg-remover", "image-compressor", "image-converter"]}
            />
          </div>
        </div>
      </section>

      {/* ---------------- Privacy Architecture Section ---------------- */}
      <section id="privacy" className="py-16 bg-muted/20 border-t border-border/60 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Privacy & Data Architecture
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                DevKit is designed as a client-side web application. Every tool runs directly inside your browser process without sending your inputs to external servers.
              </p>

              <div className="mt-6 space-y-4">
                <PrivacyItem
                  icon="lucide:lock"
                  title="In-Memory Computation"
                  desc="Formatting, parsing, and cryptographic operations run locally in browser memory and are discarded when closed."
                />
                <PrivacyItem
                  icon="lucide:database"
                  title="Origin-Scoped Storage"
                  desc="Tool history, pinned favorites, and appearance preferences are stored solely in your local browser storage."
                />
                <PrivacyItem
                  icon="lucide:shield"
                  title="No Third-Party Analytics"
                  desc="No tracking scripts, cookies, or remote logging services are loaded."
                />
              </div>
            </div>

            <div>
              <GlassCard className="p-6 space-y-5 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="font-semibold text-muted-foreground">Execution Model</span>
                  <Badge variant="outline" className="text-[10px]">Client-Only</Badge>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-border bg-card p-3">
                    <div className="text-muted-foreground mb-1 text-[11px]">Runtime Environment</div>
                    <div className="text-foreground font-semibold">Local Browser (V8 / JavaScript / WASM)</div>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-3">
                    <div className="text-muted-foreground mb-1 text-[11px]">Network Transmissions</div>
                    <div className="text-foreground font-semibold">0 outbound requests on tool execution</div>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-3">
                    <div className="text-muted-foreground mb-1 text-[11px]">Data Persistence</div>
                    <div className="text-foreground font-semibold">Browser localStorage (on-device only)</div>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-3">
                    <div className="text-muted-foreground mb-1 text-[11px]">Authentication & Accounts</div>
                    <div className="text-foreground font-semibold">None required (no sign-up, no tokens stored remotely)</div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" className="py-16 border-t border-border/60 scroll-mt-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Common questions about DevKit and how it works.
            </p>
          </div>

          <FaqAccordion />
        </div>
      </section>

      {/* ---------------- Bottom Call to Action ---------------- */}
      <section className="py-16 border-t border-border/60 bg-muted/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <GlassCard className="p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Start Using DevKit
            </h2>
            <p className="text-muted-foreground text-sm">
              Launch the dashboard to access all tools, configure shortcuts, and pin your favorites.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 px-6">
                  <span>Open Dashboard</span>
                  <Icon icon="lucide:arrow-right" className="size-4" />
                </Button>
              </Link>
              <Link href="/tools">
                <Button size="lg" variant="outline" className="gap-2 px-6">
                  <span>Browse Catalog</span>
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-border/60 bg-muted/30 py-10 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            <div className="space-y-3 sm:col-span-2">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                  <Icon icon="lucide:zap" className="size-3.5" />
                </span>
                <span className="text-sm font-bold text-foreground">DevKit</span>
              </div>
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                Client-side developer utilities for formatting, encoding, AST analysis, and network testing.
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2.5">Common Tools</p>
              <ul className="space-y-1.5">
                <li><Link href="/tools/json-formatter" className="hover:text-foreground transition">JSON Formatter</Link></li>
                <li><Link href="/tools/jwt-decoder" className="hover:text-foreground transition">JWT Decoder</Link></li>
                <li><Link href="/tools/uuid-generator" className="hover:text-foreground transition">UUID Generator</Link></li>
                <li><Link href="/tools/base64" className="hover:text-foreground transition">Base64 Converter</Link></li>
                <li><Link href="/tools/hash-generator" className="hover:text-foreground transition">Hash Generator</Link></li>
                <li><Link href="/tools/regex-playground" className="hover:text-foreground transition">Regex Playground</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2.5">Analysis Tools</p>
              <ul className="space-y-1.5">
                <li><Link href="/tools/ast-explorer" className="hover:text-foreground transition">AST Explorer</Link></li>
                <li><Link href="/tools/wasm-explorer" className="hover:text-foreground transition">WASM Explorer</Link></li>
                <li><Link href="/tools/api-tester" className="hover:text-foreground transition">API Tester</Link></li>
                <li><Link href="/tools/websocket-tester" className="hover:text-foreground transition">WebSocket Tester</Link></li>
                <li><Link href="/tools/bg-remover" className="hover:text-foreground transition">Background Remover</Link></li>
                <li><Link href="/tools/diff-checker" className="hover:text-foreground transition">Diff Checker</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2.5">Navigation</p>
              <ul className="space-y-1.5">
                <li><Link href="/dashboard" className="hover:text-foreground transition">Dashboard</Link></li>
                <li><Link href="/tools" className="hover:text-foreground transition">All Tools</Link></li>
                <li><Link href="/history" className="hover:text-foreground transition">History</Link></li>
                <li><a href="#faq" className="hover:text-foreground transition">FAQ</a></li>
                <li><a href="#privacy" className="hover:text-foreground transition">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-5 sm:flex-row">
            <p>© {new Date().getFullYear()} DevKit. Open source developer utilities.</p>
            <div>
              <span>Shortcut: <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">Ctrl+K</kbd></span>
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
        name: "DevKit",
        version: "1.0.0",
        settings: { theme: "dark", offline: true },
        tools: ["json", "base64", "uuid", "jwt", "hash"]
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
  const [b64Input, setB64Input] = useState("The quick brown fox jumps over the lazy dog.");
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
  const [hashInput, setHashInput] = useState("Hello world");
  const [sha256Hash, setSha256Hash] = useState("64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c");

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
    { sub: "user_12345", name: "Alex", role: "developer", exp: 1893456000 },
    null,
    2
  );

  return (
    <GlassCard className="mx-auto max-w-4xl overflow-hidden border-border/80 p-0 shadow-lg">
      {/* Playground Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            Interactive Preview
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 rounded-lg bg-background p-1 border border-border">
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
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">JSON Input:</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={handleJsonFormat} className="h-7 text-xs">
                  Prettify
                </Button>
                <Button size="sm" variant="secondary" onClick={handleJsonMinify} className="h-7 text-xs">
                  Minify
                </Button>
                <CopyButton value={jsonInput} />
                <Link href="/tools/json-formatter">
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-primary gap-1">
                    <span>Open Tool</span>
                    <Icon icon="lucide:arrow-right" className="size-3" />
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
              rows={7}
              className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs text-foreground outline-none focus:border-ring resize-y"
              spellCheck={false}
            />
            {jsonError ? (
              <p className="text-xs text-red-500 font-mono">{jsonError}</p>
            ) : (
              <p className="text-xs text-muted-foreground font-mono">Valid JSON</p>
            )}
          </div>
        )}

        {activeTab === "base64" && (
          <div className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Plain Text:</span>
                <textarea
                  value={b64Input}
                  onChange={(e) => setB64Input(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs text-foreground outline-none focus:border-ring"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Base64 Encoded:</span>
                  <CopyButton value={b64Output} />
                </div>
                <textarea
                  readOnly
                  value={b64Output}
                  rows={5}
                  className="w-full rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-foreground outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Link href="/tools/base64">
                <Button size="sm" variant="ghost" className="text-xs text-primary gap-1">
                  <span>Open Base64 Tool</span>
                  <Icon icon="lucide:arrow-right" className="size-3" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "uuid" && (
          <div className="space-y-5 text-center py-3">
            <div className="max-w-md mx-auto space-y-1.5">
              <span className="text-xs text-muted-foreground">UUID v4 (RFC 4122):</span>
              <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm">
                <span>{uuid}</span>
                <CopyButton value={uuid} />
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button size="sm" onClick={generateUuid} className="gap-2">
                <Icon icon="lucide:refresh-cw" className="size-3.5" />
                <span>Generate New</span>
              </Button>
              <Link href="/tools/uuid-generator">
                <Button size="sm" variant="outline">
                  Bulk Generator
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "hash" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Input Text:</span>
              <input
                type="text"
                value={hashInput}
                onChange={(e) => updateHash(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-ring"
                placeholder="Enter string..."
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>SHA-256:</span>
                <CopyButton value={sha256Hash} />
              </div>
              <div className="break-all rounded-lg border border-border bg-muted/40 p-2.5 font-mono text-xs text-foreground">
                {sha256Hash || "—"}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link href="/tools/hash-generator">
                <Button size="sm" variant="ghost" className="text-xs text-primary gap-1">
                  <span>Open Hash Generator</span>
                  <Icon icon="lucide:arrow-right" className="size-3" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "jwt" && (
          <div className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Header:</span>
                <pre className="rounded-lg border border-border bg-background p-3 font-mono text-xs text-foreground overflow-x-auto">
                  {sampleJwtHeader}
                </pre>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Payload:</span>
                <pre className="rounded-lg border border-border bg-background p-3 font-mono text-xs text-foreground overflow-x-auto">
                  {sampleJwtPayload}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end pt-1">
              <Link href="/tools/jwt-decoder">
                <Button size="sm" variant="ghost" className="text-xs text-primary gap-1">
                  <span>Open JWT Decoder</span>
                  <Icon icon="lucide:arrow-right" className="size-3" />
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
      <div className="text-xl font-bold tracking-tight sm:text-2xl text-foreground">
        {value}
      </div>
      <div className="text-xs font-semibold text-foreground">{label}</div>
      <div className="text-[11px] text-muted-foreground">{detail}</div>
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
    <GlassCard className="p-5 space-y-3">
      <div
        className="flex size-9 items-center justify-center rounded-lg"
        style={{
          backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
          color: accent,
        }}
      >
        <Icon icon={icon} className="size-4.5" />
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
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
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "rounded-full px-3.5 py-1 text-xs font-medium transition cursor-pointer select-none",
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          All ({TOOLS.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = TOOLS.filter((t) => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "rounded-full px-3.5 py-1 text-xs font-medium transition cursor-pointer select-none",
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
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedTools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group block transition"
          >
            <GlassCard className="h-full p-4 hover:border-border/80 transition-all duration-150">
              <div className="flex items-start justify-between gap-2.5">
                <ToolIcon icon={tool.icon} accent={tool.accent} className="size-8" />
                <Badge variant="secondary" className="text-[10px] capitalize">
                  {tool.category}
                </Badge>
              </div>
              <div className="mt-2.5 space-y-1">
                <h4 className="text-xs font-semibold group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>{tool.name}</span>
                  <Icon icon="lucide:arrow-right" className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
    <GlassCard className="p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div
            className="flex size-9 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
              color: accent,
            }}
          >
            <Icon icon={icon} className="size-4.5" />
          </div>
          <Badge variant="outline" className="text-[10px]">{badge}</Badge>
        </div>
        <h3 className="text-base font-bold tracking-tight">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>

      <div className="pt-2 border-t border-border">
        <div className="flex flex-wrap gap-1.5">
          {tools.map((slug) => {
            const tool = TOOLS.find((t) => t.slug === slug);
            if (!tool) return null;
            return (
              <Link key={slug} href={`/tools/${slug}`}>
                <Badge
                  variant="secondary"
                  className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer text-[10px] py-0.5"
                >
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
    <div className="flex items-start gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground mt-0.5">
        <Icon icon={icon} className="size-3.5" />
      </div>
      <div>
        <h4 className="text-xs font-semibold">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ---------------- FAQ Accordion ---------------- */

const FAQS = [
  {
    q: "How does DevKit process my inputs?",
    a: "All tools run locally within your browser tab using JavaScript, WebAssembly, and native Web APIs (such as WebCrypto). No payload data is sent to external servers or logged in remote backends.",
  },
  {
    q: "Does DevKit work offline?",
    a: "Yes. DevKit is configured as a Progressive Web App (PWA) with a local service worker cache. Once loaded, tools remain accessible without an active internet connection.",
  },
  {
    q: "Where is my data stored?",
    a: "Your favorites, recent tool usage, and UI settings are stored in your browser's localStorage. You can clear this data at any time from the History page.",
  },
  {
    q: "Are there any usage limits or fees?",
    a: "No. DevKit is completely free and open source with no rate limits, paid plans, or sign-up requirements.",
  },
  {
    q: "How do I navigate using keyboard shortcuts?",
    a: "Press Ctrl+K (or ⌘K on macOS) from any page to open the command palette. You can search by tool name, category, or keyword.",
  },
];

function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="space-y-2.5">
      {FAQS.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <GlassCard
            key={faq.q}
            className="overflow-hidden border-border/80 transition-colors p-0"
          >
            <button
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="flex w-full items-center justify-between p-4 text-left font-medium text-foreground hover:bg-muted/30 transition-colors"
            >
              <span className="text-sm font-semibold">{faq.q}</span>
              <Icon
                icon="lucide:chevron-down"
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180 text-foreground"
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
                  className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-2.5"
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
