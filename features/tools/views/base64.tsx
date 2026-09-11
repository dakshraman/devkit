"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton, DownloadButton } from "@/components/ui/copy-button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { base64Encode, base64Decode } from "@/lib/tool-utils";
import type { Tool } from "@/types";

export default function Base64Tool({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const output = mode === "encode" ? base64Encode(input) : (() => {
    try { return base64Decode(input); } catch { return ""; }
  })();
  return (
    <Shell tool={tool}>
      <Panel title="Convert text" description="Encode UTF-8 text to Base64 or decode it back.">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "encode" | "decode")}>
          <TabsList><TabsTrigger value="encode">Encode</TabsTrigger><TabsTrigger value="decode">Decode</TabsTrigger></TabsList>
        </Tabs>
        <div className="grid gap-4 lg:grid-cols-2">
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={14} className="font-mono text-[13px]" placeholder="Type text or Base64 here..." />
          <Textarea value={output} readOnly rows={14} className="font-mono text-[13px]" />
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={output} toolSlug={tool.slug} toolName={tool.name} />
          <DownloadButton content={output} filename={`devkit-base64.${mode === "encode" ? "txt" : "decoded.txt"}`} />
        </div>
      </Panel>
    </Shell>
  );
}
