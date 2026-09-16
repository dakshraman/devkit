"use client";

import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

/* ── Device definitions ─────────────────────────────────────────── */

interface Device {
  name: string;
  category: string;
  width: number;
  height: number;
  scale: number;
  frame: "phone" | "tablet" | "laptop" | "desktop" | "watch" | "fold";
}

const DEVICES: Device[] = [
  { name: "iPhone 16 Pro", category: "Phones", width: 393, height: 852, scale: 0.42, frame: "phone" },
  { name: "iPhone 16 Pro Max", category: "Phones", width: 440, height: 932, scale: 0.38, frame: "phone" },
  { name: "iPhone SE", category: "Phones", width: 375, height: 667, scale: 0.48, frame: "phone" },
  { name: "Galaxy S24", category: "Phones", width: 360, height: 780, scale: 0.46, frame: "phone" },
  { name: "Pixel 8", category: "Phones", width: 412, height: 915, scale: 0.4, frame: "phone" },
  { name: "iPad Mini", category: "Tablets", width: 768, height: 1024, scale: 0.42, frame: "tablet" },
  { name: "iPad Air", category: "Tablets", width: 820, height: 1180, scale: 0.38, frame: "tablet" },
  { name: "iPad Pro 12.9\"", category: "Tablets", width: 1024, height: 1366, scale: 0.34, frame: "tablet" },
  { name: "Galaxy Tab S9", category: "Tablets", width: 800, height: 1280, scale: 0.36, frame: "tablet" },
  { name: "Z Fold (Inner)", category: "Foldables", width: 930, height: 1200, scale: 0.34, frame: "fold" },
  { name: "Z Fold (Outer)", category: "Foldables", width: 360, height: 780, scale: 0.46, frame: "phone" },
  { name: "Pixel Fold", category: "Foldables", width: 1048, height: 1200, scale: 0.32, frame: "fold" },
  { name: "Z Flip (Outer)", category: "Foldables", width: 360, height: 720, scale: 0.48, frame: "phone" },
  { name: "Watch Ultra 2", category: "Watches", width: 410, height: 502, scale: 0.38, frame: "watch" },
  { name: "Watch Series 10", category: "Watches", width: 368, height: 448, scale: 0.42, frame: "watch" },
  { name: "Galaxy Watch 6", category: "Watches", width: 432, height: 432, scale: 0.38, frame: "watch" },
  { name: "MacBook Air", category: "Laptops", width: 1280, height: 800, scale: 0.45, frame: "laptop" },
  { name: "MacBook Pro 14\"", category: "Laptops", width: 1512, height: 982, scale: 0.38, frame: "laptop" },
  { name: "MacBook Pro 16\"", category: "Laptops", width: 1728, height: 1117, scale: 0.34, frame: "laptop" },
  { name: "ThinkPad X1", category: "Laptops", width: 1920, height: 1200, scale: 0.32, frame: "laptop" },
  { name: "Windows 1080p", category: "Desktops", width: 1920, height: 1080, scale: 0.36, frame: "desktop" },
  { name: "iMac 24\"", category: "Desktops", width: 2048, height: 1152, scale: 0.34, frame: "desktop" },
  { name: "4K Monitor", category: "Desktops", width: 3840, height: 2160, scale: 0.2, frame: "desktop" },
];

/* ── Helper: scale a device to its display size ─────────────────── */

function scaled(d: Device) {
  return { w: Math.round(d.width * d.scale), h: Math.round(d.height * d.scale) };
}

/* ── Frame: Phone ───────────────────────────────────────────────── */

function PhoneFrame({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const bezelX = Math.max(6, Math.round(w * 0.04));
  const bezelTop = Math.max(20, Math.round(h * 0.035));
  const bezelBot = Math.max(6, Math.round(h * 0.012));
  const r = Math.max(20, Math.round(w * 0.12));
  const totalW = w + bezelX * 2;
  const totalH = h + bezelTop + bezelBot;
  const notchW = Math.round(w * 0.26);
  const notchH = Math.max(8, Math.round(w * 0.05));
  const indicatorW = Math.round(w * 0.28);

  return (
    <div style={{ width: totalW, height: totalH, position: "relative", flexShrink: 0 }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: r,
        background: "linear-gradient(160deg, #222 0%, #111 100%)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
      }}>
        {/* Volume buttons left */}
        <div style={{ position: "absolute", left: -2, top: "25%", width: 2, height: "6%", borderRadius: 2, background: "#444" }} />
        <div style={{ position: "absolute", left: -2, top: "33%", width: 2, height: "8%", borderRadius: 2, background: "#444" }} />
        {/* Power right */}
        <div style={{ position: "absolute", right: -2, top: "28%", width: 2, height: "10%", borderRadius: 2, background: "#444" }} />
        {/* Dynamic Island */}
        <div style={{
          position: "absolute", left: "50%", top: Math.round(bezelTop * 0.4),
          transform: "translateX(-50%)", width: notchW, height: notchH,
          borderRadius: notchH / 2, background: "#000", zIndex: 2,
        }} />
        {/* Screen */}
        <div style={{
          position: "absolute", left: bezelX, top: bezelTop,
          width: w, height: h, borderRadius: r - 6,
          overflow: "hidden", background: "#fff",
        }}>{children}</div>
        {/* Home indicator */}
        <div style={{
          position: "absolute", left: "50%", bottom: Math.round(bezelBot * 0.5),
          transform: "translateX(-50%)", width: indicatorW, height: 3,
          borderRadius: 2, background: "rgba(255,255,255,0.15)",
        }} />
      </div>
    </div>
  );
}

