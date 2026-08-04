/* ---------- Tool metadata (admin-managed) ---------- */

export type ToolCategory =
  | "conversion"
  | "crypto"
  | "data"
  | "network"
  | "text"
  | "web"
  | "visual"
  | "developer";

export interface ToolCategoryMeta {
  id: ToolCategory;
  label: string;
  description: string;
}

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  popular?: boolean;
  featured?: boolean;
  accent: string;
  docs?: string;
}

export interface ToolWithMeta extends Tool {
  accent: string;
}

/* ---------- Content blocks ---------- */

export interface Snippet {
  id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  code: string;
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
}

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  sections: DocSection[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  highlights: string[];
}

export interface FaqItem {
  q: string;
  a: string;
}

/* ---------- Runtime / preferences ---------- */

export interface Settings {
  theme: "light" | "dark";
  reduceMotion: boolean;
  compactMode: boolean;
  historyLimit: number;
}

export type ToastType = "copy" | "success" | "error" | "info";

export interface HistoryItem {
  toolSlug: string;
  toolName: string;
  at: number;
}

export interface CopyHistoryItem {
  toolSlug: string;
  toolName: string;
  preview: string;
  at: number;
}
