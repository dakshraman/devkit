"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { InfoTile, Panel, Shell } from "@/features/tools/tool-layout";
import { prettyBytes } from "@/features/tools/tool-helpers";
import { downloadImageBlob } from "@/lib/image-utils";
import type { Tool } from "@/types";

const CHECKERBOARD =
  "linear-gradient(45deg, rgba(148,163,184,.25) 25%, transparent 25%), linear-gradient(-45deg, rgba(148,163,184,.25) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(148,163,184,.25) 75%), linear-gradient(-45deg, transparent 75%, rgba(148,163,184,.25) 75%)";

interface BgRemoverProgress {
  key: string;
  current: number;
  total: number;
}

export default function BgRemoverTool({ tool }: { tool: Tool }) {
  const [source, setSource] = useState<{ name: string; size: number; url: string } | null>(null);

  const [progress, setProgress] = useState<BgRemoverProgress | null>(null);
  const [result, setResult] = useState<{ url: string; blob: Blob; size: number } | null>(null);
  const [error, setError] = useState("");
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const onFile = async (file?: File) => {
    if (!file) return;
    setError("");
    setResult(null);
    setProgress(null);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setSource({ name: file.name, size: file.size, url });
    await runRemoval(url);
  };

  const runRemoval = async (url: string) => {
    setProgress({ key: "loading", current: 0, total: 100 });
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(url, {
        output: { format: "image/png" },
        progress: (key, current, total) => {
          if (key.startsWith("fetch:")) {
            setProgress({ key, current, total });
          } else if (key.startsWith("compute:")) {
            setProgress({ key, current: current + 1, total });
          }
        },
      });
      const outUrl = URL.createObjectURL(blob);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = outUrl;
      setResult({ url: outUrl, blob, size: blob.size });
      setProgress(null);
    } catch (err) {
      setProgress(null);
      setError(err instanceof Error ? err.message : "Failed to remove background.");
    }
  };

  const reset = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setSource(null);
    setResult(null);
    setProgress(null);
    setError("");
  };

  const progressPct = progress
    ? progress.total > 0
      ? Math.min(100, Math.round((progress.current / progress.total) * 100))
      : 0
    : 0;
  const isFetching = progress?.key.startsWith("fetch:") ?? false;
  const stageLabel = !progress
    ? ""
    : isFetching
      ? "Downloading AI model…"
      : "Removing background…";

  return (
    <Shell tool={tool}>
      <Panel title="Background remover" description="AI-powered removal that runs entirely in your browser. No upload to any server.">
        {!source && (
          <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-ring/50 hover:text-foreground">
            <Icon icon="lucide:wand-2" className="size-4" />
            Upload image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {source && !result && !error && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile label="File" value={source.name} />
              <InfoTile label="Original size" value={prettyBytes(source.size)} />
            </div>
            <div className="flex items-center justify-center overflow-auto rounded-2xl border border-border bg-card p-3" style={{ backgroundImage: CHECKERBOARD, backgroundSize: 24 }}>
              <Image src={source.url} alt="Source image" width={0} height={0} unoptimized className="max-h-[320px] w-auto" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Icon icon="lucide:loader-2" className="size-4 animate-spin" />
                  {stageLabel}
                </span>
                <span className="tabular-nums text-muted-foreground">{progressPct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        )}
        {result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile label="File" value={source?.name ?? "image"} />
              <InfoTile label="Output size" value={prettyBytes(result.size)} />
            </div>
            <div className="flex items-center justify-center overflow-auto rounded-2xl border border-border bg-card p-3" style={{ backgroundImage: CHECKERBOARD, backgroundSize: 24 }}>
              <Image src={result.url} alt="Background removed" width={0} height={0} unoptimized className="max-h-[320px] w-auto" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => downloadImageBlob(result.blob, (source?.name ?? "image").replace(/\.[^.]+$/, "") + "-bg-removed.png")}>
                Download PNG
              </Button>
              <Button variant="outline" onClick={reset}>
                Remove another image
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The model only runs on your device; the input never leaves this tab.
            </p>
          </div>
        )}
      </Panel>
    </Shell>
  );
}
