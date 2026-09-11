"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { CopyButton } from "@/components/ui/copy-button";
import type { Tool } from "@/types";

/* ---------- LEB128 helpers ---------- */
function readLeb128U(data: Uint8Array, offset: number): [number, number] {
  let result = 0;
  let shift = 0;
  let i = offset;
  while (i < data.length) {
    const byte = data[i];
    result |= (byte & 0x7f) << shift;
    i++;
    if ((byte & 0x80) === 0) break;
    shift += 7;
  }
  return [result >>> 0, i];
}

function readLeb128S(data: Uint8Array, offset: number): [number, number] {
  let result = 0;
  let shift = 0;
  let i = offset;
  while (i < data.length) {
    const byte = data[i];
    result |= (byte & 0x7f) << shift;
    shift += 7;
    i++;
    if ((byte & 0x80) === 0) {
      if (shift < 32 && (byte & 0x40) !== 0) result |= -(1 << shift);
      break;
    }
  }
  return [result, i];
}

function readName(data: Uint8Array, offset: number): [string, number] {
  const [len, next] = readLeb128U(data, offset);
  const bytes = data.slice(next, next + len);
  return [new TextDecoder().decode(bytes), next + len];
}

/* ---------- Section IDs ---------- */
const SECTION_NAMES: Record<number, string> = {
  0: "Custom",
  1: "Type",
  2: "Import",
  3: "Function",
  4: "Table",
  5: "Memory",
  6: "Global",
  7: "Export",
  8: "Start",
  9: "Element",
  10: "Code",
  11: "Data",
  12: "Data Count",
};

const VAL_TYPES: Record<number, string> = {
  0x7f: "i32",
  0x7e: "i64",
  0x7d: "f32",
  0x7c: "f64",
  0x70: "funcref",
  0x6f: "externref",
};

interface WasmSection {
  id: number;
  name: string;
  size: number;
  offset: number;
  contentOffset: number;
}

interface WasmImport {
  module: string;
  name: string;
  kind: number;
  type?: string;
}

interface WasmExport {
  name: string;
  kind: number;
  index: number;
}

interface WasmResult {
  version: number;
  sections: WasmSection[];
  imports: WasmImport[];
  exports: WasmExport[];
  memoryCount: number;
  functionCount: number;
  typeCount: number;
}

function parseWasm(buffer: ArrayBuffer): WasmResult {
  const data = new Uint8Array(buffer);
  if (data.length < 8) throw new Error("File too small to be a valid WASM module");
  if (data[0] !== 0x00 || data[1] !== 0x61 || data[2] !== 0x73 || data[3] !== 0x6d) {
    throw new Error("Invalid WASM magic number (expected 0x0061736d)");
  }
  const version = data[4] | (data[5] << 8) | (data[6] << 16) | (data[7] << 24);
  const sections: WasmSection[] = [];
  const imports: WasmImport[] = [];
  const exports: WasmExport[] = [];
  let memoryCount = 0;
  let functionCount = 0;
  let typeCount = 0;

  let pos = 8;
  while (pos < data.length) {
    const sectionId = data[pos++];
    const [sectionSize, nextPos] = readLeb128U(data, pos);
    pos = nextPos;
    const contentOffset = pos;
    const sectionName = SECTION_NAMES[sectionId] ?? `Unknown(${sectionId})`;

    sections.push({
      id: sectionId,
      name: sectionName,
      size: sectionSize,
      offset: contentOffset - 1 - (nextPos - (contentOffset - sectionSize - 1)),
      contentOffset,
    });

    if (sectionId === 1) {
      let p = contentOffset;
      const [count, cp] = readLeb128U(data, p);
      typeCount = count;
      p = cp;
      for (let i = 0; i < count && p < contentOffset + sectionSize; i++) {
        p++; // 0x60 = func type
        const [paramCount, np] = readLeb128U(data, p);
        p = np;
        for (let j = 0; j < paramCount; j++) p++;
        const [resultCount, rp] = readLeb128U(data, p);
        p = rp;
        for (let j = 0; j < resultCount; j++) p++;
      }
    } else if (sectionId === 2) {
      let p = contentOffset;
      const [count, cp] = readLeb128U(data, p);
      p = cp;
      for (let i = 0; i < count && p < contentOffset + sectionSize; i++) {
        const [mod, np] = readName(data, p);
        p = np;
        const [nm, np2] = readName(data, p);
        p = np2;
        const kind = data[p++];
        let type = "";
        if (kind === 0) {
          const [idx, tp] = readLeb128U(data, p);
          p = tp;
          type = `func[${idx}]`;
        } else if (kind === 1) {
          p++; // limits
          const [min, mp] = readLeb128U(data, p);
          p = mp;
          if (data[p - 1] & 0x01) {
            const [, mp2] = readLeb128U(data, p);
            p = mp2;
          }
          type = `memory(min=${min})`;
        } else if (kind === 2) {
          p += 2; // elem type + limits
          const [min, mp] = readLeb128U(data, p);
          p = mp;
          if (data[p - 1] & 0x01) {
            const [, mp2] = readLeb128U(data, p);
            p = mp2;
          }
          type = `table(min=${min})`;
        } else if (kind === 3) {
          p++; // global type
          p++; // mutable
          type = "global";
        }
        imports.push({ module: mod, name: nm, kind, type });
      }
    } else if (sectionId === 3) {
      let p = contentOffset;
      const [count, cp] = readLeb128U(data, p);
      functionCount = count;
      p = cp;
      for (let i = 0; i < count; i++) {
        const [, np] = readLeb128U(data, p);
        p = np;
      }
    } else if (sectionId === 5) {
      memoryCount++;
    } else if (sectionId === 7) {
      let p = contentOffset;
      const [count, cp] = readLeb128U(data, p);
      p = cp;
      for (let i = 0; i < count; i++) {
        const [name, np] = readName(data, p);
        p = np;
        const kind = data[p++];
        const [idx, ip] = readLeb128U(data, p);
        p = ip;
        exports.push({ name, kind, index: idx });
      }
    } else {
      // skip section content
    }
    pos = contentOffset + sectionSize;
  }

  return { version, sections, imports, exports, memoryCount, functionCount, typeCount };
}

