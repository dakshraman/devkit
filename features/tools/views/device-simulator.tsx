"use client";

import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

interface Device {
  name: string;
  category: string;
  width: number;
  height: number;
  scale: number;
  frame: "phone" | "tablet" | "laptop" | "desktop" | "watch" | "fold";
}

const DEVICES: Device[] = [
  { name: "iPhone 16 Pro", category: "Phones", width: 393, height: 852, scale: 0.55, frame: "phone" },
  { name: "iPhone 16 Pro Max", category: "Phones", width: 440, height: 932, scale: 0.5, frame: "phone" },
  { name: "iPhone SE", category: "Phones", width: 375, height: 667, scale: 0.6, frame: "phone" },
  { name: "Samsung Galaxy S24", category: "Phones", width: 360, height: 780, scale: 0.58, frame: "phone" },
  { name: "Google Pixel 8", category: "Phones", width: 412, height: 915, scale: 0.52, frame: "phone" },
  { name: "iPad Mini", category: "Tablets", width: 768, height: 1024, scale: 0.55, frame: "tablet" },
  { name: "iPad Air", category: "Tablets", width: 820, height: 1180, scale: 0.5, frame: "tablet" },
  { name: "iPad Pro 12.9\"", category: "Tablets", width: 1024, height: 1366, scale: 0.45, frame: "tablet" },
  { name: "Galaxy Tab S9", category: "Tablets", width: 800, height: 1280, scale: 0.5, frame: "tablet" },
  { name: "Z Fold (Inner)", category: "Foldables", width: 930, height: 2316, scale: 0.35, frame: "fold" },
  { name: "Z Fold (Outer)", category: "Foldables", width: 360, height: 780, scale: 0.58, frame: "phone" },
  { name: "Pixel Fold (Inner)", category: "Foldables", width: 1048, height: 2208, scale: 0.33, frame: "fold" },
  { name: "Z Flip (Outer)", category: "Foldables", width: 360, height: 720, scale: 0.6, frame: "phone" },
  { name: "Apple Watch Ultra 2", category: "Watches", width: 410, height: 502, scale: 0.55, frame: "watch" },
  { name: "Apple Watch Series 10", category: "Watches", width: 368, height: 448, scale: 0.6, frame: "watch" },
  { name: "Galaxy Watch 6", category: "Watches", width: 432, height: 432, scale: 0.55, frame: "watch" },
  { name: "MacBook Air 13\"", category: "Laptops", width: 1280, height: 800, scale: 0.65, frame: "laptop" },
  { name: "MacBook Pro 14\"", category: "Laptops", width: 1512, height: 982, scale: 0.55, frame: "laptop" },
  { name: "MacBook Pro 16\"", category: "Laptops", width: 1728, height: 1117, scale: 0.5, frame: "laptop" },
  { name: "Dell XPS 15", category: "Laptops", width: 1504, height: 1000, scale: 0.55, frame: "laptop" },
  { name: "ThinkPad X1 Carbon", category: "Laptops", width: 1920, height: 1200, scale: 0.48, frame: "laptop" },
  { name: "Windows 1080p", category: "Desktops", width: 1920, height: 1080, scale: 0.45, frame: "desktop" },
  { name: "iMac 24\"", category: "Desktops", width: 2048, height: 1152, scale: 0.42, frame: "desktop" },
  { name: "4K Monitor", category: "Desktops", width: 3840, height: 2160, scale: 0.3, frame: "desktop" },
];

/* ── Frame Components ────────────────────────────────────────────── */