/* ── Frame: Tablet ──────────────────────────────────────────────── */

function TabletFrame({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const bezel = Math.max(8, Math.round(Math.min(w, h) * 0.02));
  const r = Math.max(14, Math.round(w * 0.03));
  const totalW = w + bezel * 2;
  const totalH = h + bezel * 2;

  return (
    <div style={{ width: totalW, height: totalH, position: "relative", flexShrink: 0 }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: r,
        background: "linear-gradient(160deg, #222 0%, #111 100%)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
      }}>
        {/* Camera */}
        <div style={{
          position: "absolute", left: "50%", top: Math.round(bezel * 0.35),
          transform: "translateX(-50%)", width: 4, height: 4,
          borderRadius: "50%", background: "#333",
        }} />
        <div style={{
          position: "absolute", left: bezel, top: bezel,
          width: w, height: h, borderRadius: r - 4,
          overflow: "hidden", background: "#fff",
        }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Frame: Watch ───────────────────────────────────────────────── */

function WatchFrame({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const bezel = Math.max(6, Math.round(w * 0.03));
  const r = Math.round(w * 0.28);
  const bodyW = w + bezel * 2;
  const bodyH = h + bezel * 2;
  const bandW = Math.round(w * 0.5);
  const bandH = 14;
  const totalW = bodyW + 8;
  const totalH = bodyH + bandH * 2;

  return (
    <div style={{ width: totalW, height: totalH, position: "relative", flexShrink: 0 }}>
      {/* Top band */}
      <div style={{
        position: "absolute", left: "50%", top: 0,
        transform: "translateX(-50%)", width: bandW, height: bandH,
        background: "#555", borderRadius: "5px 5px 0 0",
      }} />
      {/* Bottom band */}
      <div style={{
        position: "absolute", left: "50%", bottom: 0,
        transform: "translateX(-50%)", width: bandW, height: bandH,
        background: "#555", borderRadius: "0 0 5px 5px",
      }} />
      {/* Body */}
      <div style={{
        position: "absolute", left: 4, top: bandH,
        width: bodyW, height: bodyH, borderRadius: r,
        background: "linear-gradient(160deg, #333 0%, #1a1a1a 100%)",
        boxShadow: "0 15px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
      }}>
        {/* Crown */}
        <div style={{ position: "absolute", right: -4, top: "32%", width: 4, height: 10, borderRadius: 2, background: "#666" }} />
        {/* Button */}
        <div style={{ position: "absolute", right: -4, top: "52%", width: 4, height: 7, borderRadius: 2, background: "#555" }} />
        <div style={{
          position: "absolute", left: bezel, top: bezel,
          width: w, height: h, borderRadius: r - 4,
          overflow: "hidden", background: "#000",
        }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Frame: Laptop ──────────────────────────────────────────────── */

function LaptopFrame({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const bezel = Math.max(6, Math.round(Math.min(w, h) * 0.012));
  const screenR = 8;
  const lidW = w + bezel * 2;
  const lidH = h + bezel * 2 + 4;
  const baseH = Math.max(16, Math.round(lidH * 0.06));
  const baseExtra = Math.max(20, Math.round(lidW * 0.03));
  const totalW = lidW + baseExtra;
  const totalH = lidH + baseH;

  return (
    <div style={{ width: totalW, height: totalH, position: "relative", flexShrink: 0 }}>
      {/* Lid */}
      <div style={{
        width: lidW, height: lidH,
        borderRadius: "10px 10px 0 0",
        background: "linear-gradient(160deg, #2a2a2a 0%, #1a1a1a 100%)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
        position: "relative",
        border: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "none",
      }}>
        {/* Camera */}
        <div style={{
          position: "absolute", left: "50%", top: 3,
          transform: "translateX(-50%)", width: 4, height: 4,
          borderRadius: "50%", background: "#2a2a2a",
          border: "1px solid #333",
        }} />
        {/* Screen */}
        <div style={{
          position: "absolute", left: bezel, top: bezel,
          width: w, height: h, borderRadius: screenR,
          overflow: "hidden", background: "#fff",
        }}>{children}</div>
        {/* Brand */}
        <div style={{
          position: "absolute", bottom: 1, left: "50%",
          transform: "translateX(-50%)",
          fontSize: 6, color: "#555", letterSpacing: 2, fontWeight: 600,
        }}>DEVKIT</div>
      </div>
      {/* Hinge */}
      <div style={{
        width: lidW, height: 2,
        background: "linear-gradient(90deg, #333, #555, #333)",
      }} />
      {/* Base */}
      <div style={{
        width: totalW, height: baseH,
        borderRadius: "0 0 10px 10px",
        background: "linear-gradient(180deg, #333 0%, #252525 100%)",
        boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.04)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        position: "relative",
      }}>
        {/* Trackpad */}
        <div style={{
          position: "absolute", left: "50%", top: 3,
          transform: "translateX(-50%)",
          width: Math.round(lidW * 0.35), height: 2,
          borderRadius: 1, background: "rgba(255,255,255,0.05)",
        }} />
      </div>
    </div>
  );
}

/* ── Frame: Desktop ─────────────────────────────────────────────── */

function DesktopFrame({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const bezel = Math.max(6, Math.round(Math.min(w, h) * 0.01));
  const monitorW = w + bezel * 2;
  const monitorH = h + bezel * 2 + 6;
  const neckW = Math.max(14, Math.round(monitorW * 0.03));
  const neckH = Math.max(14, Math.round(monitorH * 0.06));
  const baseW = Math.max(40, Math.round(monitorW * 0.2));
  const baseH = 6;
  const totalW = monitorW + 20;
  const totalH = monitorH + neckH + baseH + 4;

  return (
    <div style={{ width: totalW, height: totalH, position: "relative", flexShrink: 0 }}>
      {/* Monitor */}
      <div style={{
        width: monitorW, height: monitorH,
        borderRadius: 8,
        background: "linear-gradient(160deg, #2a2a2a 0%, #1a1a1a 100%)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
        position: "relative",
      }}>
        {/* Camera */}
        <div style={{
          position: "absolute", left: "50%", top: 3,
          transform: "translateX(-50%)", width: 3, height: 3,
          borderRadius: "50%", background: "#333",
        }} />
        <div style={{
          position: "absolute", left: bezel, top: bezel + 3,
          width: w, height: h, borderRadius: 4,
          overflow: "hidden", background: "#fff",
        }}>{children}</div>
        <div style={{
          position: "absolute", bottom: 1, left: "50%",
          transform: "translateX(-50%)",
          fontSize: 5, color: "#555", letterSpacing: 1, fontWeight: 600,
        }}>DEVKIT</div>
      </div>
      {/* Neck */}
      <div style={{
        position: "absolute", bottom: baseH, left: "50%",
        transform: "translateX(-50%)",
        width: neckW, height: neckH,
        background: "linear-gradient(180deg, #444, #333)",
        borderRadius: "0 0 3px 3px",
      }} />
      {/* Base */}
      <div style={{
        position: "absolute", bottom: 0, left: "50%",
        transform: "translateX(-50%)",
        width: baseW, height: baseH,
        borderRadius: 3,
        background: "linear-gradient(180deg, #555, #3a3a3a)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      }} />
    </div>
  );
}

/* ── Frame: Fold ────────────────────────────────────────────────── */

function FoldFrame({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const bezel = Math.max(6, Math.round(w * 0.015));
  const gap = 4;
  const halfW = Math.round((w - gap) / 2);
  const totalW = w + bezel * 2 + gap + 4;
  const totalH = h + bezel * 2;

  return (
    <div style={{ width: totalW, height: totalH, position: "relative", flexShrink: 0 }}>
      <div style={{
        display: "flex", gap,
        width: totalW, height: totalH,
        borderRadius: 14,
        background: "linear-gradient(160deg, #222 0%, #111 100%)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
        padding: bezel,
      }}>
        {/* Left panel */}
        <div style={{
          width: halfW, height: h, borderRadius: 8,
          overflow: "hidden", background: "#e8e8e8",
        }} />
        {/* Hinge */}
        <div style={{ width: gap, background: "#444", borderRadius: 1 }} />
        {/* Right panel */}
        <div style={{
          width: halfW, height: h, borderRadius: 8,
          overflow: "hidden", background: "#fff",
        }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */

export default function DeviceSimulator({ tool }: { tool: Tool }) {
  const [url, setUrl] = useState("https://devkit.dakshraman.in");
  const [active, setActive] = useState<Device>(DEVICES[0]);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [history, setHistory] = useState(["https://devkit.dakshraman.in"]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigate = (u: string) => {
    const full = u.startsWith("http") ? u : `https://${u}`;
    setUrl(full);
    const next = [...history.slice(0, historyIdx + 1), full];
    setHistory(next);
    setHistoryIdx(next.length - 1);
  };
  const back = () => { if (historyIdx > 0) { const i = historyIdx - 1; setHistoryIdx(i); setUrl(history[i]); } };
  const fwd = () => { if (historyIdx < history.length - 1) { const i = historyIdx + 1; setHistoryIdx(i); setUrl(history[i]); } };

  const isLandscape = orientation === "landscape" && active.frame !== "watch" && active.frame !== "fold";
  const vpW = isLandscape ? active.height : active.width;
  const vpH = isLandscape ? active.width : active.height;
  const { w: displayW, h: displayH } = scaled({ ...active, width: vpW, height: vpH });

  const categories = [...new Set(DEVICES.map((d) => d.category))];

  const iframe = (
    <iframe
      ref={iframeRef}
      src={url}
      style={{ width: "100%", height: "100%", border: 0, background: "#fff" }}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      loading="lazy"
      title="simulated website"
    />
  );

  const fp = { w: displayW, h: displayH };

  const renderFrame = () => {
    switch (active.frame) {
      case "phone":   return <PhoneFrame {...fp}>{iframe}</PhoneFrame>;
      case "tablet":  return <TabletFrame {...fp}>{iframe}</TabletFrame>;
      case "watch":   return <WatchFrame {...fp}>{iframe}</WatchFrame>;
      case "laptop":  return <LaptopFrame {...fp}>{iframe}</LaptopFrame>;
      case "desktop": return <DesktopFrame {...fp}>{iframe}</DesktopFrame>;
      case "fold":    return <FoldFrame {...fp}>{iframe}</FoldFrame>;
      default:        return iframe;
    }
  };

  return (
    <Shell tool={tool}>
      <Panel title="Device Simulator" description="Preview websites in real device frames with accurate screen dimensions and bezels.">
        <div className="space-y-4">
          {/* URL bar */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <Button variant="ghost" size="icon" className="size-8" onClick={back} disabled={historyIdx === 0}>
                <Icon icon="lucide:chevron-left" className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8" onClick={fwd} disabled={historyIdx >= history.length - 1}>
                <Icon icon="lucide:chevron-right" className="size-4" />
              </Button>
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5">
              <Icon icon="lucide:globe" className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && navigate(url)}
                className="flex-1 bg-transparent font-mono text-sm outline-none"
                placeholder="Enter URL..."
              />
            </div>
            <Button onClick={() => navigate(url)} size="sm">Go</Button>
          </div>

          {/* Device chips */}
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat} className="flex items-start gap-2">
                <span className="mt-1 w-16 shrink-0 text-[10px] font-medium uppercase text-muted-foreground">{cat}</span>
                <div className="flex flex-wrap gap-1">
                  {DEVICES.filter((d) => d.category === cat).map((d) => (
                    <button
                      key={d.name}
                      onClick={() => setActive(d)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                        active.name === d.name
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {active.frame !== "watch" && active.frame !== "fold" && (
              <div className="flex rounded-lg border border-border bg-background p-0.5">
                {(["portrait", "landscape"] as const).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrientation(o)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      orientation === o ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {o === "portrait" ? "Portrait" : "Landscape"}
                  </button>
                ))}
              </div>
            )}
            <span className="text-xs tabular-nums text-muted-foreground">
              {vpW}×{vpH} @ {Math.round(active.scale * 100)}% → {displayW}×{displayH}px
            </span>
          </div>

          {/* Frame viewport */}
          <div
            className="mx-auto flex items-center justify-center overflow-auto rounded-3xl p-8"
            style={{
              background: "radial-gradient(ellipse at 50% 40%, #1e1e32 0%, #0c0c18 100%)",
              minHeight: Math.min(displayH + 100, 700),
            }}
          >
            {renderFrame()}
          </div>

          {/* Info */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background/50 px-4 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{active.name}</span>
            <span>·</span>
            <span>{active.category}</span>
            <span>·</span>
            <span>{vpW}×{vpH}px</span>
            <span>·</span>
            <span>{active.frame}</span>
          </div>
        </div>
      </Panel>
    </Shell>
  );
}
