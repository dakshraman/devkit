"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SafeHtml } from "@/components/ui/safe-html";
import { useCopy } from "@/hooks/useCopy";
import { Shell, Panel } from "@/features/tools/tool-layout";
import { useDebounce } from "@/hooks/useDebounce";
import { usePrismHtml } from "@/features/tools/tool-helpers";
import { SNIPPETS } from "@/data/snippets";
import { downloadFile } from "@/lib/utils";
import type { Tool } from "@/types";

function SnippetCard({ snippet }: { snippet: (typeof SNIPPETS)[number] }) {
  const highlighted = usePrismHtml(snippet.code, snippet.language);
  const copy = useCopy();
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="border-b border-border p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{snippet.title}</h3>
            <p className="text-sm text-muted-foreground">{snippet.description}</p>
          </div>
          <Badge variant="outline">{snippet.language}</Badge>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {snippet.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>
      </div>
      <div className="space-y-2 p-4">
        <SafeHtml as="pre" html={highlighted} className={`language-${snippet.language} overflow-auto rounded-xl border border-border bg-card p-4 text-xs leading-6`} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => copy(snippet.code, "snippets", "Code Snippet", "Snippet copied")}>Copy</Button>
          <Button variant="outline" size="sm" onClick={() => downloadFile(snippet.code, `${snippet.id}.${snippet.language === "typescript" ? "ts" : "js"}`)}>Download</Button>
        </div>
      </div>
    </div>
  );
}

export default function SnippetsTool({ tool }: { tool: Tool }) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const debounced = useDebounce(query, 120);
  const snippets = useMemo(() => {
    return SNIPPETS.filter((snippet) => {
      const match = [snippet.title, snippet.description, snippet.code, ...snippet.tags].join(" ").toLowerCase().includes(debounced.toLowerCase());
      const langMatch = language === "all" || snippet.language === language;
      return match && langMatch;
    });
  }, [debounced, language]);
  return (
    <Shell tool={tool}>
      <Panel title="Curated library" description="Search, filter, copy and download admin-managed snippets.">
        <div className="flex flex-wrap gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search snippets..." className="max-w-sm" />
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {snippets.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      </Panel>
    </Shell>
  );
}
