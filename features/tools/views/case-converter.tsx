"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/input";
import { Shell, Panel, InfoTile } from "@/features/tools/tool-layout";
import { convertCase } from "@/lib/tool-utils";
import type { Tool } from "@/types";

export default function CaseTool({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("DevKit toolkit example");
  const cases = convertCase(input);
  return (
    <Shell tool={tool}>
      <Panel title="Case converter">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={5} />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(cases).map(([key, value]) => (
            <InfoTile key={key} label={key} value={value} />
          ))}
        </div>
      </Panel>
    </Shell>
  );
}
