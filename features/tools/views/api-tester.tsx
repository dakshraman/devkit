"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton, DownloadButton } from "@/components/ui/copy-button";
import { InfoTile, Panel, SectionLabel, Shell } from "@/features/tools/tool-layout";
import { downloadFile, formatBytes, formatDuration, nowMs } from "@/lib/utils";
import { randomUuid } from "@/lib/tool-utils";
import { prettyJson } from "@/features/tools/tool-helpers";
import {
  buildPostmanCollection,
  flattenPostmanCollection,
  parsePostmanCollection,
  prepareRequest,
  METHOD_STYLES,
  type AuthState,
  type FlatRequest,
  type KeyValueRow,
  type PcCollection,
} from "@/lib/postman";
import type { Tool } from "@/types";

const API_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;

export default function ApiTesterTool({ tool }: { tool: Tool }) {
  const [view, setView] = useState<"builder" | "collection">("builder");
  const [url, setUrl] = useState("https://api.github.com/repos/vercel/next.js");
  const [method, setMethod] = useState<string>("GET");
  const [headers, setHeaders] = useState<KeyValueRow[]>([{ key: "Accept", value: "application/json" }]);
  const [queries, setQueries] = useState<KeyValueRow[]>([{ key: "", value: "" }]);
  const [bodyMode, setBodyMode] = useState<"none" | "raw" | "urlencoded">("none");
  const [body, setBody] = useState("");
  const [auth, setAuth] = useState<AuthState>({ type: "none" });
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    body: string;
    headers: KeyValueRow[];
    size: number;
    contentType: string;
    elapsed: number;
  } | null>(null);
  const [respTab, setRespTab] = useState<"body" | "headers">("body");
  const [pretty, setPretty] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [collection, setCollection] = useState<PcCollection | null>(null);
  const [flat, setFlat] = useState<FlatRequest[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [importError, setImportError] = useState("");
  const [runResults, setRunResults] = useState<{ name: string; status: number | null; time: number }[] | null>(null);
  const [running, setRunning] = useState(false);

  const [history, setHistory] = useState<{ url: string; method: string; status: number | null; time: number; date: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem("api-history") || "[]"); } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [curlText, setCurlText] = useState("");
  const [showCurlImport, setShowCurlImport] = useState(false);
  const [variables, setVariables] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [responseSearch, setResponseSearch] = useState("");

  const currentRequest = (): FlatRequest => ({
    id: randomUuid(),
    name: "New request",
    method,
    url,
    headers,
    query: queries,
    body,
    bodyMode: bodyMode === "none" ? "raw" : bodyMode,
    auth,
  });

  const onSend = async () => {
    if (!url.trim()) {
      setError("Enter a request URL.");
      return;
    }
    try {
      new URL(url);
    } catch {
      setError("Invalid URL.");
      return;
    }
    setLoading(true);
    const start = nowMs();
    try {
      let interpolatedUrl = url;
      let interpolatedHeaders = headers;
      let interpolatedBody = body;
      for (const v of variables.filter(v => v.key.trim())) {
        const regex = new RegExp(`\\{\\{${v.key}\\}\\}`, "g");
        interpolatedUrl = interpolatedUrl.replace(regex, v.value);
        interpolatedBody = interpolatedBody.replace(regex, v.value);
        interpolatedHeaders = headers.map(h => ({ ...h, value: h.value.replace(regex, v.value) }));
      }
      const req = { ...currentRequest(), url: interpolatedUrl, headers: interpolatedHeaders, body: interpolatedBody };
      const { init, url: finalUrl } = prepareRequest(req);
      const res = await fetch(finalUrl, init);
      const text = await res.text();
      const resHeaders: KeyValueRow[] = [];
      res.headers.forEach((value, key) => resHeaders.push({ key, value }));
      const elapsed = nowMs() - start;
      setResponse({
        status: res.status,
        statusText: res.statusText,
        body: text,
        headers: resHeaders,
        size: new Blob([text]).size,
        contentType: res.headers.get("content-type") ?? "",
        elapsed,
      });
      setHistory(prev => {
        const next = [{ url: interpolatedUrl, method, status: res.status, time: elapsed, date: new Date().toISOString() }, ...prev].slice(0, 50);
        try { localStorage.setItem("api-history", JSON.stringify(next)); } catch {}
        return next;
      });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onSend();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, method, headers, queries, body, bodyMode, auth]);

  function parseCurl(curl: string) {
    const methodMatch = curl.match(/-X\s+(\w+)/);
    const method = methodMatch ? methodMatch[1].toUpperCase() : "GET";
    const urlMatch = curl.match(/(?:^|\s)(https?:\/\/[^\s'"]+)/) || curl.match(/-U\s+(\S+)/);
    const url = urlMatch ? (urlMatch[1] || urlMatch[0]).replace(/^--url\s+/, "").replace(/^--request\s+\S+\s+/, "").trim() : "";
    const headerRegex = /-H\s+'([^']*)'/g;
    const headers: KeyValueRow[] = [];
    let m;
    while ((m = headerRegex.exec(curl)) !== null) {
      const idx = m[1].indexOf(":");
      if (idx !== -1) headers.push({ key: m[1].slice(0, idx).trim(), value: m[1].slice(idx + 1).trim() });
    }
    const bodyMatch = curl.match(/(?:-d|--data)\s+'([^']*)'/);
    const body = bodyMatch ? bodyMatch[1] : "";
    return { method, url, headers, body };
  }

  function formatXml(xml: string): string {
    let formatted = "";
    let indent = 0;
    const lines = xml.replace(/>\s*</g, ">\n<").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith("</")) indent = Math.max(0, indent - 1);
      formatted += "  ".repeat(indent) + trimmed + "\n";
      if (trimmed.startsWith("<") && !trimmed.startsWith("</") && !trimmed.endsWith("/>") && !/<\//.test(trimmed)) {
        indent++;
      }
    }
    return formatted.trim();
  }

  const importCollection = (text: string) => {
    const parsed = parsePostmanCollection(text);
    if (!parsed) {
      setImportError("Invalid Postman collection JSON. Expected an object with info and item.");
      return;
    }
    const vars: Record<string, string> = {};
    (parsed.variable ?? []).forEach((v) => {
      if (v.key) vars[v.key] = v.value ?? "";
    });
    setCollection(parsed);
    setFlat(flattenPostmanCollection(parsed, vars));
    setImportError("");
    setRunResults(null);
  };

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importCollection(await file.text());
    e.target.value = "";
  };

  const loadIntoBuilder = (f: FlatRequest) => {
    setMethod(f.method);
    setUrl(f.url);
    setHeaders(f.headers.length ? f.headers : [{ key: "", value: "" }]);
    setQueries(f.query.length ? f.query : [{ key: "", value: "" }]);
    setBodyMode(f.body ? f.bodyMode : "none");
    setBody(f.body);
    setAuth(f.auth);
    setError("");
    setView("builder");
  };

  const runAll = async () => {
    setRunning(true);
    setRunResults([]);
    const results: { name: string; status: number | null; time: number }[] = [];
    for (const f of flat) {
      const start = nowMs();
      try {
        const { init, url: finalUrl } = prepareRequest(f);
        const res = await fetch(finalUrl, init);
        await res.text();
        results.push({ name: f.name, status: res.status, time: nowMs() - start });
      } catch {
        results.push({ name: f.name, status: null, time: nowMs() - start });
      }
      setRunResults([...results]);
    }
    setRunning(false);
  };

  const exportCollection = () => {
    const col = collection ?? buildPostmanCollection(`${tool.name} — new collection`, [currentRequest()]);
    const name = (collection?.info?.name ?? tool.name).replace(/[^\w\s-]+/g, "-");
    downloadFile(JSON.stringify(col, null, 2), `${name}.collection.json`, "application/json");
  };

  const exportCurrentRequest = () => {
    const col = buildPostmanCollection(tool.name, [currentRequest()]);
    downloadFile(JSON.stringify(col, null, 2), `${tool.slug}-request.collection.json`, "application/json");
  };

  return (
    <Shell tool={tool}>
      <div className="space-y-6">
        <Tabs value={view} onValueChange={(v) => setView(v as "builder" | "collection")}>
          <TabsList>
            <TabsTrigger value="builder">Request builder</TabsTrigger>
            <TabsTrigger value="collection">
              Postman collection{collection ? ` (${flat.length})` : ""}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {view === "builder" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <Panel title="Request builder" description="Use public APIs or your own CORS-enabled endpoints.">
              <div className="grid gap-3">
                <div className="flex flex-wrap gap-2">
                  <div className="w-32 shrink-0">
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {API_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/path" className="min-w-64 flex-1" />
                </div>

                <div className="space-y-2">
                  <SectionLabel icon="lucide:key-round" label="Auth" />
                  <Select value={auth.type} onValueChange={(v) => setAuth({ type: v as AuthState["type"] })}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No auth</SelectItem>
                      <SelectItem value="bearer">Bearer token</SelectItem>
                      <SelectItem value="basic">Basic auth</SelectItem>
                      <SelectItem value="apikey">API key</SelectItem>
                    </SelectContent>
                  </Select>
                  {auth.type === "bearer" && (
                    <Input value={auth.token ?? ""} onChange={(e) => setAuth({ ...auth, token: e.target.value })} placeholder="Token" />
                  )}
                  {auth.type === "basic" && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input value={auth.username ?? ""} onChange={(e) => setAuth({ ...auth, username: e.target.value })} placeholder="Username" />
                      <Input type="password" value={auth.password ?? ""} onChange={(e) => setAuth({ ...auth, password: e.target.value })} placeholder="Password" />
                    </div>
                  )}
                  {auth.type === "apikey" && (
                    <div className="grid gap-2 sm:grid-cols-[1fr_1fr_7rem]">
                      <Input value={auth.key ?? ""} onChange={(e) => setAuth({ ...auth, key: e.target.value })} placeholder="Key" />
                      <Input value={auth.value ?? ""} onChange={(e) => setAuth({ ...auth, value: e.target.value })} placeholder="Value" />
                      <Select value={auth.in ?? "header"} onValueChange={(v) => setAuth({ ...auth, in: v as "header" | "query" })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="header">Header</SelectItem>
                          <SelectItem value="query">Query</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 text-left text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCurlImport((p) => !p)}
                  >
                    <Icon icon={showCurlImport ? "lucide:chevron-down" : "lucide:chevron-right"} className="size-3" />
                    Import cURL
                  </button>
                  {showCurlImport && (
                    <div className="space-y-2">
                      <Textarea
                        value={curlText}
                        onChange={(e) => setCurlText(e.target.value)}
                        rows={4}
                        placeholder="Paste a cURL command here..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const parsed = parseCurl(curlText);
                          if (parsed.url) setUrl(parsed.url);
                          if (parsed.method) setMethod(parsed.method);
                          if (parsed.headers.length) setHeaders(parsed.headers);
                          if (parsed.body) { setBody(parsed.body); setBodyMode("raw"); }
                          setCurlText("");
                          setShowCurlImport(false);
                        }}
                        disabled={!curlText.trim()}
                      >
                        Import
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <SectionLabel icon="lucide:braces" label={`Variables (${variables.filter((v) => v.key.trim()).length})`} />
                  <div className="space-y-1">
                    {variables.map((row, index) => (
                      <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                        <Input
                          value={row.key}
                          onChange={(e) => setVariables((prev) => prev.map((item, i) => i === index ? { ...item, key: e.target.value } : item))}
                          placeholder="Variable name"
                        />
                        <Input
                          value={row.value}
                          onChange={(e) => setVariables((prev) => prev.map((item, i) => i === index ? { ...item, value: e.target.value } : item))}
                          placeholder="Value"
                        />
                        <Button type="button" variant="ghost" size="iconSm" onClick={() => setVariables((prev) => prev.filter((_, i) => i !== index))}>×</Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setVariables((prev) => [...prev, { key: "", value: "" }])}>Add variable</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <SectionLabel icon="lucide:hash" label="Headers" />
                  {headers.map((row, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <Input value={row.key} onChange={(e) => setHeaders((prev) => prev.map((item, i) => i === index ? { ...item, key: e.target.value } : item))} placeholder="Header" />
                      <Input value={row.value} onChange={(e) => setHeaders((prev) => prev.map((item, i) => i === index ? { ...item, value: e.target.value } : item))} placeholder="Value" />
                      <Button type="button" variant="ghost" size="iconSm" onClick={() => setHeaders((prev) => prev.filter((_, i) => i !== index))}>×</Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setHeaders((prev) => [...prev, { key: "", value: "" }])}>Add header</Button>
                </div>

                <div className="space-y-2">
                  <SectionLabel icon="lucide:link-2" label="Query parameters" />
                  {queries.map((row, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <Input value={row.key} onChange={(e) => setQueries((prev) => prev.map((item, i) => i === index ? { ...item, key: e.target.value } : item))} placeholder="Key" />
                      <Input value={row.value} onChange={(e) => setQueries((prev) => prev.map((item, i) => i === index ? { ...item, value: e.target.value } : item))} placeholder="Value" />
                      <Button type="button" variant="ghost" size="iconSm" onClick={() => setQueries((prev) => prev.filter((_, i) => i !== index))}>×</Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setQueries((prev) => [...prev, { key: "", value: "" }])}>Add parameter</Button>
                </div>

                <div className="space-y-2">
                  <SectionLabel icon="lucide:file-code-2" label="Body" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={bodyMode} onValueChange={(v) => setBodyMode(v as "none" | "raw" | "urlencoded")}>
                      <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="raw">Raw (JSON / Text)</SelectItem>
                        <SelectItem value="urlencoded">URL encoded</SelectItem>
                      </SelectContent>
                    </Select>
                    {bodyMode !== "none" && (
                      <span className="text-xs text-muted-foreground">
                        Content-Type auto-set to {bodyMode === "raw" ? "application/json" : "application/x-www-form-urlencoded"}
                      </span>
                    )}
                  </div>
                  {bodyMode !== "none" && (
                    <Textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={8}
                      placeholder={bodyMode === "raw" ? '{"hello":"world"}' : "key=value&key2=value2"}
                    />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={() => void onSend()} disabled={loading}>
                    {loading ? "Sending..." : "Send request"}
                  </Button>
                  <span className="text-xs text-muted-foreground">Ctrl+Enter</span>
                  <Button variant="outline" onClick={exportCurrentRequest}>Export request</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowHistory((p) => !p)}>
                    <Icon icon="lucide:history" className="mr-1 size-3" />
                    History ({history.length})
                  </Button>
                </div>
                {showHistory && history.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-auto rounded-xl border border-border">
                    <ul className="divide-y divide-border">
                      {history.map((h, i) => (
                        <li key={i} className="flex items-center gap-3 px-3 py-1.5 text-xs">
                          <span className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${h.status !== null && h.status < 400 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                            {h.status ?? "ERR"}
                          </span>
                          <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{h.method}</span>
                          <span className="min-w-0 flex-1 truncate">{h.url}</span>
                          <span className="shrink-0 text-muted-foreground">{formatDuration(h.time)}</span>
                          <Button
                            variant="ghost"
                            size="iconSm"
                            className="shrink-0"
                            onClick={() => {
                              setUrl(h.url);
                              setMethod(h.method);
                              setShowHistory(false);
                            }}
                          >
                            <Icon icon="lucide:arrow-up-left" className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="iconSm"
                            className="shrink-0"
                            onClick={() => {
                              setHistory((prev) => {
                                const next = prev.filter((_, idx) => idx !== i);
                                try { localStorage.setItem("api-history", JSON.stringify(next)); } catch {}
                                return next;
                              });
                            }}
                          >
                            <Icon icon="lucide:x" className="size-3" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </Panel>

            <Panel title="Response" description="Status, time, size and full response details.">
              {response ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoTile label="Status" value={`${response.status} ${response.statusText}`} />
                    <InfoTile label="Response time" value={formatDuration(response.elapsed)} />
                    <InfoTile label="Size" value={formatBytes(response.size)} />
                    <InfoTile label="Content type" value={response.contentType || "—"} />
                  </div>
                  <Tabs value={respTab} onValueChange={(v) => setRespTab(v as "body" | "headers")}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <TabsList>
                        <TabsTrigger value="body">Body</TabsTrigger>
                        <TabsTrigger value="headers">Headers ({response.headers.length})</TabsTrigger>
                      </TabsList>
                      <div className="flex items-center gap-2">
                        {respTab === "body" && (
                          <>
                            <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={() => setPretty((p) => !p)}>
                              {pretty ? "Raw" : "Pretty"}
                            </Button>
                            <CopyButton value={response.body} toolSlug={tool.slug} toolName={tool.name} />
                            <DownloadButton
                              content={response.body}
                              filename={response.contentType.includes("json") ? "response.json" : "response.txt"}
                              mime={response.contentType || "text/plain"}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </Tabs>
                  {respTab === "body" ? (
                    <>
                      <Input
                        value={responseSearch}
                        onChange={(e) => setResponseSearch(e.target.value)}
                        placeholder="Search response body..."
                        className="h-8 text-xs"
                      />
                      <pre className="max-h-[560px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6">
                        {(() => {
                          const body = responseSearch
                            ? response.body.split('\n').filter(line => line.toLowerCase().includes(responseSearch.toLowerCase())).join('\n')
                            : response.body;
                          if (pretty) {
                            const json = prettyJson(body);
                            if (json) return json;
                            if (response.contentType.includes("xml") || body.trim().startsWith("<")) {
                              try { return formatXml(body); } catch { return body; }
                            }
                            return body;
                          }
                          return body;
                        })()}
                      </pre>
                    </>
                  ) : (
                    <ul className="divide-y divide-border rounded-xl border border-border text-xs">
                      {response.headers.map((h) => (
                        <li key={h.key} className="flex gap-3 px-3 py-1.5">
                          <span className="w-48 shrink-0 font-medium">{h.key}</span>
                          <span className="min-w-0 break-all text-muted-foreground">{h.value}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  Send a request to see status, headers and body here.
                </div>
              )}
            </Panel>
          </div>
        ) : (
          <Panel title="Postman collection" description="Import a Postman collection (v2.0 / v2.1) to load and run its requests.">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer">
                  <input type="file" accept=".json,application/json" className="hidden" onChange={(e) => void onFileChange(e)} />
                  <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-accent">
                    <Icon icon="lucide:folder-open" className="size-4" />
                    Import file
                  </span>
                </label>
                <Button variant="outline" onClick={exportCollection}>
                  <Icon icon="lucide:download" className="mr-2 size-4" />
                  Export collection
                </Button>
              </div>
              <Textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={6}
                placeholder='Paste Postman collection JSON here…'
              />
              <Button onClick={() => importCollection(pasteText)} disabled={!pasteText.trim()}>
                Import from text
              </Button>
              {importError && <p className="text-sm text-red-500">{importError}</p>}

              {collection && (
                <>
                  <div className="flex items-center justify-between">
                    <SectionLabel icon="lucide:list-tree" label={`Requests (${flat.length})`} />
                    <span className="text-xs text-muted-foreground">{collection.info?.name}</span>
                  </div>
                  <ul className="divide-y divide-border rounded-xl border border-border">
                    {flat.map((f) => (
                      <li key={f.id} className="flex items-center gap-3 px-3 py-2">
                        <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${METHOD_STYLES[f.method] ?? "bg-zinc-500/10 text-muted-foreground"}`}>
                          {f.method}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{f.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">{f.url}</span>
                        </span>
                        <Button variant="outline" size="sm" onClick={() => loadIntoBuilder(f)}>Load</Button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => void runAll()} disabled={running}>
                      {running && <Icon icon="lucide:loader-2" className="mr-2 size-4 animate-spin" />}
                      {running ? "Running…" : `Run all (${flat.length})`}
                    </Button>
                    {runResults && (
                      <Button variant="ghost" size="sm" onClick={() => setRunResults(null)}>Clear results</Button>
                    )}
                  </div>
                  {runResults && (
                  <ul className="divide-y divide-border rounded-xl border border-border">
                      {runResults.map((r) => (
                        <li key={r.name} className="flex items-center gap-3 px-3 py-1.5 text-sm">
                          <span className={`w-16 shrink-0 rounded-md px-2 py-0.5 text-center font-mono text-[11px] font-semibold ${r.status !== null && r.status < 400 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                            {r.status ?? "ERR"}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{r.name}</span>
                          <span className="text-xs text-muted-foreground">{formatDuration(r.time)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </Panel>
        )}
      </div>
    </Shell>
  );
}