function PhoneFrame({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const bezel = 10;
  const topBar = 32;
  const bottomBar = 8;
  const radius = 36;
  const notchW = Math.min(w * 0.28, 80);
  const notchH = Math.min(w * 0.06, 20);
  const totalW = w + bezel * 2;
  const totalH = h + topBar + bottomBar + bezel * 2;

  return (
    <div style={{ width: totalW, height: totalH, position: "relative" }}>
      {/* Outer body */}
      <div style={{
        position: "absolute", inset: 0,
        borderRadius: radius,
        background: "linear-gradient(145deg, #1a1a2e, #0f0f1a)",
        boxShadow: "0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        {/* Side buttons */}
        <div style={{ position: "absolute", right: -3, top: "22%", width: 3, height: "8%", borderRadius: 4, background: "#333" }} />
        <div style={{ position: "absolute", right: -3, top: "34%", width: 3, height: "12%", borderRadius: 4, background: "#333" }} />
        <div style={{ position: "absolute", left: -3, top: "28%", width: 3, height: "6%", borderRadius: 4, background: "#333" }} />

        {/* Dynamic Island */}
        <div style={{
          position: "absolute", left: "50%", top: bezel + 6,
          transform: "translateX(-50%)",
          width: notchW, height: notchH,
          borderRadius: notchH / 2,
          background: "#000",
          zIndex: 10,
        }} />

        {/* Screen area */}
        <div style={{
          position: "absolute",
          left: bezel, top: topBar,
          width: w, height: h,
          borderRadius: radius - 8,
          overflow: "hidden",
          background: "#fff",
        }}>
          {children}
        </div>

        {/* Home indicator */}
        <div style={{
          position: "absolute",
          left: "50%", bottom: bezel + 2,
          transform: "translateX(-50%)",
          width: w * 0.3, height: 4,
          borderRadius: 2,
          background: "rgba(255,255,255,0.2)",
        }} />
      </div>
    </div>
  );
}

function TabletFrame({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const bezel = 12;
  const radius = 20;
  const totalW = w + bezel * 2;
  const totalH = h + bezel * 2;

  return (
    <div style={{ width: totalW, height: totalH, position: "relative" }}>
      <div style={{
        position: "absolute", inset: 0,
        borderRadius: radius,
        background: "linear-gradient(145deg, #1a1a2e, #0f0f1a)",
        boxShadow: "0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        {/* Camera */}
        <div style={{ position: "absolute", left: "50%", top: 6, transform: "translateX(-50%)", width: 6, height: 6, borderRadius: "50%", background: "#222" }} />
        <div style={{
          position: "absolute", left: bezel, top: bezel,
          width: w, height: h,
          borderRadius: radius - 6,
          overflow: "hidden", background: "#fff",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function WatchFrame({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const bezel = 8;
  const radius = 28;
  const bandW = w * 0.55;
  const totalW = w + bezel * 2 + 8;
  const totalH = h + bezel * 2 + 40;

  return (
    <div style={{ width: totalW, height: totalH, position: "relative" }}>
      {/* Band top */}
      <div style={{
        position: "absolute", left: "50%", top: 0,
        transform: "translateX(-50%)",
        width: bandW, height: 18,
        background: "linear-gradient(180deg, #444, #333)",
        borderRadius: "6px 6px 0 0",
      }} />
      {/* Band bottom */}
      <div style={{
        position: "absolute", left: "50%", bottom: 0,
        transform: "translateX(-50%)",
        width: bandW, height: 18,
        background: "linear-gradient(0deg, #444, #333)",
        borderRadius: "0 0 6px 6px",
      }} />
      {/* Body */}
      <div style={{
        position: "absolute", left: 4, top: 18,
        width: w + bezel * 2, height: h + bezel * 2,
        borderRadius: radius,
        background: "linear-gradient(145deg, #2a2a3e, #1a1a28)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        {/* Crown */}
        <div style={{ position: "absolute", right: -5, top: "30%", width: 5, height: 14, borderRadius: 3, background: "#555" }} />
        {/* Side button */}
        <div style={{ position: "absolute", right: -5, top: "50%", width: 5, height: 10, borderRadius: 3, background: "#444" }} />
        <div style={{
          position: "absolute", left: bezel, top: bezel,
          width: w, height: h,
          borderRadius: radius - 6,
          overflow: "hidden", background: "#000",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function LaptopFrame({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const bezel = 10;
  const screenRadius = 10;
  const lidW = w + bezel * 2;
  const lidH = h + bezel * 2 + 6;
  const baseW = lidW + 40;
  const baseH = 28;
  const totalW = baseW;
  const totalH = lidH + baseH;

  return (
    <div style={{ width: totalW, height: totalH, position: "relative" }}>
      {/* Screen lid */}
      <div style={{
        width: lidW, height: lidH,
        borderRadius: "12px 12px 0 0",
        background: "linear-gradient(145deg, #1a1a2e, #0f0f1a)",
        boxShadow: "0 -5px 30px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "none",
        position: "relative",
      }}>
        {/* Camera */}
        <div style={{ position: "absolute", left: "50%", top: 4, transform: "translateX(-50%)", width: 5, height: 5, borderRadius: "50%", background: "#222" }} />
        <div style={{
          position: "absolute", left: bezel, top: bezel,
          width: w, height: h,
          borderRadius: screenRadius,
          overflow: "hidden", background: "#fff",
        }}>
          {children}
        </div>
        {/* Brand text */}
        <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", fontSize: 7, color: "#555", letterSpacing: 2, fontWeight: 500 }}>DEVKIT</div>
      </div>
      {/* Hinge */}
      <div style={{
        width: lidW, height: 3,
        background: "linear-gradient(90deg, #333, #555, #333)",
      }} />
      {/* Base */}
      <div style={{
        width: baseW, height: baseH,
        marginLeft: -(baseW - lidW) / 2,
        borderRadius: "0 0 12px 12px",
        background: "linear-gradient(180deg, #2a2a3e, #1f1f30)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        position: "relative",
      }}>
        {/* Trackpad cutout */}
        <div style={{
          position: "absolute", left: "50%", top: 4,
          transform: "translateX(-50%)",
          width: Math.min(lidW * 0.4, 120), height: 3,
          borderRadius: 2, background: "rgba(255,255,255,0.06)",
        }} />
        {/* Keyboard dots */}
        <div style={{ position: "absolute", left: "15%", top: 8, right: "15%", display: "flex", gap: 3, justifyContent: "center", flexWrap: "wrap" }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{ width: 4, height: 3, borderRadius: 1, background: "rgba(255,255,255,0.08)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DesktopFrame({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const bezel = 10;
  const monitorW = w + bezel * 2;
  const monitorH = h + bezel * 2 + 8;
  const totalW = monitorW + 40;
  const totalH = monitorH + 50;

  return (
    <div style={{ width: totalW, height: totalH, position: "relative" }}>
      {/* Monitor */}
      <div style={{
        width: monitorW, height: monitorH,
        borderRadius: 12,
        background: "linear-gradient(145deg, #1a1a2e, #0f0f1a)",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        position: "relative",
      }}>
        {/* Camera */}
        <div style={{ position: "absolute", left: "50%", top: 4, transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#222" }} />
        <div style={{
          position: "absolute", left: bezel, top: bezel + 4,
          width: w, height: h,
          borderRadius: 6,
          overflow: "hidden", background: "#fff",
        }}>
          {children}
        </div>
        {/* Brand */}
        <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", fontSize: 7, color: "#555", letterSpacing: 2, fontWeight: 500 }}>DEVKIT</div>
      </div>
      {/* Stand neck */}
      <div style={{
        position: "absolute", bottom: 18, left: "50%",
        transform: "translateX(-50%)",
        width: 20, height: 22,
        background: "linear-gradient(180deg, #444, #333)",
        borderRadius: "0 0 4px 4px",
      }} />
      {/* Stand base */}
      <div style={{
        position: "absolute", bottom: 0, left: "50%",
        transform: "translateX(-50%)",
        width: 80, height: 8,
        borderRadius: 4,
        background: "linear-gradient(180deg, #555, #3a3a3a)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }} />
    </div>
  );
}

function FoldFrame({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const halfW = w / 2;
  const bezel = 8;
  const gap = 6;
  const totalW = w + bezel * 2 + gap + 4;
  const totalH = h + bezel * 2;

  return (
    <div style={{ width: totalW, height: totalH, position: "relative" }}>
      <div style={{
        display: "flex", gap: gap,
        width: totalW, height: totalH,
        borderRadius: 16,
        background: "linear-gradient(145deg, #1a1a2e, #0f0f1a)",
        boxShadow: "0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: bezel,
      }}>
        {/* Left panel (blank) */}
        <div style={{ width: halfW, height: h, borderRadius: 10, overflow: "hidden", background: "#f0f0f0" }} />
        {/* Hinge */}
        <div style={{ width: gap, background: "linear-gradient(180deg, #444, #333)", borderRadius: 2 }} />
        {/* Right panel (live) */}
        <div style={{ width: halfW, height: h, borderRadius: 10, overflow: "hidden", background: "#fff" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */

export default function DeviceSimulator({ tool }: { tool: Tool }) {
  const [url, setUrl] = useState("https://devkit.dakshraman.in");
  const [activeDevice, setActiveDevice] = useState<Device>(DEVICES[0]);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [history, setHistory] = useState(["https://devkit.dakshraman.in"]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigate = (targetUrl: string) => {
    const full = targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`;
    setUrl(full);
    const next = [...history.slice(0, historyIdx + 1), full];
    setHistory(next);
    setHistoryIdx(next.length - 1);
  };

  const goBack = () => { if (historyIdx > 0) { const i = historyIdx - 1; setHistoryIdx(i); setUrl(history[i]); } };
  const goForward = () => { if (historyIdx < history.length - 1) { const i = historyIdx + 1; setHistoryIdx(i); setUrl(history[i]); } };

  const isLandscape = orientation === "landscape";
  const screenW = isLandscape ? activeDevice.height : activeDevice.width;
  const screenH = isLandscape ? activeDevice.width : activeDevice.height;

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

  const frameProps = { w: screenW, h: screenH };

  const renderFrame = () => {
    switch (activeDevice.frame) {
      case "phone":   return <PhoneFrame {...frameProps}>{iframe}</PhoneFrame>;
      case "tablet":  return <TabletFrame {...frameProps}>{iframe}</TabletFrame>;
      case "watch":   return <WatchFrame {...frameProps}>{iframe}</WatchFrame>;
      case "laptop":  return <LaptopFrame {...frameProps}>{iframe}</LaptopFrame>;
      case "desktop": return <DesktopFrame {...frameProps}>{iframe}</DesktopFrame>;
      case "fold":    return <FoldFrame {...frameProps}>{iframe}</FoldFrame>;
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
              <Button variant="ghost" size="icon" className="size-8" onClick={goBack} disabled={historyIdx === 0}>
                <Icon icon="lucide:chevron-left" className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8" onClick={goForward} disabled={historyIdx >= history.length - 1}>
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

          {/* Device chips by category */}
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat} className="flex items-start gap-2">
                <span className="mt-1 w-16 shrink-0 text-[10px] font-medium uppercase text-muted-foreground">{cat}</span>
                <div className="flex flex-wrap gap-1">
                  {DEVICES.filter((d) => d.category === cat).map((d) => (
                    <button
                      key={d.name}
                      onClick={() => setActiveDevice(d)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                        activeDevice.name === d.name
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

          {/* Orientation toggle */}
          {activeDevice.frame !== "watch" && activeDevice.frame !== "fold" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Orientation:</span>
              <div className="flex rounded-lg border border-border bg-background p-0.5">
                {(["portrait", "landscape"] as const).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrientation(o)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      orientation === o ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {o === "portrait" ? "Portrait" : "Landscape"}
                  </button>
                ))}
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">{screenW} × {screenH}</span>
            </div>
          )}

          {/* Frame viewport */}
          <div
            className="mx-auto flex items-center justify-center overflow-auto rounded-3xl border border-border p-6"
            style={{
              background: "radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a14 100%)",
              minHeight: 400,
            }}
          >
            {renderFrame()}
          </div>

          {/* Device info */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background/50 px-4 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{activeDevice.name}</span>
            <span>·</span>
            <span>{activeDevice.category}</span>
            <span>·</span>
            <span>{screenW}×{screenH}px viewport</span>
            <span>·</span>
            <span>{activeDevice.frame} frame</span>
          </div>
        </div>
      </Panel>
    </Shell>
  );
}
