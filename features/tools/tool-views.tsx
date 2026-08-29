"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import axios from "axios";
import QRCode from "qrcode";
import { marked } from "marked";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCopy } from "@/hooks/useCopy";
import { CopyButton, DownloadButton } from "@/components/ui/copy-button";
import { EditorSkeleton, InfoTile, Panel, SectionLabel, Shell } from "@/features/tools/tool-layout";
import { ExtraToolView } from "@/features/tools/extra-tools";
import { useDebounce } from "@/hooks/useDebounce";
import { useSettings } from "@/context/settings-context";
import { bytesToBase64, downloadFile, formatBytes, formatDuration, formatNumber, nowMs, nowSeconds } from "@/lib/utils";
import {
  base64Decode,
  base64Encode,
  compareText,
  convertCase,
  createLorem,
  generatePasswords,
  jsonSummary,
  jwtDecode,
  jwtStatus,
  md5Digest,
  randomUuid,
  safeJsonParse,
  shaDigest,
  strengthScore,
  formatUnixTime,
} from "@/lib/tool-utils";
import { SNIPPETS } from "@/data/snippets";
import { TOOLS } from "@/data/tools";
import {
  buildPostmanCollection,
  flattenPostmanCollection,
  parsePostmanCollection,
  prepareRequest,
  METHOD_STYLES,
  type AuthState,
  type FlatRequest,
  type KeyValueRow,
  type PcCollection,
} from "@/lib/postman";
import type { Tool } from "@/types";
import type { editor } from "monaco-editor";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false, loading: () => <EditorSkeleton /> });

marked.setOptions({
  breaks: true,
  gfm: true,
});

const API_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;

/* ------------------------------------------------------------------ */
/* Postman collection types + helpers (API Tester)                    */
/* ------------------------------------------------------------------ */

const EXTRA_SLUGS = [
  "html-formatter",
  "sql-formatter",
  "cron-builder",
  "file-checksum",
  "csv-json",
  "json-to-typescript",
  "jwt-generator",
  "bcrypt-generator",
  "text-stats",
  "url-builder",
  "unicode-inspector",
  "unit-converter",
  "svg-optimizer",
  "env-parser",
  "http-status",
  "regex-cheatsheet",
  "image-converter",
  "image-compressor",
  "bg-remover",
  "temp-mail",
  "json-viewer",
  "color-contrast",
  "ip-dns",
  "ascii-art",
];

function usePrismHtml(code: string, language: string) {
  return useMemo(() => {
    const grammar = Prism.languages[language as keyof typeof Prism.languages];
    if (!grammar) return code;
    return Prism.highlight(code, grammar, language);
  }, [code, language]);
}

export function ToolView({ slug }: { slug: string }) {
  const tool = TOOLS.find((item) => item.slug === slug);
  if (!tool) {
    return (
      <Shell
        tool={{
          slug,
          name: "Tool not found",
          description: "The requested tool could not be resolved.",
          category: "developer",
          icon: "lucide:sparkles",
          keywords: [],
          accent: "#64748b",
        }}
      >
        <Panel title="Unavailable">
          <p className="text-sm text-muted-foreground">
            The requested tool could not be found.
          </p>
        </Panel>
      </Shell>
    );
  }
  if (EXTRA_SLUGS.includes(tool.slug)) {
    return <ExtraToolView slug={tool.slug} tool={tool} />;
  }
  switch (tool.slug) {
    case "json-formatter":
      return <JsonFormatterTool tool={tool} />;
    case "jwt-decoder":
      return <JwtDecoderTool tool={tool} />;
    case "base64":
      return <Base64Tool tool={tool} />;
    case "uuid-generator":
      return <UuidTool tool={tool} />;
    case "hash-generator":
      return <HashTool tool={tool} />;
    case "timestamp-converter":
      return <TimestampTool tool={tool} />;
    case "regex-playground":
      return <RegexTool tool={tool} />;
    case "markdown-editor":
      return <MarkdownTool tool={tool} />;
    case "color-toolkit":
      return <ColorTool tool={tool} />;
    case "api-tester":
      return <ApiTesterTool tool={tool} />;
    case "snippets":
      return <SnippetsTool tool={tool} />;
    case "url-encoder":
      return <UrlTool tool={tool} />;
    case "qr-generator":
      return <QrTool tool={tool} />;
    case "password-generator":
      return <PasswordTool tool={tool} />;
    case "lorem-ipsum":
      return <LoremTool tool={tool} />;
    case "case-converter":
      return <CaseTool tool={tool} />;
    case "diff-checker":
      return <DiffTool tool={tool} />;
    case "image-to-base64":
      return <ImageToBase64Tool tool={tool} />;
    case "github-analyzer":
      return <GitHubTool tool={tool} />;
    case "npm-explorer":
      return <NpmTool tool={tool} />;
    default:
      return <Shell tool={tool}><Panel title="Tool unavailable"><p className="text-sm text-muted-foreground">This tool has not been wired yet.</p></Panel></Shell>;
  }
}

function JsonFormatterTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState("");
  const [indent, setIndent] = useState<2 | 4>(2);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const parsed = safeJsonParse(text);
  const summary = parsed.ok ? jsonSummary(parsed.value) : null;

  const format = (minify = false, updateInput = false) => {
    const result = safeJsonParse(text);
    if (!result.ok) {
      setError(result.error);
      setOutput("");
      return;
    }
    try {
      setError("");
      const formatted = minify
        ? JSON.stringify(result.value)
        : JSON.stringify(result.value, null, indent);
      setOutput(formatted);
      if (updateInput) {
        setText(formatted);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to format JSON");
    }
  };

  return (
    <Shell tool={tool}>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Input" description="Paste or upload JSON to validate and format.">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => format(false, true)}>Pretty Print</Button>
            <Button variant="outline" size="sm" onClick={() => format(true)}>Minify</Button>
            <Select value={String(indent)} onValueChange={(v) => setIndent(Number(v) as 2 | 4)}>
              <SelectTrigger className="w-[110px]"><SelectValue placeholder="Indent" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 spaces</SelectItem>
                <SelectItem value="4">4 spaces</SelectItem>
              </SelectContent>
            </Select>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
              <Icon icon="lucide:upload" className="size-4" />
              Upload JSON
              <input
                type="file"
                accept=".json,application/json,text/json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setText(await file.text());
                }}
              />
            </label>
          </div>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={18} placeholder='{"name":"DevKit"}' className="font-mono text-[13px]" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => format(false)}>Validate</Button>
            <CopyButton value={output || text} toolSlug={tool.slug} toolName={tool.name} />
            <Button variant="outline" size="sm" onClick={() => downloadFile(output || text, "devkit.json", "application/json")}>Download</Button>
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title="Output" description="Formatted JSON appears here.">
            <pre className="max-h-[340px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6">{output || "Formatted output will appear here."}</pre>
          </Panel>
          <Panel title="Summary" description="Structure counts for the parsed JSON.">
            {summary ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(summary).map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-border bg-background p-3">
                    <div className="text-xs uppercase text-muted-foreground">{key}</div>
                    <div className="text-lg font-semibold">{formatNumber(value)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Valid JSON is required to generate a summary.</p>
            )}
          </Panel>
        </div>
      </div>
    </Shell>
  );
}

