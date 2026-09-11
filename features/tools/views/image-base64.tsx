"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { Textarea } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton, DownloadButton } from "@/components/ui/copy-button";
import { Shell, Panel } from "@/features/tools/tool-layout";
import { bytesToBase64 } from "@/lib/utils";
import { imageBase64ToDataUrl } from "@/features/tools/tool-helpers";
import type { Tool } from "@/types";

export default function ImageToBase64Tool({ tool }: { tool: Tool }) {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [value, setValue] = useState("");
  const [fileName, setFileName] = useState("");
  const onUpload = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    const array = await file.arrayBuffer();
    const bytes = new Uint8Array(array);
    const data = `data:${file.type || "image/png"};base64,${bytesToBase64(bytes)}`;
    setValue(data);
  };
  const dataUrl = useMemo(() => (mode === "decode" ? imageBase64ToDataUrl(value) : value), [mode, value]);
  const canPreview = dataUrl.length > 0;
  return (
    <Shell tool={tool}>
      <Panel title="Image ↔ Base64">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "encode" | "decode")}>
          <TabsList>
            <TabsTrigger value="encode">Image → Base64</TabsTrigger>
            <TabsTrigger value="decode">Base64 → Image</TabsTrigger>
          </TabsList>
        </Tabs>
        {mode === "encode" ? (
          <>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
              <Icon icon="lucide:upload" className="size-4" />
              Upload image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files?.[0])} />
            </label>
            {fileName && <p className="text-sm text-muted-foreground">{fileName}</p>}
            <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={10} className="font-mono text-[13px]" placeholder="Generated data URI appears here..." />
            <div className="flex gap-2">
              <CopyButton value={value} toolSlug={tool.slug} toolName={tool.name} />
              <DownloadButton content={value} filename="image-base64.txt" />
            </div>
          </>
        ) : (
          <>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={8}
              className="font-mono text-[13px]"
              placeholder="Paste a base64 image string or data URI here..."
            />
            {value && !canPreview && (
              <p className="text-sm text-red-500">Not a valid base64 image string.</p>
            )}
            {canPreview && (
              <>
                <CopyButton value={dataUrl} toolSlug={tool.slug} toolName={tool.name} />
                <DownloadButton
                  content={dataUrl}
                  filename={`image.${dataUrl.match(/^data:image\/(\w+);/)?.at(1) ?? "png"}`}
                  mime="application/octet-stream"
                  label="Download image"
                />
              </>
            )}
          </>
        )}
        {canPreview && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-background p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</div>
            <Image src={dataUrl} alt="Base64 image preview" width={640} height={480} unoptimized className="mx-auto max-h-[420px] w-auto rounded-xl" />
          </div>
        )}
      </Panel>
    </Shell>
  );
}
