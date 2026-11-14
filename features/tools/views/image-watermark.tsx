"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { prettyBytes } from "@/features/tools/tool-helpers";
import { loadImageFromFile, canvasToBlob, downloadImageBlob } from "@/lib/image-utils";
import type { Tool } from "@/types";

type Position = "tl" | "tc" | "tr" | "cl" | "cc" | "cr" | "bl" | "bc" | "br" | "tile";

export default function ImageWatermarkTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
  const [origWidth, setOrigWidth] = useState(0);
  const [origHeight, setOrigHeight] = useState(0);

  // Watermark parameters
  const [text, setText] = useState("CONFIDENTIAL");
  const [color, setColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(36);
  const [opacity, setOpacity] = useState(60); // 10 to 100%
  const [rotation, setRotation] = useState(-30); // -90 to 90
  const [position, setPosition] = useState<Position>("cc");

  // Output
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");

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
      // Automatically adjust default font size relative to image dimensions
      setFontSize(Math.max(18, Math.round(loaded.width / 22)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load image.");
    } finally {
      e.target.value = "";
    }
  };

  const renderWatermark = useCallback(async () => {
    if (!loadedImg || origWidth <= 0 || origHeight <= 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = origWidth;
    canvas.height = origHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw base image
    ctx.drawImage(loadedImg, 0, 0, origWidth, origHeight);

    if (!text.trim()) {
      try {
        const blob = await canvasToBlob(canvas, "image/png");
        setOutputBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch {
        // ignore
      }
      return;
    }

    // Configure text styling
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity / 100;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const rad = (rotation * Math.PI) / 180;

    if (position === "tile") {
      // Repeat tiled pattern across the canvas
      const stepX = fontSize * 8;
      const stepY = fontSize * 4;

      for (let x = -origWidth; x < origWidth * 2; x += stepX) {
        for (let y = -origHeight; y < origHeight * 2; y += stepY) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rad);
          ctx.fillText(text, 0, 0);
          ctx.restore();
        }
      }
    } else {
      // Fixed 9-point grid positioning
      let posX = origWidth / 2;
      let posY = origHeight / 2;
      const padding = fontSize * 1.5;

      if (position.includes("l")) posX = padding;
      if (position.includes("r")) posX = origWidth - padding;
      if (position.includes("t")) posY = padding;
      if (position.includes("b")) posY = origHeight - padding;

      ctx.save();
      ctx.translate(posX, posY);
      ctx.rotate(rad);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    try {
      const blob = await canvasToBlob(canvas, "image/png");
      setOutputBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Canvas export failed.");
    }
  }, [loadedImg, origWidth, origHeight, text, color, fontSize, opacity, rotation, position]);

  useEffect(() => {
    if (loadedImg) {
      renderWatermark();
    }
  }, [renderWatermark, loadedImg]);

  const downloadResult = () => {
    if (!outputBlob || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, "");
    downloadImageBlob(outputBlob, `${base}-watermarked.png`);
  };

  return (
    <Shell tool={tool}>
      <Panel title="Watermark Image" description="Add customizable text watermarks to your images with live position & opacity controls.">
        <div className="space-y-6">
          {!file ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition hover:border-primary/50">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                <Icon icon="lucide:stamp" className="size-6" />
              </div>
              <h3 className="text-sm font-semibold">Select an image to watermark</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                All watermarking happens locally on your machine.
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
                    {origWidth} × {origHeight}px • {prettyBytes(file.size)}
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

              {/* Controls and Preview */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Settings Column */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Watermark Text</label>
                    <Input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="e.g. DRAFT, CONFIDENTIAL, or copyright"
                      className="h-8 text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="size-8 rounded border border-border cursor-pointer p-0.5"
                        />
                        <Input
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Opacity ({opacity}%)
                      </label>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={opacity}
                        onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
                        className="w-full h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Font Size ({fontSize}px)
                      </label>
                      <input
                        type="range"
                        min={12}
                        max={140}
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                        className="w-full h-8"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Rotation ({rotation}°)
                      </label>
                      <input
                        type="range"
                        min={-90}
                        max={90}
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                        className="w-full h-8"
                      />
                    </div>
                  </div>

                  {/* Position Picker */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground">Placement</label>
                      <Button
                        size="sm"
                        variant={position === "tile" ? "default" : "outline"}
                        onClick={() => setPosition(position === "tile" ? "cc" : "tile")}
                        className="h-7 text-xs"
                      >
                        {position === "tile" ? "Tiled (Full Image)" : "Switch to Tiled"}
                      </Button>
                    </div>

                    {position !== "tile" && (
                      <div className="grid grid-cols-3 gap-1.5 max-w-[150px]">
                        {(["tl", "tc", "tr", "cl", "cc", "cr", "bl", "bc", "br"] as Position[]).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setPosition(pos)}
                            className={`flex size-8 items-center justify-center rounded border text-[10px] font-bold transition cursor-pointer ${
                              position === pos
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border bg-card hover:bg-muted"
                            }`}
                          >
                            {pos.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview Column */}
                <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/10 p-4">
                  <div className="flex items-center justify-between w-full mb-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Watermarked Result:</span>
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
                        alt="Watermarked Preview"
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
                      <span>Download Watermarked Image</span>
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