function JwtDecoderTool({ tool }: { tool: Tool }) {
  const [token, setToken] = useState("");
  const decoded = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Invalid JWT" };
    }
  }, [token]);

  const payload = decoded && "payload" in decoded ? decoded.payload as Record<string, unknown> : null;
  const status = payload ? jwtStatus(payload.exp as number | undefined, payload.nbf as number | undefined) : null;

  return (
    <Shell tool={tool}>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Panel title="Token" description="Paste a JWT to inspect its header and payload.">
          <Textarea value={token} onChange={(e) => setToken(e.target.value)} rows={11} className="font-mono text-[13px]" placeholder="eyJhbGciOi..." />
          {decoded && "error" in decoded && <p className="text-sm text-red-500">{decoded.error}</p>}
        </Panel>
        <div className="space-y-6">
          <Panel title="Status" description="Expiration and validity information.">
            {status ? <Badge variant={status.variant}>{status.label}</Badge> : <p className="text-sm text-muted-foreground">No token parsed yet.</p>}
          </Panel>
          <Panel title="Decoded">
            {decoded && "header" in decoded ? (
              <div className="space-y-4">
                <JsonBlock title="Header" data={decoded.header} />
                <JsonBlock
                  title="Payload"
                  data={Object.fromEntries(
                    Object.entries(decoded.payload as Record<string, unknown>).map(([key, value]) => [
                      key,
                      typeof value === "number" && ["exp", "iat", "nbf"].includes(key) ? formatUnixTime(value) : value,
                    ])
                  )}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Decoded claims will appear here.</p>
            )}
          </Panel>
        </div>
      </div>
    </Shell>
  );
}

function Base64Tool({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const output = mode === "encode" ? base64Encode(input) : (() => {
    try { return base64Decode(input); } catch { return ""; }
  })();
  return (
    <Shell tool={tool}>
      <Panel title="Convert text" description="Encode UTF-8 text to Base64 or decode it back.">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "encode" | "decode")}>
          <TabsList><TabsTrigger value="encode">Encode</TabsTrigger><TabsTrigger value="decode">Decode</TabsTrigger></TabsList>
        </Tabs>
        <div className="grid gap-4 lg:grid-cols-2">
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={14} className="font-mono text-[13px]" placeholder="Type text or Base64 here..." />
          <Textarea value={output} readOnly rows={14} className="font-mono text-[13px]" />
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={output} toolSlug={tool.slug} toolName={tool.name} />
          <DownloadButton content={output} filename={`devkit-base64.${mode === "encode" ? "txt" : "decoded.txt"}`} />
        </div>
      </Panel>
    </Shell>
  );
}

function UuidTool({ tool }: { tool: Tool }) {
  const [count, setCount] = useState(1);
  const [items, setItems] = useState<string[]>([]);
  return (
    <Shell tool={tool}>
      <Panel title="UUID v4" description="Generate single or bulk identifiers.">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 5, 10, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n} UUIDs</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setItems(Array.from({ length: count }, () => randomUuid()))}>Generate</Button>
          <CopyButton value={items.join("\n")} toolSlug={tool.slug} toolName={tool.name} />
          <DownloadButton content={items.join("\n")} filename="uuid-v4.txt" />
        </div>
        <pre className="max-h-[520px] overflow-auto rounded-xl border border-border bg-background p-4 text-sm">{items.length ? items.join("\n") : "Generated UUIDs appear here."}</pre>
      </Panel>
    </Shell>
  );
}

function HashTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    setLoading(true);
    const [sha1, sha256, md5] = await Promise.all([shaDigest(text, "SHA-1"), shaDigest(text, "SHA-256"), Promise.resolve(md5Digest(text))]);
    setResults({ MD5: md5, "SHA-1": sha1, "SHA-256": sha256 });
    setLoading(false);
  };
  return (
    <Shell tool={tool}>
      <Panel title="Hash generator" description="MD5, SHA-1 and SHA-256 digests generated locally.">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Enter text to hash..." />
        <Button onClick={generate} disabled={loading}>{loading ? "Generating..." : "Generate hashes"}</Button>
        <div className="grid gap-3 lg:grid-cols-3">
          {Object.entries(results).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-border bg-background p-3">
              <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium">{key}</span><CopyButton value={value} toolSlug={tool.slug} toolName={tool.name} /></div>
              <p className="break-all font-mono text-xs text-muted-foreground">{value}</p>
            </div>
          ))}
        </div>
      </Panel>
    </Shell>
  );
}

function TimestampTool({ tool }: { tool: Tool }) {
  const [value, setValue] = useState(String(nowSeconds()));
  const [mode, setMode] = useState<"unix" | "date">("unix");
  const date = useMemo(() => {
    if (mode === "unix") {
      const raw = Number(value);
      return new Date(raw < 1e12 ? raw * 1000 : raw);
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [value, mode]);
  return (
    <Shell tool={tool}>
      <Panel title="Timestamp converter" description="Convert between epoch values and human-readable dates.">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "unix" | "date")}>
          <TabsList><TabsTrigger value="unix">Unix</TabsTrigger><TabsTrigger value="date">Date</TabsTrigger></TabsList>
        </Tabs>
        {mode === "unix" ? <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="1735689600" /> : <Input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} />}
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile label="ISO" value={date.toISOString()} />
          <InfoTile label="Local" value={date.toLocaleString()} />
          <InfoTile label="Unix seconds" value={Math.floor(date.getTime() / 1000).toString()} />
          <InfoTile label="Unix ms" value={date.getTime().toString()} />
        </div>
      </Panel>
    </Shell>
  );
}

