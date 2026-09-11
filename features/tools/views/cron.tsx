"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/ui/copy-button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import { parseCronField, cronNextRuns, CRON_PRESETS } from "@/features/tools/tool-helpers";
import type { Tool } from "@/types";

export default function CronTool({ tool }: { tool: Tool }) {
  const [minute, setMinute] = useState("*/5");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  const [runs, setRuns] = useState<Date[]>([]);
  const expr = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`.trim();
  const valid = useMemo(() => {
    const fields = expr.split(/\s+/);
    if (fields.length !== 5) return false;
    return [59, 23, 31, 12, 6].every((max, i) => parseCronField(fields[i], max) !== null);
  }, [expr]);
  const generate = () => {
    setRuns(cronNextRuns(expr, 6));
  };
  return (
    <Shell tool={tool}>
      <Panel title="Cron expression builder" description="Compose cron schedules and preview the next run times.">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Minute</div>
            <Input value={minute} onChange={(e) => setMinute(e.target.value)} className="w-28 font-mono" placeholder="*" />
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Hour</div>
            <Input value={hour} onChange={(e) => setHour(e.target.value)} className="w-28 font-mono" placeholder="*" />
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Day of month</div>
            <Input value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} className="w-28 font-mono" placeholder="*" />
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Month</div>
            <Input value={month} onChange={(e) => setMonth(e.target.value)} className="w-28 font-mono" placeholder="*" />
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Day of week (0-6)</div>
            <Input value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className="w-28 font-mono" placeholder="*" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CRON_PRESETS.map((preset) => (
            <button
              key={preset.expr}
              onClick={() => {
                const [m, h, d, mo, dw] = preset.expr.split(" ");
                setMinute(m);
                setHour(h);
                setDayOfMonth(d);
                setMonth(mo);
                setDayOfWeek(dw);
              }}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Expression</div>
          <div className="mt-1 flex items-center gap-3">
            <code className="font-mono text-lg font-semibold text-primary">{expr}</code>
            <CopyButton value={expr} toolSlug={tool.slug} toolName={tool.name} />
          </div>
          {!valid && <p className="mt-1 text-sm text-red-500">Invalid cron fields — check ranges and syntax.</p>}
        </div>
        <Button onClick={generate} disabled={!valid}>Preview next runs</Button>
        {runs.length > 0 && (
          <div className="space-y-2">
            {runs.map((run, index) => (
              <div key={run.toISOString()} className="rounded-xl border border-border bg-background p-3 text-sm">
                <span className="mr-2 text-xs text-muted-foreground">#{index + 1}</span>
                {run.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </Shell>
  );
}
