"use client";

import { CopyButton } from "@/components/ui/copy-button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

interface RegexItem {
  pattern: string;
  meaning: string;
  example?: string;
}

interface RegexSection {
  title: string;
  items: RegexItem[];
}

const REGEX_SECTIONS: RegexSection[] = [
  {
    title: "Character classes",
    items: [
      { pattern: "\\d", meaning: "Digit 0-9", example: "/\\d/ matches 7 in 'a7b'" },
      { pattern: "\\w", meaning: "Word character [A-Za-z0-9_]", example: "/\\w+/ matches 'devkit'" },
      { pattern: "\\s", meaning: "Whitespace (space, tab, newline)" },
      { pattern: ".", meaning: "Any character except newline", example: "/c.t/ matches 'cat'" },
      { pattern: "[abc]", meaning: "Any character in the set" },
      { pattern: "[^abc]", meaning: "Any character NOT in the set" },
      { pattern: "[a-z]", meaning: "Range from a to z" },
    ],
  },
  {
    title: "Anchors & boundaries",
    items: [
      { pattern: "^", meaning: "Start of string", example: "/^dev/ matches 'devkit'" },
      { pattern: "$", meaning: "End of string", example: "/kit$/ matches 'devkit'" },
      { pattern: "\\b", meaning: "Word boundary", example: "/\\bkit\\b/ matches 'kit' but not 'kite'" },
      { pattern: "\\B", meaning: "Non-word boundary" },
    ],
  },
  {
    title: "Quantifiers",
    items: [
      { pattern: "a*", meaning: "Zero or more of 'a'" },
      { pattern: "a+", meaning: "One or more of 'a'", example: "/bo+ matches 'boo' in 'boooo'" },
      { pattern: "a?", meaning: "Zero or one of 'a'" },
      { pattern: "a{3}", meaning: "Exactly 3 of 'a'" },
      { pattern: "a{2,4}", meaning: "Between 2 and 4 of 'a'" },
      { pattern: "a{2,}", meaning: "2 or more of 'a'" },
      { pattern: "a*?", meaning: "Lazy (non-greedy) match" },
    ],
  },
  {
    title: "Groups & alternation",
    items: [
      { pattern: "(abc)", meaning: "Capture group", example: "/^(\\d{2})/ captures area code" },
      { pattern: "(?:abc)", meaning: "Non-capturing group" },
      { pattern: "a|b", meaning: "Alternation — 'a' or 'b'" },
      { pattern: "(?<name>x)", meaning: "Named capture group" },
      { pattern: "\\1", meaning: "Backreference to group 1" },
    ],
  },
  {
    title: "Lookaround",
    items: [
      { pattern: "(?=x)", meaning: "Positive lookahead", example: "/\\d(?=px)/ digit before 'px'" },
      { pattern: "(?!x)", meaning: "Negative lookahead" },
      { pattern: "(?<=x)", meaning: "Positive lookbehind" },
      { pattern: "(?<!x)", meaning: "Negative lookbehind" },
    ],
  },
  {
    title: "Flags",
    items: [
      { pattern: "g", meaning: "Global — find all matches" },
      { pattern: "i", meaning: "Case-insensitive" },
      { pattern: "m", meaning: "Multiline — ^ and $ match line breaks" },
      { pattern: "s", meaning: "Dotall — '.' matches newlines" },
      { pattern: "u", meaning: "Unicode mode" },
      { pattern: "y", meaning: "Sticky — match only from lastIndex" },
    ],
  },
  {
    title: "Escapes & misc",
    items: [
      { pattern: "\\n", meaning: "Newline" },
      { pattern: "\\t", meaning: "Tab" },
      { pattern: "\\", meaning: "Escape a metacharacter", example: "/\\./ matches a literal dot" },
      { pattern: "\\p{L}", meaning: "Any letter (with u flag)" },
      { pattern: "$&", meaning: "Matched text in replacement strings" },
      { pattern: "\\x{1F600}", meaning: "Unicode code point (with u flag)" },
    ],
  },
];

export default function RegexCheatsheetTool({ tool }: { tool: Tool }) {
  return (
    <Shell tool={tool}>
      <Panel title="Regular expression cheatsheet" description="Common patterns, syntax and flags with examples.">
        <div className="grid gap-6 lg:grid-cols-2">
          {REGEX_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.title}</div>
              <div className="overflow-hidden rounded-xl border border-border bg-background">
                {section.items.map((item, index) => (
                  <div key={item.pattern} className={`flex items-center gap-3 p-3 ${index > 0 ? "border-t border-border/60" : ""}`}>
                    <code className="min-w-[90px] shrink-0 rounded-lg border border-border bg-card px-2 py-1 font-mono text-xs text-primary">{item.pattern}</code>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm">{item.meaning}</div>
                      {item.example && <div className="truncate text-xs text-muted-foreground">{item.example}</div>}
                    </div>
                    <CopyButton value={item.pattern} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Shell>
  );
}