function RegexTool({ tool }: { tool: Tool }) {
  const [pattern, setPattern] = useState("\\bDevKit\\b");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState("DevKit is fast. devkit is flexible.");
  const regex = useMemo(() => {
    try {
      return new RegExp(pattern, flags.includes("g") ? flags : `${flags}g`);
    } catch {
      return null;
    }
  }, [pattern, flags]);
  const error = regex ? "" : "Invalid regex";
  const result = useMemo(() => (regex ? [...text.matchAll(regex)] : []), [regex, text]);
  return (
    <Shell tool={tool}>
      <Panel title="Playground" description="Test patterns and flags with live match results.">
        <div className="grid gap-4 md:grid-cols-2">
          <Input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="Pattern" />
          <Input value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="Flags: gi" />
        </div>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={9} />
        {error ? <p className="text-sm text-red-500">{error}</p> : <p className="text-sm text-muted-foreground">{result.length} matches</p>}
        <div className="space-y-2">
          {result.map((match, index) => (
            <div key={`${match.index}-${index}`} className="rounded-xl border border-border bg-background p-3 text-sm">
              <div className="font-medium">Match {index + 1}: {match[0]}</div>
              <div className="text-xs text-muted-foreground">Index {match.index}</div>
              {match.slice(1).some(Boolean) && <div className="mt-2 text-xs text-muted-foreground">Groups: {match.slice(1).filter(Boolean).join(", ")}</div>}
            </div>
          ))}
        </div>
      </Panel>
    </Shell>
  );
}

function MarkdownTool({ tool }: { tool: Tool }) {
  const DEFAULT_MARKDOWN = `# DevKit Markdown Editor

Welcome to the **Markdown Editor** — a powerful tool for writing and previewing Markdown documents.

## Features

- **Live Preview** — See your rendered Markdown in real-time
- **Toolbar** — Quick access to common formatting options
- **Export Options** — Download as .md or copy HTML
- **Word Statistics** — Track your document's word count and reading time

## Formatting Examples

### Text Styling

You can write in **bold**, *italic*, or ~~strikethrough~~.

### Links

[Visit DevKit](https://devkit.local)

### Code

Inline \`code\` or code blocks:

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Lists

1. Ordered list item
2. Another item
3. Final item

- Unordered item
- Another bullet
- Last one

### Blockquotes

> "The best way to predict the future is to invent it." — Alan Kay

### Tables

| Feature | Status |
|---------|--------|
| Editor | ✅ |
| Preview | ✅ |
| Export | ✅ |

---

*Start editing to see the live preview!*`;

  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "stacked">("split");
  const { theme } = useSettings();
  const html = useMemo(() => marked.parse(markdown) as string, [markdown]);
  
  const stats = useMemo(() => {
    const text = markdown.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const characters = markdown.length;
    const lines = markdown.split("\n").length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, characters, lines, readingTime };
  }, [markdown]);

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    Prism.highlightAll();
  }, [html]);

  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [previewOpen]);

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const insertMarkdown = (before: string, after: string = "") => {
    const editor = editorRef.current;
    if (!editor) return;
    
    const model = editor.getModel();
    const selection = editor.getSelection();
    const position = editor.getPosition();
    
    if (!model || !selection || !position) return;
    
    const selectedText = model.getValueInRange(selection);
    const text = selectedText || "text";
    const newText = `${before}${text}${after}`;
    
    editor.executeEdits("markdown-toolbar", [{
      range: {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      },
      text: newText,
    }]);
    
    editor.focus();
  };

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "bold": insertMarkdown("**", "**"); break;
      case "italic": insertMarkdown("*", "*"); break;
      case "strikethrough": insertMarkdown("~~", "~~"); break;
      case "code": insertMarkdown("`", "`"); break;
      case "codeblock": insertMarkdown("\n```\n", "\n```\n"); break;
      case "link": insertMarkdown("[", "](url)"); break;
      case "image": insertMarkdown("![alt](", ")"); break;
      case "h1": insertMarkdown("# "); break;
      case "h2": insertMarkdown("## "); break;
      case "h3": insertMarkdown("### "); break;
      case "ul": insertMarkdown("- "); break;
      case "ol": insertMarkdown("1. "); break;
      case "quote": insertMarkdown("> "); break;
      case "hr": insertMarkdown("\n---\n"); break;
      case "table": insertMarkdown("\n| Header | Header |\n|--------|--------|\n| Cell   | Cell   |\n"); break;
    }
  };

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html);
  };

  const downloadMarkdown = () => {
    downloadFile(markdown, "document.md", "text/markdown");
  };

  const downloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    code { background: #f0f0f0; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
    downloadFile(fullHtml, "document.html", "text/html");
  };

  return (
    <Shell tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("h1")} title="Heading 1">
              <Icon icon="lucide:heading-1" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("h2")} title="Heading 2">
              <Icon icon="lucide:heading-2" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("h3")} title="Heading 3">
              <Icon icon="lucide:heading-3" className="size-3.5" />
            </Button>
            <div className="w-px bg-border mx-1" />
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("bold")} title="Bold">
              <Icon icon="lucide:bold" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("italic")} title="Italic">
              <Icon icon="lucide:italic" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("strikethrough")} title="Strikethrough">
              <Icon icon="lucide:strikethrough" className="size-3.5" />
            </Button>
            <div className="w-px bg-border mx-1" />
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("ul")} title="Bullet List">
              <Icon icon="lucide:list" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("ol")} title="Numbered List">
              <Icon icon="lucide:list-ordered" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("quote")} title="Blockquote">
              <Icon icon="lucide:quote" className="size-3.5" />
            </Button>
            <div className="w-px bg-border mx-1" />
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("code")} title="Inline Code">
              <Icon icon="lucide:code" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("codeblock")} title="Code Block">
              <Icon icon="lucide:file-code-2" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("link")} title="Link">
              <Icon icon="lucide:link" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("image")} title="Image">
              <Icon icon="lucide:image" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("table")} title="Table">
              <Icon icon="lucide:table-2" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("hr")} title="Horizontal Rule">
              <Icon icon="lucide:minus" className="size-3.5" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-1">
            <Button
              variant={viewMode === "split" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("split")}
            >
              <Icon icon="lucide:columns-2" className="size-3.5 mr-1" />
              Split
            </Button>
            <Button
              variant={viewMode === "stacked" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("stacked")}
            >
              <Icon icon="lucide:rows-2" className="size-3.5 mr-1" />
              Stacked
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{stats.words} words</span>
          <span>·</span>
          <span>{stats.characters} characters</span>
          <span>·</span>
          <span>{stats.lines} lines</span>
          <span>·</span>
          <span>~{stats.readingTime} min read</span>
        </div>

        <div className={viewMode === "split" ? "grid gap-6 lg:grid-cols-2" : "space-y-6"}>
          <Panel title="Editor" description="Monaco-backed markdown editing with toolbar." className="min-w-0">
            <MonacoEditor
              height="420px"
              defaultLanguage="markdown"
              theme={theme === "dark" ? "vs-dark" : "light"}
              value={markdown}
              onChange={(value) => setMarkdown(value ?? "")}
              onMount={handleEditorMount}
              options={{ minimap: { enabled: false }, wordWrap: "on", fontSize: 14 }}
            />
            <div className="flex flex-wrap gap-2">
              <CopyButton value={markdown} toolSlug={tool.slug} toolName={tool.name} label="Copy Markdown" />
              <Button variant="outline" size="sm" onClick={downloadMarkdown}>
                <Icon icon="lucide:download" className="size-3.5 mr-1" />
                Download .md
              </Button>
              <Button variant="outline" size="sm" onClick={copyHtml}>
                <Icon icon="lucide:copy" className="size-3.5 mr-1" />
                Copy HTML
              </Button>
              <Button variant="outline" size="sm" onClick={downloadHtml}>
                <Icon icon="lucide:file-code" className="size-3.5 mr-1" />
                Download HTML
              </Button>
            </div>
          </Panel>
          <Panel title="Preview" description="Rendered HTML preview with fullscreen option." className="min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Live render</p>
              <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                <Icon icon="lucide:maximize-2" className="mr-1.5 size-3.5" />
                Fullscreen
              </Button>
            </div>
            <article
              className="prose max-w-none break-words dark:prose-invert prose-headings:tracking-tight prose-pre:overflow-x-auto prose-img:max-w-full prose-img:rounded-xl prose-table:block prose-table:max-w-full prose-table:overflow-x-auto [&_pre]:p-4"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </Panel>
        </div>
      </div>
      {previewOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal="true" aria-label="Markdown preview">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setPreviewOpen(false)} />
          <div className="relative flex h-full max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="text-sm font-semibold">Fullscreen Preview</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{stats.words} words · ~{stats.readingTime} min read</span>
                <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(false)} aria-label="Close preview">
                  <Icon icon="lucide:x" className="size-4" />
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-6">
              <article
                className="prose max-w-none break-words dark:prose-invert prose-headings:tracking-tight prose-pre:overflow-x-auto prose-img:max-w-full prose-img:rounded-xl prose-table:block prose-table:max-w-full prose-table:overflow-x-auto [&_pre]:p-4"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </Shell>
  );
}

