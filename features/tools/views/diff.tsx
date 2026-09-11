"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { CopyButton } from "@/components/ui/copy-button";
import { Shell, Panel } from "@/features/tools/tool-layout";
import { compareTextAdvanced } from "@/lib/tool-utils";
import type { Tool } from "@/types";

export default function DiffTool({ tool }: { tool: Tool }) {
  const [left, setLeft] = useState("function sum(a, b) {\n  return a + b;\n}");
  const [right, setRight] = useState("function sum(a, b) {\n  return a - b;\n}");
  const [viewMode, setViewMode] = useState<"unified" | "side-by-side">("unified");
  const [mode, setMode] = useState<"line" | "word">("line");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const diff = useMemo(
    () => compareTextAdvanced(left, right, { mode, ignoreWhitespace, ignoreCase }),
    [left, right, mode, ignoreWhitespace, ignoreCase]
  );

  const stats = useMemo(() => {
    let added = 0, removed = 0, unchanged = 0;
    diff.forEach(part => {
      const lines = part.value.split('\n').length - 1;
      if (part.added) added += lines;
      else if (part.removed) removed += lines;
      else unchanged += lines;
    });
    return { added, removed, unchanged };
  }, [diff]);

  const diffText = useMemo(() => {
    if (viewMode === 'unified') {
      return diff.map(part => {
        const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
        return part.value.split('\n').filter((_, i, arr) => i < arr.length - 1 || arr[arr.length - 1] !== '').map(line => prefix + line).join('\n');
      }).join('\n');
    }
    const leftLines: { lineNum: number; text: string; type: 'added' | 'removed' | 'unchanged' }[] = [];
    const rightLines: { lineNum: number; text: string; type: 'added' | 'removed' | 'unchanged' }[] = [];
    let leftNum = 1, rightNum = 1;
    diff.forEach(part => {
      const lines = part.value.split('\n');
      const textLines = lines.slice(0, -1);
      if (part.removed) {
        textLines.forEach(line => { leftLines.push({ lineNum: leftNum++, text: line, type: 'removed' }); });
      } else if (part.added) {
        textLines.forEach(line => { rightLines.push({ lineNum: rightNum++, text: line, type: 'added' }); });
      } else {
        textLines.forEach(line => {
          leftLines.push({ lineNum: leftNum++, text: line, type: 'unchanged' });
          rightLines.push({ lineNum: rightNum++, text: line, type: 'unchanged' });
        });
      }
    });
    return leftLines.map((l) => `${String(l.lineNum).padStart(4)} ${l.type === 'removed' ? '-' : ' '}${l.text}`).join('\n') + '\n\n' + rightLines.map(r => `${String(r.lineNum).padStart(4)} ${r.type === 'added' ? '+' : ' '}${r.text}`).join('\n');
  }, [diff, viewMode]);

  const renderSideBySide = () => {
    const leftLines: { lineNum: number; text: string; type: string }[] = [];
    const rightLines: { lineNum: number; text: string; type: string }[] = [];
    let leftNum = 1, rightNum = 1;
    diff.forEach(part => {
      const lines = part.value.split('\n');
      const textLines = lines.slice(0, -1);
      if (part.removed) {
        textLines.forEach(line => { leftLines.push({ lineNum: leftNum++, text: line, type: 'removed' }); });
      } else if (part.added) {
        textLines.forEach(line => { rightLines.push({ lineNum: rightNum++, text: line, type: 'added' }); });
      } else {
        textLines.forEach(line => {
          leftLines.push({ lineNum: leftNum++, text: line, type: 'unchanged' });
          rightLines.push({ lineNum: rightNum++, text: line, type: 'unchanged' });
        });
      }
    });
    const maxRows = Math.max(leftLines.length, rightLines.length);
    return (
      <div className="grid grid-cols-2 gap-4">
        <pre className="max-h-[440px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6">
          {Array.from({ length: maxRows }, (_, i) => {
            const left = leftLines[i];
            if (!left) return <div key={i} className="h-6" />;
            return (
              <div key={i}>
                <span className="inline-block w-8 text-right pr-2 text-muted-foreground select-none">{left.lineNum}</span>
                <span className={left.type === 'removed' ? 'diff-removed' : ''}>{left.text}</span>
              </div>
            );
          })}
        </pre>
        <pre className="max-h-[440px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6">
          {Array.from({ length: maxRows }, (_, i) => {
            const right = rightLines[i];
            if (!right) return <div key={i} className="h-6" />;
            return (
              <div key={i}>
                <span className="inline-block w-8 text-right pr-2 text-muted-foreground select-none">{right.lineNum}</span>
                <span className={right.type === 'added' ? 'diff-added' : ''}>{right.text}</span>
              </div>
            );
          })}
        </pre>
      </div>
    );
  };

  const renderUnified = () => (
    <pre className="max-h-[440px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6">
      {diff.map((part, index) => (
        <span key={index} className={part.added ? "diff-added" : part.removed ? "diff-removed" : ""}>
          {part.value}
        </span>
      ))}
    </pre>
  );

  return (
    <Shell tool={tool}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Left">
          <Textarea value={left} onChange={(e) => setLeft(e.target.value)} rows={16} />
        </Panel>
        <Panel title="Right">
          <Textarea value={right} onChange={(e) => setRight(e.target.value)} rows={16} />
        </Panel>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button variant={viewMode === 'unified' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('unified')}>Unified</Button>
          <Button variant={viewMode === 'side-by-side' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('side-by-side')}>Side by side</Button>
          <div className="w-px bg-border mx-1 h-5" />
          <Button variant={mode === 'line' ? 'default' : 'outline'} size="sm" onClick={() => setMode('line')}>Line</Button>
          <Button variant={mode === 'word' ? 'default' : 'outline'} size="sm" onClick={() => setMode('word')}>Word</Button>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} className="cursor-pointer" />
            Ignore whitespace
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} className="cursor-pointer" />
            Ignore case
          </label>
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-emerald-500">+{stats.added}</span>
        <span className="text-red-500">-{stats.removed}</span>
        <span className="text-muted-foreground">~{stats.unchanged}</span>
        <CopyButton value={diffText} toolSlug={tool.slug} toolName={tool.name} />
      </div>
      <Panel title={viewMode === 'unified' ? 'Unified diff' : 'Side-by-side diff'}>
        {viewMode === 'unified' ? renderUnified() : renderSideBySide()}
      </Panel>
    </Shell>
  );
}
