"use client";

import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/input";
import { InfoTile, Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

interface UnicodeRow {
  char: string;
  hex: string;
  decimal: number;
  utf8: string;
}

export default function UnicodeTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState("DevKit 🚀 中文 español");
  const rows = useMemo<UnicodeRow[]>(() => {
    return Array.from(text).slice(0, 200).map((char) => {
      const codePoint = char.codePointAt(0) ?? 0;
      const utf8 = new TextEncoder().encode(char);
      return {
        char,
        hex: `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
        decimal: codePoint,
        utf8: Array.from(utf8, (byte) => byte.toString(16).padStart(2, "0")).join(" "),
      };
    });
  }, [text]);
  const totals = useMemo(() => {
    const codePoints = Array.from(text).length;
    const bytes = new TextEncoder().encode(text).length;
    return { codePoints, bytes };
  }, [text]);
  return (
    <Shell tool={tool}>
      <Panel title="Unicode inspector" description="Explore code points, UTF-8 bytes and escapes for any text.">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} />
        <div className="flex flex-wrap gap-2">
          <InfoTile label="Characters" value={String(text.length)} />
          <InfoTile label="Code points" value={String(totals.codePoints)} />
          <InfoTile label="UTF-8 bytes" value={String(totals.bytes)} />
        </div>
        {rows.length > 0 && (
          <div className="overflow-auto rounded-xl border border-border bg-background">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2">Char</th>
                  <th className="px-3 py-2">Code point</th>
                  <th className="px-3 py-2">Decimal</th>
                  <th className="px-3 py-2">UTF-8 bytes</th>
                  <th className="px-3 py-2">Escape</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.decimal}-${row.hex}`} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-1.5 font-mono text-base">{row.char === " " ? "␣" : row.char}</td>
                    <td className="px-3 py-1.5 font-mono text-xs">{row.hex}</td>
                    <td className="px-3 py-1.5 font-mono text-xs">{row.decimal}</td>
                    <td className="px-3 py-1.5 font-mono text-xs">{row.utf8}</td>
                    <td className="px-3 py-1.5 font-mono text-xs">{"\\u{" + row.hex.slice(2) + "}"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {Array.from(text).length > 200 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">Showing the first 200 code points.</p>
            )}
          </div>
        )}
      </Panel>
    </Shell>
  );
}