function ColorTool({ tool }: { tool: Tool }) {
  const [color, setColor] = useState("#6366f1");
  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  return (
    <Shell tool={tool}>
      <Panel title="Color toolkit" description="Convert, inspect and copy color values.">
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="space-y-4">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-28 w-full cursor-pointer rounded-2xl border border-border bg-transparent p-2" />
            <Input value={color} onChange={(e) => setColor(e.target.value)} />
            {rgb && <CopyButton value={color} toolSlug={tool.slug} toolName={tool.name} />}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile label="HEX" value={color} />
            <InfoTile label="RGB" value={rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "Invalid"} />
            <InfoTile label="HSL" value={hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : "Invalid"} />
            <div className="rounded-xl border border-border p-4" style={{ background: color, color: contrastText(color) }}>
              <div className="text-sm font-medium">Preview</div>
              <div className="mt-2 text-xs opacity-80">Accessible foreground chosen automatically.</div>
            </div>
          </div>
        </div>
      </Panel>
    </Shell>
  );
}

function ApiTesterTool({ tool }: { tool: Tool }) {
  const [view, setView] = useState<"builder" | "collection">("builder");
  const [url, setUrl] = useState("https://api.github.com/repos/vercel/next.js");
  const [method, setMethod] = useState<string>("GET");
  const [headers, setHeaders] = useState<KeyValueRow[]>([{ key: "Accept", value: "application/json" }]);
  const [queries, setQueries] = useState<KeyValueRow[]>([{ key: "", value: "" }]);
  const [bodyMode, setBodyMode] = useState<"none" | "raw" | "urlencoded">("none");
  const [body, setBody] = useState("");
  const [auth, setAuth] = useState<AuthState>({ type: "none" });
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    body: string;
    headers: KeyValueRow[];
    size: number;
    contentType: string;
    elapsed: number;
  } | null>(null);
  const [respTab, setRespTab] = useState<"body" | "headers">("body");
  const [pretty, setPretty] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [collection, setCollection] = useState<PcCollection | null>(null);
  const [flat, setFlat] = useState<FlatRequest[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [importError, setImportError] = useState("");
  const [runResults, setRunResults] = useState<{ name: string; status: number | null; time: number }[] | null>(null);
  const [running, setRunning] = useState(false);

  const currentRequest = (): FlatRequest => ({
    id: randomUuid(),
    name: "New request",
    method,
    url,
    headers,
    query: queries,
    body,
    bodyMode: bodyMode === "none" ? "raw" : bodyMode,
    auth,
  });

  const onSend = async () => {
    if (!url.trim()) {
      setError("Enter a request URL.");
      return;
    }
    try {
      new URL(url);
    } catch {
      setError("Invalid URL.");
      return;
    }
    setLoading(true);
    const start = nowMs();
    try {
      const { init, url: finalUrl } = prepareRequest(currentRequest());
      const res = await fetch(finalUrl, init);
      const text = await res.text();
      const resHeaders: KeyValueRow[] = [];
      res.headers.forEach((value, key) => resHeaders.push({ key, value }));
      setResponse({
        status: res.status,
        statusText: res.statusText,
        body: text,
        headers: resHeaders,
        size: new Blob([text]).size,
        contentType: res.headers.get("content-type") ?? "",
        elapsed: nowMs() - start,
      });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const importCollection = (text: string) => {
    const parsed = parsePostmanCollection(text);
    if (!parsed) {
      setImportError("Invalid Postman collection JSON. Expected an object with info and item.");
      return;
    }
    const vars: Record<string, string> = {};
    (parsed.variable ?? []).forEach((v) => {
      if (v.key) vars[v.key] = v.value ?? "";
    });
    setCollection(parsed);
    setFlat(flattenPostmanCollection(parsed, vars));
    setImportError("");
    setRunResults(null);
  };

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importCollection(await file.text());
    e.target.value = "";
  };

  const loadIntoBuilder = (f: FlatRequest) => {
    setMethod(f.method);
    setUrl(f.url);
    setHeaders(f.headers.length ? f.headers : [{ key: "", value: "" }]);
    setQueries(f.query.length ? f.query : [{ key: "", value: "" }]);
    setBodyMode(f.body ? f.bodyMode : "none");
    setBody(f.body);
    setAuth(f.auth);
    setError("");
    setView("builder");
  };

  const runAll = async () => {
    setRunning(true);
    setRunResults([]);
    const results: { name: string; status: number | null; time: number }[] = [];
    for (const f of flat) {
      const start = nowMs();
      try {
        const { init, url: finalUrl } = prepareRequest(f);
        const res = await fetch(finalUrl, init);
        await res.text();
        results.push({ name: f.name, status: res.status, time: nowMs() - start });
      } catch {
        results.push({ name: f.name, status: null, time: nowMs() - start });
      }
      setRunResults([...results]);
    }
    setRunning(false);
  };

  const exportCollection = () => {
    const col = collection ?? buildPostmanCollection(`${tool.name} — new collection`, [currentRequest()]);
    const name = (collection?.info?.name ?? tool.name).replace(/[^\w\s-]+/g, "-");
    downloadFile(JSON.stringify(col, null, 2), `${name}.collection.json`, "application/json");
  };

  const exportCurrentRequest = () => {
    const col = buildPostmanCollection(tool.name, [currentRequest()]);
    downloadFile(JSON.stringify(col, null, 2), `${tool.slug}-request.collection.json`, "application/json");
  };

  return (
    <Shell tool={tool}>
      <div className="space-y-6">
        <Tabs value={view} onValueChange={(v) => setView(v as "builder" | "collection")}>
          <TabsList>
            <TabsTrigger value="builder">Request builder</TabsTrigger>
            <TabsTrigger value="collection">
              Postman collection{collection ? ` (${flat.length})` : ""}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {view === "builder" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <Panel title="Request builder" description="Use public APIs or your own CORS-enabled endpoints.">
              <div className="grid gap-3">
                <div className="flex flex-wrap gap-2">
                  <div className="w-32 shrink-0">
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {API_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/path" className="min-w-64 flex-1" />
                </div>

                <div className="space-y-2">
                  <SectionLabel icon="lucide:key-round" label="Auth" />
                  <Select value={auth.type} onValueChange={(v) => setAuth({ type: v as AuthState["type"] })}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No auth</SelectItem>
                      <SelectItem value="bearer">Bearer token</SelectItem>
                      <SelectItem value="basic">Basic auth</SelectItem>
                      <SelectItem value="apikey">API key</SelectItem>
                    </SelectContent>
                  </Select>
                  {auth.type === "bearer" && (
                    <Input value={auth.token ?? ""} onChange={(e) => setAuth({ ...auth, token: e.target.value })} placeholder="Token" />
                  )}
                  {auth.type === "basic" && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input value={auth.username ?? ""} onChange={(e) => setAuth({ ...auth, username: e.target.value })} placeholder="Username" />
                      <Input type="password" value={auth.password ?? ""} onChange={(e) => setAuth({ ...auth, password: e.target.value })} placeholder="Password" />
                    </div>
                  )}
                  {auth.type === "apikey" && (
                    <div className="grid gap-2 sm:grid-cols-[1fr_1fr_7rem]">
                      <Input value={auth.key ?? ""} onChange={(e) => setAuth({ ...auth, key: e.target.value })} placeholder="Key" />
                      <Input value={auth.value ?? ""} onChange={(e) => setAuth({ ...auth, value: e.target.value })} placeholder="Value" />
                      <Select value={auth.in ?? "header"} onValueChange={(v) => setAuth({ ...auth, in: v as "header" | "query" })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="header">Header</SelectItem>
                          <SelectItem value="query">Query</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <SectionLabel icon="lucide:hash" label="Headers" />
                  {headers.map((row, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <Input value={row.key} onChange={(e) => setHeaders((prev) => prev.map((item, i) => i === index ? { ...item, key: e.target.value } : item))} placeholder="Header" />
                      <Input value={row.value} onChange={(e) => setHeaders((prev) => prev.map((item, i) => i === index ? { ...item, value: e.target.value } : item))} placeholder="Value" />
                      <Button type="button" variant="ghost" size="iconSm" onClick={() => setHeaders((prev) => prev.filter((_, i) => i !== index))}>×</Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setHeaders((prev) => [...prev, { key: "", value: "" }])}>Add header</Button>
                </div>

                <div className="space-y-2">
                  <SectionLabel icon="lucide:link-2" label="Query parameters" />
                  {queries.map((row, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <Input value={row.key} onChange={(e) => setQueries((prev) => prev.map((item, i) => i === index ? { ...item, key: e.target.value } : item))} placeholder="Key" />
                      <Input value={row.value} onChange={(e) => setQueries((prev) => prev.map((item, i) => i === index ? { ...item, value: e.target.value } : item))} placeholder="Value" />
                      <Button type="button" variant="ghost" size="iconSm" onClick={() => setQueries((prev) => prev.filter((_, i) => i !== index))}>×</Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setQueries((prev) => [...prev, { key: "", value: "" }])}>Add parameter</Button>
                </div>

                <div className="space-y-2">
                  <SectionLabel icon="lucide:file-code-2" label="Body" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={bodyMode} onValueChange={(v) => setBodyMode(v as "none" | "raw" | "urlencoded")}>
                      <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="raw">Raw (JSON / Text)</SelectItem>
                        <SelectItem value="urlencoded">URL encoded</SelectItem>
                      </SelectContent>
                    </Select>
                    {bodyMode !== "none" && (
                      <span className="text-xs text-muted-foreground">
                        Content-Type auto-set to {bodyMode === "raw" ? "application/json" : "application/x-www-form-urlencoded"}
                      </span>
                    )}
                  </div>
                  {bodyMode !== "none" && (
                    <Textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={8}
                      placeholder={bodyMode === "raw" ? '{"hello":"world"}' : "key=value&key2=value2"}
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => void onSend()} disabled={loading}>
                    {loading ? "Sending..." : "Send request"}
                  </Button>
                  <Button variant="outline" onClick={exportCurrentRequest}>Export request</Button>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </Panel>

            <Panel title="Response" description="Status, time, size and full response details.">
              {response ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoTile label="Status" value={`${response.status} ${response.statusText}`} />
                    <InfoTile label="Response time" value={formatDuration(response.elapsed)} />
                    <InfoTile label="Size" value={formatBytes(response.size)} />
                    <InfoTile label="Content type" value={response.contentType || "—"} />
                  </div>
                  <Tabs value={respTab} onValueChange={(v) => setRespTab(v as "body" | "headers")}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <TabsList>
                        <TabsTrigger value="body">Body</TabsTrigger>
                        <TabsTrigger value="headers">Headers ({response.headers.length})</TabsTrigger>
                      </TabsList>
                      <div className="flex items-center gap-2">
                        {respTab === "body" && (
                          <>
                            <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={() => setPretty((p) => !p)}>
                              {pretty ? "Raw" : "Pretty"}
                            </Button>
                            <CopyButton value={response.body} toolSlug={tool.slug} toolName={tool.name} />
                            <DownloadButton
                              content={response.body}
                              filename={response.contentType.includes("json") ? "response.json" : "response.txt"}
                              mime={response.contentType || "text/plain"}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </Tabs>
                  {respTab === "body" ? (
                    <pre className="max-h-[560px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6">
                      {pretty ? (prettyJson(response.body) ?? response.body) : response.body}
                    </pre>
                  ) : (
                    <ul className="divide-y divide-zinc-200 rounded-xl border border-border text-xs dark:divide-zinc-800">
                      {response.headers.map((h) => (
                        <li key={h.key} className="flex gap-3 px-3 py-1.5">
                          <span className="w-48 shrink-0 font-medium">{h.key}</span>
                          <span className="min-w-0 break-all text-zinc-500 dark:text-zinc-400">{h.value}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  Send a request to see status, headers and body here.
                </div>
              )}
            </Panel>
          </div>
        ) : (
          <Panel title="Postman collection" description="Import a Postman collection (v2.0 / v2.1) to load and run its requests.">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer">
                  <input type="file" accept=".json,application/json" className="hidden" onChange={(e) => void onFileChange(e)} />
                  <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-300 px-3 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
                    <Icon icon="lucide:folder-open" className="size-4" />
                    Import file
                  </span>
                </label>
                <Button variant="outline" onClick={exportCollection}>
                  <Icon icon="lucide:download" className="mr-2 size-4" />
                  Export collection
                </Button>
              </div>
              <Textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={6}
                placeholder='Paste Postman collection JSON here…'
              />
              <Button onClick={() => importCollection(pasteText)} disabled={!pasteText.trim()}>
                Import from text
              </Button>
              {importError && <p className="text-sm text-red-500">{importError}</p>}

              {collection && (
                <>
                  <div className="flex items-center justify-between">
                    <SectionLabel icon="lucide:list-tree" label={`Requests (${flat.length})`} />
                    <span className="text-xs text-muted-foreground">{collection.info?.name}</span>
                  </div>
                  <ul className="divide-y divide-zinc-200 rounded-xl border border-border dark:divide-zinc-800">
                    {flat.map((f) => (
                      <li key={f.id} className="flex items-center gap-3 px-3 py-2">
                        <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${METHOD_STYLES[f.method] ?? "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"}`}>
                          {f.method}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{f.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">{f.url}</span>
                        </span>
                        <Button variant="outline" size="sm" onClick={() => loadIntoBuilder(f)}>Load</Button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => void runAll()} disabled={running}>
                      {running && <Icon icon="lucide:loader-2" className="mr-2 size-4 animate-spin" />}
                      {running ? "Running…" : `Run all (${flat.length})`}
                    </Button>
                    {runResults && (
                      <Button variant="ghost" size="sm" onClick={() => setRunResults(null)}>Clear results</Button>
                    )}
                  </div>
                  {runResults && (
                    <ul className="divide-y divide-zinc-200 rounded-xl border border-border dark:divide-zinc-800">
                      {runResults.map((r) => (
                        <li key={r.name} className="flex items-center gap-3 px-3 py-1.5 text-sm">
                          <span className={`w-16 shrink-0 rounded-md px-2 py-0.5 text-center font-mono text-[11px] font-semibold ${r.status !== null && r.status < 400 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                            {r.status ?? "ERR"}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{r.name}</span>
                          <span className="text-xs text-muted-foreground">{formatDuration(r.time)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </Panel>
        )}
      </div>
    </Shell>
  );
}

function SnippetsTool({ tool }: { tool: Tool }) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const debounced = useDebounce(query, 120);
  const snippets = useMemo(() => {
    return SNIPPETS.filter((snippet) => {
      const match = [snippet.title, snippet.description, snippet.code, ...snippet.tags].join(" ").toLowerCase().includes(debounced.toLowerCase());
      const langMatch = language === "all" || snippet.language === language;
      return match && langMatch;
    });
  }, [debounced, language]);
  return (
    <Shell tool={tool}>
      <Panel title="Curated library" description="Search, filter, copy and download admin-managed snippets.">
        <div className="flex flex-wrap gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search snippets..." className="max-w-sm" />
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {snippets.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      </Panel>
    </Shell>
  );
}

function UrlTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState("https://example.com/?q=dev kit");
  const encoded = encodeURIComponent(text);
  const decoded = (() => {
    try { return decodeURIComponent(text); } catch { return ""; }
  })();
  return (
    <Shell tool={tool}>
      <Panel title="URL encoder / decoder">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} />
        <div className="grid gap-4 lg:grid-cols-2">
          <InfoTile label="Encoded" value={encoded} />
          <InfoTile label="Decoded" value={decoded} />
        </div>
      </Panel>
    </Shell>
  );
}

function QrTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState("https://devkit.local");
  const [dataUrl, setDataUrl] = useState("");
  useEffect(() => {
    QRCode.toDataURL(text, { margin: 1, width: 340, errorCorrectionLevel: "M" }).then(setDataUrl);
  }, [text]);
  return (
    <Shell tool={tool}>
      <Panel title="QR code generator">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} />
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-border bg-background p-4">
            {dataUrl ? <Image src={dataUrl} alt="QR code" width={340} height={340} unoptimized className="mx-auto h-auto w-auto rounded-xl" /> : null}
          </div>
          <div className="space-y-3">
            <CopyButton value={text} toolSlug={tool.slug} toolName={tool.name} />
            {dataUrl && <DownloadButton content={dataUrl} filename="qrcode-data-uri.txt" label="Download data URI" />}
            <p className="text-sm text-muted-foreground">The QR image is generated locally in your browser.</p>
          </div>
        </div>
      </Panel>
    </Shell>
  );
}

function PasswordTool({ tool }: { tool: Tool }) {
  const [length, setLength] = useState(20);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const generate = () => setPassword(generatePasswords({ length, upper, lower, numbers, symbols }));
  const score = strengthScore(password);
  return (
    <Shell tool={tool}>
      <Panel title="Password generator">
        <div className="grid gap-4 lg:grid-cols-2">
          <Input type="number" min={4} max={128} value={length} onChange={(e) => setLength(Number(e.target.value))} />
          <Button onClick={generate}>Generate</Button>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {[
            ["Uppercase", upper, setUpper],
            ["Lowercase", lower, setLower],
            ["Numbers", numbers, setNumbers],
            ["Symbols", symbols, setSymbols],
          ].map(([label, value, setter]) => (
            <label key={label as string} className="flex items-center gap-2">
              <input type="checkbox" checked={value as boolean} onChange={(e) => (setter as (next: boolean) => void)(e.target.checked)} />
              {label as string}
            </label>
          ))}
        </div>
        <pre className="rounded-xl border border-border bg-background p-4 text-sm break-all">{password || "Generated password appears here."}</pre>
        <div className="flex items-center gap-3">
          <Badge variant="info">{score.label}</Badge>
          <CopyButton value={password} toolSlug={tool.slug} toolName={tool.name} />
        </div>
      </Panel>
    </Shell>
  );
}

function LoremTool({ tool }: { tool: Tool }) {
  const [paragraphs, setParagraphs] = useState(3);
  const [sentences, setSentences] = useState(4);
  const text = useMemo(() => createLorem({ paragraphs, sentencesPerParagraph: sentences }), [paragraphs, sentences]);
  return (
    <Shell tool={tool}>
      <Panel title="Lorem Ipsum generator">
        <div className="grid gap-4 md:grid-cols-2">
          <Input type="number" min={1} max={10} value={paragraphs} onChange={(e) => setParagraphs(Number(e.target.value))} />
          <Input type="number" min={1} max={10} value={sentences} onChange={(e) => setSentences(Number(e.target.value))} />
        </div>
        <Textarea value={text} readOnly rows={12} />
        <div className="flex gap-2">
          <CopyButton value={text} toolSlug={tool.slug} toolName={tool.name} />
          <DownloadButton content={text} filename="lorem.txt" />
        </div>
      </Panel>
    </Shell>
  );
}

function CaseTool({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("DevKit toolkit example");
  const cases = convertCase(input);
  return (
    <Shell tool={tool}>
      <Panel title="Case converter">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={5} />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(cases).map(([key, value]) => (
            <InfoTile key={key} label={key} value={value} />
          ))}
        </div>
      </Panel>
    </Shell>
  );
}

function DiffTool({ tool }: { tool: Tool }) {
  const [left, setLeft] = useState("function sum(a, b) {\n  return a + b;\n}");
  const [right, setRight] = useState("function sum(a, b) {\n  return a - b;\n}");
  const diff = compareText(left, right);
  return (
    <Shell tool={tool}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Left">
          <Textarea value={left} onChange={(e) => setLeft(e.target.value)} rows={16} />
        </Panel>
        <Panel title="Right">
          <Textarea value={right} onChange={(e) => setRight(e.target.value)} rows={16} />
        </Panel>
      </div>
      <Panel title="Unified diff">
        <pre className="max-h-[440px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6">
          {diff.map((part, index) => (
            <span key={index} className={part.added ? "diff-added" : part.removed ? "diff-removed" : ""}>
              {part.value}
            </span>
          ))}
        </pre>
      </Panel>
    </Shell>
  );
}

function imageBase64ToDataUrl(raw: string): string {
  const text = raw.trim();
  if (!text) return "";
  if (text.startsWith("data:image/") && text.includes(",")) {
    return text;
  }
  try {
    const cleaned = text.replace(/\s+/g, "");
    const bytes = Uint8Array.from(atob(cleaned), (c) => c.charCodeAt(0));
    let mime = "image/png";
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) mime = "image/jpeg";
    else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e) mime = "image/png";
    else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) mime = "image/gif";
    else if (bytes[0] === 0x42 && bytes[1] === 0x4d) mime = "image/bmp";
    else if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes.slice(8, 12).reduce((acc, b) => acc + String.fromCharCode(b), "") === "WEBP") mime = "image/webp";
    else if (/<svg/i.test(new TextDecoder().decode(bytes).slice(0, 200))) mime = "image/svg+xml";
    return `data:${mime};base64,${cleaned}`;
  } catch {
    return "";
  }
}

function ImageToBase64Tool({ tool }: { tool: Tool }) {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [value, setValue] = useState("");
  const [fileName, setFileName] = useState("");
  const onUpload = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    const array = await file.arrayBuffer();
    const bytes = new Uint8Array(array);
    const data = `data:${file.type || "image/png"};base64,${bytesToBase64(bytes)}`;
    setValue(data);
  };
  const dataUrl = useMemo(() => (mode === "decode" ? imageBase64ToDataUrl(value) : value), [mode, value]);
  const canPreview = dataUrl.length > 0;
  return (
    <Shell tool={tool}>
      <Panel title="Image ↔ Base64">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "encode" | "decode")}>
          <TabsList>
            <TabsTrigger value="encode">Image → Base64</TabsTrigger>
            <TabsTrigger value="decode">Base64 → Image</TabsTrigger>
          </TabsList>
        </Tabs>
        {mode === "encode" ? (
          <>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
              <Icon icon="lucide:upload" className="size-4" />
              Upload image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files?.[0])} />
            </label>
            {fileName && <p className="text-sm text-muted-foreground">{fileName}</p>}
            <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={10} className="font-mono text-[13px]" placeholder="Generated data URI appears here..." />
            <div className="flex gap-2">
              <CopyButton value={value} toolSlug={tool.slug} toolName={tool.name} />
              <DownloadButton content={value} filename="image-base64.txt" />
            </div>
          </>
        ) : (
          <>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={8}
              className="font-mono text-[13px]"
              placeholder="Paste a base64 image string or data URI here..."
            />
            {value && !canPreview && (
              <p className="text-sm text-red-500">Not a valid base64 image string.</p>
            )}
            {canPreview && (
              <>
                <CopyButton value={dataUrl} toolSlug={tool.slug} toolName={tool.name} />
                <DownloadButton
                  content={dataUrl}
                  filename={`image.${dataUrl.match(/^data:image\/(\w+);/)?.at(1) ?? "png"}`}
                  mime="application/octet-stream"
                  label="Download image"
                />
              </>
            )}
          </>
        )}
        {canPreview && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-background p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</div>
            <Image src={dataUrl} alt="Base64 image preview" width={640} height={480} unoptimized className="mx-auto max-h-[420px] w-auto rounded-xl" />
          </div>
        )}
      </Panel>
    </Shell>
  );
}

function GitHubTool({ tool }: { tool: Tool }) {
  const schema = z.object({ username: z.string().min(1) });
  const { register, handleSubmit } = useForm<{ username: string }>({ resolver: zodResolver(schema), defaultValues: { username: "vercel" } });
  type GitHubProfile = {
    avatar_url?: string;
    name?: string | null;
    login?: string;
    bio?: string | null;
    followers?: number;
    following?: number;
    public_repos?: number;
  };
  type GitHubRepo = {
    id: number;
    name: string;
    description?: string | null;
    language?: string | null;
  };
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadProfile = async (username: string) => {
    setLoading(true);
    setError("");
    try {
      const [userRes, repoRes] = await Promise.all([
        axios.get(`https://api.github.com/users/${username}`),
        axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=stars`),
      ]);
      setProfile(userRes.data);
      setRepos(repoRes.data.slice(0, 8));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load GitHub profile");
      setProfile(null);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };
  const onSubmit = handleSubmit(async ({ username }) => {
    await loadProfile(username);
  });
  useEffect(() => {
    let active = true;
    axios
      .get<GitHubProfile>("https://api.github.com/users/vercel")
      .then((userRes) =>
        Promise.all([
          userRes,
          axios.get<GitHubRepo[]>("https://api.github.com/users/vercel/repos?per_page=100&sort=stars"),
        ])
      )
      .then(([userRes, repoRes]) => {
        if (!active) return;
        setProfile(userRes.data);
        setRepos(repoRes.data.slice(0, 8));
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load GitHub profile");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <Shell tool={tool}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Panel title="GitHub profile" description="Public API only. No auth required.">
          <div className="flex gap-2">
            <Input {...register("username")} placeholder="GitHub username" />
            <Button type="submit" disabled={loading}>{loading ? "Loading..." : "Analyze"}</Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {profile ? (
            <div className="grid gap-6 lg:grid-cols-[0.6fr_1.4fr]">
              <div className="space-y-4">
                <Image src={profile.avatar_url ?? "/vercel.svg"} alt="Avatar" width={128} height={128} className="rounded-2xl" />
                <div>
                  <h3 className="text-lg font-semibold">{profile.name ?? profile.login ?? "GitHub user"}</h3>
                  <p className="text-sm text-muted-foreground">{profile.bio ?? "No bio"}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <InfoTile label="Followers" value={String(profile.followers ?? 0)} />
                  <InfoTile label="Following" value={String(profile.following ?? 0)} />
                  <InfoTile label="Repos" value={String(profile.public_repos ?? 0)} />
                </div>
              </div>
              <div className="space-y-3">
                {repos.map((repo) => (
                  <div key={repo.id} className="rounded-xl border border-border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{repo.name}</div>
                      <Badge variant="outline">{repo.language ?? "n/a"}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{repo.description ?? "No description."}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : <Skeleton className="h-64" />}
        </Panel>
      </form>
    </Shell>
  );
}

function NpmTool({ tool }: { tool: Tool }) {
  const schema = z.object({ name: z.string().min(1) });
  const { register, handleSubmit } = useForm<{ name: string }>({ resolver: zodResolver(schema), defaultValues: { name: "react" } });
  type NpmPackage = {
    "dist-tags"?: { latest?: string };
    maintainers?: { name?: string }[];
    dependencies?: Record<string, string>;
    readme?: string;
    versions?: Record<string, unknown>;
  };
  const [pkg, setPkg] = useState<NpmPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadPackage = async (name: string) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`https://registry.npmjs.org/${name}`);
      setPkg(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load npm package");
      setPkg(null);
    } finally {
      setLoading(false);
    }
  };
  const onSubmit = handleSubmit(async ({ name }) => {
    await loadPackage(name);
  });
  useEffect(() => {
    let active = true;
    axios
      .get<NpmPackage>("https://registry.npmjs.org/react")
      .then(({ data }) => {
        if (active) setPkg(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load npm package");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const versions = pkg ? Object.keys(pkg.versions ?? {}).slice(-10).reverse() : [];
  return (
    <Shell tool={tool}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Panel title="npm package explorer" description="Registry info, README and version history.">
          <div className="flex gap-2">
            <Input {...register("name")} placeholder="Package name" />
            <Button type="submit" disabled={loading}>{loading ? "Loading..." : "Explore"}</Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {pkg ? (
            <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoTile label="Version" value={pkg["dist-tags"]?.latest ?? "n/a"} />
                  <InfoTile label="Maintainers" value={String(pkg.maintainers?.length ?? 0)} />
                  <InfoTile label="Dependencies" value={String(Object.keys(pkg.dependencies ?? {}).length)} />
                </div>
                <Panel title="README" className="bg-background/60">
                  <div className="max-h-[420px] overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">{pkg.readme ?? "No README available."}</div>
                </Panel>
              </div>
              <div className="space-y-3">
                {versions.map((version) => (
                  <div key={version} className="rounded-xl border border-border bg-background p-3 text-sm">{version}</div>
                ))}
              </div>
            </div>
          ) : <Skeleton className="h-64" />}
        </Panel>
      </form>
    </Shell>
  );
}

function JsonBlock({ title, data }: { title: string; data: unknown }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      <pre className="rounded-xl border border-border bg-background p-3 text-xs leading-6">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

function SnippetCard({ snippet }: { snippet: (typeof SNIPPETS)[number] }) {
  const highlighted = usePrismHtml(snippet.code, snippet.language);
  const copy = useCopy();
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="border-b border-border p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{snippet.title}</h3>
            <p className="text-sm text-muted-foreground">{snippet.description}</p>
          </div>
          <Badge variant="outline">{snippet.language}</Badge>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {snippet.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>
      </div>
      <div className="space-y-2 p-4">
        <pre className={`language-${snippet.language} overflow-auto rounded-xl border border-border bg-card p-4 text-xs leading-6`} dangerouslySetInnerHTML={{ __html: highlighted }} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => copy(snippet.code, "snippets", "Code Snippet", "Snippet copied")}>Copy</Button>
          <Button variant="outline" size="sm" onClick={() => downloadFile(snippet.code, `${snippet.id}.${snippet.language === "typescript" ? "ts" : "js"}`)}>Download</Button>
        </div>
      </div>
    </div>
  );
}

function prettyJson(text: string) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return null;
  }
}

function contrastText(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#fff";
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.6 ? "#111827" : "#fff";
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const match = normalized.match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;
  return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
