"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/ui/copy-button";
import { Shell, Panel } from "@/features/tools/tool-layout";
import { generatePasswords, strengthScore } from "@/lib/tool-utils";
import type { Tool } from "@/types";

export default function PasswordTool({ tool }: { tool: Tool }) {
  const [length, setLength] = useState(20);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const generate = () => setPassword(generatePasswords({ length, upper, lower, numbers, symbols }));
  const score = strengthScore(password);
  return (
    <Shell tool={tool}>
      <Panel title="Password generator">
        <div className="grid gap-4 lg:grid-cols-2">
          <Input type="number" min={4} max={128} value={length} onChange={(e) => setLength(Number(e.target.value))} />
          <Button onClick={generate}>Generate</Button>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {[
            ["Uppercase", upper, setUpper],
            ["Lowercase", lower, setLower],
            ["Numbers", numbers, setNumbers],
            ["Symbols", symbols, setSymbols],
          ].map(([label, value, setter]) => (
            <label key={label as string} className="flex items-center gap-2">
              <input type="checkbox" checked={value as boolean} onChange={(e) => (setter as (next: boolean) => void)(e.target.checked)} />
              {label as string}
            </label>
          ))}
        </div>
        <pre className="rounded-xl border border-border bg-background p-4 text-sm break-all">{password || "Generated password appears here."}</pre>
        <div className="flex items-center gap-3">
          <Badge variant="info">{score.label}</Badge>
          <CopyButton value={password} toolSlug={tool.slug} toolName={tool.name} />
        </div>
      </Panel>
    </Shell>
  );
}
