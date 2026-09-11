"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, Shell, InfoTile } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

interface RequestResult {
  status: number | null;
  latency: number;
  error?: string;
}

interface LatencyBuckets {
  "0-100ms": number;
  "100-250ms": number;
  "250-500ms": number;
  "500ms-1s": number;
  "1s+": number;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function bucketLatencies(latencies: number[]): LatencyBuckets {
  const buckets: LatencyBuckets = { "0-100ms": 0, "100-250ms": 0, "250-500ms": 0, "500ms-1s": 0, "1s+": 0 };
  for (const ms of latencies) {
    if (ms < 100) buckets["0-100ms"]++;
    else if (ms < 250) buckets["100-250ms"]++;
    else if (ms < 500) buckets["250-500ms"]++;
    else if (ms < 1000) buckets["500ms-1s"]++;
    else buckets["1s+"]++;
  }
  return buckets;
}

async function runConcurrentRequests(
  url: string,
  total: number,
  concurrency: number,
  onProgress: (done: number) => void,
): Promise<RequestResult[]> {
  const results: RequestResult[] = [];
  let index = 0;

  async function worker() {
    while (index < total) {
      const i = index++;
      const start = performance.now();
      try {
        const res = await fetch(url, { mode: "cors" });
        const latency = performance.now() - start;
        results[i] = { status: res.status, latency };
      } catch (err) {
        const latency = performance.now() - start;
        results[i] = { status: null, latency, error: err instanceof Error ? err.message : "Request failed" };
      }
      onProgress(Math.min(i + 1, total));
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
  await Promise.all(workers);
  return results;
}

export default function LoadTesterTool({ tool }: { tool: Tool }) {
  const [url, setUrl] = useState("https://httpbin.org/get");
  const [totalRequests, setTotalRequests] = useState(50);
  const [concurrency, setConcurrency] = useState(10);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<RequestResult[] | null>(null);
  const startRef = useRef(0);

  const runTest = useCallback(async () => {
    if (!url.trim()) return;
    try {
      new URL(url);
    } catch {
      return;
    }
    setRunning(true);
    setProgress(0);
    setResults(null);
    startRef.current = performance.now();

    const res = await runConcurrentRequests(url, totalRequests, concurrency, (done) => setProgress(done));
    const totalTime = performance.now() - startRef.current;

    setResults(res);
    setProgress(totalRequests);
    setRunning(false);
  }, [url, totalRequests, concurrency]);

  const stats = (() => {
    if (!results) return null;
    const latencies = results.map((r) => r.latency).sort((a, b) => a - b);
    const total = results.length;
    const success = results.filter((r) => r.status !== null && r.status! < 400).length;
    const failed = total - success;
    const totalTime = latencies.reduce((sum, l) => sum + l, 0);
    const avgLatency = total > 0 ? totalTime / total : 0;
    const rps = avgLatency > 0 ? (total / (totalTime / 1000)) : 0;

    const statusCodes: Record<string, number> = {};
    for (const r of results) {
      const key = r.status !== null ? String(r.status) : "Error";
      statusCodes[key] = (statusCodes[key] || 0) + 1;
    }

    return {
      totalTime: performance.now() - startRef.current,
      avgLatency,
      minLatency: latencies[0] || 0,
      maxLatency: latencies[latencies.length - 1] || 0,
      p95: percentile(latencies, 95),
      p99: percentile(latencies, 99),
      rps,
      total,
      success,
      failed,
      successRate: total > 0 ? (success / total) * 100 : 0,
      statusCodes,
      buckets: bucketLatencies(latencies),
      errors: results.filter((r) => r.error).map((r) => r.error!),
    };
  })();

  return (
    <Shell tool={tool}>
      <div className="space-y-6">
        <Panel title="Load Tester" description="Send concurrent HTTP requests and measure latency, throughput, and reliability.">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/api"
              />
              <Input
                type="number"
                value={totalRequests}
                onChange={(e) => setTotalRequests(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                className="w-28"
                placeholder="Requests"
              />
              <Input
                type="number"
                value={concurrency}
                onChange={(e) => setConcurrency(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                className="w-28"
                placeholder="Concurrency"
              />
              <Button onClick={runTest} disabled={running}>
                {running ? `Running (${progress}/${totalRequests})...` : "Run Test"}
              </Button>
            </div>
            {running && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200"
                  style={{ width: `${(progress / totalRequests) * 100}%` }}
                />
              </div>
            )}
          </div>
        </Panel>

        {stats && (
          <>
            <Panel title="Results" description="Performance summary of the load test.">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoTile label="Total Time" value={`${(stats.totalTime / 1000).toFixed(2)}s`} />
                <InfoTile label="Avg Latency" value={`${stats.avgLatency.toFixed(0)}ms`} />
                <InfoTile label="Requests/sec" value={stats.rps.toFixed(1)} />
                <InfoTile label="Success Rate" value={`${stats.successRate.toFixed(1)}%`} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoTile label="Min Latency" value={`${stats.minLatency.toFixed(0)}ms`} />
                <InfoTile label="Max Latency" value={`${stats.maxLatency.toFixed(0)}ms`} />
                <InfoTile label="P95" value={`${stats.p95.toFixed(0)}ms`} />
                <InfoTile label="P99" value={`${stats.p99.toFixed(0)}ms`} />
              </div>
            </Panel>

            <Panel title="Latency Distribution" description="Response time breakdown by bucket.">
              <div className="space-y-2">
                {Object.entries(stats.buckets).map(([bucket, count]) => {
                  const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={bucket} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-xs text-muted-foreground">{bucket}</span>
                      <div className="flex-1 h-6 overflow-hidden rounded-md bg-secondary">
                        <div
                          className="h-full rounded-md bg-primary/80 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
                        {count} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel title="Status Codes" description="HTTP response code breakdown.">
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.statusCodes).map(([code, count]) => (
                  <span
                    key={code}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                      code === "Error"
                        ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                        : parseInt(code) < 400
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {code}
                    <span className="text-muted-foreground">×{count}</span>
                  </span>
                ))}
              </div>
            </Panel>

            {stats.errors.length > 0 && (
              <Panel title="Errors" description={`${stats.errors.length} request(s) failed.`}>
                <ul className="max-h-48 space-y-1 overflow-auto text-xs">
                  {[...new Set(stats.errors)].map((err, i) => (
                    <li key={i} className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-red-600 dark:text-red-400">
                      {err}
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </>
        )}

        {!results && !running && (
          <Panel title="Results" description="Performance summary of the load test.">
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Enter a URL and click Run Test to see results here.
            </div>
          </Panel>
        )}
      </div>
    </Shell>
  );
}
