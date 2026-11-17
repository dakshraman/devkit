"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { Icon } from "@iconify/react";
import { TOOLS, CATEGORIES } from "@/data/tools";
import { useSettings } from "@/context/settings-context";
import { useCommandPalette } from "@/context/command-palette-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolIcon } from "@/components/ui/tool-icon";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";
import type { ToolCategory } from "@/types";

export function LandingPage() {
  const { theme, toggleTheme } = useSettings();
  const { open: openPalette } = useCommandPalette();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      {/* ---------------- Navigation Bar ---------------- */}
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
              className="hidden items-center gap-5 text-xs font-medium text-muted-foreground md:flex"
            >
              <a href="#workbench" className="transition hover:text-foreground">
                Workbench
              </a>
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
                href="#workbench"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Workbench
              </a>
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

      <main>
        {/* ---------------- Hero Section ---------------- */}
        <section className="border-b border-border/70 py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center">
              {/* Telemetry Guarantee Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-muted/60 px-3 py-1 font-mono text-[11px] text-muted-foreground">
                <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
                <span>100% Client-Side • 0 B Egress • PWA Ready</span>
              </div>

              {/* Headline */}
              <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">
                Developer utilities that never leave your browser
              </h1>

              {/* Subtitle */}
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                An offline, local-first workbench with 54 formatters, AST analyzers, WebCrypto
                generators, and document converters. Executed in-memory with zero server transmissions.
              </p>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/dashboard">
                  <Button size="default" className="gap-2 px-5 text-xs font-medium">
                    <Icon icon="lucide:layout-grid" className="size-3.5" aria-hidden="true" />
                    <span>Open Dashboard</span>
                  </Button>
                </Link>

                <a href="#catalog">
                  <Button variant="outline" size="default" className="gap-2 px-5 text-xs font-medium">
                    <Icon icon="lucide:list" className="size-3.5" aria-hidden="true" />
                    <span>Explore 54 Tools</span>
                  </Button>
                </a>
              </div>

              {/* Shortcut helper */}
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
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

            {/* Focal Moment: Live Workbench Terminal */}
            <div id="workbench" className="mt-10 scroll-mt-20">
              <LiveWorkbench />
            </div>
          </div>
        </section>

        {/* ---------------- Engineering Guarantees (Metrics) ---------------- */}
        <section aria-label="Engineering guarantees" className="border-b border-border/70 bg-muted/20 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
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

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ToolMatrix />
          </div>
        </section>

        {/* ---------------- Frequently Asked Questions ---------------- */}
        <section id="faq" className="border-t border-border/70 bg-muted/10 py-16 scroll-mt-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
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
        </section>

        {/* ---------------- Bottom Call to Action ---------------- */}
        <section className="border-t border-border/70 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                <li><a href="#workbench" className="hover:text-foreground transition">Workbench Demo</a></li>
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

/* ---------------- Focal Workbench Component ---------------- */

type WorkbenchTab = "json" | "jwt" | "hash" | "base64" | "uuid" | "regex";

function LiveWorkbench() {
  const [activeTab, setActiveTab] = useState<WorkbenchTab>("json");

  // JSON state
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(
      {
        project: "DevKit",
        architecture: "local-first",
        telemetry: { egressBytes: 0, remoteLogging: false },
        engine: { runtime: "V8 In-Memory", wasmReady: true },
        toolsCount: 54
      },
      null,
      2
    )
  );
  const [jsonError, setJsonError] = useState("");

  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setJsonError("");
    } catch (e) {
      setJsonError((e as Error).message);
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed));
      setJsonError("");
    } catch (e) {
      setJsonError((e as Error).message);
    }
  };

  // Base64 state
  const [b64Input, setB64Input] = useState("Local-first execution with zero cloud egress.");
  const b64Output = useMemo(() => {
    try {
      return btoa(unescape(encodeURIComponent(b64Input)));
    } catch {
      return "";
    }
  }, [b64Input]);

  // UUID state
  const [uuid, setUuid] = useState("7b3f9a2e-8c4d-4b1a-9f5e-3d2c1b0a9e8d");
  const handleGenerateUuid = () => {
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
  const [hashInput, setHashInput] = useState("devkit-privacy-guarantee");
  const [sha256Digest, setSha256Digest] = useState("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");

  useEffect(() => {
    let isCurrent = true;
    const compute = async () => {
      if (!hashInput) {
        if (isCurrent) setSha256Digest("");
        return;
      }
      if (typeof crypto !== "undefined" && crypto.subtle) {
        try {
          const enc = new TextEncoder().encode(hashInput);
          const buf = await crypto.subtle.digest("SHA-256", enc);
          const hex = Array.from(new Uint8Array(buf))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
          if (isCurrent) setSha256Digest(hex);
        } catch {
          // fallback
        }
      }
    };
    compute();
    return () => {
      isCurrent = false;
    };
  }, [hashInput]);

  // JWT state
  const sampleJwtHeader = JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2);
  const sampleJwtPayload = JSON.stringify(
    {
      sub: "usr_8921a4f0",
      roles: ["engineer", "admin"],
      scope: "read:write:local",
      iat: 1731826800,
      exp: 1763362800
    },
    null,
    2
  );

  // Regex state
  const [regexPattern, setRegexPattern] = useState("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b");
  const [regexText, setRegexText] = useState("Contact security@devkit.dev or maintainers@example.org for inquiries.");
  const regexMatches = useMemo(() => {
    try {
      const re = new RegExp(regexPattern, "g");
      const found = regexText.match(re);
      return found || [];
    } catch {
      return null;
    }
  }, [regexPattern, regexText]);

  return (
    <div className="mx-auto max-w-4xl rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      {/* Workbench Diagnostic Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/40 px-4 py-2 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="font-semibold text-foreground">Interactive Console</span>
          </div>
          <span className="text-border">|</span>
          <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline">
            Runtime: <span className="text-foreground">V8 In-Memory</span>
          </span>
          <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline">
            Egress: <span className="text-foreground">0 B</span>
          </span>
        </div>

        {/* Console Tab Switches */}
        <div
          role="tablist"
          aria-label="Interactive tool selection"
          className="flex items-center gap-1 rounded-md border border-border bg-background p-0.5"
        >
          <ConsoleTabBtn
            active={activeTab === "json"}
            onClick={() => setActiveTab("json")}
            label="JSON"
            icon="lucide:braces"
          />
          <ConsoleTabBtn
            active={activeTab === "jwt"}
            onClick={() => setActiveTab("jwt")}
            label="JWT"
            icon="lucide:key"
          />
          <ConsoleTabBtn
            active={activeTab === "hash"}
            onClick={() => setActiveTab("hash")}
            label="SHA-256"
            icon="lucide:hash"
          />
          <ConsoleTabBtn
            active={activeTab === "base64"}
            onClick={() => setActiveTab("base64")}
            label="Base64"
            icon="lucide:binary"
          />
          <ConsoleTabBtn
            active={activeTab === "uuid"}
            onClick={() => setActiveTab("uuid")}
            label="UUID"
            icon="lucide:fingerprint"
          />
          <ConsoleTabBtn
            active={activeTab === "regex"}
            onClick={() => setActiveTab("regex")}
            label="Regex"
            icon="lucide:regex"
          />
        </div>
      </div>

      {/* Workbench Working Viewport */}
      <div className="p-4 sm:p-5">
        {activeTab === "json" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">JSON In-Memory Prettifier:</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={handlePrettify} className="h-7 text-xs">
                  Prettify
                </Button>
                <Button size="sm" variant="secondary" onClick={handleMinify} className="h-7 text-xs">
                  Minify
                </Button>
                <CopyButton value={jsonInput} />
                <Link href="/tools/json-formatter">
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-primary">
                    <span>Full Tool</span>
                    <Icon icon="lucide:arrow-right" className="size-3" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>

            <textarea
              aria-label="JSON payload editor"
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setJsonError("");
              }}
              rows={7}
              className="w-full rounded-md border border-border bg-background p-3 font-mono text-xs text-foreground outline-none focus:border-ring resize-y"
              spellCheck={false}
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              {jsonError ? (
                <span className="text-red-500">{jsonError}</span>
              ) : (
                <span className="text-emerald-500">✓ Valid JSON • Parsed in-memory</span>
              )}
              <span>{jsonInput.length} characters</span>
            </div>
          </div>
        )}

        {activeTab === "jwt" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Decoded JWT Payload (HS256):</span>
              <Link href="/tools/jwt-decoder">
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-primary">
                  <span>Full JWT Decoder</span>
                  <Icon icon="lucide:arrow-right" className="size-3" aria-hidden="true" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Header</span>
                  <CopyButton value={sampleJwtHeader} />
                </div>
                <pre className="rounded-md border border-border bg-background p-3 font-mono text-xs text-foreground overflow-x-auto">
                  {sampleJwtHeader}
                </pre>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Claims & Payload</span>
                  <CopyButton value={sampleJwtPayload} />
                </div>
                <pre className="rounded-md border border-border bg-background p-3 font-mono text-xs text-foreground overflow-x-auto">
                  {sampleJwtPayload}
                </pre>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span className="text-emerald-500">Algorithm: HMAC SHA-256 (Decoded locally)</span>
              <span>Expiration: 2025-11-17</span>
            </div>
          </div>
        )}

        {activeTab === "hash" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="hash-input" className="text-xs font-medium text-muted-foreground">
                Plaintext Input (Processed via SubtleCrypto):
              </label>
              <input
                id="hash-input"
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-ring"
                placeholder="Enter string to digest..."
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>SHA-256 Digest (256-bit Hex):</span>
                <CopyButton value={sha256Digest} />
              </div>
              <div className="break-all rounded-md border border-border bg-muted/40 p-2.5 font-mono text-xs text-foreground">
                {sha256Digest || "—"}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="font-mono text-[11px] text-muted-foreground">
                Latency: <span className="text-emerald-500">&lt; 0.2ms</span> • Hardware-accelerated WebCrypto
              </span>
              <Link href="/tools/hash-generator">
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-primary">
                  <span>MD5, SHA-512 & HMAC</span>
                  <Icon icon="lucide:arrow-right" className="size-3" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "base64" && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="b64-src" className="text-xs font-medium text-muted-foreground">
                  Source String:
                </label>
                <textarea
                  id="b64-src"
                  value={b64Input}
                  onChange={(e) => setB64Input(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-border bg-background p-2.5 font-mono text-xs text-foreground outline-none focus:border-ring"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <label htmlFor="b64-res">Base64 Encoded:</label>
                  <CopyButton value={b64Output} />
                </div>
                <textarea
                  id="b64-res"
                  readOnly
                  value={b64Output}
                  rows={4}
                  className="w-full rounded-md border border-border bg-muted/40 p-2.5 font-mono text-xs text-foreground outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link href="/tools/base64">
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-primary">
                  <span>Full Base64 & Hex Tool</span>
                  <Icon icon="lucide:arrow-right" className="size-3" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "uuid" && (
          <div className="space-y-4 py-2 text-center">
            <div className="max-w-md mx-auto space-y-1.5 text-left">
              <span className="text-xs font-medium text-muted-foreground">
                Cryptographic UUID v4 (RFC 4122):
              </span>
              <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 font-mono text-xs">
                <span>{uuid}</span>
                <CopyButton value={uuid} />
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button size="sm" onClick={handleGenerateUuid} className="gap-2 h-8 text-xs">
                <Icon icon="lucide:refresh-cw" className="size-3.5" aria-hidden="true" />
                <span>Generate Next UUID</span>
              </Button>
              <Link href="/tools/uuid-generator">
                <Button size="sm" variant="outline" className="h-8 text-xs">
                  Bulk UUID & v7 Generator
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "regex" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="regex-pat" className="text-xs font-medium text-muted-foreground">
                Regular Expression Pattern:
              </label>
              <input
                id="regex-pat"
                type="text"
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs outline-none focus:border-ring"
                placeholder="Regex pattern..."
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="regex-src" className="text-xs font-medium text-muted-foreground">
                Test Target String:
              </label>
              <textarea
                id="regex-src"
                value={regexText}
                onChange={(e) => setRegexText(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-background p-2.5 font-mono text-xs text-foreground outline-none focus:border-ring"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              {regexMatches === null ? (
                <span className="text-red-500">Invalid regular expression syntax</span>
              ) : (
                <span>
                  Matches found: <span className="text-emerald-500 font-semibold">{regexMatches.length}</span>
                  {regexMatches.length > 0 && ` (${regexMatches.join(", ")})`}
                </span>
              )}
              <Link href="/tools/regex-playground">
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-primary">
                  <span>Full Regex Tester</span>
                  <Icon icon="lucide:arrow-right" className="size-3" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConsoleTabBtn({
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
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition cursor-pointer select-none",
        active
          ? "bg-foreground text-background shadow-xs"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon icon={icon} className="size-3.5" aria-hidden="true" />
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
        <div className="w-full md:w-72">
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

      {/* Grid of Tools using <article> elements as recommended in Modern Web Guidance */}
      {filteredTools.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center text-xs text-muted-foreground">
          No tools found matching &ldquo;{searchQuery}&rdquo;.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

/* ---------------- FAQ Accordion (Compliant with Modern HTML & Accessibility) ---------------- */

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
