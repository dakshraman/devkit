"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { marked } from "marked";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import { Button } from "@/components/ui/button";
import { SafeHtml } from "@/components/ui/safe-html";
import { CopyButton } from "@/components/ui/copy-button";
import { EditorSkeleton, Panel, Shell } from "@/features/tools/tool-layout";
import { useSettings } from "@/context/settings-context";
import { downloadFile } from "@/lib/utils";
import type { Tool } from "@/types";
import type { editor } from "monaco-editor";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false, loading: () => <EditorSkeleton /> });

marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function MarkdownTool({ tool }: { tool: Tool }) {
  const DEFAULT_MARKDOWN = `# DevKit Markdown Editor

Welcome to the **Markdown Editor** — a powerful tool for writing and previewing Markdown documents.

## Features

- **Live Preview** — See your rendered Markdown in real-time
- **Toolbar** — Quick access to common formatting options
- **Export Options** — Download as .md or copy HTML
- **Word Statistics** — Track your document's word count and reading time

## Formatting Examples

### Text Styling

You can write in **bold**, *italic*, or ~~strikethrough~~.

### Links

[Visit DevKit](https://devkit.local)

### Code

Inline \`code\` or code blocks:

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Lists

1. Ordered list item
2. Another item
3. Final item

- Unordered item
- Another bullet
- Last one

### Blockquotes

> "The best way to predict the future is to invent it." — Alan Kay

### Tables

| Feature | Status |
|---------|--------|
| Editor | ✅ |
| Preview | ✅ |
| Export | ✅ |

---

*Start editing to see the live preview!*`;

  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "stacked">("split");
  const { theme } = useSettings();
  const html = useMemo(() => marked.parse(markdown) as string, [markdown]);
  
  const stats = useMemo(() => {
    const text = markdown.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const characters = markdown.length;
    const lines = markdown.split("\n").length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, characters, lines, readingTime };
  }, [markdown]);

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    Prism.highlightAll();
  }, [html]);

  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [previewOpen]);

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const insertMarkdown = (before: string, after: string = "") => {
    const editor = editorRef.current;
    if (!editor) return;
    
    const model = editor.getModel();
    const selection = editor.getSelection();
    const position = editor.getPosition();
    
    if (!model || !selection || !position) return;
    
    const selectedText = model.getValueInRange(selection);
    const text = selectedText || "text";
    const newText = `${before}${text}${after}`;
    
    editor.executeEdits("markdown-toolbar", [{
      range: {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      },
      text: newText,
    }]);
    
    editor.focus();
  };

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "bold": insertMarkdown("**", "**"); break;
      case "italic": insertMarkdown("*", "*"); break;
      case "strikethrough": insertMarkdown("~~", "~~"); break;
      case "code": insertMarkdown("`", "`"); break;
      case "codeblock": insertMarkdown("\n```\n", "\n```\n"); break;
      case "link": insertMarkdown("[", "](url)"); break;
      case "image": insertMarkdown("![alt](", ")"); break;
      case "h1": insertMarkdown("# "); break;
      case "h2": insertMarkdown("## "); break;
      case "h3": insertMarkdown("### "); break;
      case "ul": insertMarkdown("- "); break;
      case "ol": insertMarkdown("1. "); break;
      case "quote": insertMarkdown("> "); break;
      case "hr": insertMarkdown("\n---\n"); break;
      case "table": insertMarkdown("\n| Header | Header |\n|--------|--------|\n| Cell   | Cell   |\n"); break;
    }
  };

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html);
  };

  const downloadMarkdown = () => {
    downloadFile(markdown, "document.md", "text/markdown");
  };

  const downloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    code { background: #f0f0f0; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
    downloadFile(fullHtml, "document.html", "text/html");
  };

  return (
    <Shell tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("h1")} title="Heading 1">
              <Icon icon="lucide:heading-1" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("h2")} title="Heading 2">
              <Icon icon="lucide:heading-2" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("h3")} title="Heading 3">
              <Icon icon="lucide:heading-3" className="size-3.5" />
            </Button>
            <div className="w-px bg-border mx-1" />
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("bold")} title="Bold">
              <Icon icon="lucide:bold" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("italic")} title="Italic">
              <Icon icon="lucide:italic" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("strikethrough")} title="Strikethrough">
              <Icon icon="lucide:strikethrough" className="size-3.5" />
            </Button>
            <div className="w-px bg-border mx-1" />
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("ul")} title="Bullet List">
              <Icon icon="lucide:list" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("ol")} title="Numbered List">
              <Icon icon="lucide:list-ordered" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("quote")} title="Blockquote">
              <Icon icon="lucide:quote" className="size-3.5" />
            </Button>
            <div className="w-px bg-border mx-1" />
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("code")} title="Inline Code">
              <Icon icon="lucide:code" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("codeblock")} title="Code Block">
              <Icon icon="lucide:file-code-2" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("link")} title="Link">
              <Icon icon="lucide:link" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("image")} title="Image">
              <Icon icon="lucide:image" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("table")} title="Table">
              <Icon icon="lucide:table-2" className="size-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleToolbarAction("hr")} title="Horizontal Rule">
              <Icon icon="lucide:minus" className="size-3.5" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-1">
            <Button
              variant={viewMode === "split" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("split")}
            >
              <Icon icon="lucide:columns-2" className="size-3.5 mr-1" />
              Split
            </Button>
            <Button
              variant={viewMode === "stacked" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("stacked")}
            >
              <Icon icon="lucide:rows-2" className="size-3.5 mr-1" />
              Stacked
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{stats.words} words</span>
          <span>·</span>
          <span>{stats.characters} characters</span>
          <span>·</span>
          <span>{stats.lines} lines</span>
          <span>·</span>
          <span>~{stats.readingTime} min read</span>
        </div>

        <div className={viewMode === "split" ? "grid gap-6 lg:grid-cols-2" : "space-y-6"}>
          <Panel title="Editor" description="Monaco-backed markdown editing with toolbar." className="min-w-0">
            <MonacoEditor
              height="420px"
              defaultLanguage="markdown"
              theme={theme === "dark" ? "vs-dark" : "light"}
              value={markdown}
              onChange={(value) => setMarkdown(value ?? "")}
              onMount={handleEditorMount}
              options={{ minimap: { enabled: false }, wordWrap: "on", fontSize: 14 }}
            />
            <div className="flex flex-wrap gap-2">
              <CopyButton value={markdown} toolSlug={tool.slug} toolName={tool.name} label="Copy Markdown" />
              <Button variant="outline" size="sm" onClick={downloadMarkdown}>
                <Icon icon="lucide:download" className="size-3.5 mr-1" />
                Download .md
              </Button>
              <Button variant="outline" size="sm" onClick={copyHtml}>
                <Icon icon="lucide:copy" className="size-3.5 mr-1" />
                Copy HTML
              </Button>
              <Button variant="outline" size="sm" onClick={downloadHtml}>
                <Icon icon="lucide:file-code" className="size-3.5 mr-1" />
                Download HTML
              </Button>
            </div>
          </Panel>
          <Panel title="Preview" description="Rendered HTML preview with fullscreen option." className="min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Live render</p>
              <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                <Icon icon="lucide:maximize-2" className="mr-1.5 size-3.5" />
                Fullscreen
              </Button>
            </div>
            <SafeHtml
              as="article"
              html={html}
              className="prose max-w-none break-words dark:prose-invert prose-headings:tracking-tight prose-pre:overflow-x-auto prose-img:max-w-full prose-img:rounded-xl prose-table:block prose-table:max-w-full prose-table:overflow-x-auto [&_pre]:p-4"
              config={{ ADD_TAGS: ["input"], ADD_ATTR: ["type", "checked", "disabled"] }}
            />
          </Panel>
        </div>
      </div>
      {previewOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal="true" aria-label="Markdown preview">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setPreviewOpen(false)} />
          <div className="relative flex h-full max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="text-sm font-semibold">Fullscreen Preview</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{stats.words} words · ~{stats.readingTime} min read</span>
                <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(false)} aria-label="Close preview">
                  <Icon icon="lucide:x" className="size-4" />
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-6">
              <SafeHtml
                as="article"
                html={html}
                className="prose max-w-none break-words dark:prose-invert prose-headings:tracking-tight prose-pre:overflow-x-auto prose-img:max-w-full prose-img:rounded-xl prose-table:block prose-table:max-w-full prose-table:overflow-x-auto [&_pre]:p-4"
                config={{ ADD_TAGS: ["input"], ADD_ATTR: ["type", "checked", "disabled"] }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </Shell>
  );
}
