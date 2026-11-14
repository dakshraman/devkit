"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { prettyBytes } from "@/features/tools/tool-helpers";
import type { Tool } from "@/types";

interface PdfItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pages: number;
}

export default function PdfMergeTool({ tool }: { tool: Tool }) {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [mergedStats, setMergedStats] = useState<{ pages: number; size: number } | null>(null);

  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError("");
    setLoadingFiles(true);

    try {
      const newItems: PdfItem[] = [];
      for (const file of Array.from(files)) {
        if (!file.name.toLowerCase().endsWith(".pdf")) continue;
        try {
          const buffer = await file.arrayBuffer();
          const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
          newItems.push({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            size: file.size,
            pages: doc.getPageCount(),
          });
        } catch (err) {
          setError(`Could not read "${file.name}". It may be encrypted or corrupted.`);
        }
      }
      setItems((prev) => [...prev, ...newItems]);
      setDownloadUrl(null);
    } finally {
      setLoadingFiles(false);
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
    setMergedStats(null);
    setError("");
  };

  const mergePdfs = async () => {
    if (items.length < 2) {
      setError("Please add at least 2 PDF files to merge.");
      return;
    }
    setMerging(true);
    setError("");
    try {
      const mergedPdf = await PDFDocument.create();
      let totalPages = 0;

      for (const item of items) {
        const buffer = await item.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const pageIndices = srcDoc.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(srcDoc, pageIndices);
        for (const page of copiedPages) {
          mergedPdf.addPage(page);
          totalPages++;
        }
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setMergedStats({ pages: totalPages, size: blob.size });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to merge PDF documents.");
    } finally {
      setMerging(false);
    }
  };

  const totalInputPages = items.reduce((acc, curr) => acc + curr.pages, 0);

  return (
    <Shell tool={tool}>
      <Panel title="Merge PDF" description="Combine multiple PDF documents into a single document in any order.">
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition hover:border-primary/50">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
              <Icon icon="lucide:files" className="size-6" />
            </div>
            <h3 className="text-sm font-semibold">Select PDF files to merge</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Files are merged 100% locally in your browser. Nothing is uploaded to any server.
            </p>
            <label className="mt-4 cursor-pointer inline-flex">
              <Button size="sm" type="button" className="pointer-events-none">
                <Icon icon="lucide:upload" className="mr-1.5 size-4" />
                <span>Choose PDF Files</span>
              </Button>
              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
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

          {/* List of Files */}
          {items.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{items.length} files</span>
                  <span>•</span>
                  <span>{totalInputPages} total pages</span>
                </div>
                <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs text-red-500">
                  Clear All
                </Button>
              </div>

              <div className="divide-y divide-border rounded-lg border border-border bg-card">
                {items.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between p-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground font-mono text-[11px] font-bold">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.pages} pages • {prettyBytes(item.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={idx === 0}
                        onClick={() => moveUp(idx)}
                        aria-label="Move Up"
                      >
                        <Icon icon="lucide:arrow-up" className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={idx === items.length - 1}
                        onClick={() => moveDown(idx)}
                        aria-label="Move Down"
                      >
                        <Icon icon="lucide:arrow-down" className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-red-500 hover:text-red-600"
                        onClick={() => remove(idx)}
                        aria-label="Remove"
                      >
                        <Icon icon="lucide:trash-2" className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <Button
                  onClick={mergePdfs}
                  disabled={merging || items.length < 2}
                  className="gap-2"
                >
                  <Icon icon="lucide:combine" className="size-4" />
                  <span>{merging ? "Merging PDFs..." : `Merge ${items.length} PDFs`}</span>
                </Button>

                {downloadUrl && mergedStats && (
                  <div className="flex items-center gap-3">
                    <Badge variant="success">
                      Merged ({mergedStats.pages} pages • {prettyBytes(mergedStats.size)})
                    </Badge>
                    <a
                      href={downloadUrl}
                      download="merged.pdf"
                      className="inline-flex"
                    >
                      <Button size="sm" variant="default" className="gap-1.5">
                        <Icon icon="lucide:download" className="size-4" />
                        <span>Download Merged PDF</span>
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
