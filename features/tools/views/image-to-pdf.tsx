"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { prettyBytes } from "@/features/tools/tool-helpers";
import { loadImageFromFile, renderToCanvas, canvasToBlob } from "@/lib/image-utils";
import type { Tool } from "@/types";

interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  width: number;
  height: number;
  previewUrl: string;
}

export default function ImageToPdfTool({ tool }: { tool: Tool }) {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "fit">("a4");
  const [orientation, setOrientation] = useState<"auto" | "portrait" | "landscape">("auto");
  const [margin, setMargin] = useState<"none" | "small" | "normal">("small");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultStats, setResultStats] = useState<{ pages: number; size: number } | null>(null);

  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError("");

    try {
      const newItems: ImageItem[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        try {
          const loaded = await loadImageFromFile(file);
          newItems.push({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            size: file.size,
            width: loaded.width,
            height: loaded.height,
            previewUrl: loaded.dataUrl,
          });
        } catch (err) {
          setError(`Could not load image: ${file.name}`);
        }
      }
      setItems((prev) => [...prev, ...newItems]);
      setDownloadUrl(null);
    } finally {
      e.target.value = "";
    }
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setDownloadUrl(null);
  };

  const moveDown = (index: number) => {
    if (index >= items.length - 1) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setDownloadUrl(null);
  };

  const remove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setDownloadUrl(null);
  };

  const clearAll = () => {
    setItems([]);
    setDownloadUrl(null);
    setResultStats(null);
    setError("");
  };

  const generatePdf = async () => {
    if (items.length === 0) return;
    setProcessing(true);
    setError("");
    setDownloadUrl(null);

    try {
      const pdfDoc = await PDFDocument.create();
      const marginPt = margin === "none" ? 0 : margin === "small" ? 20 : 40;

      for (const item of items) {
        // Convert image to clean PNG blob via canvas
        const loaded = await loadImageFromFile(item.file);
        const canvas = renderToCanvas(loaded.img, loaded.width, loaded.height);
        const blob = await canvasToBlob(canvas, "image/png");
        const arrayBuf = await blob.arrayBuffer();
        const embeddedImg = await pdfDoc.embedPng(arrayBuf);

        let pageWidth: number;
        let pageHeight: number;

        if (pageSize === "fit") {
          pageWidth = loaded.width + marginPt * 2;
          pageHeight = loaded.height + marginPt * 2;
        } else {
          // A4 = 595.28 x 841.89, Letter = 612 x 792
          const standardDim =
            pageSize === "a4"
              ? { w: 595.28, h: 841.89 }
              : { w: 612, h: 792 };

          const isLandscape =
            orientation === "landscape" ||
            (orientation === "auto" && loaded.width > loaded.height);

          pageWidth = isLandscape ? standardDim.h : standardDim.w;
          pageHeight = isLandscape ? standardDim.w : standardDim.h;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate fitted image dimensions maintaining aspect ratio
        const availWidth = pageWidth - marginPt * 2;
        const availHeight = pageHeight - marginPt * 2;
        const imgAspect = loaded.width / loaded.height;
        const pageAspect = availWidth / availHeight;

        let drawWidth: number;
        let drawHeight: number;

        if (imgAspect > pageAspect) {
          drawWidth = availWidth;
          drawHeight = availWidth / imgAspect;
        } else {
          drawHeight = availHeight;
          drawWidth = availHeight * imgAspect;
        }

        const x = marginPt + (availWidth - drawWidth) / 2;
        const y = marginPt + (availHeight - drawHeight) / 2;

        page.drawImage(embeddedImg, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const resultBlob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(resultBlob);
      setDownloadUrl(url);
      setResultStats({ pages: items.length, size: resultBlob.size });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF from images.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Shell tool={tool}>
      <Panel title="Image to PDF" description="Convert JPG, PNG, and WebP images into a clean PDF document.">
        <div className="space-y-6">
          {/* Upload Box */}
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition hover:border-primary/50">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
              <Icon icon="lucide:image" className="size-6" />
            </div>
            <h3 className="text-sm font-semibold">Select images to convert into PDF</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports PNG, JPG, WebP, and GIF. Images are processed locally.
            </p>
            <label className="mt-4 cursor-pointer inline-flex">
              <Button size="sm" type="button" className="pointer-events-none">
                <Icon icon="lucide:upload" className="mr-1.5 size-4" />
                <span>Choose Images</span>
              </Button>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={onFilesSelected}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500 flex items-center gap-2">
              <Icon icon="lucide:alert-circle" className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {items.length > 0 && (
            <div className="space-y-6">
              {/* Layout Settings Bar */}
              <div className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Page Size</label>
                  <Select
                    value={pageSize}
                    onValueChange={(val) => {
                      setPageSize(val as "a4" | "letter" | "fit");
                      setDownloadUrl(null);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Page Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4 (Standard)</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="fit">Fit to Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Orientation</label>
                  <Select
                    value={orientation}
                    onValueChange={(val) => {
                      setOrientation(val as "auto" | "portrait" | "landscape");
                      setDownloadUrl(null);
                    }}
                    disabled={pageSize === "fit"}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (Match Image)</SelectItem>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Margins</label>
                  <Select
                    value={margin}
                    onValueChange={(val) => {
                      setMargin(val as "none" | "small" | "normal");
                      setDownloadUrl(null);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Margin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Margin (0)</SelectItem>
                      <SelectItem value="small">Small (20pt)</SelectItem>
                      <SelectItem value="normal">Normal (40pt)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{items.length} images selected</span>
                  <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs text-red-500">
                    Clear All
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card p-3 shadow-sm"
                    >
                      <div className="relative aspect-video w-full overflow-hidden rounded bg-muted/40 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                        <div className="absolute top-1.5 left-1.5 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-bold">
                          Page {idx + 1}
                        </div>
                      </div>

                      <div className="mt-2 min-w-0">
                        <p className="truncate text-xs font-medium text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.width} × {item.height}px • {prettyBytes(item.size)}
                        </p>
                      </div>

                      <div className="mt-2.5 flex items-center justify-end gap-1 border-t border-border/40 pt-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 text-xs"
                          disabled={idx === 0}
                          onClick={() => moveUp(idx)}
                          aria-label="Move Up"
                        >
                          <Icon icon="lucide:arrow-left" className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 text-xs"
                          disabled={idx === items.length - 1}
                          onClick={() => moveDown(idx)}
                          aria-label="Move Down"
                        >
                          <Icon icon="lucide:arrow-right" className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 text-xs text-red-500"
                          onClick={() => remove(idx)}
                          aria-label="Delete"
                        >
                          <Icon icon="lucide:trash" className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <Button
                  onClick={generatePdf}
                  disabled={processing || items.length === 0}
                  className="gap-2"
                >
                  <Icon icon="lucide:file-plus" className="size-4" />
                  <span>{processing ? "Generating PDF..." : `Convert ${items.length} Images to PDF`}</span>
                </Button>

                {downloadUrl && resultStats && (
                  <div className="flex items-center gap-3">
                    <Badge variant="success">
                      Generated ({resultStats.pages} pages • {prettyBytes(resultStats.size)})
                    </Badge>
                    <a
                      href={downloadUrl}
                      download="converted-images.pdf"
                      className="inline-flex"
                    >
                      <Button size="sm" variant="default" className="gap-1.5">
                        <Icon icon="lucide:download" className="size-4" />
                        <span>Download PDF</span>
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Panel>
    </Shell>
  );
}
