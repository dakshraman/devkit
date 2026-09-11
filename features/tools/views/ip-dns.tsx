"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoTile, Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

const DNS_TYPES: Record<string, number> = { A: 1, AAAA: 28, MX: 15, TXT: 16, NS: 2, CNAME: 5, SOA: 6 };

export default function IpDnsTool({ tool }: { tool: Tool }) {
  const [tab, setTab] = useState<"ip" | "dns">("ip");
  const [ipInfo, setIpInfo] = useState<Record<string, string> | null>(null);
  const [ipError, setIpError] = useState("");
  const [host, setHost] = useState("example.com");
  const [dnsType, setDnsType] = useState<string>("A");
  const [records, setRecords] = useState<{ name: string; type: string; ttl: number; data: string }[] | null>(null);
  const [dnsError, setDnsError] = useState("");
  const [dnsLoading, setDnsLoading] = useState(false);

  useEffect(() => {
    if (tab !== "ip") return;
    let active = true;
    (async () => {
      try {
        const res = await fetch("https://ipwho.is/");
        const data = (await res.json()) as Record<string, unknown>;
        if (!active) return;
        if (data.success === false) throw new Error("Lookup failed");
        const connection = data.connection as Record<string, unknown> | undefined;
        const timezone = data.timezone as Record<string, unknown> | undefined;
        setIpInfo({
          ip: String(data.ip ?? "\u2014"),
          type: String(data.type ?? "\u2014"),
          country: String(data.country ?? "\u2014"),
          region: String(data.region ?? "\u2014"),
          city: String(data.city ?? "\u2014"),
          isp: String(connection?.isp ?? "\u2014"),
          timezone: String(timezone?.id ?? "\u2014"),
        });
        setIpError("");
      } catch (err) {
        if (active) {
          setIpError(err instanceof Error ? err.message : "Could not detect your IP.");
          setIpInfo(null);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [tab]);

  const lookup = async () => {
    if (!host.trim() || dnsLoading) return;
    setDnsLoading(true);
    setDnsError("");
    setRecords(null);
    try {
      const res = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host.trim())}&type=${DNS_TYPES[dnsType]}`,
        { headers: { accept: "application/dns-json" } }
      );
      const data = (await res.json()) as { Status: number; Answer?: { name: string; type: number; TTL: number; data: string }[]; Comment?: string };
      if (data.Status !== 0) throw new Error(data.Comment ?? "DNS lookup failed.");
      setRecords((data.Answer ?? []).map((a) => ({ name: a.name, type: dnsType, ttl: a.TTL, data: a.data })));
    } catch (err) {
      setDnsError(err instanceof Error ? err.message : "Lookup failed. Enter a valid hostname.");
    } finally {
      setDnsLoading(false);
    }
  };

  return (
    <Shell tool={tool}>
      <Panel title="IP & DNS lookup" description="Your public IP via ipwho.is, DNS records via Cloudflare DoH.">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "ip" | "dns")}>
          <TabsList>
            <TabsTrigger value="ip">My IP</TabsTrigger>
            <TabsTrigger value="dns">DNS lookup</TabsTrigger>
          </TabsList>
        </Tabs>

        {tab === "ip" ? (
          ipInfo ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(ipInfo).map(([key, value]) => (
                <InfoTile key={key} label={key} value={value} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              {ipError ? ipError : "Detecting your public IP\u2026"}
            </div>
          )
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Input value={host} onChange={(e) => setHost(e.target.value)} placeholder="example.com" className="flex-1 min-w-56" onKeyDown={(e) => { if (e.key === "Enter") void lookup(); }} />
              <div className="w-32">
                <Select value={dnsType} onValueChange={setDnsType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(DNS_TYPES).map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => void lookup()} disabled={dnsLoading}>
                {dnsLoading ? "Resolving\u2026" : "Look up"}
              </Button>
            </div>
            {dnsError && <p className="text-sm text-red-500">{dnsError}</p>}
            {records && (
              records.length ? (
                <ul className="divide-y divide-border rounded-xl border border-border">
                  {records.map((record, index) => (
                    <li key={index} className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
                      <span className="w-24 shrink-0 rounded-md bg-indigo-500/10 px-2 py-0.5 text-center font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">{record.type}</span>
                      <span className="text-xs text-muted-foreground">{record.name}</span>
                      <span className="min-w-0 flex-1 break-all font-mono">{record.data}</span>
                      <span className="text-xs text-muted-foreground">{record.ttl}s TTL</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No records found for {host.trim()}.</p>
              )
            )}
          </div>
        )}
      </Panel>
    </Shell>
  );
}
