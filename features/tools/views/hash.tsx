"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { CopyButton } from "@/components/ui/copy-button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { shaDigest, md5Digest } from "@/lib/tool-utils";
import type { Tool } from "@/types";

export default function HashTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    setLoading(true);
    const [sha1, sha256, md5] = await Promise.all([shaDigest(text, "SHA-1"), shaDigest(text, "SHA-256"), Promise.resolve(md5Digest(text))]);
    setResults({ MD5: md5, "SHA-1": sha1, "SHA-256": sha256 });
    setLoading(false);
  };
  return (
    <Shell tool={tool}>
      <Panel title="Hash generator" description="MD5, SHA-1 and SHA-256 digests generated locally.">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Enter text to hash..." />
        <Button onClick={generate} disabled={loading}>{loading ? "Generating..." : "Generate hashes"}</Button>
        <div className="grid gap-3 lg:grid-cols-3">
          {Object.entries(results).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-border bg-background p-3">
              <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium">{key}</span><CopyButton value={value} toolSlug={tool.slug} toolName={tool.name} /></div>
              <p className="break-all font-mono text-xs text-muted-foreground">{value}</p>
            </div>
          ))}
        </div>
      </Panel>
    </Shell>
  );
}
