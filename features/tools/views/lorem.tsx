"use client";

import { useMemo, useState } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { CopyButton, DownloadButton } from "@/components/ui/copy-button";
import { Shell, Panel } from "@/features/tools/tool-layout";
import { createLorem } from "@/lib/tool-utils";
import type { Tool } from "@/types";

export default function LoremTool({ tool }: { tool: Tool }) {
  const [paragraphs, setParagraphs] = useState(3);
  const [sentences, setSentences] = useState(4);
  const text = useMemo(() => createLorem({ paragraphs, sentencesPerParagraph: sentences }), [paragraphs, sentences]);
  return (
    <Shell tool={tool}>
      <Panel title="Lorem Ipsum generator">
        <div className="grid gap-4 md:grid-cols-2">
          <Input type="number" min={1} max={10} value={paragraphs} onChange={(e) => setParagraphs(Number(e.target.value))} />
          <Input type="number" min={1} max={10} value={sentences} onChange={(e) => setSentences(Number(e.target.value))} />
        </div>
        <Textarea value={text} readOnly rows={12} />
        <div className="flex gap-2">
          <CopyButton value={text} toolSlug={tool.slug} toolName={tool.name} />
          <DownloadButton content={text} filename="lorem.txt" />
        </div>
      </Panel>
    </Shell>
  );
}
