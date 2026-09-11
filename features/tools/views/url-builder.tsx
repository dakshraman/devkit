"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/ui/copy-button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

interface QueryRow {
  id: number;
  key: string;
  value: string;
}

export default function UrlBuilderTool({ tool }: { tool: Tool }) {
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
