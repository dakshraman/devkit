"use client";

import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { CopyButton } from "@/components/ui/copy-button";
import { InfoTile, Panel, Shell } from "@/features/tools/tool-layout";
import { jsonSummary, safeJsonParse } from "@/lib/tool-utils";
import type { Tool } from "@/types";

const JSON_SAMPLE = `{
  "name": "DevKit",
  "tools": 54,
  "active": true,
  "meta": {
    "author": "Daksh",
    "tags": ["web", "utility", "free"]
  }
}`;

function JsonValue({ value, path, expanded, onToggle }: {
  value: unknown;
  path: string;
  expanded: Set<string>;
  onToggle: (path: string) => void;
}) {
  const isObject = value !== null && typeof value === "object";
  if (!isObject) {
    const display = value === null ? "null" : typeof value === "string" ? `"${value}"` : String(value);
    const color = value === null
      ? "text-red-500"
      : typeof value === "string"
        ? "text-emerald-600 dark:text-emerald-400"
        : typeof value === "number"
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-amber-600 dark:text-amber-400";
    return <span className={color}>{display}</span>;
  }
  const isArray = Array.isArray(value);
  const entries = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, unknown>);
  const isOpen = expanded.has(path);
  const count = entries.length;
  return (
    <span className="block">
      <button
        type="button"
        onClick={() => onToggle(path)}
        className="mr-1 inline-flex items-center gap-1 rounded px-1 text-muted-foreground hover:bg-accent"
        aria-label={isOpen ? "Collapse" : "Expand"}
      >
        <Icon icon={isOpen ? "lucide:chevron-down" : "lucide:chevron-right"} className="size-3.5" />
      </button>
      <span className="text-muted-foreground">{isArray ? "[" : "{"}</span>
      {isOpen && (
        <span className="block border-l border-border pl-4">
          {entries.map(([key, v]) => (
            <span key={key} className="block py-0.5">
              <span className="select-none text-muted-foreground">&quot;{key}&quot;</span>
              <span className="text-muted-foreground">: </span>
              <JsonValue value={v} path={`${path}.${key}`} expanded={expanded} onToggle={onToggle} />
              {key !== String(count - 1) && <span className="text-muted-foreground">,</span>}
            </span>
          ))}
        </span>
      )}
      <span className="text-muted-foreground">{isArray ? "]" : "}"}</span>
    </span>
  );
}

export default function JsonViewerTool({ tool }: { tool: Tool }) {
  const [input, setInput] = useState(JSON_SAMPLE);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["$"]));
  const parsed = useMemo(() => safeJsonParse(input), [input]);
  const stats = useMemo(() => (parsed.ok ? jsonSummary(parsed.value) : null), [parsed]);

  const toggle = (path: string) => {
    if (expanded.has(path)) {
      setExpanded((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    } else {
      setExpanded((prev) => new Set(prev).add(path));
    }
  };

  return (
    <Shell tool={tool}>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="JSON input" description="Paste or edit JSON — validation happens live.">
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={14} className="font-mono text-xs" spellCheck={false} />
          <div className="flex flex-wrap items-center gap-2">
            {parsed.ok ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setInput(JSON.stringify(parsed.value, null, 2))}>Format</Button>
                <Button variant="outline" size="sm" onClick={() => setCollapsed((prev) => (prev.size ? new Set() : new Set(["$"])))}>
                  {collapsed.size ? "Expand all" : "Collapse all"}
                </Button>
                <CopyButton value={input} toolSlug={tool.slug} toolName={tool.name} />
              </>
            ) : (
              <p className="text-sm text-red-500">Invalid JSON — {parsed.error}</p>
            )}
          </div>
        </Panel>
        <Panel title="Tree view" description="Click brackets to expand or collapse nodes.">
          {parsed.ok ? (
            <>
              {stats && (
                <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {([["objects", stats.objects], ["arrays", stats.arrays], ["strings", stats.strings], ["numbers", stats.numbers], ["nulls", stats.nulls]] as const).map(([label, value]) => (
                    <InfoTile key={label} label={label} value={String(value)} />
                  ))}
                </div>
              )}
              <pre className="max-h-[520px] overflow-auto rounded-xl border border-border bg-background p-4 font-mono text-xs leading-6">
                <JsonValue value={parsed.value} path="$" expanded={expanded} onToggle={toggle} />
              </pre>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Enter valid JSON on the left to see the tree view.
            </div>
          )}
        </Panel>
      </div>
    </Shell>
  );
}
