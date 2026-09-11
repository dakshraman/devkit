"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { CopyButton, DownloadButton } from "@/components/ui/copy-button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { minifySvg } from "@/features/tools/tool-helpers";
import type { Tool } from "@/types";

export default function SvgTool({ tool }: { tool: Tool }) {
  const [input, setInput] = useState(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">\n  <!-- heart icon -->\n  <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>\n</svg>'
  );
  const output = useMemo(() => minifySvg(input), [input]);
  const previewUrl = `data:image/svg+xml,${encodeURIComponent(output)}`;
  const savings = input.length > 0 ? Math.max(0, input.length - output.length) : 0;
  return (
    <Shell tool={tool}>
      <Panel title="SVG optimizer" description="Strip comments and whitespace, preview and download the result.">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} className="font-mono text-[13px]" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Optimized</div>
              <Badge variant="outline">{savings} bytes saved</Badge>
            </div>
            <pre className="max-h-[360px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6">{output}</pre>
            <div className="flex gap-2">
              <CopyButton value={output} toolSlug={tool.slug} toolName={tool.name} />
              <DownloadButton content={output} filename="optimized.svg" mime="image/svg+xml" label="Download SVG" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</div>
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border bg-background p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="SVG preview" className="max-h-[300px] w-auto" />
            </div>
          </div>
        </div>
      </Panel>
    </Shell>
  );
}
