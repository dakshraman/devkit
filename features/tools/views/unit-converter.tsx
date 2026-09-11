"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

export default function UnitConvertTool({ tool }: { tool: Tool }) {
  const [base, setBase] = useState("16");
  const [px, setPx] = useState("24");
  const [rem, setRem] = useState("1.5");
  const [em, setEm] = useState("1.5");
  const baseNumber = Number(base) || 16;
  const pxNumber = Number(px);
  const remNumber = Number(rem);
  const emNumber = Number(em);
  const valid = [pxNumber, remNumber, emNumber].every((n) => Number.isFinite(n));
  const remFromPx = valid ? pxNumber / baseNumber : null;
  const emFromPx = valid ? pxNumber / baseNumber : null;
  const pxFromRem = valid ? remNumber * baseNumber : null;
  const pxFromEm = valid ? emNumber * baseNumber : null;
  const fmt = (value: number | null) => (value === null ? "—" : value.toFixed(3).replace(/\.?0+$/, ""));
  return (
    <Shell tool={tool}>
      <Panel title="px ↔ rem ↔ em" description="Convert CSS units against a configurable root font size.">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Root font size (px)</div>
            <Input value={base} onChange={(e) => setBase(e.target.value)} className="w-32 font-mono" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Pixels</div>
            <Input value={px} onChange={(e) => setPx(e.target.value)} className="mt-1 font-mono" />
            <div className="mt-2 text-sm text-muted-foreground">
              → rem: <span className="font-medium text-foreground">{fmt(remFromPx)}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              → em: <span className="font-medium text-foreground">{fmt(emFromPx)}</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">REM</div>
            <Input value={rem} onChange={(e) => setRem(e.target.value)} className="mt-1 font-mono" />
            <div className="mt-2 text-sm text-muted-foreground">
              → px: <span className="font-medium text-foreground">{fmt(pxFromRem)}</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">EM</div>
            <Input value={em} onChange={(e) => setEm(e.target.value)} className="mt-1 font-mono" />
            <div className="mt-2 text-sm text-muted-foreground">
              → px: <span className="font-medium text-foreground">{fmt(pxFromEm)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["4px", "4"], ["8px", "8"], ["12px", "12"], ["14px", "14"], ["16px", "16"], ["20px", "20"], ["24px", "24"], ["32px", "32"], ["48px", "48"],
          ].map(([label, value]) => (
            <button
              key={value}
              onClick={() => setPx(value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          1rem = {baseNumber}px. rem targets the root element; em resolves against the current element&apos;s font size.
        </p>
      </Panel>
    </Shell>
  );
}
