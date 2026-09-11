import { randomUuid } from "@/lib/tool-utils";

export interface KeyValueRow {
  key: string;
  value: string;
}

export interface AuthState {
  type: "none" | "bearer" | "basic" | "apikey";
  token?: string;
  username?: string;
  password?: string;
  key?: string;
  value?: string;
  in?: "header" | "query";
}

export interface FlatRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: KeyValueRow[];
  query: KeyValueRow[];
  body: string;
  bodyMode: "raw" | "urlencoded";
  auth: AuthState;
}

export interface PcCollection {
  info?: { name?: string; _postman_id?: string; schema?: string };
  item?: PcItem[];
  variable?: { key?: string; value?: string }[];
}

export interface PcItem {
  name?: string;
  request?: PcRequest;
  item?: PcItem[];
}

export interface PcRequest {
  method?: string;
  url?: string | PcUrl;
  header?: PcHeader[];
  body?: PcBody;
  auth?: PcAuth;
}

export interface PcUrl {
  raw?: string;
  protocol?: string;
  host?: string[];
  path?: string[];
  query?: { key?: string; value?: string; disabled?: boolean }[];
  variable?: { key?: string; value?: string }[];
}

export interface PcHeader {
  key?: string;
  value?: string;
  disabled?: boolean;
  type?: string;
}

export interface PcBody {
  mode?: string;
  raw?: string;
  urlencoded?: PcHeader[];
  formdata?: PcHeader[];
}

export interface PcAuth {
  type?: string;
  bearer?: Record<string, string>[];
  basic?: Record<string, string>[];
  apikey?: { key?: string; value?: string; in?: string }[];
}

export const METHOD_STYLES: Record<string, string> = {
  GET: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  POST: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  PUT: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  PATCH: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  DELETE: "bg-red-500/10 text-red-600 dark:text-red-400",
  HEAD: "bg-zinc-500/10 text-muted-foreground",
  OPTIONS: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
};

export function substituteVariables(value: string, vars: Record<string, string>): string {
  return value.replace(/\{\{([^{}]+)\}\}/g, (match, key: string) => vars[key] ?? match);
}

export function postmanUrlToString(url: PcUrl | string | undefined): string {
  if (!url) return "";
  if (typeof url === "string") return url;
  if (url.raw) return url.raw;
  const protocol = url.protocol ?? "https";
  const host = Array.isArray(url.host) ? url.host.join(".") : "";
  const path = Array.isArray(url.path) ? `/${url.path.join("/")}` : "";
  const query = (url.query ?? [])
    .filter((q) => !q.disabled)
    .map((q) => `${q.key}=${q.value ?? ""}`)
    .join("&");
  return `${protocol}://${host}${path}${query ? `?${query}` : ""}`;
}

export function parsePostmanAuth(auth?: PcAuth): AuthState {
  if (!auth || auth.type === "noauth") return { type: "none" };
  if (auth.type === "bearer") {
    const token = auth.bearer?.[0]?.token ?? "";
    return token ? { type: "bearer", token } : { type: "none" };
  }
  if (auth.type === "basic") {
    const username = auth.basic?.[0]?.username ?? "";
    const password = auth.basic?.[0]?.password ?? "";
    return username || password ? { type: "basic", username, password } : { type: "none" };
  }
  if (auth.type === "apikey") {
    const cfg = auth.apikey?.[0];
    if (!cfg?.key) return { type: "none" };
    return { type: "apikey", key: cfg.key, value: cfg.value ?? "", in: cfg.in === "query" ? "query" : "header" };
  }
  return { type: "none" };
}

export function parsePostmanRequest(req: PcRequest, name: string, collectionVars: Record<string, string> = {}): FlatRequest {
  const vars: Record<string, string> = { ...collectionVars };
  const urlObj = typeof req.url === "string" ? null : req.url;
  (urlObj?.variable ?? []).forEach((v) => {
    if (v.key) vars[v.key] = v.value ?? "";
  });
  const url = substituteVariables(postmanUrlToString(req.url), vars);
  const headers = (req.header ?? [])
    .filter((h) => !h.disabled && h.key)
    .map((h) => ({ key: substituteVariables(h.key ?? "", vars), value: substituteVariables(h.value ?? "", vars) }));
  const query = (urlObj?.query ?? [])
    .filter((q) => !q.disabled && q.key)
    .map((q) => ({ key: substituteVariables(q.key ?? "", vars), value: substituteVariables(q.value ?? "", vars) }));
  let body = "";
  let bodyMode: FlatRequest["bodyMode"] = "raw";
  const b = req.body;
  if (b) {
    if (b.mode === "urlencoded") {
      bodyMode = "urlencoded";
      body = (b.urlencoded ?? [])
        .filter((p) => !p.disabled && p.key)
        .map((p) => `${encodeURIComponent(p.key ?? "")}=${encodeURIComponent(p.value ?? "")}`)
        .join("&");
    } else if (b.mode === "formdata") {
      bodyMode = "urlencoded";
      body = (b.formdata ?? [])
        .filter((p) => !p.disabled && p.key && p.type !== "file")
        .map((p) => `${encodeURIComponent(p.key ?? "")}=${encodeURIComponent(p.value ?? "")}`)
        .join("&");
    } else {
      body = substituteVariables(b.raw ?? "", vars);
    }
  }
  return {
    id: randomUuid(),
    name: name || "Untitled request",
    method: (req.method ?? "GET").toUpperCase(),
    url,
    headers,
    query,
    body,
    bodyMode,
    auth: parsePostmanAuth(req.auth),
  };
}

