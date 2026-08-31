import { md5 } from "js-md5";
import { diffLines, diffWords, type Change } from "diff";
import type { Tool } from "@/types";
import { bytesToBase64, formatDate } from "@/lib/utils";

export function base64Encode(input: string): string {
  return bytesToBase64(new TextEncoder().encode(input));
}

export function base64Decode(input: string): string {
  const normalized = input.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeBase64Url(input: string): string {
  return base64Encode(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  return base64Decode(base64);
}

export function safeJsonParse(value: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(value) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Invalid JSON" };
  }
}

export function formatUnixTime(value: number): string {
  if (!Number.isFinite(value)) return "Invalid";
  const date = new Date(value < 1e12 ? value * 1000 : value);
  return `${formatDate(date)} (${date.toLocaleString("en-US", { timeZoneName: "short" })})`;
}

export function jwtStatus(exp?: number, nbf?: number): { label: string; variant: "success" | "warning" | "danger" | "info" } {
  const now = Math.floor(Date.now() / 1000);
  if (typeof nbf === "number" && nbf > now) return { label: "Not yet valid", variant: "warning" };
  if (typeof exp === "number" && exp <= now) return { label: "Expired", variant: "danger" };
  if (typeof exp === "number") {
    const remaining = exp - now;
    if (remaining < 3600) return { label: "Expiring soon", variant: "warning" };
  }
  return { label: "Active", variant: "success" };
}

export function shaDigest(text: string, algorithm: "SHA-1" | "SHA-256"): Promise<string> {
  return crypto.subtle.digest(algorithm, new TextEncoder().encode(text)).then((buffer) =>
    Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
  );
}

export function md5Digest(text: string): string {
  return md5(text);
}

export function randomUuid(): string {
  return crypto.randomUUID();
}

export function generatePasswords({
  length,
  upper,
  lower,
  numbers,
  symbols,
}: {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
}): string {
  const pools = [
    upper && "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower && "abcdefghijklmnopqrstuvwxyz",
    numbers && "0123456789",
    symbols && "!@#$%^&*()-_=+[]{};:,.?/|~",
  ].filter(Boolean) as string[];

  if (pools.length === 0) return "";
  const all = pools.join("");
  const chars = pools.map((pool) => pool[Math.floor(Math.random() * pool.length)]);
  while (chars.length < length) {
    chars.push(all[Math.floor(Math.random() * all.length)]);
  }
  return chars
    .sort(() => Math.random() - 0.5)
    .slice(0, length)
    .join("");
}

export function strengthScore(password: string): { label: string; score: number } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return {
    score,
    label: ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"][score] ?? "Very weak",
  };
}

export function createLorem({
  paragraphs,
  sentencesPerParagraph,
}: {
  paragraphs: number;
  sentencesPerParagraph: number;
}): string {
  const words = [
    "adaptive",
    "binary",
    "cache",
    "component",
    "dashboard",
    "engine",
    "framework",
    "gradient",
    "hash",
    "interface",
    "latency",
    "module",
    "pipeline",
    "query",
    "render",
    "signal",
    "token",
    "utility",
    "vector",
    "workflow",
  ];
  const sentence = () => {
    const count = 8 + Math.floor(Math.random() * 8);
    const tokens = Array.from({ length: count }, () => words[Math.floor(Math.random() * words.length)]);
    const text = tokens.join(" ");
    return text.charAt(0).toUpperCase() + text.slice(1) + ".";
  };
  return Array.from({ length: paragraphs }, () =>
    Array.from({ length: sentencesPerParagraph }, sentence).join(" ")
  ).join("\n\n");
}

export function convertCase(input: string) {
  const parts = input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.toLowerCase());
  const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
  return {
    words: parts.join(" "),
    camel: parts.map((part, index) => (index === 0 ? part : capitalize(part))).join(""),
    pascal: parts.map(capitalize).join(""),
    snake: parts.join("_"),
    kebab: parts.join("-"),
    title: parts.map(capitalize).join(" "),
    upper: parts.join(" ").toUpperCase(),
    lower: parts.join(" ").toLowerCase(),
  };
}

export function compareText(left: string, right: string) {
  return diffLines(left, right);
}

export function compareTextAdvanced(
  left: string,
  right: string,
  options: { mode?: "line" | "word"; ignoreWhitespace?: boolean; ignoreCase?: boolean } = {}
): Change[] {
  const { mode = "line", ignoreWhitespace = false, ignoreCase = false } = options;
  if (mode === "word") {
    return diffWords(left, right, { ignoreCase });
  }
  return diffLines(left, right, { ignoreWhitespace });
}

export function jsonSummary(value: unknown): { objects: number; arrays: number; strings: number; numbers: number; booleans: number; nulls: number } {
  const summary = { objects: 0, arrays: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0 };
  const walk = (item: unknown) => {
    if (Array.isArray(item)) {
      summary.arrays += 1;
      item.forEach(walk);
      return;
    }
    if (item === null) {
      summary.nulls += 1;
      return;
    }
    switch (typeof item) {
      case "object":
        summary.objects += 1;
        Object.values(item as Record<string, unknown>).forEach(walk);
        break;
      case "string":
        summary.strings += 1;
        break;
      case "number":
        summary.numbers += 1;
        break;
      case "boolean":
        summary.booleans += 1;
        break;
    }
  };
  walk(value);
  return summary;
}

export function jwtDecode(input: string) {
  const parts = input.trim().split(".");
  if (parts.length !== 3) throw new Error("JWT must contain three segments.");
  const decodeSegment = (segment: string) => JSON.parse(decodeBase64Url(segment));
  return {
    header: decodeSegment(parts[0]),
    payload: decodeSegment(parts[1]),
    signature: parts[2],
  };
}

export function toolLabel(tool: Tool | undefined): string {
  return tool ? tool.name : "DevKit";
}
