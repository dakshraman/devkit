"use client";

import { useState } from "react";
import bcrypt from "bcryptjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton, DownloadButton } from "@/components/ui/copy-button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

export default function BcryptTool({ tool }: { tool: Tool }) {
  const [password, setPassword] = useState("");
  const [rounds, setRounds] = useState(10);
  const [hash, setHash] = useState("");
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const generate = () => {
    setError("");
    if (!password) {
      setError("Enter a password first.");
      return;
    }
    try {
      setHash(bcrypt.hashSync(password, rounds));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to hash");
    }
  };
  const verify = () => {
    setError("");
    if (!password || !verifyHash) {
      setError("Enter the password and the hash to verify.");
      setVerifyResult(null);
      return;
    }
    setVerifyResult(bcrypt.compareSync(password, verifyHash));
  };
  return (
    <Shell tool={tool}>
      <Panel title="Bcrypt hash generator" description="Hash passwords with configurable cost and verify existing hashes.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Password</div>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter password" />
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Cost factor (rounds: {rounds})</div>
            <input
              type="range"
              min={4}
              max={14}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={generate}>Generate hash</Button>
          {hash && (
            <>
              <CopyButton value={hash} toolSlug={tool.slug} toolName={tool.name} />
              <DownloadButton content={hash} filename="devkit-bcrypt.txt" label="Download" />
            </>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {hash && <pre className="break-all rounded-xl border border-border bg-background p-4 font-mono text-xs">{hash}</pre>}
        {hash && (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Verify a hash</div>
            <Input value={verifyHash} onChange={(e) => setVerifyHash(e.target.value)} className="font-mono" placeholder="Paste hash to verify" />
            <Button variant="outline" onClick={verify}>Verify</Button>
            {verifyResult !== null && (
              <p className={verifyResult ? "text-sm text-emerald-500" : "text-sm text-red-500"}>
                {verifyResult ? "Hash matches the password." : "Hash does not match the password."}
              </p>
            )}
          </div>
        )}
      </Panel>
    </Shell>
  );
}
