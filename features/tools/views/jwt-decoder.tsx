"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { jwtDecode, jwtStatus, formatUnixTime } from "@/lib/tool-utils";
import type { Tool } from "@/types";

function JsonBlock({ title, data }: { title: string; data: unknown }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      <pre className="rounded-xl border border-border bg-background p-3 text-xs leading-6">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default function JwtDecoderTool({ tool }: { tool: Tool }) {
  const [token, setToken] = useState("");
  const decoded = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Invalid JWT" };
    }
  }, [token]);

  const payload = decoded && "payload" in decoded ? decoded.payload as Record<string, unknown> : null;
  const status = payload ? jwtStatus(payload.exp as number | undefined, payload.nbf as number | undefined) : null;

  return (
    <Shell tool={tool}>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Panel title="Token" description="Paste a JWT to inspect its header and payload.">
          <Textarea value={token} onChange={(e) => setToken(e.target.value)} rows={11} className="font-mono text-[13px]" placeholder="eyJhbGciOi..." />
          {decoded && "error" in decoded && <p className="text-sm text-red-500">{decoded.error}</p>}
        </Panel>
        <div className="space-y-6">
          <Panel title="Status" description="Expiration and validity information.">
            {status ? <Badge variant={status.variant}>{status.label}</Badge> : <p className="text-sm text-muted-foreground">No token parsed yet.</p>}
          </Panel>
          <Panel title="Decoded">
            {decoded && "header" in decoded ? (
              <div className="space-y-4">
                <JsonBlock title="Header" data={decoded.header} />
                <JsonBlock
                  title="Payload"
                  data={Object.fromEntries(
                    Object.entries(decoded.payload as Record<string, unknown>).map(([key, value]) => [
                      key,
                      typeof value === "number" && ["exp", "iat", "nbf"].includes(key) ? formatUnixTime(value) : value,
                    ])
                  )}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Decoded claims will appear here.</p>
            )}
          </Panel>
        </div>
      </div>
    </Shell>
  );
}
