"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { md5 } from "js-md5";
import { format as formatSql, type SqlLanguage } from "sql-formatter";
import bcrypt from "bcryptjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton, DownloadButton } from "@/components/ui/copy-button";
import { InfoTile, Panel, SectionLabel, Shell } from "@/features/tools/tool-layout";
import { useDebounce } from "@/hooks/useDebounce";
import { nowSeconds, formatBytes } from "@/lib/utils";
import { encodeBase64Url, safeJsonParse } from "@/lib/tool-utils";
import {
  blobToDataUrl,
  canvasToBlob,
  downloadDataUrl,
  downloadImageBlob,
  loadImageFromFile,
  renderToCanvas,
} from "@/lib/image-utils";
import type { Tool } from "@/types";

function prettyBytes(bytes: number): string {
  return formatBytes(bytes);
}

/* ================================================================== */
/* HTML / CSS formatter                                                */
/* ================================================================== */

function indentText(level: number): string {
  return "  ".repeat(level);
}

function formatHtmlPretty(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const root = doc.body ?? doc.documentElement;
  const voidElements = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  let out = "";
  const walk = (node: Node, depth: number) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent ?? "";
        if (text.trim()) out += indentText(depth) + text.trim() + "\n";
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const el = child as Element;
      const tag = el.tagName.toLowerCase();
      const attrs = Array.from(el.attributes).map((a) => `${a.name}="${a.value}"`).join(" ");
      const open = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;
      if (voidElements.has(tag)) {
        out += indentText(depth) + open + "\n";
        return;
      }
      const hasBlockChildren = Array.from(el.childNodes).some((c) => c.nodeType === Node.ELEMENT_NODE);
      if (!hasBlockChildren) {
        const inner = (el.textContent ?? "").trim();
        out += indentText(depth) + open + (inner ? inner : "") + `</${tag}>` + "\n";
        return;
      }
      out += indentText(depth) + open + "\n";
      walk(el, depth + 1);
      out += indentText(depth) + `</${tag}>` + "\n";
    });
  };
  walk(root, 0);
  return out.trim();
}

function minifyHtml(html: string): string {
  return html
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
}

function formatCssPretty(css: string): string {
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();
  let depth = 0;
  let out = "";
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === "{") {
      out += " {\n" + indentText(depth + 1);
      depth += 1;
    } else if (ch === "}") {
      out = out.replace(/[ \t]*\n?$/, "");
      depth = Math.max(0, depth - 1);
      out += "\n" + indentText(depth) + "}";
      const next = cleaned[i + 1];
      if (next === ",") out += ",";
      else out += "\n" + indentText(depth);
    } else if (ch === ";") {
      out += ";\n" + indentText(depth);
    } else {
      out += ch;
    }
  }
  return out.replace(/\n+$/, "\n");
}

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .trim();
}

function HtmlCssTool({ tool }: { tool: Tool }) {
  const [target, setTarget] = useState<"html" | "css">("html");
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [input, setInput] = useState(
    '<div class="card">\n  <h1>Hello</h1>\n  <p>World</p>\n</div>'
  );
  const [output, setOutput] = useState("");
  const run = () => {
    if (target === "html") {
      setOutput(mode === "format" ? formatHtmlPretty(input) : minifyHtml(input));
    } else {
      setOutput(mode === "format" ? formatCssPretty(input) : minifyCss(input));
    }
  };
  return (
    <Shell tool={tool}>
      <Panel title="Format or minify" description="HTML and CSS are processed entirely in your browser.">
        <Tabs value={target} onValueChange={(v) => setTarget(v as "html" | "css")}>
          <TabsList>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={mode} onValueChange={(v) => setMode(v as "format" | "minify")}>
          <TabsList>
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="minify">Minify</TabsTrigger>
          </TabsList>
        </Tabs>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} className="font-mono text-[13px]" />
        <Button onClick={run}>{mode === "format" ? "Format" : "Minify"}</Button>
        {output && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <CopyButton value={output} toolSlug={tool.slug} toolName={tool.name} />
              <DownloadButton content={output} filename={`devkit-${target}.${mode === "minify" ? "min." : ""}${target}`} label="Download" />
            </div>
            <pre className="max-h-[420px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6">{output}</pre>
          </div>
        )}
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* SQL formatter                                                       */
/* ================================================================== */

const SQL_DIALECTS: { id: SqlLanguage; label: string }[] = [
  { id: "sql", label: "Standard SQL" },
  { id: "mysql", label: "MySQL" },
  { id: "postgresql", label: "PostgreSQL" },
  { id: "sqlite", label: "SQLite" },
  { id: "tsql", label: "SQL Server (T-SQL)" },
  { id: "plsql", label: "Oracle (PL/SQL)" },
  { id: "mariadb", label: "MariaDB" },
  { id: "snowflake", label: "Snowflake" },
  { id: "bigquery", label: "BigQuery" },
];

