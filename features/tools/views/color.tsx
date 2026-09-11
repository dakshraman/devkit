"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/ui/copy-button";
import { InfoTile, Panel, Shell } from "@/features/tools/tool-layout";
import { hexToRgb, rgbToHsl, contrastText } from "@/features/tools/tool-helpers";
import type { Tool } from "@/types";

export default function ColorTool({ tool }: { tool: Tool }) {
  const [color, setColor] = useState("#6366f1");
  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  return (
    <Shell tool={tool}>
      <Panel title="Color toolkit" description="Convert, inspect and copy color values.">
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="space-y-4">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-28 w-full cursor-pointer rounded-2xl border border-border bg-transparent p-2" />
            <Input value={color} onChange={(e) => setColor(e.target.value)} />
            {rgb && <CopyButton value={color} toolSlug={tool.slug} toolName={tool.name} />}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile label="HEX" value={color} />
            <InfoTile label="RGB" value={rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "Invalid"} />
            <InfoTile label="HSL" value={hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : "Invalid"} />
            <div className="rounded-xl border border-border p-4" style={{ background: color, color: contrastText(color) }}>
              <div className="text-sm font-medium">Preview</div>
              <div className="mt-2 text-xs opacity-80">Accessible foreground chosen automatically.</div>
            </div>
          </div>
        </div>
      </Panel>
    </Shell>
  );
}
