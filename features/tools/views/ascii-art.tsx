"use client";

import { useEffect, useState } from "react";
import figlet from "figlet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton, DownloadButton } from "@/components/ui/copy-button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

const FIGLET_FONTS = ["Standard", "Big", "Slant", "Block", "Bubble", "3-D", "Small", "ANSI Shadow", "Doh", "DOS Rebel"];

export default function AsciiArtTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState("DEVKIT");
  const [font, setFont] = useState("Standard");
  const [art, setArt] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      if (!text.trim()) {
        if (!active) return;
        setArt("");
        setError("");
        return;
      }
      try {
        const out = await figlet.text(text, { font });
        if (!active) return;
        setArt(out);
        setError("");
      } catch {
        if (!active) return;
        setArt("");
        setError("Could not render with this font.");
      }
    })();
    return () => {
      active = false;
    };
  }, [text, font]);

  return (
    <Shell tool={tool}>
      <Panel title="ASCII art" description="Render text as banner-style ASCII art with FIGlet fonts.">
        <div className="flex flex-wrap gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type something\u2026" className="flex-1 min-w-56" />
          <div className="w-44">
            <Select value={font} onValueChange={setFont}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FIGLET_FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <pre className="max-h-[480px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-5">{art || "Rendered ASCII art appears here."}</pre>
        {art && (
          <div className="flex flex-wrap gap-2">
            <CopyButton value={art} toolSlug={tool.slug} toolName={tool.name} />
            <DownloadButton content={art} filename="ascii-art.txt" />
          </div>
        )}
      </Panel>
    </Shell>
  );
}