function SqlTool({ tool }: { tool: Tool }) {
  const [dialect, setDialect] = useState<SqlLanguage>("sql");
  const [input, setInput] = useState("SELECT u.id, u.name, COUNT(o.id) AS orders FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE u.active = 1 GROUP BY u.id, u.name ORDER BY orders DESC LIMIT 10;");
  const [output, setOutput] = useState("");
  const run = () => {
    try {
      setOutput(formatSql(input, { language: dialect, keywordCase: "upper", tabWidth: 2, linesBetweenQueries: 2 }));
    } catch (error) {
      setOutput(error instanceof Error ? error.message : "Invalid SQL");
    }
  };
  return (
    <Shell tool={tool}>
      <Panel title="Beautify SQL" description="Auto-format SELECT, INSERT, UPDATE, DDL and more.">
        <Select value={dialect} onValueChange={(v) => setDialect(v as SqlLanguage)}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Dialect" /></SelectTrigger>
          <SelectContent>
            {SQL_DIALECTS.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={9} className="font-mono text-[13px]" />
        <Button onClick={run}>Format SQL</Button>
        {output && (
          <div className="space-y-2">
            <CopyButton value={output} toolSlug={tool.slug} toolName={tool.name} />
            <pre className="max-h-[420px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6">{output}</pre>
          </div>
        )}
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* Cron builder                                                        */
/* ================================================================== */

type CronField = Set<number>;

function parseCronField(raw: string, max: number): CronField | null {
  const values = new Set<number>();
  const parts = raw.split(",");
  for (const part of parts) {
    const match = part.match(/^(\*|\d+)(?:-(\d+))?(?:\/(\d+))?$/);
    if (!match) return null;
    const [, startRaw, endRaw, stepRaw] = match;
    const step = stepRaw ? parseInt(stepRaw, 10) : 1;
    const from = startRaw === "*" ? 0 : parseInt(startRaw, 10);
    const to = endRaw ? parseInt(endRaw, 10) : startRaw === "*" ? max : from;
    if (step < 1 || from > to || to > max) return null;
    for (let v = from; v <= to; v += step) values.add(v);
  }
  return values;
}

function cronMatches(expr: string, date: Date): boolean {
  const fields = expr.trim().split(/\s+/);
  if (fields.length !== 5) return false;
  const minutes = parseCronField(fields[0], 59);
  const hours = parseCronField(fields[1], 23);
  const dom = parseCronField(fields[2], 31);
  const months = parseCronField(fields[3], 12);
  const dow = parseCronField(fields[4], 6);
  if (!minutes || !hours || !dom || !months || !dow) return false;
  return (
    minutes.has(date.getMinutes()) &&
    hours.has(date.getHours()) &&
    dom.has(date.getDate()) &&
    months.has(date.getMonth() + 1) &&
    dow.has(date.getDay())
  );
}

function cronNextRuns(expr: string, count: number): Date[] {
  const runs: Date[] = [];
  const now = new Date(nowSeconds() * 1000);
  now.setSeconds(0, 0);
  const cursor = new Date(now.getTime());
  const cap = 5 * 366 * 24 * 60 * 60 * 1000;
  const deadline = cursor.getTime() + cap;
  while (runs.length < count && cursor.getTime() < deadline) {
    if (cronMatches(expr, cursor)) runs.push(new Date(cursor.getTime()));
    cursor.setTime(cursor.getTime() + 60_000);
  }
  return runs;
}

const CRON_PRESETS = [
  { label: "Every minute", expr: "* * * * *" },
  { label: "Every 5 minutes", expr: "*/5 * * * *" },
  { label: "Every hour", expr: "0 * * * *" },
  { label: "Every day at midnight", expr: "0 0 * * *" },
  { label: "Every Monday 9am", expr: "0 9 * * 1" },
  { label: "Weekdays 9-5 hourly", expr: "0 9-17 * * 1-5" },
  { label: "1st of month at noon", expr: "0 12 1 * *" },
];

function CronTool({ tool }: { tool: Tool }) {
  const [minute, setMinute] = useState("*/5");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  const [runs, setRuns] = useState<Date[]>([]);
  const expr = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`.trim();
  const valid = useMemo(() => {
    const fields = expr.split(/\s+/);
    if (fields.length !== 5) return false;
    return [59, 23, 31, 12, 6].every((max, i) => parseCronField(fields[i], max) !== null);
  }, [expr]);
  const generate = () => {
    setRuns(cronNextRuns(expr, 6));
  };
  return (
    <Shell tool={tool}>
      <Panel title="Cron expression builder" description="Compose cron schedules and preview the next run times.">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Minute</div>
            <Input value={minute} onChange={(e) => setMinute(e.target.value)} className="w-28 font-mono" placeholder="*" />
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Hour</div>
            <Input value={hour} onChange={(e) => setHour(e.target.value)} className="w-28 font-mono" placeholder="*" />
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Day of month</div>
            <Input value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} className="w-28 font-mono" placeholder="*" />
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Month</div>
            <Input value={month} onChange={(e) => setMonth(e.target.value)} className="w-28 font-mono" placeholder="*" />
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Day of week (0-6)</div>
            <Input value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className="w-28 font-mono" placeholder="*" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CRON_PRESETS.map((preset) => (
            <button
              key={preset.expr}
              onClick={() => {
                const [m, h, d, mo, dw] = preset.expr.split(" ");
                setMinute(m);
                setHour(h);
                setDayOfMonth(d);
                setMonth(mo);
                setDayOfWeek(dw);
              }}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Expression</div>
          <div className="mt-1 flex items-center gap-3">
            <code className="font-mono text-lg font-semibold text-primary">{expr}</code>
            <CopyButton value={expr} toolSlug={tool.slug} toolName={tool.name} />
          </div>
          {!valid && <p className="mt-1 text-sm text-red-500">Invalid cron fields — check ranges and syntax.</p>}
        </div>
        <Button onClick={generate} disabled={!valid}>Preview next runs</Button>
        {runs.length > 0 && (
          <div className="space-y-2">
            {runs.map((run, index) => (
              <div key={run.toISOString()} className="rounded-xl border border-border bg-background p-3 text-sm">
                <span className="mr-2 text-xs text-muted-foreground">#{index + 1}</span>
                {run.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* File checksum                                                       */
/* ================================================================== */

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function FileChecksumTool({ tool }: { tool: Tool }) {
  const [fileName, setFileName] = useState("");
  const [size, setSize] = useState<number | null>(null);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const onFile = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    setSize(file.size);
    setLoading(true);
    setError("");
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const algorithms = ["SHA-1", "SHA-256", "SHA-512"] as const;
      const results: Record<string, string> = { MD5: md5(bytes) };
      for (const algorithm of algorithms) {
        results[algorithm] = toHex(await crypto.subtle.digest(algorithm, buffer));
      }
      setHashes(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to hash file");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Shell tool={tool}>
      <Panel title="File checksum" description="Compute MD5, SHA-1, SHA-256 and SHA-512 hashes of any file.">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          <Icon icon="lucide:file-up" className="size-4" />
          Choose file
          <input type="file" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {fileName && (
          <div className="flex flex-wrap gap-2">
            <InfoTile label="File" value={fileName} />
            {size !== null && <InfoTile label="Size" value={`${(size / 1024).toFixed(1)} KB`} />}
          </div>
        )}
        {loading && <p className="text-sm text-muted-foreground">Hashing…</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {Object.entries(hashes).map(([name, hash]) => (
          <div key={name} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
            <Badge variant="outline" className="w-16 justify-center">{name}</Badge>
            <code className="min-w-0 flex-1 break-all font-mono text-xs">{hash}</code>
            <CopyButton value={hash} toolSlug={tool.slug} toolName={tool.name} />
          </div>
        ))}
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* CSV <-> JSON converter                                              */
/* ================================================================== */

function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

function escapeCsvCell(value: string, delimiter: string): string {
  if (/[",\n\r]/.test(value) || value.includes(delimiter)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function csvToJsonText(text: string, delimiter: string): string {
  const rows = parseCsv(text, delimiter);
  if (rows.length < 2) throw new Error("CSV needs a header row and at least one data row.");
  const headers = rows[0].map((h) => h.trim() || "column");
  const records = rows.slice(1).map((cells) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = cells[index] ?? "";
    });
    return record;
  });
  return JSON.stringify(records, null, 2);
}

function jsonToCsvText(json: string, delimiter: string): string {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("JSON must be a non-empty array of objects.");
  }
  const headers = Array.from(
    parsed.reduce<Set<string>>((acc, item) => {
      Object.keys(item as object).forEach((key) => acc.add(key));
      return acc;
    }, new Set<string>())
  );
  const lines = [headers.join(delimiter)];
  parsed.forEach((item) => {
    lines.push(headers.map((header) => escapeCsvCell(String((item as Record<string, unknown>)[header] ?? ""), delimiter)).join(delimiter));
  });
  return lines.join("\n");
}

function CsvJsonTool({ tool }: { tool: Tool }) {
  const [mode, setMode] = useState<"csv" | "json">("csv");
  const [delimiter, setDelimiter] = useState(",");
  const [input, setInput] = useState('name,role,years\nAda,Engineer,8\nGrace,Analyst,4');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const convert = () => {
    setError("");
    try {
      setOutput(mode === "csv" ? csvToJsonText(input, delimiter) : jsonToCsvText(input, delimiter));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
      setOutput("");
    }
  };
  return (
    <Shell tool={tool}>
      <Panel title="CSV ↔ JSON converter" description="Convert between delimited tables and JSON arrays of objects.">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "csv" | "json")}>
            <TabsList>
              <TabsTrigger value="csv">CSV → JSON</TabsTrigger>
              <TabsTrigger value="json">JSON → CSV</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={delimiter} onValueChange={setDelimiter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Delimiter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value=",">Comma (,)</SelectItem>
              <SelectItem value=";">Semicolon (;)</SelectItem>
              <SelectItem value="\t">Tab</SelectItem>
              <SelectItem value="|">Pipe (|)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} className="font-mono text-[13px]" />
        <Button onClick={convert}>Convert</Button>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {output && (
          <div className="space-y-2">
            <CopyButton value={output} toolSlug={tool.slug} toolName={tool.name} />
            <DownloadButton content={output} filename={`devkit-converted.${mode === "csv" ? "json" : "csv"}`} mime="text/plain" label="Download" />
            <pre className="max-h-[420px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6">{output}</pre>
          </div>
        )}
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* JSON -> TypeScript interfaces                                       */
/* ================================================================== */

function tsTypeName(name: string): string {
  const cleaned = name
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  if (!cleaned) return "Root";
  if (/^\d/.test(cleaned)) return `T${cleaned}`;
  return cleaned;
}

function inferTsType(value: unknown, name: string, interfaces: string[], seen: Map<object, string>): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const itemTypes = Array.from(new Set(value.map((item) => inferTsType(item, `${name}Item`, interfaces, seen))));
    return itemTypes.length === 1 ? `${itemTypes[0]}[]` : `(${itemTypes.join(" | ")})[]`;
  }
  switch (typeof value) {
    case "string": return "string";
    case "number": return "number";
    case "boolean": return "boolean";
    case "bigint": return "number";
    case "undefined": return "unknown";
    case "object": {
      const existing = seen.get(value as object);
      if (existing) return existing;
      const typeName = tsTypeName(name);
      seen.set(value as object, typeName);
      const fields = Object.entries(value as Record<string, unknown>);
      const body = fields
        .map(([key, fieldValue]) => {
          const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
          const optional = fieldValue === null || fieldValue === undefined ? "?" : "";
          return `  ${safeKey}${optional}: ${inferTsType(fieldValue, `${typeName}${tsTypeName(key)}`, interfaces, seen)};`;
        })
        .join("\n");
      interfaces.push(`export interface ${typeName} {\n${body}\n}`);
      return typeName;
    }
    default:
      return "unknown";
  }
}

function jsonToTsText(jsonText: string, rootName: string): string {
  const parsed = JSON.parse(jsonText);
  const interfaces: string[] = [];
  const seen = new Map<object, string>();
  const root = inferTsType(parsed, rootName, interfaces, seen);
  if (!/^[\w$]+$/.test(root) || !interfaces.some((i) => i.startsWith(`export interface ${root}`))) {
    interfaces.push(`export interface ${tsTypeName(rootName)} {\n  value: ${root};\n}`);
  }
  return interfaces.join("\n\n") + "\n";
}

function JsonTsTool({ tool }: { tool: Tool }) {
  const [input, setInput] = useState('{\n  "name": "DevKit",\n  "version": 1,\n  "tools": ["formatter", "encoder"],\n  "meta": { "local": true, "count": 20 }\n}');
  const [rootName, setRootName] = useState("Root");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const generate = () => {
    setError("");
    const parsed = safeJsonParse(input);
    if (!parsed.ok) {
      setError(parsed.error);
      setOutput("");
      return;
    }
    try {
      setOutput(jsonToTsText(input, rootName.trim() || "Root"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate types");
      setOutput("");
    }
  };
  return (
    <Shell tool={tool}>
      <Panel title="JSON → TypeScript" description="Generate TypeScript interfaces from any JSON document.">
        <div className="flex gap-3">
          <Input value={rootName} onChange={(e) => setRootName(e.target.value)} placeholder="Root interface name" className="w-56" />
          <Button onClick={generate}>Generate types</Button>
        </div>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} className="font-mono text-[13px]" />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {output && (
          <div className="space-y-2">
            <CopyButton value={output} toolSlug={tool.slug} toolName={tool.name} />
            <DownloadButton content={output} filename="devkit-types.ts" mime="text/plain" label="Download" />
            <pre className="max-h-[420px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6 text-foreground">{output}</pre>
          </div>
        )}
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* JWT signer                                                          */
/* ================================================================== */

function hmacSign(secret: string, data: string, algorithm: "HS256" | "HS384" | "HS512"): Promise<string> {
  const encoder = new TextEncoder();
  const hash = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" }[algorithm];
  return crypto.subtle
    .importKey("raw", encoder.encode(secret), { name: "HMAC", hash: { name: hash } }, false, ["sign"])
    .then((key) => crypto.subtle.sign("HMAC", key, encoder.encode(data)))
    .then((buffer) => encodeBase64Url(Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join("")));
}

const JWT_ALGS = ["HS256", "HS384", "HS512"] as const;

function JwtSignerTool({ tool }: { tool: Tool }) {
  const [algorithm, setAlgorithm] = useState<(typeof JWT_ALGS)[number]>("HS256");
  const [payload, setPayload] = useState('{\n  "sub": "user_123",\n  "role": "admin",\n  "aud": "devkit"\n}');
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [expires, setExpires] = useState("3600");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const sign = async () => {
    setError("");
    const parsed = safeJsonParse(payload);
    if (!parsed.ok) {
      setError(`Invalid payload: ${parsed.error}`);
      setToken("");
      return;
    }
    const now = nowSeconds();
    const body = {
      ...(parsed.value as Record<string, unknown>),
      iat: now,
      exp: now + Number(expires),
    };
    const header = { alg: algorithm, typ: "JWT" };
    const data = `${encodeBase64Url(JSON.stringify(header))}.${encodeBase64Url(JSON.stringify(body))}`;
    const signature = await hmacSign(secret, data, algorithm);
    setToken(`${data}.${signature}`);
  };
  return (
    <Shell tool={tool}>
      <Panel title="JWT generator" description="Create signed HS256/384/512 tokens with custom claims.">
        <div className="flex flex-wrap gap-3">
          <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as (typeof JWT_ALGS)[number])}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Algorithm" /></SelectTrigger>
            <SelectContent>
              {JWT_ALGS.map((alg) => (
                <SelectItem key={alg} value={alg}>{alg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={expires} onValueChange={setExpires}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Expires" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="300">5 minutes</SelectItem>
              <SelectItem value="3600">1 hour</SelectItem>
              <SelectItem value="86400">1 day</SelectItem>
              <SelectItem value="604800">7 days</SelectItem>
              <SelectItem value="2592000">30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Payload (JSON)</div>
            <Textarea value={payload} onChange={(e) => setPayload(e.target.value)} rows={8} className="font-mono text-[13px]" />
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Secret</div>
            <Input value={secret} onChange={(e) => setSecret(e.target.value)} type="password" className="font-mono" />
            <p className="text-xs text-muted-foreground">iat and exp claims are added automatically.</p>
          </div>
        </div>
        <Button onClick={sign}>Sign token</Button>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {token && (
          <div className="space-y-2">
            <CopyButton value={token} toolSlug={tool.slug} toolName={tool.name} />
            <pre className="max-h-[300px] overflow-auto break-all rounded-xl border border-border bg-background p-4 font-mono text-xs leading-6">{token}</pre>
          </div>
        )}
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* Bcrypt hash generator                                               */
/* ================================================================== */

function BcryptTool({ tool }: { tool: Tool }) {
  const [password, setPassword] = useState("");
  const [rounds, setRounds] = useState(10);
  const [hash, setHash] = useState("");
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const generate = () => {
    setError("");
    if (!password) {
      setError("Enter a password first.");
      return;
    }
    try {
      setHash(bcrypt.hashSync(password, rounds));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to hash");
    }
  };
  const verify = () => {
    setError("");
    if (!password || !verifyHash) {
      setError("Enter the password and the hash to verify.");
      setVerifyResult(null);
      return;
    }
    setVerifyResult(bcrypt.compareSync(password, verifyHash));
  };
  return (
    <Shell tool={tool}>
      <Panel title="Bcrypt hash generator" description="Hash passwords with configurable cost and verify existing hashes.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Password</div>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter password" />
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Cost factor (rounds: {rounds})</div>
            <input
              type="range"
              min={4}
              max={14}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={generate}>Generate hash</Button>
          {hash && (
            <>
              <CopyButton value={hash} toolSlug={tool.slug} toolName={tool.name} />
              <DownloadButton content={hash} filename="devkit-bcrypt.txt" label="Download" />
            </>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {hash && <pre className="break-all rounded-xl border border-border bg-background p-4 font-mono text-xs">{hash}</pre>}
        {hash && (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Verify a hash</div>
            <Input value={verifyHash} onChange={(e) => setVerifyHash(e.target.value)} className="font-mono" placeholder="Paste hash to verify" />
            <Button variant="outline" onClick={verify}>Verify</Button>
            {verifyResult !== null && (
              <p className={verifyResult ? "text-sm text-emerald-500" : "text-sm text-red-500"}>
                {verifyResult ? "Hash matches the password." : "Hash does not match the password."}
              </p>
            )}
          </div>
        )}
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* Text statistics                                                     */
/* ================================================================== */

function TextStatsTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState("DevKit is a developer toolkit that runs entirely in your browser.\nIt includes formatters, encoders, generators and analyzers.");
  const stats = useMemo(() => {
    const characters = text.length;
    const withoutSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
    const lines = text.split(/\r?\n/);
    const sentences = text.split(/[.!?]+(?=\s|$)/).filter((s) => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
    const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
    const averageWordLength = words.length ? (words.reduce((acc, w) => acc + w.length, 0) / words.length).toFixed(1) : "0";
    const readingMinutes = words.length / 200;
    const speakingMinutes = words.length / 130;
    const frequency = words.reduce<Record<string, number>>((acc, w) => {
      const key = w.toLowerCase().replace(/[^a-z0-9']/g, "");
      if (key) acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const topWords = Object.entries(frequency).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return { characters, withoutSpaces, words: words.length, lines: lines.length, sentences, paragraphs, uniqueWords, averageWordLength, readingMinutes, speakingMinutes, topWords };
  }, [text]);
  const fmt = (minutes: number) => (minutes < 1 ? `${Math.round(minutes * 60)} sec` : `${minutes.toFixed(1)} min`);
  return (
    <Shell tool={tool}>
      <Panel title="Text statistics" description="Live counts for characters, words, lines and readability.">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoTile label="Characters" value={String(stats.characters)} />
          <InfoTile label="No spaces" value={String(stats.withoutSpaces)} />
          <InfoTile label="Words" value={String(stats.words)} />
          <InfoTile label="Unique words" value={String(stats.uniqueWords)} />
          <InfoTile label="Lines" value={String(stats.lines)} />
          <InfoTile label="Sentences" value={String(stats.sentences)} />
          <InfoTile label="Paragraphs" value={String(stats.paragraphs)} />
          <InfoTile label="Avg word length" value={stats.averageWordLength} />
          <InfoTile label="Reading time" value={fmt(stats.readingMinutes)} />
          <InfoTile label="Speaking time" value={fmt(stats.speakingMinutes)} />
        </div>
        {stats.topWords.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Most frequent words</div>
            <div className="flex flex-wrap gap-2">
              {stats.topWords.map(([word, count]) => (
                <span key={word} className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs">
                  <span className="font-medium">{word}</span>{" "}
                  <span className="text-muted-foreground">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* URL query builder                                                   */
/* ================================================================== */

interface QueryRow {
  id: number;
  key: string;
  value: string;
}

function UrlBuilderTool({ tool }: { tool: Tool }) {
  const [base, setBase] = useState("https://api.example.com/search");
  const [rows, setRows] = useState<QueryRow[]>([
    { id: 1, key: "q", value: "developer toolkit" },
    { id: 2, key: "limit", value: "10" },
  ]);
  const [encodeValues, setEncodeValues] = useState(true);
  const [nextId, setNextId] = useState(3);
  const updateRow = (id: number, patch: Partial<QueryRow>) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };
  const removeRow = (id: number) => setRows((current) => current.filter((row) => row.id !== id));
  const addRow = () => {
    setRows((current) => [...current, { id: nextId, key: "", value: "" }]);
    setNextId((n) => n + 1);
  };
  const url = useMemo(() => {
    const params = rows.filter((row) => row.key.trim());
    const query = params
      .map((row) => {
        const key = encodeValues ? encodeURIComponent(row.key.trim()) : row.key.trim();
        const value = encodeValues ? encodeURIComponent(row.value) : row.value;
        return `${key}=${value}`;
      })
      .join("&");
    const separator = query ? (base.includes("?") ? (base.endsWith("&") || base.endsWith("?") ? "" : "&") : "?") : "";
    return `${base}${separator}${query}`;
  }, [base, rows, encodeValues]);
  return (
    <Shell tool={tool}>
      <Panel title="URL query builder" description="Assemble query strings visually with automatic encoding.">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Base URL</div>
          <Input value={base} onChange={(e) => setBase(e.target.value)} className="font-mono" placeholder="https://example.com/path" />
        </div>
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <Input value={row.key} onChange={(e) => updateRow(row.id, { key: e.target.value })} placeholder="key" className="w-1/3 font-mono" />
              <span className="text-muted-foreground">=</span>
              <Input value={row.value} onChange={(e) => updateRow(row.id, { value: e.target.value })} placeholder="value" className="font-mono" />
              <button
                onClick={() => removeRow(row.id)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Remove parameter"
              >
                <Icon icon="lucide:trash-2" className="size-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={addRow}>
              <Icon icon="lucide:plus" className="mr-1 size-3.5" /> Add parameter
            </Button>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={encodeValues}
                onChange={(e) => setEncodeValues(e.target.checked)}
                className="size-4 accent-[var(--primary)]"
              />
              URL-encode values
            </label>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Final URL</div>
          <div className="mt-1 flex items-start gap-3">
            <code className="min-w-0 flex-1 break-all font-mono text-sm">{url}</code>
            <CopyButton value={url} toolSlug={tool.slug} toolName={tool.name} />
          </div>
        </div>
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* Unicode inspector                                                   */
/* ================================================================== */

interface UnicodeRow {
  char: string;
  hex: string;
  decimal: number;
  utf8: string;
}

function UnicodeTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState("DevKit 🚀 中文 español");
  const rows = useMemo<UnicodeRow[]>(() => {
    return Array.from(text).slice(0, 200).map((char) => {
      const codePoint = char.codePointAt(0) ?? 0;
      const utf8 = new TextEncoder().encode(char);
      return {
        char,
        hex: `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
        decimal: codePoint,
        utf8: Array.from(utf8, (byte) => byte.toString(16).padStart(2, "0")).join(" "),
      };
    });
  }, [text]);
  const totals = useMemo(() => {
    const codePoints = Array.from(text).length;
    const bytes = new TextEncoder().encode(text).length;
    return { codePoints, bytes };
  }, [text]);
  return (
    <Shell tool={tool}>
      <Panel title="Unicode inspector" description="Explore code points, UTF-8 bytes and escapes for any text.">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} />
        <div className="flex flex-wrap gap-2">
          <InfoTile label="Characters" value={String(text.length)} />
          <InfoTile label="Code points" value={String(totals.codePoints)} />
          <InfoTile label="UTF-8 bytes" value={String(totals.bytes)} />
        </div>
        {rows.length > 0 && (
          <div className="overflow-auto rounded-xl border border-border bg-background">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2">Char</th>
                  <th className="px-3 py-2">Code point</th>
                  <th className="px-3 py-2">Decimal</th>
                  <th className="px-3 py-2">UTF-8 bytes</th>
                  <th className="px-3 py-2">Escape</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.decimal}-${row.hex}`} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-1.5 font-mono text-base">{row.char === " " ? "␣" : row.char}</td>
                    <td className="px-3 py-1.5 font-mono text-xs">{row.hex}</td>
                    <td className="px-3 py-1.5 font-mono text-xs">{row.decimal}</td>
                    <td className="px-3 py-1.5 font-mono text-xs">{row.utf8}</td>
                    <td className="px-3 py-1.5 font-mono text-xs">{"\\u{" + row.hex.slice(2) + "}"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {Array.from(text).length > 200 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">Showing the first 200 code points.</p>
            )}
          </div>
        )}
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* px <-> rem <-> em converter                                         */
/* ================================================================== */

function UnitConvertTool({ tool }: { tool: Tool }) {
  const [base, setBase] = useState("16");
  const [px, setPx] = useState("24");
  const [rem, setRem] = useState("1.5");
  const [em, setEm] = useState("1.5");
  const baseNumber = Number(base) || 16;
  const pxNumber = Number(px);
  const remNumber = Number(rem);
  const emNumber = Number(em);
  const valid = [pxNumber, remNumber, emNumber].every((n) => Number.isFinite(n));
  const remFromPx = valid ? pxNumber / baseNumber : null;
  const emFromPx = valid ? pxNumber / baseNumber : null;
  const pxFromRem = valid ? remNumber * baseNumber : null;
  const pxFromEm = valid ? emNumber * baseNumber : null;
  const fmt = (value: number | null) => (value === null ? "—" : value.toFixed(3).replace(/\.?0+$/, ""));
  return (
    <Shell tool={tool}>
      <Panel title="px ↔ rem ↔ em" description="Convert CSS units against a configurable root font size.">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Root font size (px)</div>
            <Input value={base} onChange={(e) => setBase(e.target.value)} className="w-32 font-mono" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Pixels</div>
            <Input value={px} onChange={(e) => setPx(e.target.value)} className="mt-1 font-mono" />
            <div className="mt-2 text-sm text-muted-foreground">
              → rem: <span className="font-medium text-foreground">{fmt(remFromPx)}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              → em: <span className="font-medium text-foreground">{fmt(emFromPx)}</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">REM</div>
            <Input value={rem} onChange={(e) => setRem(e.target.value)} className="mt-1 font-mono" />
            <div className="mt-2 text-sm text-muted-foreground">
              → px: <span className="font-medium text-foreground">{fmt(pxFromRem)}</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">EM</div>
            <Input value={em} onChange={(e) => setEm(e.target.value)} className="mt-1 font-mono" />
            <div className="mt-2 text-sm text-muted-foreground">
              → px: <span className="font-medium text-foreground">{fmt(pxFromEm)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["4px", "4"], ["8px", "8"], ["12px", "12"], ["14px", "14"], ["16px", "16"], ["20px", "20"], ["24px", "24"], ["32px", "32"], ["48px", "48"],
          ].map(([label, value]) => (
            <button
              key={value}
              onClick={() => setPx(value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          1rem = {baseNumber}px. rem targets the root element; em resolves against the current element’s font size.
        </p>
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* SVG optimizer                                                       */
/* ================================================================== */

function minifySvg(svg: string): string {
  return svg
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+|\s+$/g, "");
}

function SvgTool({ tool }: { tool: Tool }) {
  const [input, setInput] = useState(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">\n  <!-- heart icon -->\n  <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>\n</svg>'
  );
  const output = useMemo(() => minifySvg(input), [input]);
  const previewUrl = `data:image/svg+xml,${encodeURIComponent(output)}`;
  const savings = input.length > 0 ? Math.max(0, input.length - output.length) : 0;
  return (
    <Shell tool={tool}>
      <Panel title="SVG optimizer" description="Strip comments and whitespace, preview and download the result.">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} className="font-mono text-[13px]" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Optimized</div>
              <Badge variant="outline">{savings} bytes saved</Badge>
            </div>
            <pre className="max-h-[360px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6">{output}</pre>
            <div className="flex gap-2">
              <CopyButton value={output} toolSlug={tool.slug} toolName={tool.name} />
              <DownloadButton content={output} filename="optimized.svg" mime="image/svg+xml" label="Download SVG" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</div>
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border bg-background p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="SVG preview" className="max-h-[300px] w-auto" />
            </div>
          </div>
        </div>
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* .env parser                                                         */
/* ================================================================== */

interface EnvVar {
  key: string;
  value: string;
  line: number;
}

function parseEnv(text: string): { vars: EnvVar[]; issues: string[] } {
  const lines = text.split(/\r?\n/);
  const vars: EnvVar[] = [];
  const issues: string[] = [];
  lines.forEach((raw, index) => {
    const lineNumber = index + 1;
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      issues.push(`Line ${lineNumber}: not a valid KEY=VALUE pair.`);
      return;
    }
    const key = match[1];
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }
    vars.push({ key, value, line: lineNumber });
  });
  const seen = new Map<string, number>();
  vars.forEach((v) => {
    if (seen.has(v.key)) {
      issues.push(`Duplicate key "${v.key}" on lines ${seen.get(v.key)} and ${v.line}.`);
    } else {
      seen.set(v.key, v.line);
    }
  });
  return { vars, issues };
}

function EnvTool({ tool }: { tool: Tool }) {
  const [input, setInput] = useState('NODE_ENV=production\nPORT=3000\nAPI_KEY="sk-123"\n# keep secrets out of the repo\nNODE_ENV=development\nDATABASE_URL=postgres://user:pass@localhost/db');
  const { vars, issues } = useMemo(() => parseEnv(input), [input]);
  const normalized = vars.map((v) => `${v.key}=${v.value}`).join("\n");
  return (
    <Shell tool={tool}>
      <Panel title=".env parser" description="Validate KEY=VALUE syntax, detect duplicates and normalize formatting.">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} className="font-mono text-[13px]" />
        {issues.length > 0 && (
          <div className="space-y-1">
            {issues.map((issue, index) => (
              <p key={index} className="text-sm text-red-500">{issue}</p>
            ))}
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-auto rounded-xl border border-border bg-background">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2">Key</th>
                  <th className="px-3 py-2">Value</th>
                  <th className="px-3 py-2">Line</th>
                </tr>
              </thead>
              <tbody>
                {vars.map((v) => (
                  <tr key={`${v.key}-${v.line}`} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-1.5 font-mono text-xs font-medium text-primary">{v.key}</td>
                    <td className="max-w-[220px] truncate px-3 py-1.5 font-mono text-xs text-muted-foreground">{v.value}</td>
                    <td className="px-3 py-1.5 font-mono text-xs text-muted-foreground">{v.line}</td>
                  </tr>
                ))}
                {vars.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-center text-sm text-muted-foreground">No variables found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Normalized output</div>
            <pre className="max-h-[320px] overflow-auto rounded-xl border border-border bg-background p-4 font-mono text-xs leading-6">{normalized || "—"}</pre>
            <CopyButton value={normalized} toolSlug={tool.slug} toolName={tool.name} />
            <DownloadButton content={normalized} filename=".env.normalized" mime="text/plain" label="Download" />
          </div>
        </div>
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* HTTP status codes reference                                         */
/* ================================================================== */

interface HttpStatus {
  code: number;
  title: string;
  description: string;
  category: "1xx" | "2xx" | "3xx" | "4xx" | "5xx";
}

const HTTP_STATUSES: HttpStatus[] = [
  { code: 100, title: "Continue", description: "The server has received the request headers and the client should proceed.", category: "1xx" },
  { code: 101, title: "Switching Protocols", description: "The requester has asked the server to switch protocols.", category: "1xx" },
  { code: 200, title: "OK", description: "Standard response for successful HTTP requests.", category: "2xx" },
  { code: 201, title: "Created", description: "The request has been fulfilled and a new resource has been created.", category: "2xx" },
  { code: 202, title: "Accepted", description: "The request has been accepted for processing, but processing is not complete.", category: "2xx" },
  { code: 204, title: "No Content", description: "The server successfully processed the request but returns no content.", category: "2xx" },
  { code: 206, title: "Partial Content", description: "The server delivers only part of the resource, used by range requests.", category: "2xx" },
  { code: 301, title: "Moved Permanently", description: "The resource has been permanently moved to a new URL.", category: "3xx" },
  { code: 302, title: "Found", description: "The resource is temporarily located at a different URL.", category: "3xx" },
  { code: 304, title: "Not Modified", description: "The resource has not been modified since the last request.", category: "3xx" },
  { code: 307, title: "Temporary Redirect", description: "The resource is temporarily at another URL; method must not change.", category: "3xx" },
  { code: 308, title: "Permanent Redirect", description: "The resource is permanently at another URL; method must not change.", category: "3xx" },
  { code: 400, title: "Bad Request", description: "The request cannot be fulfilled due to bad syntax.", category: "4xx" },
  { code: 401, title: "Unauthorized", description: "Authentication is required and has failed or not been provided.", category: "4xx" },
  { code: 403, title: "Forbidden", description: "The server understood the request but refuses to authorize it.", category: "4xx" },
  { code: 404, title: "Not Found", description: "The requested resource could not be found.", category: "4xx" },
  { code: 405, title: "Method Not Allowed", description: "The HTTP method is not supported by the resource.", category: "4xx" },
  { code: 408, title: "Request Timeout", description: "The server timed out waiting for the request.", category: "4xx" },
  { code: 409, title: "Conflict", description: "The request conflicts with the current state of the resource.", category: "4xx" },
  { code: 410, title: "Gone", description: "The resource is no longer available and will not be available again.", category: "4xx" },
  { code: 413, title: "Payload Too Large", description: "The request is larger than the server is willing or able to process.", category: "4xx" },
  { code: 415, title: "Unsupported Media Type", description: "The request entity has a media type the server does not support.", category: "4xx" },
  { code: 422, title: "Unprocessable Entity", description: "The request was well-formed but contains semantic errors.", category: "4xx" },
  { code: 429, title: "Too Many Requests", description: "The user has sent too many requests in a given time.", category: "4xx" },
  { code: 500, title: "Internal Server Error", description: "A generic error message when an unexpected condition was met.", category: "5xx" },
  { code: 501, title: "Not Implemented", description: "The server does not support the functionality required.", category: "5xx" },
  { code: 502, title: "Bad Gateway", description: "The server received an invalid response from an upstream server.", category: "5xx" },
  { code: 503, title: "Service Unavailable", description: "The server is currently unavailable (overloaded or down).", category: "5xx" },
  { code: 504, title: "Gateway Timeout", description: "The upstream server did not respond in time.", category: "5xx" },
];

const HTTP_CATEGORY_COLORS: Record<HttpStatus["category"], string> = {
  "1xx": "#64748b",
  "2xx": "#22c55e",
  "3xx": "#eab308",
  "4xx": "#f97316",
  "5xx": "#ef4444",
};

function HttpStatusTool({ tool }: { tool: Tool }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HTTP_STATUSES;
    return HTTP_STATUSES.filter(
      (status) =>
        String(status.code).includes(q) ||
        status.title.toLowerCase().includes(q) ||
        status.description.toLowerCase().includes(q)
    );
  }, [query]);
  return (
    <Shell tool={tool}>
      <Panel title="HTTP status codes" description="A quick reference of the most common HTTP response statuses.">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by code or name…" />
        <div className="grid gap-2 md:grid-cols-2">
          {filtered.map((status) => (
            <div key={status.code} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
              <span
                className="rounded-lg px-2 py-0.5 font-mono text-sm font-semibold"
                style={{ background: `color-mix(in srgb, ${HTTP_CATEGORY_COLORS[status.category]} 16%, transparent)`, color: HTTP_CATEGORY_COLORS[status.category] }}
              >
                {status.code}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium">{status.title}</div>
                <p className="text-xs text-muted-foreground">{status.description}</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">No status codes match “{query}”.</p>
          )}
        </div>
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* Regex cheatsheet                                                    */
/* ================================================================== */

interface RegexItem {
  pattern: string;
  meaning: string;
  example?: string;
}

interface RegexSection {
  title: string;
  items: RegexItem[];
}

const REGEX_SECTIONS: RegexSection[] = [
  {
    title: "Character classes",
    items: [
      { pattern: "\\d", meaning: "Digit 0-9", example: "/\\d/ matches 7 in 'a7b'" },
      { pattern: "\\w", meaning: "Word character [A-Za-z0-9_]", example: "/\\w+/ matches 'devkit'" },
      { pattern: "\\s", meaning: "Whitespace (space, tab, newline)" },
      { pattern: ".", meaning: "Any character except newline", example: "/c.t/ matches 'cat'" },
      { pattern: "[abc]", meaning: "Any character in the set" },
      { pattern: "[^abc]", meaning: "Any character NOT in the set" },
      { pattern: "[a-z]", meaning: "Range from a to z" },
    ],
  },
  {
    title: "Anchors & boundaries",
    items: [
      { pattern: "^", meaning: "Start of string", example: "/^dev/ matches 'devkit'" },
      { pattern: "$", meaning: "End of string", example: "/kit$/ matches 'devkit'" },
      { pattern: "\\b", meaning: "Word boundary", example: "/\\bkit\\b/ matches 'kit' but not 'kite'" },
      { pattern: "\\B", meaning: "Non-word boundary" },
    ],
  },
  {
    title: "Quantifiers",
    items: [
      { pattern: "a*", meaning: "Zero or more of 'a'" },
      { pattern: "a+", meaning: "One or more of 'a'", example: "/bo+ matches 'boo' in 'boooo'" },
      { pattern: "a?", meaning: "Zero or one of 'a'" },
      { pattern: "a{3}", meaning: "Exactly 3 of 'a'" },
      { pattern: "a{2,4}", meaning: "Between 2 and 4 of 'a'" },
      { pattern: "a{2,}", meaning: "2 or more of 'a'" },
      { pattern: "a*?", meaning: "Lazy (non-greedy) match" },
    ],
  },
  {
    title: "Groups & alternation",
    items: [
      { pattern: "(abc)", meaning: "Capture group", example: "/^(\\d{2})/ captures area code" },
      { pattern: "(?:abc)", meaning: "Non-capturing group" },
      { pattern: "a|b", meaning: "Alternation — 'a' or 'b'" },
      { pattern: "(?<name>x)", meaning: "Named capture group" },
      { pattern: "\\1", meaning: "Backreference to group 1" },
    ],
  },
  {
    title: "Lookaround",
    items: [
      { pattern: "(?=x)", meaning: "Positive lookahead", example: "/\\d(?=px)/ digit before 'px'" },
      { pattern: "(?!x)", meaning: "Negative lookahead" },
      { pattern: "(?<=x)", meaning: "Positive lookbehind" },
      { pattern: "(?<!x)", meaning: "Negative lookbehind" },
    ],
  },
  {
    title: "Flags",
    items: [
      { pattern: "g", meaning: "Global — find all matches" },
      { pattern: "i", meaning: "Case-insensitive" },
      { pattern: "m", meaning: "Multiline — ^ and $ match line breaks" },
      { pattern: "s", meaning: "Dotall — '.' matches newlines" },
      { pattern: "u", meaning: "Unicode mode" },
      { pattern: "y", meaning: "Sticky — match only from lastIndex" },
    ],
  },
  {
    title: "Escapes & misc",
    items: [
      { pattern: "\\n", meaning: "Newline" },
      { pattern: "\\t", meaning: "Tab" },
      { pattern: "\\", meaning: "Escape a metacharacter", example: "/\\./ matches a literal dot" },
      { pattern: "\\p{L}", meaning: "Any letter (with u flag)" },
      { pattern: "$&", meaning: "Matched text in replacement strings" },
      { pattern: "\\x{1F600}", meaning: "Unicode code point (with u flag)" },
    ],
  },
];

function RegexCheatsheetTool({ tool }: { tool: Tool }) {
  return (
    <Shell tool={tool}>
      <Panel title="Regular expression cheatsheet" description="Common patterns, syntax and flags with examples.">
        <div className="grid gap-6 lg:grid-cols-2">
          {REGEX_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.title}</div>
              <div className="overflow-hidden rounded-xl border border-border bg-background">
                {section.items.map((item, index) => (
                  <div key={item.pattern} className={`flex items-center gap-3 p-3 ${index > 0 ? "border-t border-border/60" : ""}`}>
                    <code className="min-w-[90px] shrink-0 rounded-lg border border-border bg-card px-2 py-1 font-mono text-xs text-primary">{item.pattern}</code>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm">{item.meaning}</div>
                      {item.example && <div className="truncate text-xs text-muted-foreground">{item.example}</div>}
                    </div>
                    <CopyButton value={item.pattern} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* Image converter                                                     */
/* ================================================================== */

interface ImageMeta {
  name: string;
  size: number;
  width: number;
  height: number;
  preview: string;
}

const IMAGE_FORMATS = [
  { id: "image/jpeg", label: "JPEG", ext: "jpg" },
  { id: "image/png", label: "PNG", ext: "png" },
  { id: "image/webp", label: "WebP", ext: "webp" },
  { id: "image/gif", label: "GIF", ext: "gif" },
];

const CHECKERBOARD =
  "linear-gradient(45deg, rgba(148,163,184,.25) 25%, transparent 25%), linear-gradient(-45deg, rgba(148,163,184,.25) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(148,163,184,.25) 75%), linear-gradient(-45deg, transparent 75%, rgba(148,163,184,.25) 75%)";

function ImageConvertTool({ tool }: { tool: Tool }) {
  const [src, setSrc] = useState<HTMLImageElement | null>(null);
  const [meta, setMeta] = useState<ImageMeta | null>(null);
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [lockAspect, setLockAspect] = useState(true);
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(85);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [result, setResult] = useState<{ url: string; mime: string; size: number; width: number; height: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const aspect = meta && meta.height > 0 ? meta.width / meta.height : 1;

  const onFile = async (file?: File) => {
    if (!file) return;
    setError("");
    try {
      const loaded = await loadImageFromFile(file);
      setSrc(loaded.img);
      setMeta({ name: loaded.name, size: loaded.size, width: loaded.width, height: loaded.height, preview: loaded.dataUrl });
      setWidthInput(String(loaded.width));
      setHeightInput(String(loaded.height));
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load image");
    }
  };

  const onWidthChange = (value: string) => {
    setWidthInput(value);
    if (lockAspect) {
      const n = parseInt(value, 10);
      if (!Number.isNaN(n) && n > 0) setHeightInput(String(Math.max(1, Math.round(n / aspect))));
    }
  };
  const onHeightChange = (value: string) => {
    setHeightInput(value);
    if (lockAspect) {
      const n = parseInt(value, 10);
      if (!Number.isNaN(n) && n > 0) setWidthInput(String(Math.max(1, Math.round(n * aspect))));
    }
  };

  const convert = async () => {
    if (!src || !meta) return;
    setBusy(true);
    setError("");
    try {
      const parsedW = parseInt(widthInput, 10);
      const parsedH = parseInt(heightInput, 10);
      const width = Number.isNaN(parsedW) || parsedW <= 0 ? meta.width : Math.min(parsedW, 8000);
      const height = Number.isNaN(parsedH) || parsedH <= 0 ? meta.height : Math.min(parsedH, 8000);
      const canvas = renderToCanvas(src, width, height, format === "image/jpeg" ? bgColor : undefined);
      const blob = await canvasToBlob(canvas, format, format === "image/png" || format === "image/gif" ? undefined : quality / 100);
      const url = await blobToDataUrl(blob);
      setResult({ url, mime: format, size: blob.size, width, height });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
      setResult(null);
    } finally {
      setBusy(false);
    }
  };

  const formatMeta = IMAGE_FORMATS.find((f) => f.id === format);
  const downloadName = `devkit-${(meta?.name ?? "image").replace(/\.[^.]+$/, "")}.${formatMeta?.ext ?? "png"}`;

  return (
    <Shell tool={tool}>
      <Panel title="Image converter" description="Change format, resize and tune quality — all in your browser.">
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          <Icon icon="lucide:upload" className="size-4" />
          {meta ? "Change image" : "Upload image"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {meta && (
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoTile label="File" value={meta.name} />
            <InfoTile label="Size" value={prettyBytes(meta.size)} />
            <InfoTile label="Dimensions" value={`${meta.width} × ${meta.height}px`} />
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <SectionLabel icon="lucide:scan" label="Target format" />
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="mt-1 w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {IMAGE_FORMATS.map((f) => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {(format === "image/jpeg" || format === "image/webp") && (
              <div>
                <SectionLabel icon="lucide:sliders-horizontal" label={`Quality: ${quality}%`} />
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="mt-1 w-full accent-[var(--primary)]"
                />
              </div>
            )}
            {format === "image/jpeg" && (
              <div className="flex items-center gap-3">
                <div>
                  <SectionLabel icon="lucide:palette" label="Background" />
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="mt-1 size-9 cursor-pointer rounded-lg border border-border bg-transparent p-1" />
                </div>
                <p className="text-xs text-muted-foreground">JPEG has no alpha channel, so transparent pixels are filled with this color.</p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <SectionLabel icon="lucide:scaling" label="Resize (optional)" />
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Width px</div>
                <Input value={widthInput} onChange={(e) => onWidthChange(e.target.value)} className="w-28 font-mono" inputMode="numeric" />
              </div>
              <span className="pb-1 text-muted-foreground">×</span>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Height px</div>
                <Input value={heightInput} onChange={(e) => onHeightChange(e.target.value)} className="w-28 font-mono" inputMode="numeric" />
              </div>
              <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={lockAspect}
                  onChange={(e) => setLockAspect(e.target.checked)}
                  className="size-4 accent-[var(--primary)]"
                />
                Lock
              </label>
            </div>
            <Button onClick={convert} disabled={!src || busy}>{busy ? "Converting…" : "Convert"}</Button>
          </div>
        </div>
        {result && meta && (
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-border bg-background p-3">
              <Image src={result.url} alt="Converted image preview" width={result.width} height={result.height} unoptimized className="max-h-[340px] w-auto object-contain" />
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <InfoTile label="Output size" value={prettyBytes(result.size)} />
                <InfoTile label="Dimensions" value={`${result.width} × ${result.height}px`} />
                <InfoTile label="Format" value={formatMeta?.label ?? "image"} />
                <InfoTile
                  label="Saved"
                  value={result.size < meta.size ? `−${prettyBytes(meta.size - result.size)}` : "—"}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton value={result.url} toolSlug={tool.slug} toolName={tool.name} label="Copied data URI" />
                <Button variant="outline" onClick={() => downloadDataUrl(result.url, downloadName)}>Download</Button>
              </div>
            </div>
          </div>
        )}
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* Image compressor                                                    */
/* ================================================================== */

function ImageCompressTool({ tool }: { tool: Tool }) {
  const [src, setSrc] = useState<HTMLImageElement | null>(null);
  const [meta, setMeta] = useState<ImageMeta | null>(null);
  const [format, setFormat] = useState("image/webp");
  const [quality, setQuality] = useState(75);
  const [scale, setScale] = useState(100);
  const [result, setResult] = useState<{ url: string; size: number; width: number; height: number } | null>(null);
  const [error, setError] = useState("");
  const debouncedQuality = useDebounce(quality, 250);
  const debouncedScale = useDebounce(scale, 250);
  const debouncedFormat = useDebounce(format, 150);

  useEffect(() => {
    if (!src || !meta) return;
    let active = true;
    (async () => {
      try {
        const width = Math.max(1, Math.round((meta.width * debouncedScale) / 100));
        const height = Math.max(1, Math.round((meta.height * debouncedScale) / 100));
        const canvas = renderToCanvas(src, width, height);
        const blob = await canvasToBlob(canvas, debouncedFormat, debouncedFormat === "image/png" ? undefined : debouncedQuality / 100);
        const url = await blobToDataUrl(blob);
        if (!active) return;
        setResult({ url, size: blob.size, width, height });
        setError("");
      } catch {
        if (active) setResult(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [src, meta, debouncedQuality, debouncedScale, debouncedFormat]);

  const onFile = async (file?: File) => {
    if (!file) return;
    setError("");
    try {
      const loaded = await loadImageFromFile(file);
      setSrc(loaded.img);
      setMeta({ name: loaded.name, size: loaded.size, width: loaded.width, height: loaded.height, preview: loaded.dataUrl });
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load image");
    }
  };

  const savings = meta && result ? meta.size - result.size : 0;
  const savingsPct = meta && result && meta.size > 0 ? Math.round((savings / meta.size) * 100) : 0;

  return (
    <Shell tool={tool}>
      <Panel title="Image compressor" description="Re-encode with live quality and scale controls plus size comparison.">
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          <Icon icon="lucide:file-archive" className="size-4" />
          {meta ? "Change image" : "Upload image"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {meta && (
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoTile label="File" value={meta.name} />
            <InfoTile label="Original size" value={prettyBytes(meta.size)} />
            <InfoTile label="Dimensions" value={`${meta.width} × ${meta.height}px`} />
          </div>
        )}
        {meta && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div>
                <SectionLabel icon="lucide:scan" label="Output format" />
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="mt-1 w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/webp">WebP</SelectItem>
                    <SelectItem value="image/jpeg">JPEG</SelectItem>
                    <SelectItem value="image/png">PNG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <SectionLabel icon="lucide:sliders-horizontal" label={`Quality: ${quality}%`} />
                <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="mt-1 w-full accent-[var(--primary)]" />
              </div>
              <div>
                <SectionLabel icon="lucide:scaling" label={`Scale: ${scale}%`} />
                <input type="range" min={25} max={100} step={5} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="mt-1 w-full accent-[var(--primary)]" />
              </div>
              {result && (
                <p className="text-xs text-muted-foreground">
                  Compressed to {result.width} × {result.height}px.
                </p>
              )}
            </div>
            <div className="space-y-3">
              {result && meta && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoTile label="Compressed" value={prettyBytes(result.size)} />
                    <InfoTile label="Saved" value={savings > 0 ? `−${prettyBytes(savings)}` : "0 B"} />
                  </div>
                  <Badge variant={savingsPct > 0 ? "success" : "outline"}>
                    {savingsPct > 0 ? `${savingsPct}% smaller` : "Not smaller"}
                  </Badge>
                  <Button variant="outline" onClick={() => downloadDataUrl(result.url, `devkit-compressed.${format === "image/webp" ? "webp" : format === "image/jpeg" ? "jpg" : "png"}`)}>
                    Download compressed
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
        {result && (
          <div className="overflow-hidden rounded-2xl border border-border bg-background p-3">
            <Image src={result.url} alt="Compressed image preview" width={result.width} height={result.height} unoptimized className="mx-auto max-h-[340px] w-auto object-contain" />
          </div>
        )}
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* Background remover                                                  */
/* ================================================================== */

interface BgRemoverProgress {
  key: string;
  current: number;
  total: number;
}

function BgRemoverTool({ tool }: { tool: Tool }) {
  const [source, setSource] = useState<{ name: string; size: number; url: string } | null>(null);

  const [progress, setProgress] = useState<BgRemoverProgress | null>(null);
  const [result, setResult] = useState<{ url: string; blob: Blob; size: number } | null>(null);
  const [error, setError] = useState("");
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const onFile = async (file?: File) => {
    if (!file) return;
    setError("");
    setResult(null);
    setProgress(null);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setSource({ name: file.name, size: file.size, url });
    await runRemoval(url);
  };

  const runRemoval = async (url: string) => {
    setProgress({ key: "loading", current: 0, total: 100 });
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(url, {
        output: { format: "image/png" },
        progress: (key, current, total) => {
          if (key.startsWith("fetch:")) {
            setProgress({ key, current, total });
          } else if (key.startsWith("compute:")) {
            setProgress({ key, current: current + 1, total });
          }
        },
      });
      const outUrl = URL.createObjectURL(blob);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = outUrl;
      setResult({ url: outUrl, blob, size: blob.size });
      setProgress(null);
    } catch (err) {
      setProgress(null);
      setError(err instanceof Error ? err.message : "Failed to remove background.");
    }
  };

  const reset = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setSource(null);
    setResult(null);
    setProgress(null);
    setError("");
  };

  const progressPct = progress
    ? progress.total > 0
      ? Math.min(100, Math.round((progress.current / progress.total) * 100))
      : 0
    : 0;
  const isFetching = progress?.key.startsWith("fetch:") ?? false;
  const stageLabel = !progress
    ? ""
    : isFetching
      ? "Downloading AI model…"
      : "Removing background…";

  return (
    <Shell tool={tool}>
      <Panel title="Background remover" description="AI-powered removal that runs entirely in your browser. No upload to any server.">
        {!source && (
          <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-ring/50 hover:text-foreground">
            <Icon icon="lucide:wand-2" className="size-4" />
            Upload image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {source && !result && !error && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile label="File" value={source.name} />
              <InfoTile label="Original size" value={prettyBytes(source.size)} />
            </div>
            <div className="flex items-center justify-center overflow-auto rounded-2xl border border-border bg-card p-3" style={{ backgroundImage: CHECKERBOARD, backgroundSize: 24 }}>
              <Image src={source.url} alt="Source image" width={0} height={0} unoptimized className="max-h-[320px] w-auto" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Icon icon="lucide:loader-2" className="size-4 animate-spin" />
                  {stageLabel}
                </span>
                <span className="tabular-nums text-muted-foreground">{progressPct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        )}
        {result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile label="File" value={source?.name ?? "image"} />
              <InfoTile label="Output size" value={prettyBytes(result.size)} />
            </div>
            <div className="flex items-center justify-center overflow-auto rounded-2xl border border-border bg-card p-3" style={{ backgroundImage: CHECKERBOARD, backgroundSize: 24 }}>
              <Image src={result.url} alt="Background removed" width={0} height={0} unoptimized className="max-h-[320px] w-auto" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => downloadImageBlob(result.blob, (source?.name ?? "image").replace(/\.[^.]+$/, "") + "-bg-removed.png")}>
                Download PNG
              </Button>
              <Button variant="outline" onClick={reset}>
                Remove another image
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The model only runs on your device; the input never leaves this tab.
            </p>
          </div>
        )}
      </Panel>
    </Shell>
  );
}

/* ================================================================== */
/* Registration                                                       */
/* ================================================================== */

export function ExtraToolView({ slug, tool }: { slug: string; tool: Tool }) {
  switch (slug) {
    case "html-formatter":
      return <HtmlCssTool tool={tool} />;
    case "sql-formatter":
      return <SqlTool tool={tool} />;
    case "cron-builder":
      return <CronTool tool={tool} />;
    case "file-checksum":
      return <FileChecksumTool tool={tool} />;
    case "csv-json":
      return <CsvJsonTool tool={tool} />;
    case "json-to-typescript":
      return <JsonTsTool tool={tool} />;
    case "jwt-generator":
      return <JwtSignerTool tool={tool} />;
    case "bcrypt-generator":
      return <BcryptTool tool={tool} />;
    case "text-stats":
      return <TextStatsTool tool={tool} />;
    case "url-builder":
      return <UrlBuilderTool tool={tool} />;
    case "unicode-inspector":
      return <UnicodeTool tool={tool} />;
    case "unit-converter":
      return <UnitConvertTool tool={tool} />;
    case "svg-optimizer":
      return <SvgTool tool={tool} />;
    case "env-parser":
      return <EnvTool tool={tool} />;
    case "http-status":
      return <HttpStatusTool tool={tool} />;
    case "regex-cheatsheet":
      return <RegexCheatsheetTool tool={tool} />;
    case "image-converter":
      return <ImageConvertTool tool={tool} />;
    case "image-compressor":
      return <ImageCompressTool tool={tool} />;
    case "bg-remover":
      return <BgRemoverTool tool={tool} />;
    default:
      return null;
  }
}
