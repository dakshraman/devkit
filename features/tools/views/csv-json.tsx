"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton, DownloadButton } from "@/components/ui/copy-button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { csvToJsonText, jsonToCsvText } from "@/features/tools/tool-helpers";
import type { Tool } from "@/types";

export default function CsvJsonTool({ tool }: { tool: Tool }) {
  const [mode, setMode] = useState<"csv" | "json">("csv");
  const [delimiter, setDelimiter] = useState(",");
  const [input, setInput] = useState('name,role,years\nAda,Engineer,8\nGrace,Analyst,4');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const convert = () => {
    setError("");
    try {
      setOutput(mode === "csv" ? csvToJsonText(input, delimiter) : jsonToCsvText(input, delimiter));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
      setOutput("");
    }
  };
  return (
    <Shell tool={tool}>
      <Panel title="CSV ↔ JSON converter" description="Convert between delimited tables and JSON arrays of objects.">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "csv" | "json")}>
            <TabsList>
              <TabsTrigger value="csv">CSV → JSON</TabsTrigger>
              <TabsTrigger value="json">JSON → CSV</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={delimiter} onValueChange={setDelimiter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Delimiter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value=",">Comma (,)</SelectItem>
              <SelectItem value=";">Semicolon (;)</SelectItem>
              <SelectItem value="\t">Tab</SelectItem>
              <SelectItem value="|">Pipe (|)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} className="font-mono text-[13px]" />
        <Button onClick={convert}>Convert</Button>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {output && (
          <div className="space-y-2">
            <CopyButton value={output} toolSlug={tool.slug} toolName={tool.name} />
            <DownloadButton content={output} filename={`devkit-converted.${mode === "csv" ? "json" : "csv"}`} mime="text/plain" label="Download" />
            <pre className="max-h-[420px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6">{output}</pre>
          </div>
        )}
      </Panel>
    </Shell>
  );
}
