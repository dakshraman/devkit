"use client";

import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/input";
import { CopyButton, DownloadButton } from "@/components/ui/copy-button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { parseEnv } from "@/features/tools/tool-helpers";
import type { Tool } from "@/types";

export default function EnvTool({ tool }: { tool: Tool }) {
  const [input, setInput] = useState('NODE_ENV=production\nPORT=3000\nAPI_KEY="sk-123"\n# keep secrets out of the repo\nNODE_ENV=development\nDATABASE_URL=postgres://user:pass@localhost/db');
  const { vars, issues } = useMemo(() => parseEnv(input), [input]);
  const normalized = vars.map((v) => `${v.key}=${v.value}`).join("\n");
  return (
    <Shell tool={tool}>
      <Panel title=".env parser" description="Validate KEY=VALUE syntax, detect duplicates and normalize formatting.">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} className="font-mono text-[13px]" />
        {issues.length > 0 && (
          <div className="space-y-1">
            {issues.map((issue, index) => (
              <p key={index} className="text-sm text-red-500">{issue}</p>
            ))}
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-auto rounded-xl border border-border bg-background">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2">Key</th>
                  <th className="px-3 py-2">Value</th>
                  <th className="px-3 py-2">Line</th>
                </tr>
              </thead>
              <tbody>
                {vars.map((v) => (
                  <tr key={`${v.key}-${v.line}`} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-1.5 font-mono text-xs font-medium text-primary">{v.key}</td>
                    <td className="max-w-[220px] truncate px-3 py-1.5 font-mono text-xs text-muted-foreground">{v.value}</td>
                    <td className="px-3 py-1.5 font-mono text-xs text-muted-foreground">{v.line}</td>
                  </tr>
                ))}
                {vars.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-center text-sm text-muted-foreground">No variables found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Normalized output</div>
            <pre className="max-h-[320px] overflow-auto rounded-xl border border-border bg-background p-4 font-mono text-xs leading-6">{normalized || "—"}</pre>
            <CopyButton value={normalized} toolSlug={tool.slug} toolName={tool.name} />
            <DownloadButton content={normalized} filename=".env.normalized" mime="text/plain" label="Download" />
          </div>
        </div>
      </Panel>
    </Shell>
  );
}
