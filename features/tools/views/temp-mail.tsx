"use client";

import { Icon } from "@iconify/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Panel, SectionLabel, Shell } from "@/features/tools/tool-layout";
import { cn } from "@/lib/utils";
import {
  randomChars,
  formatMailDate,
  mailApi,
  downloadAttachment,
  type MailAccount,
  type MailSummary,
  type MailDetail,
} from "@/features/tools/tool-helpers";
import type { Tool } from "@/types";

export default function TempMailTool({ tool }: { tool: Tool }) {
  const [account, setAccount] = useState<MailAccount | null>(null);
  const [messages, setMessages] = useState<MailSummary[]>([]);
  const [detail, setDetail] = useState<MailDetail | null>(null);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const bootRef = useRef(false);

  const fetchInbox = useCallback(async (silent = false): Promise<void> => {
    if (!account) return;
    if (!silent) setRefreshing(true);
    try {
      const data = await mailApi<{ "hydra:member": MailSummary[] }>("/messages", { token: account.token });
      setMessages(data["hydra:member"]);
      setError("");
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : "Failed to fetch messages.");
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, [account]);

  const generateInbox = useCallback(async (): Promise<void> => {
    if (generating) return;
    setGenerating(true);
    setError("");
    try {
      const domains = await mailApi<{ "hydra:member": { domain: string }[] }>("/domains");
      const list = domains["hydra:member"] ?? [];
      if (!list.length) throw new Error("No mail domains available.");
      const domain = list[Math.floor(Math.random() * list.length)].domain;
      const password = randomChars(16, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*");
      let created = false;
      for (let attempt = 0; attempt < 4 && !created; attempt++) {
        const address = `${randomChars(12, "abcdefghijklmnopqrstuvwxyz0123456789")}@${domain}`;
        try {
          await mailApi("/accounts", { method: "POST", body: { address, password } });
          const tokenData = await mailApi<{ token: string }>("/token", { method: "POST", body: { address, password } });
          setAccount({ address, token: tokenData.token, password });
          setMessages([]);
          setDetail(null);
          created = true;
        } catch {
          // address collision — retry with a fresh address
        }
      }
      if (!created) throw new Error("Could not create a mailbox. Please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create inbox.");
    } finally {
      setGenerating(false);
    }
  }, [generating]);

  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    void generateInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!account) return;
    let active = true;
    const load = async () => {
      try {
        const data = await mailApi<{ "hydra:member": MailSummary[] }>("/messages", { token: account.token });
        if (!active) return;
        setMessages(data["hydra:member"]);
        setError("");
      } catch {
        // silent poll — ignore transient errors
      }
    };
    void load();
    const t = setInterval(() => void load(), 10000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [account]);

  const openMessage = async (id: string) => {
    if (!account) return;
    setReadingId(id);
    try {
      const data = await mailApi<MailDetail>(`/messages/${id}`, { token: account.token });
      setDetail(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read message.");
    } finally {
      setReadingId(null);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!account) return;
    try {
      await mailApi(`/messages/${id}`, { method: "DELETE", token: account.token });
      if (detail?.id === id) setDetail(null);
      void fetchInbox(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete message.");
    }
  };

  const disposeInbox = async () => {
    if (!account) return;
    try {
      await mailApi("/accounts", { method: "DELETE", token: account.token });
    } catch {
      // best effort
    }
    setAccount(null);
    setMessages([]);
    setDetail(null);
  };

  return (
    <Shell tool={tool}>
      <Panel title="Temporary Inbox">
        {account ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
              <Icon icon="lucide:mail" className="size-4 shrink-0 text-indigo-500" />
              <span className="min-w-0 flex-1 break-all font-mono text-sm">{account.address}</span>
              <CopyButton value={account.address} toolSlug={tool.slug} toolName={tool.name} />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={() => void fetchInbox()}
                disabled={refreshing}
                aria-label="Refresh inbox"
              >
                <Icon icon={refreshing ? "lucide:loader-2" : "lucide:refresh-cw"} className={cn("size-3.5", refreshing && "animate-spin")} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={() => void generateInbox()}
                disabled={generating}
                aria-label="New inbox"
              >
                <Icon icon="lucide:plus" className="size-3.5" />
                <span className="hidden sm:inline">New inbox</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs text-red-500 hover:text-red-600"
                onClick={() => void disposeInbox()}
                aria-label="Dispose inbox"
              >
                <Icon icon="lucide:trash-2" className="size-3.5" />
                <span className="hidden sm:inline">Dispose</span>
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <SectionLabel icon="lucide:inbox" label={`Inbox (${messages.length})`} />
                <span className="text-xs text-muted-foreground">auto-refreshes every 10s</span>
              </div>
              {messages.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No messages yet. Send an email to{" "}
                  <span className="font-mono text-foreground">{account.address}</span> and it will
                  appear here within seconds.
                </div>
              ) : (
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {messages.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => void openMessage(m.id)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent"
                      >
                        <span className={cn("size-2 shrink-0 rounded-full", m.seen ? "bg-muted-foreground/50" : "bg-indigo-500")} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{m.subject || "(no subject)"}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {m.from.name || m.from.address} · {formatMailDate(m.createdAt)}
                          </span>
                        </span>
                        <Icon
                          icon={readingId === m.id ? "lucide:loader-2" : "lucide:chevron-right"}
                          className={cn("size-4 shrink-0 text-muted-foreground", readingId === m.id && "animate-spin")}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {detail && (
              <div className="space-y-3 rounded-lg border border-border">
                <div className="flex items-start justify-between gap-2 border-b border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{detail.subject || "(no subject)"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      From: {detail.from.name ? `${detail.from.name} <${detail.from.address}>` : detail.from.address} ·{" "}
                      {formatMailDate(detail.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs" onClick={() => setDetail(null)} aria-label="Close message">
                      <Icon icon="lucide:x" className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs text-red-500 hover:text-red-600"
                      onClick={() => void deleteMessage(detail.id)}
                      aria-label="Delete message"
                    >
                      <Icon icon="lucide:trash-2" className="size-3.5" />
                    </Button>
                  </div>
                </div>
                {detail.html ? (
                  <iframe title="Email preview" sandbox="" srcDoc={detail.html} className="h-96 w-full rounded-b-lg" />
                ) : (
                  <pre className="max-h-96 overflow-auto whitespace-pre-wrap p-4 text-sm">{detail.text || detail.intro}</pre>
                )}
                {detail.attachments && detail.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-3 pb-3">
                    {detail.attachments.map((a) => (
                      <Button
                        key={a.id}
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() => void downloadAttachment(account, a)}
                      >
                        <Icon icon="lucide:paperclip" className="size-3.5" />
                        {a.filename}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <Icon icon="lucide:inbox" className="mx-auto mb-3 size-10 text-muted-foreground" />
              <p className="text-sm text-foreground">
                Generate a disposable inbox to receive email instantly.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">No signup required. Inboxes are temporary.</p>
              <Button className="mt-4" onClick={() => void generateInbox()} disabled={generating}>
                {generating ? "Creating inbox…" : "Generate inbox"}
                {generating && <Icon icon="lucide:loader-2" className="ml-2 size-4 animate-spin" />}
              </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}
      </Panel>
    </Shell>
  );
}
