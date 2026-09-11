"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

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

export default function HttpStatusTool({ tool }: { tool: Tool }) {
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
            <p className="text-sm text-muted-foreground">No status codes match &quot;{query}&quot;.</p>
          )}
        </div>
      </Panel>
    </Shell>
  );
}
