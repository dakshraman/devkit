"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton } from "@/components/ui/copy-button";
import { InfoTile, Panel, SectionLabel, Shell } from "@/features/tools/tool-layout";
import { prettyBytes } from "@/features/tools/tool-helpers";
import { blobToDataUrl, canvasToBlob, downloadDataUrl, loadImageFromFile, renderToCanvas } from "@/lib/image-utils";
import type { Tool } from "@/types";

const IMAGE_FORMATS = [
  { id: "image/jpeg", label: "JPEG", ext: "jpg" },
  { id: "image/png", label: "PNG", ext: "png" },
  { id: "image/webp", label: "WebP", ext: "webp" },
  { id: "image/gif", label: "GIF", ext: "gif" },
];

export default function ImageConvertTool({ tool }: { tool: Tool }) {
  const [src, setSrc] = useState<HTMLImageElement | null>(null);
  const [meta, setMeta] = useState<{ name: string; size: number; width: number; height: number; preview: string } | null>(null);
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [lockAspect, setLockAspect] = useState(true);
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(85);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [result, setResult] = useState<{ url: string; mime: string; size: number; width: number; height: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const aspect = meta && meta.height > 0 ? meta.width / meta.height : 1;

  const onFile = async (file?: File) => {
    if (!file) return;
    setError("");
    try {
      const loaded = await loadImageFromFile(file);
      setSrc(loaded.img);
      setMeta({ name: loaded.name, size: loaded.size, width: loaded.width, height: loaded.height, preview: loaded.dataUrl });
      setWidthInput(String(loaded.width));
      setHeightInput(String(loaded.height));
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load image");
    }
  };

  const onWidthChange = (value: string) => {
    setWidthInput(value);
    if (lockAspect) {
      const n = parseInt(value, 10);
      if (!Number.isNaN(n) && n > 0) setHeightInput(String(Math.max(1, Math.round(n / aspect))));
    }
  };
  const onHeightChange = (value: string) => {
    setHeightInput(value);
    if (lockAspect) {
      const n = parseInt(value, 10);
      if (!Number.isNaN(n) && n > 0) setWidthInput(String(Math.max(1, Math.round(n * aspect))));
    }
  };

  const convert = async () => {
    if (!src || !meta) return;
    setBusy(true);
    setError("");
    try {
      const parsedW = parseInt(widthInput, 10);
      const parsedH = parseInt(heightInput, 10);
      const width = Number.isNaN(parsedW) || parsedW <= 0 ? meta.width : Math.min(parsedW, 8000);
      const height = Number.isNaN(parsedH) || parsedH <= 0 ? meta.height : Math.min(parsedH, 8000);
      const canvas = renderToCanvas(src, width, height, format === "image/jpeg" ? bgColor : undefined);
      const blob = await canvasToBlob(canvas, format, format === "image/png" || format === "image/gif" ? undefined : quality / 100);
      const url = await blobToDataUrl(blob);
      setResult({ url, mime: format, size: blob.size, width, height });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
      setResult(null);
    } finally {
      setBusy(false);
    }
  };

  const formatMeta = IMAGE_FORMATS.find((f) => f.id === format);
  const downloadName = `devkit-${(meta?.name ?? "image").replace(/\.[^.]+$/, "")}.${formatMeta?.ext ?? "png"}`;

  return (
    <Shell tool={tool}>
      <Panel title="Image converter" description="Change format, resize and tune quality — all in your browser.">
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          <Icon icon="lucide:upload" className="size-4" />
          {meta ? "Change image" : "Upload image"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {meta && (
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoTile label="File" value={meta.name} />
            <InfoTile label="Size" value={prettyBytes(meta.size)} />
            <InfoTile label="Dimensions" value={`${meta.width} × ${meta.height}px`} />
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <SectionLabel icon="lucide:scan" label="Target format" />
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="mt-1 w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {IMAGE_FORMATS.map((f) => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {(format === "image/jpeg" || format === "image/webp") && (
              <div>
                <SectionLabel icon="lucide:sliders-horizontal" label={`Quality: ${quality}%`} />
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="mt-1 w-full accent-[var(--primary)]"
                />
              </div>
            )}
            {format === "image/jpeg" && (
              <div className="flex items-center gap-3">
                <div>
                  <SectionLabel icon="lucide:palette" label="Background" />
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="mt-1 size-9 cursor-pointer rounded-lg border border-border bg-transparent p-1" />
                </div>
                <p className="text-xs text-muted-foreground">JPEG has no alpha channel, so transparent pixels are filled with this color.</p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <SectionLabel icon="lucide:scaling" label="Resize (optional)" />
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Width px</div>
                <Input value={widthInput} onChange={(e) => onWidthChange(e.target.value)} className="w-28 font-mono" inputMode="numeric" />
              </div>
              <span className="pb-1 text-muted-foreground">×</span>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Height px</div>
                <Input value={heightInput} onChange={(e) => onHeightChange(e.target.value)} className="w-28 font-mono" inputMode="numeric" />
              </div>
              <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={lockAspect}
                  onChange={(e) => setLockAspect(e.target.checked)}
                  className="size-4 accent-[var(--primary)]"
                />
                Lock
              </label>
            </div>
            <Button onClick={convert} disabled={!src || busy}>{busy ? "Converting…" : "Convert"}</Button>
          </div>
        </div>
        {result && meta && (
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-border bg-background p-3">
              <Image src={result.url} alt="Converted image preview" width={result.width} height={result.height} unoptimized className="max-h-[340px] w-auto object-contain" />
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <InfoTile label="Output size" value={prettyBytes(result.size)} />
                <InfoTile label="Dimensions" value={`${result.width} × ${result.height}px`} />
                <InfoTile label="Format" value={formatMeta?.label ?? "image"} />
                <InfoTile
                  label="Saved"
                  value={result.size < meta.size ? `−${prettyBytes(meta.size - result.size)}` : "—"}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton value={result.url} toolSlug={tool.slug} toolName={tool.name} label="Copied data URI" />
                <Button variant="outline" onClick={() => downloadDataUrl(result.url, downloadName)}>Download</Button>
              </div>
            </div>
          </div>
        )}
      </Panel>
    </Shell>
  );
}
