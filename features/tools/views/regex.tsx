"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { SafeHtml } from "@/components/ui/safe-html";
import { Input, Textarea } from "@/components/ui/input";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { escapeHtml, REGEX_PRESETS } from "@/features/tools/tool-helpers";
import type { Tool } from "@/types";

export default function RegexTool({ tool }: { tool: Tool }) {
  const [pattern, setPattern] = useState("\\bDevKit\\b");
  const [flagG, setFlagG] = useState(true);
  const [flagI, setFlagI] = useState(true);
  const [flagM, setFlagM] = useState(false);
  const [flagS, setFlagS] = useState(false);
  const [flagU, setFlagU] = useState(false);
  const [flagY, setFlagY] = useState(false);
  const [text, setText] = useState("DevKit is fast. devkit is flexible.");
  const [replacement, setReplacement] = useState("");
  const [showReplacement, setShowReplacement] = useState(false);

  const flags = [flagG && "g", flagI && "i", flagM && "m", flagS && "s", flagU && "u", flagY && "y"].filter(Boolean).join("");

  let error = "";
  let regex: RegExp | null = null;
  try {
    regex = new RegExp(pattern, flags);
  } catch (e) {
    error = e instanceof Error ? e.message : "Invalid regex";
  }

  const result = useMemo(() => (regex ? [...text.matchAll(regex)] : []), [regex, text]);

  const highlightedText = useMemo(() => {
    if (!regex || result.length === 0) return escapeHtml(text);
    let html = "";
    let lastIndex = 0;
    for (const match of result) {
      const start = match.index!;
      const end = start + match[0].length;
      html += escapeHtml(text.slice(lastIndex, start));
      html += `<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">${escapeHtml(match[0])}</mark>`;
      lastIndex = end;
    }
    html += escapeHtml(text.slice(lastIndex));
    return html;
  }, [text, result, regex]);

  const replacedText = useMemo(() => {
    if (!regex || !showReplacement) return null;
    try {
      return text.replace(regex, replacement);
    } catch {
      return null;
    }
  }, [text, regex, replacement, showReplacement]);

  const toggleFlags = [
    { label: "g", value: flagG, set: setFlagG, desc: "Global" },
    { label: "i", value: flagI, set: setFlagI, desc: "Case insensitive" },
    { label: "m", value: flagM, set: setFlagM, desc: "Multiline" },
    { label: "s", value: flagS, set: setFlagS, desc: "Dot all" },
    { label: "u", value: flagU, set: setFlagU, desc: "Unicode" },
    { label: "y", value: flagY, set: setFlagY, desc: "Sticky" },
  ];

  return (
    <Shell tool={tool}>
      <Panel title="Playground" description="Test patterns and flags with live match results.">
        <Input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="Pattern" />

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Flags</p>
          <div className="flex flex-wrap gap-2">
            {toggleFlags.map((f) => (
              <button
                key={f.label}
                onClick={() => f.set(!f.value)}
                title={f.desc}
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                  f.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {REGEX_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => setPattern(preset.pattern)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={9} />

        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{result.length} matches</p>
        )}

        {!error && result.length > 0 && (
          <div className="rounded-xl border border-border bg-background p-4 text-sm leading-relaxed">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Highlighted matches</p>
            <SafeHtml
              html={highlightedText}
              className="whitespace-pre-wrap break-words font-mono text-xs"
              config={{ ADD_TAGS: ["mark"], ADD_ATTR: ["class"] }}
            />
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowReplacement(!showReplacement)}
        >
          <Icon icon={showReplacement ? "lucide:eye-off" : "lucide:eye"} className="size-3.5 mr-1.5" />
          {showReplacement ? "Hide replacement" : "Show replacement"}
        </Button>

        {showReplacement && (
          <div className="space-y-2">
            <Input
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              placeholder="Replacement string (use $1, $2 for groups)"
            />
            {replacedText !== null && (
              <div className="rounded-xl border border-border bg-background p-4 text-sm">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Replaced result</p>
                <pre className="whitespace-pre-wrap break-words font-mono text-xs">{replacedText}</pre>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          {result.map((match, index) => (
            <div key={`${match.index}-${index}`} className="rounded-xl border border-border bg-background p-3 text-sm">
              <div className="font-medium">Match {index + 1}: {match[0]}</div>
              <div className="text-xs text-muted-foreground">Index {match.index}</div>
              {match.slice(1).some(Boolean) && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Groups: {match.slice(1).filter(Boolean).join(", ")}
                </div>
              )}
              {match.groups && Object.entries(match.groups).length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Named groups:{" "}
                  {Object.entries(match.groups).map(([name, value]) => (
                    <span key={name} className="ml-2">
                      <span className="font-medium text-foreground">{name}:</span> {value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </Shell>
  );
}
