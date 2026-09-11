"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton } from "@/components/ui/copy-button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { hmacSign } from "@/features/tools/tool-helpers";
import { encodeBase64Url } from "@/lib/tool-utils";
import { nowSeconds } from "@/lib/utils";
import type { Tool } from "@/types";

const JWT_ALGS = ["HS256", "HS384", "HS512"] as const;

export default function JwtSignerTool({ tool }: { tool: Tool }) {
  const [algorithm, setAlgorithm] = useState<(typeof JWT_ALGS)[number]>("HS256");
  const [payload, setPayload] = useState('{\n  "sub": "user_123",\n  "role": "admin",\n  "aud": "devkit"\n}');
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [expires, setExpires] = useState("3600");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const sign = async () => {
    setError("");
    const parsed = JSON.parse(payload);
    const now = nowSeconds();
    const body = {
      ...parsed,
      iat: now,
      exp: now + Number(expires),
    };
    const header = { alg: algorithm, typ: "JWT" };
    const data = `${encodeBase64Url(JSON.stringify(header))}.${encodeBase64Url(JSON.stringify(body))}`;
    const signature = await hmacSign(secret, data, algorithm);
    setToken(`${data}.${signature}`);
  };
  return (
    <Shell tool={tool}>
      <Panel title="JWT generator" description="Create signed HS256/384/512 tokens with custom claims.">
        <div className="flex flex-wrap gap-3">
          <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as (typeof JWT_ALGS)[number])}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Algorithm" /></SelectTrigger>
            <SelectContent>
              {JWT_ALGS.map((alg) => (
                <SelectItem key={alg} value={alg}>{alg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={expires} onValueChange={setExpires}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Expires" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="300">5 minutes</SelectItem>
              <SelectItem value="3600">1 hour</SelectItem>
              <SelectItem value="86400">1 day</SelectItem>
              <SelectItem value="604800">7 days</SelectItem>
              <SelectItem value="2592000">30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Payload (JSON)</div>
            <Textarea value={payload} onChange={(e) => setPayload(e.target.value)} rows={8} className="font-mono text-[13px]" />
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Secret</div>
            <Input value={secret} onChange={(e) => setSecret(e.target.value)} type="password" className="font-mono" />
            <p className="text-xs text-muted-foreground">iat and exp claims are added automatically.</p>
          </div>
        </div>
        <Button onClick={sign}>Sign token</Button>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {token && (
          <div className="space-y-2">
            <CopyButton value={token} toolSlug={tool.slug} toolName={tool.name} />
            <pre className="max-h-[300px] overflow-auto break-all rounded-xl border border-border bg-background p-4 font-mono text-xs leading-6">{token}</pre>
          </div>
        )}
      </Panel>
    </Shell>
  );
}
