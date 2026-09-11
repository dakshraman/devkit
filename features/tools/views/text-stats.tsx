"use client";

import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/input";
import { InfoTile, Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

export default function TextStatsTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState("DevKit is a developer toolkit that runs entirely in your browser.\nIt includes formatters, encoders, generators and analyzers.");
  const stats = useMemo(() => {
    const characters = text.length;
    const withoutSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
    const lines = text.split(/\r?\n/);
    const sentences = text.split(/[.!?]+(?=\s|$)/).filter((s) => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
    const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
    const averageWordLength = words.length ? (words.reduce((acc, w) => acc + w.length, 0) / words.length).toFixed(1) : "0";
    const readingMinutes = words.length / 200;
    const speakingMinutes = words.length / 130;
    const frequency = words.reduce<Record<string, number>>((acc, w) => {
      const key = w.toLowerCase().replace(/[^a-z0-9']/g, "");
      if (key) acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const topWords = Object.entries(frequency).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return { characters, withoutSpaces, words: words.length, lines: lines.length, sentences, paragraphs, uniqueWords, averageWordLength, readingMinutes, speakingMinutes, topWords };
  }, [text]);
  const fmt = (minutes: number) => (minutes < 1 ? `${Math.round(minutes * 60)} sec` : `${minutes.toFixed(1)} min`);
  return (
    <Shell tool={tool}>
      <Panel title="Text statistics" description="Live counts for characters, words, lines and readability.">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoTile label="Characters" value={String(stats.characters)} />
          <InfoTile label="No spaces" value={String(stats.withoutSpaces)} />
          <InfoTile label="Words" value={String(stats.words)} />
          <InfoTile label="Unique words" value={String(stats.uniqueWords)} />
          <InfoTile label="Lines" value={String(stats.lines)} />
          <InfoTile label="Sentences" value={String(stats.sentences)} />
          <InfoTile label="Paragraphs" value={String(stats.paragraphs)} />
          <InfoTile label="Avg word length" value={stats.averageWordLength} />
          <InfoTile label="Reading time" value={fmt(stats.readingMinutes)} />
          <InfoTile label="Speaking time" value={fmt(stats.speakingMinutes)} />
        </div>
        {stats.topWords.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Most frequent words</div>
            <div className="flex flex-wrap gap-2">
              {stats.topWords.map(([word, count]) => (
                <span key={word} className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs">
                  <span className="font-medium">{word}</span>{" "}
                  <span className="text-muted-foreground">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </Panel>
    </Shell>
  );
}
