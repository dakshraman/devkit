/* ================================================================== */
/* tool-helpers.ts — Shared utilities extracted from:                  */
/*   - features/tools/tool-views.tsx                                  */
/*   - features/tools/extra-tools.tsx                                 */
/* ================================================================== */

import { useMemo } from "react";
import Prism from "prismjs";
import { formatBytes } from "@/lib/utils";
import { encodeBase64Url } from "@/lib/tool-utils";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface EnvVar {
  key: string;
  value: string;
  line: number;
}

export interface ImageMeta {
  name: string;
  size: number;
  width: number;
  height: number;
  preview: string;
}

export interface JsonValueProps {
  value: unknown;
  path: string;
  expanded: Set<string>;
  onToggle: (path: string) => void;
}

// ===================================================================
// From tool-views.tsx
// ===================================================================

export function usePrismHtml(code: string, language: string) {
  return useMemo(() => {
    const grammar = Prism.languages[language as keyof typeof Prism.languages];
    if (!grammar) return code;
    return Prism.highlight(code, grammar, language);
  }, [code, language]);
}

export function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function prettyJson(text: string) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return null;
  }
}

export function contrastText(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#fff";
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.6 ? "#111827" : "#fff";
}

export function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const match = normalized.match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;
  return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) };
}

export function rgbToHsl(r: number, g: number, b: number) {
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

export function imageBase64ToDataUrl(raw: string): string {
  const text = raw.trim();
  if (!text) return "";
  if (text.startsWith("data:image/") && text.includes(",")) return text;
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

export const EXTRA_SLUGS = [
  "html-formatter", "sql-formatter", "cron-builder", "file-checksum",
  "csv-json", "json-to-typescript", "jwt-generator", "bcrypt-generator",
  "text-stats", "url-builder", "unicode-inspector", "unit-converter",
  "svg-optimizer", "env-parser", "http-status", "regex-cheatsheet",
  "image-converter", "image-compressor", "bg-remover", "temp-mail",
  "json-viewer", "color-contrast", "ip-dns", "ascii-art",
] as const;

export const REGEX_PRESETS = [
  { label: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
  { label: "URL", pattern: "https?://[^\\s/$.?#].[^\\s]*" },
  { label: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  { label: "Phone (US)", pattern: "\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}" },
  { label: "Semver", pattern: "\\d+\\.\\d+\\.\\d+" },
  { label: "Hex Color", pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b" },
];

// ===================================================================
// From extra-tools.tsx
// ===================================================================

export function prettyBytes(bytes: number): string {
  return formatBytes(bytes);
}

// --- HTML / CSS formatting ---

function indentText(level: number): string {
  return "  ".repeat(level);
}

export function formatHtmlPretty(html: string): string {
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
      if (voidElements.has(tag)) { out += indentText(depth) + open + "\n"; return; }
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

export function minifyHtml(html: string): string {
  return html.replace(/<\?xml[\s\S]*?\?>/g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();
}

export function formatCssPretty(css: string): string {
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();
  let depth = 0;
  let out = "";
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === "{") { out += " {\n" + indentText(depth + 1); depth += 1; }
    else if (ch === "}") {
      out = out.replace(/[ \t]*\n?$/, "");
      depth = Math.max(0, depth - 1);
      out += "\n" + indentText(depth) + "}";
      const next = cleaned[i + 1];
      if (next === ",") out += ",";
      else out += "\n" + indentText(depth);
    } else if (ch === ";") { out += ";\n" + indentText(depth); }
    else { out += ch; }
  }
  return out.replace(/\n+$/, "\n");
}

export function minifyCss(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}:;,])\s*/g, "$1").trim();
}

// --- Cron ---

type CronField = Set<number>;

export function parseCronField(raw: string, max: number): CronField | null {
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

export function cronMatches(expr: string, date: Date): boolean {
  const fields = expr.trim().split(/\s+/);
  if (fields.length !== 5) return false;
  const minutes = parseCronField(fields[0], 59);
  const hours = parseCronField(fields[1], 23);
  const dom = parseCronField(fields[2], 31);
  const months = parseCronField(fields[3], 12);
  const dow = parseCronField(fields[4], 6);
  if (!minutes || !hours || !dom || !months || !dow) return false;
  return minutes.has(date.getMinutes()) && hours.has(date.getHours()) && dom.has(date.getDate()) && months.has(date.getMonth() + 1) && dow.has(date.getDay());
}

export function cronNextRuns(expr: string, count: number): Date[] {
  const runs: Date[] = [];
  const now = new Date(Date.now());
  now.setSeconds(0, 0);
  const cursor = new Date(now.getTime());
  const deadline = cursor.getTime() + 5 * 366 * 24 * 60 * 60 * 1000;
  while (runs.length < count && cursor.getTime() < deadline) {
    if (cronMatches(expr, cursor)) runs.push(new Date(cursor.getTime()));
    cursor.setTime(cursor.getTime() + 60_000);
  }
  return runs;
}

export const CRON_PRESETS = [
  { label: "Every minute", expr: "* * * * *" },
  { label: "Every 5 minutes", expr: "*/5 * * * *" },
  { label: "Every hour", expr: "0 * * * *" },
  { label: "Every day at midnight", expr: "0 0 * * *" },
  { label: "Every Monday 9am", expr: "0 9 * * 1" },
  { label: "Weekdays 9-5 hourly", expr: "0 9-17 * * 1-5" },
  { label: "1st of month at noon", expr: "0 12 1 * *" },
];

// --- File checksum ---

export function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

// --- CSV <-> JSON ---

export function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i += 1; } else { inQuotes = false; } }
      else { field += ch; }
    } else if (ch === '"') { inQuotes = true; }
    else if (ch === delimiter) { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field); field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else { field += ch; }
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

