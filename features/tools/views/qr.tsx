"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Textarea } from "@/components/ui/input";
import { CopyButton, DownloadButton } from "@/components/ui/copy-button";
import { Shell, Panel } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

export default function QrTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState("https://devkit.local");
  const [dataUrl, setDataUrl] = useState("");
  useEffect(() => {
    QRCode.toDataURL(text, { margin: 1, width: 340, errorCorrectionLevel: "M" }).then(setDataUrl);
  }, [text]);
  return (
    <Shell tool={tool}>
      <Panel title="QR code generator">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} />
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-border bg-background p-4">
            {dataUrl ? <Image src={dataUrl} alt="QR code" width={340} height={340} unoptimized className="mx-auto h-auto w-auto rounded-xl" /> : null}
          </div>
          <div className="space-y-3">
            <CopyButton value={text} toolSlug={tool.slug} toolName={tool.name} />
            {dataUrl && <DownloadButton content={dataUrl} filename="qrcode-data-uri.txt" label="Download data URI" />}
            <p className="text-sm text-muted-foreground">The QR image is generated locally in your browser.</p>
          </div>
        </div>
      </Panel>
    </Shell>
  );
}
