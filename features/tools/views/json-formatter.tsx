"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { SafeHtml } from "@/components/ui/safe-html";
import { Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton } from "@/components/ui/copy-button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { useDebounce } from "@/hooks/useDebounce";
import { downloadFile, formatBytes, formatNumber } from "@/lib/utils";
import { safeJsonParse, jsonSummary } from "@/lib/tool-utils";
import { usePrismHtml } from "@/features/tools/tool-helpers";
import type { Tool } from "@/types";

export default function JsonFormatterTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState("");
  const [indent, setIndent] = useState<"tab" | 2 | 4 | 8>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const parsed = safeJsonParse(text);
  const summary = parsed.ok ? jsonSummary(parsed.value) : null;
  const debouncedText = useDebounce(text, 500);

  function sortObjectKeys(obj: unknown): unknown {
    if (Array.isArray(obj)) return obj.map(sortObjectKeys);
    if (obj && typeof obj === "object" && obj.constructor === Object) {
      return Object.fromEntries(
        Object.entries(obj as Record<string, unknown>)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => [k, sortObjectKeys(v)])
      );
    }
    return obj;
  }

  const autoFormattedOutput = useMemo(() => {
    if (!debouncedText.trim()) return "";
    const result = safeJsonParse(debouncedText);
    if (!result.ok) return "";
    try {
      const indentParam = indent === "tab" ? "\t" : indent;
      let value = result.value;
      if (sortKeys) {
        value = sortObjectKeys(value);
      }
      return JSON.stringify(value, null, indentParam);
    } catch {
      return "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedText, indent, sortKeys]);

  const displayOutput = output || autoFormattedOutput;
  const highlightedOutput = usePrismHtml(displayOutput, "json");

  const format = (minify = false, updateInput = false) => {
    const result = safeJsonParse(text);
    if (!result.ok) {
      setError(result.error);
      setOutput("");
      return;
    }
    try {
      setError("");
      const indentParam = indent === "tab" ? "\t" : indent;
      let value = result.value;
      if (sortKeys) {
        value = sortObjectKeys(value);
      }
      const formatted = minify
        ? JSON.stringify(value)
        : JSON.stringify(value, null, indentParam);
      setOutput(formatted);
      if (updateInput) {
        setText(formatted);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to format JSON");
    }
  };

  const charCount = text.length;
  const byteCount = new Blob([text]).size;

  return (
    <Shell tool={tool}>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Input" description="Paste or upload JSON to validate and format.">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => format(false, true)}>Pretty Print</Button>
            <Button variant="outline" size="sm" onClick={() => format(true)}>Minify</Button>
            <Select value={String(indent)} onValueChange={(v) => setIndent(v === "tab" ? "tab" : Number(v) as 2 | 4 | 8)}>
              <SelectTrigger className="w-[110px]"><SelectValue placeholder="Indent" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tab">Tab</SelectItem>
                <SelectItem value="2">2 spaces</SelectItem>
                <SelectItem value="4">4 spaces</SelectItem>
                <SelectItem value="8">8 spaces</SelectItem>
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
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={sortKeys}
                onChange={(e) => setSortKeys(e.target.checked)}
                className="cursor-pointer"
              />
              Sort keys
            </label>
          </div>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={18} placeholder='{"name":"DevKit"}' className="font-mono text-[13px]" />
          <p className="text-xs text-muted-foreground">{charCount.toLocaleString()} characters &middot; {formatBytes(byteCount)}</p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => format(false)}>Validate</Button>
            <CopyButton value={displayOutput || text} toolSlug={tool.slug} toolName={tool.name} />
            <Button variant="outline" size="sm" onClick={() => downloadFile(displayOutput || text, "devkit.json", "application/json")}>Download</Button>
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title="Output" description="Formatted JSON appears here.">
            <pre className="max-h-[340px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6"><SafeHtml as="code" html={highlightedOutput || displayOutput || "Formatted output will appear here."} /></pre>
            <CopyButton value={displayOutput} toolSlug={tool.slug} toolName={tool.name} className="mt-2" />
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
