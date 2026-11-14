"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { prettyBytes } from "@/features/tools/tool-helpers";
import { loadImageFromFile, canvasToBlob, downloadImageBlob } from "@/lib/image-utils";
import type { Tool } from "@/types";

export default function ImageResizerTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
  const [origWidth, setOrigWidth] = useState(0);
  const [origHeight, setOrigHeight] = useState(0);

  // Resize settings
  const [resizeMode, setResizeMode] = useState<"pixels" | "percentage">("pixels");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [percentage, setPercentage] = useState(100);

  // Transformation settings
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Format settings
  const [exportMime, setExportMime] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [quality, setQuality] = useState(90);

  // Output
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");

    try {
      const loaded = await loadImageFromFile(f);
      setFile(f);
      setLoadedImg(loaded.img);
      setOrigWidth(loaded.width);
      setOrigHeight(loaded.height);
      setWidth(loaded.width);
      setHeight(loaded.height);
      setPercentage(100);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load image.");
    } finally {
      e.target.value = "";
    }
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && origWidth > 0) {
      const ratio = origHeight / origWidth;
      setHeight(Math.max(1, Math.round(val * ratio)));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && origHeight > 0) {
      const ratio = origWidth / origHeight;
      setWidth(Math.max(1, Math.round(val * ratio)));
    }
  };

  const handlePercentageChange = (pct: number) => {
    setPercentage(pct);
    const newW = Math.max(1, Math.round((origWidth * pct) / 100));
    const newH = Math.max(1, Math.round((origHeight * pct) / 100));
    setWidth(newW);
    setHeight(newH);
  };

  const renderCanvas = useCallback(async () => {
    if (!loadedImg || width <= 0 || height <= 0) return;

    const canvas = document.createElement("canvas");
    const isRotated90or270 = rotation === 90 || rotation === 270;
    canvas.width = isRotated90or270 ? height : width;
    canvas.height = isRotated90or270 ? width : height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    ctx.drawImage(loadedImg, -width / 2, -height / 2, width, height);
    ctx.restore();

    try {
      const q = exportMime === "image/png" ? undefined : quality / 100;
      const blob = await canvasToBlob(canvas, exportMime, q);
      setOutputBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Canvas export failed.");
    }
  }, [loadedImg, width, height, rotation, flipH, flipV, exportMime, quality]);

  useEffect(() => {
    if (loadedImg) {
      renderCanvas();
    }
  }, [renderCanvas, loadedImg]);

  const downloadResult = () => {
    if (!outputBlob || !file) return;
    const ext = exportMime === "image/png" ? "png" : exportMime === "image/jpeg" ? "jpg" : "webp";
    const base = file.name.replace(/\.[^/.]+$/, "");
    downloadImageBlob(outputBlob, `${base}-resized.${ext}`);
  };

  return (
    <Shell tool={tool}>
      <Panel title="Image Resizer & Crop" description="Resize images by dimensions or percentage, and rotate or flip format.">
        <div className="space-y-6">
          {!file ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition hover:border-primary/50">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                <Icon icon="lucide:scaling" className="size-6" />
              </div>
              <h3 className="text-sm font-semibold">Select an image to resize</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports PNG, JPG, WebP, GIF, and SVG.
              </p>
              <label className="mt-4 cursor-pointer inline-flex">
                <Button size="sm" type="button" className="pointer-events-none">
                  <Icon icon="lucide:upload" className="mr-1.5 size-4" />
                  <span>Choose Image</span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileSelected}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File details bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Original: {origWidth} × {origHeight}px • {prettyBytes(file.size)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setLoadedImg(null);
                    setPreviewUrl(null);
                    setOutputBlob(null);
                  }}
                  className="text-xs"
                >
                  Change Image
                </Button>
              </div>

              {/* Controls Grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left settings */}
                <div className="space-y-4">
                  {/* Mode switcher */}
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Button
                      size="sm"
                      variant={resizeMode === "pixels" ? "default" : "outline"}
                      onClick={() => setResizeMode("pixels")}
                      className="h-8 text-xs"
                    >
                      By Pixels
                    </Button>
                    <Button
                      size="sm"
                      variant={resizeMode === "percentage" ? "default" : "outline"}
                      onClick={() => setResizeMode("percentage")}
                      className="h-8 text-xs"
                    >
                      By Percentage
                    </Button>
                  </div>

                  {resizeMode === "pixels" ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground">Width (px)</label>
                          <Input
                            type="number"
                            value={width}
                            onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 1)}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground">Height (px)</label>
                          <Input
                            type="number"
                            value={height}
                            onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 1)}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lockAspect}
                          onChange={(e) => setLockAspect(e.target.checked)}
                          className="rounded border-border"
                        />
                        <span>Lock Aspect Ratio</span>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-foreground">
                        Scale Percentage: {percentage}%
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[25, 50, 75, 125, 150, 200].map((pct) => (
                          <Button
                            key={pct}
                            variant={percentage === pct ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePercentageChange(pct)}
                            className="h-7 text-xs"
                          >
                            {pct}%
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Target dimensions: {width} × {height}px
                      </p>
                    </div>
                  )}

                  {/* Transformation Controls */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <label className="text-xs font-semibold text-foreground">Rotate & Flip</label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Icon icon="lucide:rotate-cw" className="size-3.5" />
                        <span>Rotate 90°</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={flipH ? "default" : "outline"}
                        onClick={() => setFlipH(!flipH)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Icon icon="lucide:flip-horizontal" className="size-3.5" />
                        <span>Flip H</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={flipV ? "default" : "outline"}
                        onClick={() => setFlipV(!flipV)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Icon icon="lucide:flip-vertical" className="size-3.5" />
                        <span>Flip V</span>
                      </Button>
                    </div>
                  </div>

                  {/* Export Format */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Format</label>
                      <Select
                        value={exportMime}
                        onValueChange={(val) => setExportMime(val as typeof exportMime)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image/png">PNG</SelectItem>
                          <SelectItem value="image/jpeg">JPEG</SelectItem>
                          <SelectItem value="image/webp">WebP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {exportMime !== "image/png" && (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground">
                          Quality ({quality}%)
                        </label>
                        <input
                          type="range"
                          min={10}
                          max={100}
                          value={quality}
                          onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                          className="w-full h-8"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Preview */}
                <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/10 p-4">
                  <div className="flex items-center justify-between w-full mb-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Preview:</span>
                    {outputBlob && (
                      <Badge variant="secondary" className="text-[10px]">
                        {prettyBytes(outputBlob.size)}
                      </Badge>
                    )}
                  </div>

                  {previewUrl ? (
                    <div className="flex max-h-72 w-full items-center justify-center overflow-hidden rounded border border-border/40 bg-background/50 p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Resized Preview"
                        className="max-h-64 max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-56 items-center justify-center text-xs text-muted-foreground">
                      Rendering preview...
                    </div>
                  )}

                  <div className="mt-4 w-full">
                    <Button
                      onClick={downloadResult}
                      disabled={!outputBlob}
                      className="w-full gap-2"
                    >
                      <Icon icon="lucide:download" className="size-4" />
                      <span>Download Resized Image</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Panel>
    </Shell>
  );
}
