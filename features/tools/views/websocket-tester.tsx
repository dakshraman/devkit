"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

interface WsMessage {
  id: number;
  dir: "sent" | "received" | "system";
  data: string;
  time: string;
}

type ConnectionState = "closed" | "connecting" | "open" | "error";

export default function WebSocketTester({ tool }: { tool: Tool }) {
  const [url, setUrl] = useState("wss://echo.websocket.org");
  const [state, setState] = useState<ConnectionState>("closed");
  const [messages, setMessages] = useState<WsMessage[]>([]);
  const [input, setInput] = useState("");
  const [isJson, setIsJson] = useState(false);
  const [stats, setStats] = useState({ sent: 0, received: 0, latency: 0 });
  const wsRef = useRef<WebSocket | null>(null);
  const msgId = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const connectTime = useRef(0);
  const [uptime, setUptime] = useState(0);
  const uptimeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingSent = useRef(0);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      if (uptimeTimer.current) clearInterval(uptimeTimer.current);
    };
  }, []);

  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (state === "open") {
      connectTime.current = Date.now();
      uptimeTimer.current = setInterval(() => {
        setUptime(Math.floor((Date.now() - connectTime.current) / 1000));
      }, 1000);
    } else {
      if (uptimeTimer.current) clearInterval(uptimeTimer.current);
    }
    return () => { if (uptimeTimer.current) clearInterval(uptimeTimer.current); };
  }, [state]);

  const addMessage = useCallback((dir: WsMessage["dir"], data: string) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;
    msgId.current++;
    setMessages((prev) => [...prev, { id: msgId.current, dir, data, time }]);
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    setState("connecting");
    setMessages([]);
    setStats({ sent: 0, received: 0, latency: 0 });
    setUptime(0);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setState("open");
        addMessage("system", `Connected to ${url}`);
      };

      ws.onmessage = (ev) => {
        const data = typeof ev.data === "string" ? ev.data : "[binary]";
        setStats((prev) => ({ ...prev, received: prev.received + 1 }));
        addMessage("received", data);

        if (pingSent.current > 0) {
          const latency = Date.now() - pingSent.current;
          pingSent.current = 0;
          setStats((prev) => ({ ...prev, latency }));
        }
      };

      ws.onerror = () => {
        setState("error");
        addMessage("system", "Connection error");
      };

      ws.onclose = (ev) => {
        setState("closed");
        addMessage("system", `Disconnected (code: ${ev.code}, reason: ${ev.reason || "none"})`);
      };
    } catch {
      setState("error");
      addMessage("system", "Failed to create WebSocket connection");
    }
  }, [url, addMessage]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    setState("closed");
  }, []);

  const send = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !input.trim()) return;
    const data = input.trim();
    wsRef.current.send(data);
    setStats((prev) => ({ ...prev, sent: prev.sent + 1 }));
    addMessage("sent", data);
    setInput("");
  }, [input, addMessage]);

  const sendPing = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    pingSent.current = Date.now();
    wsRef.current.send("ping");
    setStats((prev) => ({ ...prev, sent: prev.sent + 1 }));
    addMessage("sent", "ping");
  }, [addMessage]);

  const formatUptime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const stateColors: Record<ConnectionState, string> = {
    closed: "bg-zinc-500",
    connecting: "bg-yellow-500",
    open: "bg-emerald-500",
    error: "bg-red-500",
  };

  return (
    <Shell tool={tool}>
      <Panel title="WebSocket Tester" description="Connect to WebSocket endpoints, send messages, and monitor real-time communication.">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="ws://localhost:8080 or wss://echo.websocket.org"
              className="font-mono text-sm"
            />
            {state === "open" ? (
              <Button variant="destructive" onClick={disconnect}>Disconnect</Button>
            ) : (
              <Button onClick={connect} disabled={state === "connecting"}>
                {state === "connecting" ? "Connecting…" : "Connect"}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <span className={`inline-block size-2 rounded-full ${stateColors[state]}`} />
              <span className="capitalize text-muted-foreground">{state}</span>
            </span>
            <span className="text-muted-foreground">Sent: <span className="font-mono text-foreground">{stats.sent}</span></span>
            <span className="text-muted-foreground">Received: <span className="font-mono text-foreground">{stats.received}</span></span>
            <span className="text-muted-foreground">Latency: <span className="font-mono text-foreground">{stats.latency}ms</span></span>
            <span className="text-muted-foreground">Uptime: <span className="font-mono text-foreground">{formatUptime(uptime)}</span></span>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={isJson ? '{"key": "value"}' : "Type a message…"}
              disabled={state !== "open"}
              className="flex-1 font-mono text-sm"
            />
            <Button
              variant={isJson ? "default" : "outline"}
              size="sm"
              onClick={() => setIsJson(!isJson)}
              disabled={state !== "open"}
            >
              {isJson ? "JSON" : "Text"}
            </Button>
            <Button onClick={send} disabled={state !== "open" || !input.trim()}>Send</Button>
            <Button variant="outline" onClick={sendPing} disabled={state !== "open"}>Ping</Button>
          </div>

          <div ref={logRef} className="h-[360px] overflow-y-auto rounded-xl border border-border bg-background p-3 space-y-1">
            {messages.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Connect to a WebSocket server to start.</p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.dir === "sent" ? "justify-end" : msg.dir === "system" ? "justify-center" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-1.5 text-xs ${
                    msg.dir === "sent"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : msg.dir === "system"
                        ? "bg-muted text-muted-foreground italic"
                        : "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                  }`}
                >
                  <span className="mr-2 font-mono text-[10px] opacity-50">{msg.time}</span>
                  <span className="break-all font-mono">{msg.data}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </Shell>
  );
}