function hexDump(data: Uint8Array, maxBytes = 512): string {
  const lines: string[] = [];
  const len = Math.min(data.length, maxBytes);
  for (let i = 0; i < len; i += 16) {
    const offset = i.toString(16).padStart(8, "0");
    const hex: string[] = [];
    const ascii: string[] = [];
    for (let j = 0; j < 16 && i + j < len; j++) {
      const byte = data[i + j];
      hex.push(byte.toString(16).padStart(2, "0"));
      ascii.push(byte >= 32 && byte < 127 ? String.fromCharCode(byte) : ".");
    }
    lines.push(`${offset}  ${hex.join(" ")}  ${ascii.join("")}`);
  }
  return lines.join("\n");
}

const EXPORT_KINDS: Record<number, string> = { 0: "Func", 1: "Table", 2: "Memory", 3: "Global" };

export default function WasmExplorer({ tool }: { tool: Tool }) {
  const [result, setResult] = useState<WasmResult | null>(null);
  const [hex, setHex] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "sections" | "imports" | "exports" | "hex">("overview");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = useCallback((file?: File) => {
    if (!file) return;
    setFileName(file.name);
    setFileSize(file.size);
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const buf = reader.result as ArrayBuffer;
        const parsed = parseWasm(buf);
        setResult(parsed);
        setHex(hexDump(new Uint8Array(buf)));
      } catch (err) {
        setResult(null);
        setError(err instanceof Error ? err.message : "Failed to parse WASM file");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const tabs = ["overview", "sections", "imports", "exports", "hex"] as const;

  return (
    <Shell tool={tool}>
      <Panel title="WASM Explorer" description="Inspect WebAssembly binary modules — view sections, imports, exports, and hex structure.">
        <div className="flex items-center gap-3">
          <input ref={inputRef} type="file" accept=".wasm" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            Upload .wasm file
          </Button>
          {fileName && <span className="text-sm text-muted-foreground">{fileName} ({(fileSize / 1024).toFixed(1)} KB)</span>}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {result && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Version", value: `v${result.version}` },
                  { label: "Sections", value: String(result.sections.length) },
                  { label: "Functions", value: String(result.functionCount) },
                  { label: "Types", value: String(result.typeCount) },
                  { label: "Imports", value: String(result.imports.length) },
                  { label: "Exports", value: String(result.exports.length) },
                  { label: "Memories", value: String(result.memoryCount) },
                  { label: "File Size", value: `${(fileSize / 1024).toFixed(1)} KB` },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-border bg-background p-3">
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className="mt-1 font-mono text-lg font-semibold">{item.value}</div>
                  </div>
                ))}
              </div>
            )}

            {tab === "sections" && (
              <div className="space-y-1">
                <div className="grid grid-cols-[auto_1fr_auto] gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <span>ID</span><span>Section</span><span>Size</span>
                </div>
                {result.sections.map((s, i) => (
                  <div key={i} className="grid grid-cols-[auto_1fr_auto] gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="w-6 text-center font-mono text-muted-foreground">{s.id}</span>
                    <span className="font-medium">{s.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{s.size.toLocaleString()} B</span>
                  </div>
                ))}
              </div>
            )}

            {tab === "imports" && (
              <div className="space-y-1">
                {result.imports.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No imports found.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      <span>Module</span><span>Name</span><span>Details</span>
                    </div>
                    {result.imports.map((imp, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_1fr] gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                        <span className="font-mono text-xs">{imp.module}</span>
                        <span className="font-mono text-xs">{imp.name}</span>
                        <span className="text-xs text-muted-foreground">{imp.type}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {tab === "exports" && (
              <div className="space-y-1">
                {result.exports.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No exports found.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      <span>Name</span><span>Kind</span><span>Index</span>
                    </div>
                    {result.exports.map((exp, i) => (
                      <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                        <span className="font-mono text-xs">{exp.name}</span>
                        <span className="text-xs text-muted-foreground">{EXPORT_KINDS[exp.kind] ?? `Unknown(${exp.kind})`}</span>
                        <span className="font-mono text-xs text-muted-foreground">{exp.index}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {tab === "hex" && (
              <div className="relative">
                <CopyButton value={hex} toolSlug={tool.slug} toolName={tool.name} className="absolute right-2 top-2" />
                <pre className="overflow-x-auto rounded-xl border border-border bg-background p-4 font-mono text-xs leading-relaxed text-muted-foreground">
                  {hex}
                </pre>
              </div>
            )}
          </div>
        )}
      </Panel>
    </Shell>
  );
}
