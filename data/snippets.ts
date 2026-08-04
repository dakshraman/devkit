import type { Snippet } from "@/types";

/* ------------------------------------------------------------------ */
/* Snippets — admin-managed content. Bundled at build time.            */
/* Users can only search, filter, copy and download.                   */
/* ------------------------------------------------------------------ */

export const SNIPPETS: Snippet[] = [
  {
    id: "fetch-json",
    title: "Fetch JSON with error handling",
    description: "A small async fetch wrapper with typed JSON parsing and errors.",
    language: "typescript",
    tags: ["http", "async", "fetch"],
    code: `async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    throw new Error(\`Request failed: \${res.status} \${res.statusText}\`);
  }
  return (await res.json()) as T;
}

const data = await fetchJSON<{ id: number; name: string }>(
  "https://api.example.com/users/1"
);`,
  },
  {
    id: "debounce",
    title: "Debounce function",
    description: "Delay a function call until input has stopped changing.",
    language: "typescript",
    tags: ["utility", "performance", "events"],
    code: `export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay = 300
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const onInput = debounce((value: string) => {
  console.log("search:", value);
}, 300);`,
  },
  {
    id: "throttle",
    title: "Throttle function",
    description: "Limit how often a function can run over time.",
    language: "typescript",
    tags: ["utility", "performance", "events"],
    code: `export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit = 200
) {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

window.addEventListener("scroll", throttle(() => {
  console.log("scrolled");
}, 150));`,
  },
  {
    id: "array-chunk",
    title: "Split array into chunks",
    description: "Divide an array into smaller arrays of a fixed size.",
    language: "typescript",
    tags: ["array", "utility"],
    code: `export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

chunk([1, 2, 3, 4, 5, 6, 7], 3);
// [[1, 2, 3], [4, 5, 6], [7]]`,
  },
  {
    id: "deep-clone",
    title: "Structured deep clone",
    description: "Clone arbitrary data with the native structuredClone API.",
    language: "javascript",
    tags: ["utility", "object"],
    code: `// structuredClone is supported in all modern browsers and Node 17+
const original = { user: { name: "Ada", roles: ["admin"] }, meta: new Map() };
const clone = structuredClone(original);

clone.user.name = "Grace";
console.log(original.user.name); // "Ada" — untouched`,
  },
  {
    id: "uuid-v4",
    title: "Generate UUID v4",
    description: "Create a cryptographically random UUID v4.",
    language: "javascript",
    tags: ["id", "crypto", "utility"],
    code: `function uuidv4(): string {
  return crypto.randomUUID();
}

const id = uuidv4(); // "9f2c…-…-…-…-…"`,
  },
  {
    id: "format-date",
    title: "Format date with Intl",
    description: "Locale-aware date formatting without a library.",
    language: "javascript",
    tags: ["date", "intl"],
    code: `function formatDate(
  date: Date | number | string,
  locale = "en-US",
  opts: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  }
) {
  return new Intl.DateTimeFormat(locale, opts).format(new Date(date));
}

formatDate(Date.now()); // "Aug 3, 2026, 12:30 PM"`,
  },
  {
    id: "sleep",
    title: "Sleep / wait helper",
    description: "Promise-based delay for async flows.",
    language: "typescript",
    tags: ["async", "utility"],
    code: `export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("start");
  await sleep(1000);
  console.log("done after 1s");
}`,
  },
  {
    id: "memoize",
    title: "Memoize a function",
    description: "Cache results of pure functions by argument key.",
    language: "typescript",
    tags: ["performance", "utility", "cache"],
    code: `export function memoize<A extends unknown[], R>(
  fn: (...args: A) => R,
  keyFn: (...args: A) => string = (...a) => JSON.stringify(a)
): (...args: A) => R {
  const cache = new Map<string, R>();
  return (...args: A): R => {
    const key = keyFn(...args);
    if (cache.has(key)) return cache.get(key) as R;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const fib = memoize((n: number): number =>
  n <= 1 ? n : fib(n - 1) + fib(n - 2)
);`,
  },
  {
    id: "group-by",
    title: "Group array by key",
    description: "Group objects into a map keyed by a property.",
    language: "typescript",
    tags: ["array", "object", "utility"],
    code: `export function groupBy<T>(arr: T[], key: keyof T): Map<T[keyof T], T[]> {
  return arr.reduce((acc, item) => {
    const k = item[key];
    const list = acc.get(k) ?? [];
    list.push(item);
    acc.set(k, list);
    return acc;
  }, new Map<T[keyof T], T[]>());
}

const users = [
  { name: "Ada", role: "admin" },
  { name: "Grace", role: "dev" },
  { name: "Alan", role: "dev" },
];
const byRole = groupBy(users, "role");
// Map { "admin" => [Ada], "dev" => [Grace, Alan] }`,
  },
  {
    id: "retry",
    title: "Retry async with backoff",
    description: "Retry a failing async call with exponential backoff.",
    language: "typescript",
    tags: ["async", "network", "error"],
    code: `export async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 3, baseDelay = 500 }: { retries?: number; baseDelay?: number } = {}
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries) throw err;
      const delay = baseDelay * 2 ** attempt;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

const data = await withRetry(() => fetchJSON("https://api.example.com"));`,
  },
  {
    id: "object-pick",
    title: "Pick / omit object keys",
    description: "Select or drop keys from an object.",
    language: "typescript",
    tags: ["object", "utility"],
    code: `export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((acc, k) => ({ ...acc, [k]: obj[k] }), {} as Pick<T, K>);
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !keys.includes(k as K))
  ) as Omit<T, K>;
}`,
  },
  {
    id: "clipboard-copy",
    title: "Clipboard copy helper",
    description: "Robust text copying with legacy fallback.",
    language: "javascript",
    tags: ["browser", "clipboard", "utility"],
    code: `export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    el.remove();
    return ok;
  }
}`,
  },
  {
    id: "read-file",
    title: "Read a File as text",
    description: "Convert a File object into its text content.",
    language: "javascript",
    tags: ["browser", "file", "utility"],
    code: `function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

const text = await readFileAsText(input.files[0]);`,
  },
  {
    id: "sql-select",
    title: "Basic SELECT with WHERE",
    description: "A simple parameterized query pattern.",
    language: "sql",
    tags: ["database", "query"],
    code: `SELECT u.id, u.name, COUNT(o.id) AS orders
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.active = TRUE
  AND u.created_at >= '2025-01-01'
GROUP BY u.id, u.name
ORDER BY orders DESC
LIMIT 20;`,
  },
  {
    id: "css-center",
    title: "Center with flexbox",
    description: "Perfectly center any element horizontally and vertically.",
    language: "css",
    tags: ["css", "layout"],
    code: `.center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Grid alternative — even simpler */
.center-grid {
  display: grid;
  place-items: center;
}

/* Absolute positioning fallback */
.center-absolute {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}`,
  },
  {
    id: "css-dark-mode",
    title: "Dark mode with custom properties",
    description: "Theme switching via CSS variables and prefers-color-scheme.",
    language: "css",
    tags: ["css", "theme"],
    code: `:root {
  --bg: #ffffff;
  --text: #18181b;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #09090b;
    --text: #ededef;
  }
}

/* Or with a .dark class for manual control */
.dark {
  --bg: #09090b;
  --text: #ededef;
}

body {
  background: var(--bg);
  color: var(--text);
}`,
  },
  {
    id: "python-parse-json",
    title: "Parse JSON in Python",
    description: "Load and pretty-print JSON files.",
    language: "python",
    tags: ["python", "json"],
    code: `import json
from pathlib import Path

data = json.loads(Path("config.json").read_text())

# Dump with formatting
print(json.dumps(data, indent=2, sort_keys=True))

# Write back
Path("config.pretty.json").write_text(
    json.dumps(data, indent=2, ensure_ascii=False)
)`,
  },
  {
    id: "python-http-server",
    title: "Instant HTTP server",
    description: "Serve the current directory over HTTP.",
    language: "python",
    tags: ["python", "http", "server"],
    code: `# Python 3 — serve current directory on port 8000
python3 -m http.server 8000

# Or with caching disabled and bind all interfaces:
python3 -m http.server 8000 --bind 0.0.0.0`,
  },
  {
    id: "bash-rename-ext",
    title: "Rename file extensions",
    description: "Bulk rename .txt to .md across the current directory.",
    language: "bash",
    tags: ["bash", "files", "rename"],
    code: `# Rename all .txt -> .md (macOS/BSD):
for f in *.txt; do mv "$f" "\${f%.txt}.md"; done

# GNU find version (Linux):
find . -maxdepth 1 -name "*.txt" -exec sh -c '
  for f; do mv "$f" "\${f%.txt}.md"; done
' _ {} +`,
  },
  {
    id: "bash-port-kill",
    title: "Kill process on a port",
    description: "Free a busy port quickly.",
    language: "bash",
    tags: ["bash", "process", "network"],
    code: `# Linux / macOS
lsof -ti :3000 | xargs kill -9

# Or using fuser (Linux)
fuser -k 3000/tcp

# Windows (PowerShell)
Get-NetTCPConnection -LocalPort 3000 |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`,
  },
  {
    id: "git-squash",
    title: "Squash commits into one",
    description: "Combine the last N commits into a single clean commit.",
    language: "bash",
    tags: ["git", "history"],
    code: `# Soft reset the last 3 commits, keep changes staged
git reset --soft HEAD~3

# Create one new commit
git commit -m "feat: squashed feature work"

# If the branch is pushed, force-push with lease:
git push --force-with-lease`,
  },
  {
    id: "git-undo-last",
    title: "Undo the last commit",
    description: "Safely remove or amend the last commit.",
    language: "bash",
    tags: ["git", "history"],
    code: `# Remove last commit, keep changes in working tree
git reset --soft HEAD~1

# Remove last commit entirely (dangerous, rewrites history)
git reset --hard HEAD~1

# Unstage a file you already staged
git restore --staged file.ts

# Discard all local changes to a file
git checkout -- file.ts`,
  },
  {
    id: "docker-compose-basic",
    title: "Basic docker-compose stack",
    description: "A simple web + database compose file.",
    language: "yaml",
    tags: ["docker", "devops", "compose"],
    code: `services:
  web:
    image: node:22-alpine
    working_dir: /app
    command: sh -c "npm install && npm run dev"
    volumes:
      - .:/app
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://app:secret@db:5432/app
    depends_on:
      - db

  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`,
  },
  {
    id: "react-useeffect-fetch",
    title: "React data fetching pattern",
    description: "Fetch on mount with cleanup and cancellation.",
    language: "tsx",
    tags: ["react", "hooks", "fetch"],
    code: `import { useEffect, useState } from "react";

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(url, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(\`\${r.status}\`))))
      .then(setData)
      .catch((e) => e.name !== "AbortError" && setError(e))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [url]);

  return { data, error, loading };
}`,
  },
  {
    id: "react-portal",
    title: "Portal to document.body",
    description: "Render children into a portal for modals and tooltips.",
    language: "tsx",
    tags: ["react", "portal", "dom"],
    code: `import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

// Usage inside a Modal component:
// <Portal><div className="overlay">...</div></Portal>`,
  },
  {
    id: "next-metadata",
    title: "Next.js metadata export",
    description: "Set page title, description and Open Graph tags.",
    language: "tsx",
    tags: ["nextjs", "seo", "metadata"],
    code: `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "My Site",
    template: "%s · My Site",
  },
  description: "A production-ready Next.js application.",
  openGraph: {
    title: "My Site",
    description: "A production-ready Next.js application.",
    url: "https://mysite.dev",
    siteName: "My Site",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Site",
    description: "A production-ready Next.js application.",
  },
};`,
  },
  {
    id: "vercel-json",
    title: "vercel.json presets",
    description: "Common Vercel deployment configuration examples.",
    language: "json",
    tags: ["vercel", "deploy", "config"],
    code: `{
  "rewrites": [
    { "source": "/docs/:path*", "destination": "/help/:path*" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ],
  "redirects": [
    { "source": "/blog/:slug", "destination": "/news/:slug", "permanent": true }
  ],
  "cleanUrls": true,
  "trailingSlash": false
}`,
  },
];

export const SNIPPET_LANGUAGES = Array.from(
  new Set(SNIPPETS.map((s) => s.language))
).sort();
