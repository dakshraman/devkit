"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton, DownloadButton } from "@/components/ui/copy-button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { randomUuid } from "@/lib/tool-utils";
import type { Tool } from "@/types";

export default function UuidTool({ tool }: { tool: Tool }) {
  const [count, setCount] = useState(1);
  const [items, setItems] = useState<string[]>([]);
  return (
    <Shell tool={tool}>
      <Panel title="UUID v4" description="Generate single or bulk identifiers.">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 5, 10, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n} UUIDs</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setItems(Array.from({ length: count }, () => randomUuid()))}>Generate</Button>
          <CopyButton value={items.join("\n")} toolSlug={tool.slug} toolName={tool.name} />
          <DownloadButton content={items.join("\n")} filename="uuid-v4.txt" />
        </div>
        <pre className="max-h-[520px] overflow-auto rounded-xl border border-border bg-background p-4 text-sm">{items.length ? items.join("\n") : "Generated UUIDs appear here."}</pre>
      </Panel>
    </Shell>
  );
}
