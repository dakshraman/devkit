"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Shell, Panel, InfoTile } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

type NpmPackage = {
  "dist-tags"?: { latest?: string };
  maintainers?: { name?: string }[];
  dependencies?: Record<string, string>;
  readme?: string;
  versions?: Record<string, unknown>;
};

export default function NpmTool({ tool }: { tool: Tool }) {
  const schema = z.object({ name: z.string().min(1) });
  const { register, handleSubmit } = useForm<{ name: string }>({ resolver: zodResolver(schema), defaultValues: { name: "react" } });
  const [pkg, setPkg] = useState<NpmPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadPackage = async (name: string) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`https://registry.npmjs.org/${name}`);
      setPkg(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load npm package");
      setPkg(null);
    } finally {
      setLoading(false);
    }
  };
  const onSubmit = handleSubmit(async ({ name }) => {
    await loadPackage(name);
  });
  useEffect(() => {
    let active = true;
    axios
      .get<NpmPackage>("https://registry.npmjs.org/react")
      .then(({ data }) => {
        if (active) setPkg(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load npm package");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const versions = pkg ? Object.keys(pkg.versions ?? {}).slice(-10).reverse() : [];
  return (
    <Shell tool={tool}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Panel title="npm package explorer" description="Registry info, README and version history.">
          <div className="flex gap-2">
            <Input {...register("name")} placeholder="Package name" />
            <Button type="submit" disabled={loading}>{loading ? "Loading..." : "Explore"}</Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {pkg ? (
            <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoTile label="Version" value={pkg["dist-tags"]?.latest ?? "n/a"} />
                  <InfoTile label="Maintainers" value={String(pkg.maintainers?.length ?? 0)} />
                  <InfoTile label="Dependencies" value={String(Object.keys(pkg.dependencies ?? {}).length)} />
                </div>
                <Panel title="README" className="bg-background/60">
                  <div className="max-h-[420px] overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">{pkg.readme ?? "No README available."}</div>
                </Panel>
              </div>
              <div className="space-y-3">
                {versions.map((version) => (
                  <div key={version} className="rounded-xl border border-border bg-background p-3 text-sm">{version}</div>
                ))}
              </div>
            </div>
          ) : <Skeleton className="h-64" />}
        </Panel>
      </form>
    </Shell>
  );
}
