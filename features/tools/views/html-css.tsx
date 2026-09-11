"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton, DownloadButton } from "@/components/ui/copy-button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { formatHtmlPretty, minifyHtml, formatCssPretty, minifyCss } from "@/features/tools/tool-helpers";
import type { Tool } from "@/types";

export default function HtmlCssTool({ tool }: { tool: Tool }) {
  const [target, setTarget] = useState<"html" | "css">("html");
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [input, setInput] = useState(
    '<div class="card">\n  <h1>Hello</h1>\n  <p>World</p>\n</div>'
  );
  const [output, setOutput] = useState("");
  const run = () => {
    if (target === "html") {
      setOutput(mode === "format" ? formatHtmlPretty(input) : minifyHtml(input));
    } else {
      setOutput(mode === "format" ? formatCssPretty(input) : minifyCss(input));
    }
  };
  return (
    <Shell tool={tool}>
      <Panel title="Format or minify" description="HTML and CSS are processed entirely in your browser.">
        <Tabs value={target} onValueChange={(v) => setTarget(v as "html" | "css")}>
          <TabsList>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={mode} onValueChange={(v) => setMode(v as "format" | "minify")}>
          <TabsList>
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="minify">Minify</TabsTrigger>
          </TabsList>
        </Tabs>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} className="font-mono text-[13px]" />
        <Button onClick={run}>{mode === "format" ? "Format" : "Minify"}</Button>
        {output && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <CopyButton value={output} toolSlug={tool.slug} toolName={tool.name} />
              <DownloadButton content={output} filename={`devkit-${target}.${mode === "minify" ? "min." : ""}${target}`} label="Download" />
            </div>
            <pre className="max-h-[420px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6">{output}</pre>
          </div>
        )}
      </Panel>
    </Shell>
  );
}
