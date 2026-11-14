"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { PDFDocument, degrees } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { prettyBytes } from "@/features/tools/tool-helpers";
import type { Tool } from "@/types";

interface PageMeta {
  originalIndex: number;
  rotation: number; // 0, 90, 180, 270
}

export default function PdfOrganizeTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultStats, setResultStats] = useState<{ pages: number; size: number } | null>(null);

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    setDownloadUrl(null);
    setResultStats(null);

    try {
      const buffer = await f.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = doc.getPageCount();

      const initialPages: PageMeta[] = [];
      for (let i = 0; i < count; i++) {
        const p = doc.getPage(i);
        const rot = p.getRotation().angle;
        initialPages.push({ originalIndex: i, rotation: rot });
      }

      setFile(f);
      setPdfBytes(buffer);
      setPages(initialPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load PDF.");
    } finally {
      e.target.value = "";
    }
  };

  const rotatePage = (index: number) => {
    setPages((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        rotation: (copy[index].rotation + 90) % 360,
      };
      return copy;
    });
    setDownloadUrl(null);
  };

  const rotateAll = () => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        rotation: (p.rotation + 90) % 360,
      }))
    );
    setDownloadUrl(null);
  };

  const moveLeft = (index: number) => {
    if (index <= 0) return;
    setPages((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setDownloadUrl(null);
  };

  const moveRight = (index: number) => {
    if (index >= pages.length - 1) return;
    setPages((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setDownloadUrl(null);
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) {
      setError("A PDF document must have at least one page.");
      return;
    }
    setPages((prev) => prev.filter((_, i) => i !== index));
    setDownloadUrl(null);
  };

  const exportPdf = async () => {
    if (!pdfBytes || !file || pages.length === 0) return;
    setProcessing(true);
    setError("");
    setDownloadUrl(null);

    try {
      const srcDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      const indicesToCopy = pages.map((p) => p.originalIndex);
      const copiedPages = await newDoc.copyPages(srcDoc, indicesToCopy);

      for (let i = 0; i < copiedPages.length; i++) {
        const page = copiedPages[i];
        page.setRotation(degrees(pages[i].rotation));
        newDoc.addPage(page);
      }

      const bytes = await newDoc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setResultStats({ pages: pages.length, size: blob.size });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export organized PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Shell tool={tool}>
      <Panel title="Organize & Rotate PDF" description="Rotate pages, delete unwanted pages, and reorder pages in your PDF.">
        <div className="space-y-6">
          {!file ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition hover:border-primary/50">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                <Icon icon="lucide:rotate-cw" className="size-6" />
              </div>
              <h3 className="text-sm font-semibold">Select a PDF file to organize</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Reorder, rotate, or remove pages locally without uploading your document.
              </p>
              <label className="mt-4 cursor-pointer inline-flex">
                <Button size="sm" type="button" className="pointer-events-none">
                  <Icon icon="lucide:upload" className="mr-1.5 size-4" />
                  <span>Choose PDF File</span>
                </Button>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={onFileSelected}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Top Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {pages.length} pages remaining • {prettyBytes(file.size)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={rotateAll} className="gap-1.5 text-xs">
                    <Icon icon="lucide:rotate-cw" className="size-3.5" />
                    <span>Rotate All 90°</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setPdfBytes(null);
                      setPages([]);
                      setDownloadUrl(null);
                    }}
                    className="text-xs"
                  >
                    Change File
                  </Button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500 flex items-center gap-2">
                  <Icon icon="lucide:alert-circle" className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Pages Grid */}
              <div className="grid gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {pages.map((p, idx) => (
                  <div
                    key={`${p.originalIndex}-${idx}`}
                    className="relative flex flex-col justify-between rounded-lg border border-border bg-card p-3 shadow-sm hover:border-border/90"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Page {idx + 1}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {p.rotation}°
                      </span>
                    </div>

                    {/* Page Placeholder Graphic */}
                    <div className="my-3 flex h-28 w-full items-center justify-center rounded border border-border bg-muted/40">
                      <div
                        className="flex items-center justify-center transition-transform duration-200"
                        style={{ transform: `rotate(${p.rotation}deg)` }}
                      >
                        <Icon icon="lucide:file-text" className="size-10 text-muted-foreground/60" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          disabled={idx === 0}
                          onClick={() => moveLeft(idx)}
                          aria-label="Move Left"
                        >
                          <Icon icon="lucide:arrow-left" className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          disabled={idx === pages.length - 1}
                          onClick={() => moveRight(idx)}
                          aria-label="Move Right"
                        >
                          <Icon icon="lucide:arrow-right" className="size-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          onClick={() => rotatePage(idx)}
                          aria-label="Rotate Page"
                        >
                          <Icon icon="lucide:rotate-cw" className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 text-red-500"
                          onClick={() => deletePage(idx)}
                          aria-label="Delete Page"
                        >
                          <Icon icon="lucide:trash" className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <Button
                  onClick={exportPdf}
                  disabled={processing || pages.length === 0}
                  className="gap-2"
                >
                  <Icon icon="lucide:download" className="size-4" />
                  <span>{processing ? "Saving PDF..." : `Export Organized PDF (${pages.length} Pages)`}</span>
                </Button>

                {downloadUrl && resultStats && (
                  <div className="flex items-center gap-3">
                    <Badge variant="success">
                      Saved ({resultStats.pages} pages • {prettyBytes(resultStats.size)})
                    </Badge>
                    <a
                      href={downloadUrl}
                      download={`organized-${file.name}`}
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
