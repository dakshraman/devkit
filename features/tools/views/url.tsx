"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/input";
import { Shell, Panel, InfoTile } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

export default function UrlTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState("https://example.com/?q=dev kit");
  const encoded = encodeURIComponent(text);
  const decoded = (() => {
    try { return decodeURIComponent(text); } catch { return ""; }
  })();
  return (
    <Shell tool={tool}>
      <Panel title="URL encoder / decoder">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} />
        <div className="grid gap-4 lg:grid-cols-2">
          <InfoTile label="Encoded" value={encoded} />
          <InfoTile label="Decoded" value={decoded} />
        </div>
      </Panel>
    </Shell>
  );
}
