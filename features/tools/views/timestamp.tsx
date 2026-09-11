"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoTile, Panel, Shell } from "@/features/tools/tool-layout";
import { nowSeconds } from "@/lib/utils";
import type { Tool } from "@/types";

export default function TimestampTool({ tool }: { tool: Tool }) {
  const [value, setValue] = useState(String(nowSeconds()));
  const [mode, setMode] = useState<"unix" | "date">("unix");
  const date = useMemo(() => {
    if (mode === "unix") {
      const raw = Number(value);
      return new Date(raw < 1e12 ? raw * 1000 : raw);
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [value, mode]);
  return (
    <Shell tool={tool}>
      <Panel title="Timestamp converter" description="Convert between epoch values and human-readable dates.">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "unix" | "date")}>
          <TabsList><TabsTrigger value="unix">Unix</TabsTrigger><TabsTrigger value="date">Date</TabsTrigger></TabsList>
        </Tabs>
        {mode === "unix" ? <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="1735689600" /> : <Input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} />}
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile label="ISO" value={date.toISOString()} />
          <InfoTile label="Local" value={date.toLocaleString()} />
          <InfoTile label="Unix seconds" value={Math.floor(date.getTime() / 1000).toString()} />
          <InfoTile label="Unix ms" value={date.getTime().toString()} />
        </div>
      </Panel>
    </Shell>
  );
}
