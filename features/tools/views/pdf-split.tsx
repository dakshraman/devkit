"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { prettyBytes } from "@/features/tools/tool-helpers";
import type { Tool } from "@/types";

export default function PdfSplitTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [splitMode, setSplitMode] = useState<"range" | "all">("range");
  const [rangeInput, setRangeInput] = useState<string>("1");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>("");
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
      const pages = doc.getPageCount();
      setFile(f);
      setPdfBytes(buffer);
      setPageCount(pages);
      setRangeInput(pages > 1 ? `1-${Math.min(pages, 3)}` : "1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse PDF document.");
    } finally {
      e.target.value = "";
    }
  };

  const parsePageRange = (input: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = input.split(",").map((s) => s.trim()).filter(Boolean);

    for (const part of parts) {
      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-").map((s) => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (Number.isNaN(start) || Number.isNaN(end)) continue;
        for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
          pages.add(i - 1); // 0-indexed
        }
      } else {
        const num = parseInt(part, 10);
        if (!Number.isNaN(num) && num >= 1 && num <= maxPages) {
          pages.add(num - 1);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const executeSplit = async () => {
    if (!pdfBytes || !file || pageCount === 0) return;
    setProcessing(true);
    setError("");
    setDownloadUrl(null);

    try {
      const srcDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

      if (splitMode === "range") {
        const targetIndices = parsePageRange(rangeInput, pageCount);
        if (targetIndices.length === 0) {
          setError(`Invalid page range. Please enter valid page numbers between 1 and ${pageCount}.`);
          setProcessing(false);
          return;
        }

        const newDoc = await PDFDocument.create();
        const copied = await newDoc.copyPages(srcDoc, targetIndices);
        for (const p of copied) {
          newDoc.addPage(p);
        }

        const bytes = await newDoc.save();
        const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const baseName = file.name.replace(/\.pdf$/i, "");
        setDownloadUrl(url);
        setDownloadFilename(`${baseName}-extracted.pdf`);
        setResultStats({ pages: targetIndices.length, size: blob.size });
      } else {
        // Split every single page into zip
        const zip = new JSZip();
        const baseName = file.name.replace(/\.pdf$/i, "");

        for (let i = 0; i < pageCount; i++) {
          const singleDoc = await PDFDocument.create();
          const [page] = await singleDoc.copyPages(srcDoc, [i]);
          singleDoc.addPage(page);
          const singleBytes = await singleDoc.save();
          zip.file(`${baseName}-page-${i + 1}.pdf`, singleBytes);
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        setDownloadUrl(url);
        setDownloadFilename(`${baseName}-split-pages.zip`);
        setResultStats({ pages: pageCount, size: zipBlob.size });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Shell tool={tool}>
      <Panel title="Split & Extract PDF" description="Extract specific pages or split every page into separate PDF files.">
        <div className="space-y-6">
          {!file ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition hover:border-primary/50">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                <Icon icon="lucide:scissors" className="size-6" />
              </div>
              <h3 className="text-sm font-semibold">Select a PDF file to split</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                All page extractions happen locally in your browser.
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
              {/* File Info Card */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon icon="lucide:file-text" className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {pageCount} pages • {prettyBytes(file.size)}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setPdfBytes(null);
                    setDownloadUrl(null);
                  }}
                  className="text-xs"
                >
                  Change File
                </Button>
              </div>

              {/* Mode Selection */}
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setSplitMode("range");
                    setDownloadUrl(null);
                  }}
                  className={`flex items-start gap-3 rounded-lg border p-3.5 text-left transition cursor-pointer ${
                    splitMode === "range"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary mt-0.5">
                    <Icon icon="lucide:file-check" className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold">Extract Selected Range</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Extract specific pages into one new PDF (e.g. 1-3, 5).
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSplitMode("all");
                    setDownloadUrl(null);
                  }}
                  className={`flex items-start gap-3 rounded-lg border p-3.5 text-left transition cursor-pointer ${
                    splitMode === "all"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary mt-0.5">
                    <Icon icon="lucide:archive" className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold">Split All Pages to ZIP</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Export every single page as a standalone PDF in a ZIP file.
                    </p>
                  </div>
                </button>
              </div>

              {/* Range input */}
              {splitMode === "range" && (
                <div className="space-y-2 rounded-lg border border-border bg-card p-4">
                  <label className="text-xs font-semibold text-foreground">
                    Pages to Extract:
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={rangeInput}
                      onChange={(e) => {
                        setRangeInput(e.target.value);
                        setDownloadUrl(null);
                      }}
                      placeholder={`e.g. 1-2, 4, 6-${pageCount}`}
                      className="font-mono text-xs"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Available pages: 1 to {pageCount}. Use hyphens for ranges and commas to separate.
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500 flex items-center gap-2">
                  <Icon icon="lucide:alert-circle" className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <Button
                  onClick={executeSplit}
                  disabled={processing}
                  className="gap-2"
                >
                  <Icon icon="lucide:scissors" className="size-4" />
                  <span>
                    {processing
                      ? "Processing..."
                      : splitMode === "range"
                      ? "Extract Pages"
                      : `Split ${pageCount} Pages to ZIP`}
                  </span>
                </Button>

                {downloadUrl && resultStats && (
                  <div className="flex items-center gap-3">
                    <Badge variant="success">
                      {splitMode === "range"
                        ? `Extracted ${resultStats.pages} pages (${prettyBytes(resultStats.size)})`
                        : `Ready (${resultStats.pages} files • ${prettyBytes(resultStats.size)})`}
                    </Badge>
                    <a
                      href={downloadUrl}
                      download={downloadFilename}
                      className="inline-flex"
                    >
                      <Button size="sm" variant="default" className="gap-1.5">
                        <Icon icon="lucide:download" className="size-4" />
                        <span>Download {splitMode === "all" ? "ZIP Archive" : "PDF"}</span>
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
