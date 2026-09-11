"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoTile, Panel, SectionLabel, Shell } from "@/features/tools/tool-layout";
import { useDebounce } from "@/hooks/useDebounce";
import { prettyBytes } from "@/features/tools/tool-helpers";
import { blobToDataUrl, canvasToBlob, downloadDataUrl, loadImageFromFile, renderToCanvas } from "@/lib/image-utils";
import type { Tool } from "@/types";

export default function ImageCompressTool({ tool }: { tool: Tool }) {
  const [src, setSrc] = useState<HTMLImageElement | null>(null);
  const [meta, setMeta] = useState<{ name: string; size: number; width: number; height: number; preview: string } | null>(null);
  const [format, setFormat] = useState("image/webp");
  const [quality, setQuality] = useState(75);
  const [scale, setScale] = useState(100);
  const [result, setResult] = useState<{ url: string; size: number; width: number; height: number } | null>(null);
  const [error, setError] = useState("");
  const debouncedQuality = useDebounce(quality, 250);
  const debouncedScale = useDebounce(scale, 250);
  const debouncedFormat = useDebounce(format, 150);

  useEffect(() => {
    if (!src || !meta) return;
    let active = true;
    (async () => {
      try {
        const width = Math.max(1, Math.round((meta.width * debouncedScale) / 100));
        const height = Math.max(1, Math.round((meta.height * debouncedScale) / 100));
        const canvas = renderToCanvas(src, width, height);
        const blob = await canvasToBlob(canvas, debouncedFormat, debouncedFormat === "image/png" ? undefined : debouncedQuality / 100);
        const url = await blobToDataUrl(blob);
        if (!active) return;
        setResult({ url, size: blob.size, width, height });
        setError("");
      } catch {
        if (active) setResult(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [src, meta, debouncedQuality, debouncedScale, debouncedFormat]);

  const onFile = async (file?: File) => {
    if (!file) return;
    setError("");
    try {
      const loaded = await loadImageFromFile(file);
      setSrc(loaded.img);
      setMeta({ name: loaded.name, size: loaded.size, width: loaded.width, height: loaded.height, preview: loaded.dataUrl });
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load image");
    }
  };

  const savings = meta && result ? meta.size - result.size : 0;
  const savingsPct = meta && result && meta.size > 0 ? Math.round((savings / meta.size) * 100) : 0;

  return (
    <Shell tool={tool}>
      <Panel title="Image compressor" description="Re-encode with live quality and scale controls plus size comparison.">
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          <Icon icon="lucide:file-archive" className="size-4" />
          {meta ? "Change image" : "Upload image"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {meta && (
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoTile label="File" value={meta.name} />
            <InfoTile label="Original size" value={prettyBytes(meta.size)} />
            <InfoTile label="Dimensions" value={`${meta.width} × ${meta.height}px`} />
          </div>
        )}
        {meta && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div>
                <SectionLabel icon="lucide:scan" label="Output format" />
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="mt-1 w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/webp">WebP</SelectItem>
                    <SelectItem value="image/jpeg">JPEG</SelectItem>
                    <SelectItem value="image/png">PNG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <SectionLabel icon="lucide:sliders-horizontal" label={`Quality: ${quality}%`} />
                <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="mt-1 w-full accent-[var(--primary)]" />
              </div>
              <div>
                <SectionLabel icon="lucide:scaling" label={`Scale: ${scale}%`} />
                <input type="range" min={25} max={100} step={5} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="mt-1 w-full accent-[var(--primary)]" />
              </div>
              {result && (
                <p className="text-xs text-muted-foreground">
                  Compressed to {result.width} × {result.height}px.
                </p>
              )}
            </div>
            <div className="space-y-3">
              {result && meta && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoTile label="Compressed" value={prettyBytes(result.size)} />
                    <InfoTile label="Saved" value={savings > 0 ? `−${prettyBytes(savings)}` : "0 B"} />
                  </div>
                  <Badge variant={savingsPct > 0 ? "success" : "outline"}>
                    {savingsPct > 0 ? `${savingsPct}% smaller` : "Not smaller"}
                  </Badge>
                  <Button variant="outline" onClick={() => downloadDataUrl(result.url, `devkit-compressed.${format === "image/webp" ? "webp" : format === "image/jpeg" ? "jpg" : "png"}`)}>
                    Download compressed
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
        {result && (
          <div className="overflow-hidden rounded-2xl border border-border bg-background p-3">
            <Image src={result.url} alt="Compressed image preview" width={result.width} height={result.height} unoptimized className="mx-auto max-h-[340px] w-auto object-contain" />
          </div>
        )}
      </Panel>
    </Shell>
  );
}
