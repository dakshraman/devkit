"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Panel, SectionLabel, Shell } from "@/features/tools/tool-layout";
import { contrastRatio } from "@/features/tools/tool-helpers";
import { cn } from "@/lib/utils";
import type { Tool } from "@/types";

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <SectionLabel icon="lucide:paint-bucket" label={label} />
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-10 shrink-0 cursor-pointer rounded-lg border border-input bg-transparent p-1"
          aria-label={label}
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" aria-label={`${label} hex`} />
      </div>
    </div>
  );
}

export default function ColorContrastTool({ tool }: { tool: Tool }) {
  const [foreground, setForeground] = useState("#111827");
  const [background, setBackground] = useState("#ffffff");
  const ratio = contrastRatio(foreground, background);
  const checks = [
    { label: "AA normal text", pass: ratio >= 4.5 },
    { label: "AAA normal text", pass: ratio >= 7 },
    { label: "AA large text", pass: ratio >= 3 },
    { label: "AAA large text", pass: ratio >= 4.5 },
  ];
  const preview = ratio >= 4.5 ? foreground : background;

  return (
    <Shell tool={tool}>
      <Panel title="WCAG contrast" description="Compare two colors against WCAG 2.x accessibility levels.">
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField label="Foreground" value={foreground} onChange={setForeground} />
          <ColorField label="Background" value={background} onChange={setBackground} />
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-5">
          <div className="text-4xl font-extrabold tracking-tight" style={{ color: foreground, background: background }}>
            Aa
          </div>
          <div>
            <div className="text-sm font-semibold">{ratio.toFixed(2)}:1 contrast ratio</div>
            <div className="text-xs text-muted-foreground">{"Text sample displayed in the preview below."}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {checks.map((check) => (
            <div key={check.label} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <Icon icon={check.pass ? "lucide:check-circle-2" : "lucide:x-circle"} className={cn("size-4", check.pass ? "text-emerald-500" : "text-red-500")} />
                {check.pass ? "Pass" : "Fail"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{check.label}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border p-4" style={{ background: background }}>
          <p className="text-lg font-semibold" style={{ color: preview }}>
            The quick brown fox jumps over the lazy dog.
          </p>
          <p className="text-sm" style={{ color: foreground }}>
            Regular text preview in your exact colors.
          </p>
        </div>
      </Panel>
    </Shell>
  );
}