export function flattenPostmanCollection(col: PcCollection, vars: Record<string, string>): FlatRequest[] {
  const out: FlatRequest[] = [];
  const walk = (items: PcItem[], prefix: string) => {
    for (const item of items) {
      const name = item.name ? (prefix ? `${prefix} / ${item.name}` : item.name) : prefix;
      if (item.request) out.push(parsePostmanRequest(item.request, name, vars));
      if (item.item) walk(item.item, name);
    }
  };
  if (Array.isArray(col.item)) walk(col.item, "");
  return out;
}

export function parsePostmanCollection(text: string): PcCollection | null {
  try {
    const data = JSON.parse(text) as PcCollection;
    if (data && typeof data === "object" && data.info && Array.isArray(data.item)) return data;
    return null;
  } catch {
    return null;
  }
}

export function exportAuth(auth: AuthState): PcAuth | undefined {
  if (auth.type === "bearer" && auth.token) {
    return { type: "bearer", bearer: [{ key: "token", value: auth.token, type: "string" }] };
  }
  if (auth.type === "basic") {
    return {
      type: "basic",
      basic: [
        { key: "username", value: auth.username ?? "", type: "string" },
        { key: "password", value: auth.password ?? "", type: "string" },
      ],
    };
  }
  if (auth.type === "apikey" && auth.key) {
    return { type: "apikey", apikey: [{ key: auth.key, value: auth.value ?? "", in: auth.in ?? "header" }] };
  }
  return undefined;
}

export function buildPostmanCollection(name: string, requests: FlatRequest[]): PcCollection {
  return {
    info: {
      _postman_id: randomUuid(),
      name,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    item: requests.map((f) => {
      const urlHost = f.url.replace(/^https?:\/\//, "").split("/")[0];
      const urlPath = f.url.replace(/^https?:\/\/[^/]+/, "").split("?")[0].split("/").filter(Boolean);
      return {
        name: f.name || "New request",
        request: {
          method: f.method,
          header: f.headers.map((h) => ({ key: h.key, value: h.value })),
          url: {
            raw: f.url,
            host: urlHost.split("."),
            path: urlPath,
            query: f.query.map((q) => ({ key: q.key, value: q.value })),
          },
          body: f.body ? { mode: f.bodyMode, raw: f.body } : undefined,
          auth: exportAuth(f.auth),
        },
      };
    }),
  };
}

export function prepareRequest(f: FlatRequest): { init: RequestInit; url: string } {
  const target = new URL(f.url);
  f.query.filter((q) => q.key).forEach((q) => target.searchParams.set(q.key, q.value));
  const outHeaders: Record<string, string> = {};
  f.headers.filter((h) => h.key).forEach((h) => {
    outHeaders[h.key] = h.value;
  });
  if (f.auth.type === "bearer" && f.auth.token) outHeaders["Authorization"] = `Bearer ${f.auth.token}`;
  if (f.auth.type === "basic") {
    try {
      outHeaders["Authorization"] = `Basic ${btoa(`${f.auth.username ?? ""}:${f.auth.password ?? ""}`)}`;
    } catch {
      // non-latin1 credentials — skip
    }
  }
  if (f.auth.type === "apikey") {
    if (f.auth.in === "query") target.searchParams.set(f.auth.key ?? "", f.auth.value ?? "");
    else if (f.auth.key) outHeaders[f.auth.key] = f.auth.value ?? "";
  }
  const init: RequestInit = { method: f.method, headers: outHeaders };
  if (f.method !== "GET" && f.method !== "HEAD" && f.body) {
    if (f.bodyMode === "urlencoded") {
      init.body = f.body;
      if (!Object.keys(outHeaders).some((k) => k.toLowerCase() === "content-type")) {
        outHeaders["Content-Type"] = "application/x-www-form-urlencoded";
      }
    } else {
      init.body = f.body;
      if (!Object.keys(outHeaders).some((k) => k.toLowerCase() === "content-type")) {
        outHeaders["Content-Type"] = "application/json";
      }
    }
  }
  return { init, url: target.toString() };
}