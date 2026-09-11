"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { CopyButton, DownloadButton } from "@/components/ui/copy-button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { jsonToTsText } from "@/features/tools/tool-helpers";
import { safeJsonParse } from "@/lib/tool-utils";
import type { Tool } from "@/types";

export default function JsonTsTool({ tool }: { tool: Tool }) {
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