function escapeCsvCell(value: string, delimiter: string): string {
  if (/[",\n\r]/.test(value) || value.includes(delimiter)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function csvToJsonText(text: string, delimiter: string): string {
  const rows = parseCsv(text, delimiter);
  if (rows.length < 2) throw new Error("CSV needs a header row and at least one data row.");
  const headers = rows[0].map((h) => h.trim() || "column");
  const records = rows.slice(1).map((cells) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => { record[header] = cells[index] ?? ""; });
    return record;
  });
  return JSON.stringify(records, null, 2);
}

export function jsonToCsvText(json: string, delimiter: string): string {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("JSON must be a non-empty array of objects.");
  const headers = Array.from(parsed.reduce<Set<string>>((acc, item) => { Object.keys(item as object).forEach((key) => acc.add(key)); return acc; }, new Set<string>()));
  const lines = [headers.join(delimiter)];
  parsed.forEach((item) => { lines.push(headers.map((header) => escapeCsvCell(String((item as Record<string, unknown>)[header] ?? ""), delimiter)).join(delimiter)); });
  return lines.join("\n");
}

// --- JSON -> TypeScript ---

export function tsTypeName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9]+/g, " ").split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  if (!cleaned) return "Root";
  if (/^\d/.test(cleaned)) return `T${cleaned}`;
  return cleaned;
}

export function inferTsType(value: unknown, name: string, interfaces: string[], seen: Map<object, string>): string {
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
      const body = fields.map(([key, fieldValue]) => {
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
        const optional = fieldValue === null || fieldValue === undefined ? "?" : "";
        return `  ${safeKey}${optional}: ${inferTsType(fieldValue, `${typeName}${tsTypeName(key)}`, interfaces, seen)};`;
      }).join("\n");
      interfaces.push(`export interface ${typeName} {\n${body}\n}`);
      return typeName;
    }
    default: return "unknown";
  }
}

export function jsonToTsText(jsonText: string, rootName: string): string {
  const parsed = JSON.parse(jsonText);
  const interfaces: string[] = [];
  const seen = new Map<object, string>();
  const root = inferTsType(parsed, rootName, interfaces, seen);
  if (!/^[\w$]+$/.test(root) || !interfaces.some((i) => i.startsWith(`export interface ${root}`))) {
    interfaces.push(`export interface ${tsTypeName(rootName)} {\n  value: ${root};\n}`);
  }
  return interfaces.join("\n\n") + "\n";
}

// --- HMAC signing ---

export function hmacSign(secret: string, data: string, algorithm: "HS256" | "HS384" | "HS512"): Promise<string> {
  const encoder = new TextEncoder();
  const hash = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" }[algorithm];
  return crypto.subtle
    .importKey("raw", encoder.encode(secret), { name: "HMAC", hash: { name: hash } }, false, ["sign"])
    .then((key) => crypto.subtle.sign("HMAC", key, encoder.encode(data)))
    .then((buffer) => encodeBase64Url(Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join("")));
}

// --- .env parser ---

export function parseEnv(text: string): { vars: EnvVar[]; issues: string[] } {
  const lines = text.split(/\r?\n/);
  const vars: EnvVar[] = [];
  const issues: string[] = [];
  lines.forEach((raw, index) => {
    const lineNumber = index + 1;
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) { issues.push(`Line ${lineNumber}: not a valid KEY=VALUE pair.`); return; }
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"') && value.length >= 2) || (value.startsWith("'") && value.endsWith("'") && value.length >= 2)) value = value.slice(1, -1);
    vars.push({ key, value, line: lineNumber });
  });
  const seen = new Map<string, number>();
  vars.forEach((v) => {
    if (seen.has(v.key)) issues.push(`Duplicate key "${v.key}" on lines ${seen.get(v.key)} and ${v.line}.`);
    else seen.set(v.key, v.line);
  });
  return { vars, issues };
}

// --- SVG optimizer ---

export function minifySvg(svg: string): string {
  return svg.replace(/<\?xml[\s\S]*?\?>/g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").replace(/^\s+|\s+$/g, "");
}

// --- Color contrast ---

export function contrastRatio(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const raw = hex.replace("#", "");
    const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
    const channels = [0, 2, 4].map((i) => {
      const c = parseInt(full.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

// --- Temp mail ---

export const MAILTM_API = "https://api.mail.tm";

export interface MailAccount { address: string; token: string; password: string; }
export interface MailSummary { id: string; from: { address: string; name: string }; subject: string; intro: string; seen: boolean; hasAttachments: boolean; createdAt: string; }
export interface MailDetail extends MailSummary { text: string; html: string; attachments?: { id: string; filename: string; contentType: string; size: number; downloadUrl: string }[]; }

export function randomChars(length: number, alphabet: string): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export function formatMailDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

export async function mailApi<T>(path: string, opts?: { method?: string; token?: string; body?: Record<string, unknown> }): Promise<T> {
  const proxyUrl = `/api/mail${path}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts?.token) headers["x-mail-token"] = opts.token;
  const res = await fetch(proxyUrl, {
    method: opts?.method ?? "GET",
    headers,
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw new Error(`mail.tm error (${res.status})`);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function downloadAttachment(acc: MailAccount, att: { downloadUrl: string; filename: string }): Promise<void> {
  const proxyUrl = `/api/mail${att.downloadUrl}`;
  const res = await fetch(proxyUrl, { headers: { "x-mail-token": acc.token } });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = att.filename;
  a.click();
  URL.revokeObjectURL(url);
}
