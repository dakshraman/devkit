"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { md5 } from "js-md5";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { InfoTile, Panel, Shell } from "@/features/tools/tool-layout";
import { toHex } from "@/features/tools/tool-helpers";
import type { Tool } from "@/types";

export default function FileChecksumTool({ tool }: { tool: Tool }) {
  const [fileName, setFileName] = useState("");
  const [size, setSize] = useState<number | null>(null);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const onFile = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    setSize(file.size);
    setLoading(true);
    setError("");
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const algorithms = ["SHA-1", "SHA-256", "SHA-512"] as const;
      const results: Record<string, string> = { MD5: md5(bytes) };
      for (const algorithm of algorithms) {
        results[algorithm] = toHex(await crypto.subtle.digest(algorithm, buffer));
      }
      setHashes(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to hash file");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Shell tool={tool}>
      <Panel title="File checksum" description="Compute MD5, SHA-1, SHA-256 and SHA-512 hashes of any file.">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          <Icon icon="lucide:file-up" className="size-4" />
          Choose file
          <input type="file" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {fileName && (
          <div className="flex flex-wrap gap-2">
            <InfoTile label="File" value={fileName} />
            {size !== null && <InfoTile label="Size" value={`${(size / 1024).toFixed(1)} KB`} />}
          </div>
        )}
        {loading && <p className="text-sm text-muted-foreground">Hashing…</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {Object.entries(hashes).map(([name, hash]) => (
          <div key={name} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
            <Badge variant="outline" className="w-16 justify-center">{name}</Badge>
            <code className="min-w-0 flex-1 break-all font-mono text-xs">{hash}</code>
            <CopyButton value={hash} toolSlug={tool.slug} toolName={tool.name} />
          </div>
        ))}
      </Panel>
    </Shell>
  );
}
