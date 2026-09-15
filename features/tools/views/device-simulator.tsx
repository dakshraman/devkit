"use client";

import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

interface Device {
  name: string;
  category: string;
  width: number;
  height: number;
  scale: number;
  frame: "phone" | "tablet" | "laptop" | "desktop" | "watch" | "fold";
  icon: string;
}

const DEVICES: Device[] = [
  // Phones
  { name: "iPhone 16 Pro", category: "Phones", width: 393, height: 852, scale: 0.55, frame: "phone", icon: "logos:apple" },
  { name: "iPhone 16 Pro Max", category: "Phones", width: 440, height: 932, scale: 0.5, frame: "phone", icon: "logos:apple" },
  { name: "iPhone SE", category: "Phones", width: 375, height: 667, scale: 0.6, frame: "phone", icon: "logos:apple" },
  { name: "Samsung Galaxy S24", category: "Phones", width: 360, height: 780, scale: 0.58, frame: "phone", icon: "logos:samsung" },
  { name: "Google Pixel 8", category: "Phones", width: 412, height: 915, scale: 0.52, frame: "phone", icon: "logos:google" },

  // Tablets
  { name: "iPad Mini", category: "Tablets", width: 768, height: 1024, scale: 0.55, frame: "tablet", icon: "logos:apple" },
  { name: "iPad Air", category: "Tablets", width: 820, height: 1180, scale: 0.5, frame: "tablet", icon: "logos:apple" },
  { name: "iPad Pro 12.9\"", category: "Tablets", width: 1024, height: 1366, scale: 0.45, frame: "tablet", icon: "logos:apple" },
  { name: "Samsung Galaxy Tab S9", category: "Tablets", width: 800, height: 1280, scale: 0.5, frame: "tablet", icon: "logos:samsung" },

  // Foldables
  { name: "Galaxy Z Fold (Inner)", category: "Foldables", width: 930, height: 2316, scale: 0.35, frame: "fold", icon: "logos:samsung" },
  { name: "Galaxy Z Fold (Outer)", category: "Foldables", width: 360, height: 780, scale: 0.58, frame: "phone", icon: "logos:samsung" },
  { name: "Pixel Fold (Inner)", category: "Foldables", width: 1048, height: 2208, scale: 0.33, frame: "fold", icon: "logos:google" },
  { name: "Samsung Z Flip (Outer)", category: "Foldables", width: 360, height: 720, scale: 0.6, frame: "phone", icon: "logos:samsung" },

  // Watches
  { name: "Apple Watch Ultra 2", category: "Watches", width: 410, height: 502, scale: 0.55, frame: "watch", icon: "logos:apple" },
  { name: "Apple Watch Series 10", category: "Watches", width: 368, height: 448, scale: 0.6, frame: "watch", icon: "logos:apple" },
  { name: "Samsung Galaxy Watch 6", category: "Watches", width: 432, height: 432, scale: 0.55, frame: "watch", icon: "logos:samsung" },

  // Laptops
  { name: "MacBook Air 13\"", category: "Laptops", width: 1280, height: 800, scale: 0.65, frame: "laptop", icon: "logos:apple" },
  { name: "MacBook Pro 14\"", category: "Laptops", width: 1512, height: 982, scale: 0.55, frame: "laptop", icon: "logos:apple" },
  { name: "MacBook Pro 16\"", category: "Laptops", width: 1728, height: 1117, scale: 0.5, frame: "laptop", icon: "logos:apple" },
  { name: "Dell XPS 15", category: "Laptops", width: 1504, height: 1000, scale: 0.55, frame: "laptop", icon: "mdi:laptop" },
  { name: "ThinkPad X1 Carbon", category: "Laptops", width: 1920, height: 1200, scale: 0.48, frame: "laptop", icon: "mdi:laptop" },

  // Desktops
  { name: "Windows Desktop (1080p)", category: "Desktops", width: 1920, height: 1080, scale: 0.45, frame: "desktop", icon: "logos:microsoft" },
  { name: "iMac 24\"", category: "Desktops", width: 2048, height: 1152, scale: 0.42, frame: "desktop", icon: "logos:apple" },
  { name: "4K Monitor", category: "Desktops", width: 3840, height: 2160, scale: 0.3, frame: "desktop", icon: "mdi:monitor" },
];

function PhoneFrame({ children, scale }: { children: React.ReactNode; scale: number }) {
  const frameW = 393 * scale + 24;
  const frameH = 852 * scale + 48;
  return (
    <div className="relative inline-block" style={{ width: frameW, height: frameH }}>
      <div
        className="absolute inset-0 rounded-[2.5rem] bg-zinc-900 shadow-2xl"
        style={{ border: "3px solid #27272a" }}
      >
        {/* Dynamic Island */}
        <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-black" style={{ width: 90 * scale, height: 22 * scale }} />
        {/* Screen */}
        <div className="absolute overflow-hidden rounded-[2rem] bg-white" style={{ left: 12, top: 36, width: frameW - 24, height: frameH - 48 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function TabletFrame({ children, scale, width, height }: { children: React.ReactNode; scale: number; width: number; height: number }) {
  const frameW = width * scale + 20;
  const frameH = height * scale + 20;
  return (
    <div className="relative inline-block" style={{ width: frameW, height: frameH }}>
      <div
        className="absolute inset-0 rounded-3xl bg-zinc-900 shadow-2xl"
        style={{ border: "3px solid #27272a" }}
      >
        {/* Camera */}
        <div className="absolute left-1/2 top-2 -translate-x-1/2 size-2 rounded-full bg-zinc-700" />
        {/* Screen */}
        <div className="absolute overflow-hidden rounded-2xl bg-white" style={{ left: 10, top: 10, width: frameW - 20, height: frameH - 20 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function WatchFrame({ children, scale, width, height }: { children: React.ReactNode; scale: number; width: number; height: number }) {
  const frameW = width * scale + 20;
  const frameH = height * scale + 40;
  return (
    <div className="relative inline-block" style={{ width: frameW, height: frameH }}>
      <div
        className="absolute inset-0 rounded-[2rem] bg-zinc-900 shadow-2xl"
        style={{ border: "3px solid #27272a" }}
      >
        {/* Crown button */}
        <div className="absolute -right-1.5 top-1/3 h-6 w-1.5 rounded-full bg-zinc-600" />
        {/* Side button */}
        <div className="absolute -right-1.5 top-1/2 h-4 w-1.5 rounded-full bg-zinc-600" />
        {/* Screen */}
        <div className="absolute overflow-hidden rounded-[1.5rem] bg-black" style={{ left: 10, top: 26, width: frameW - 20, height: frameH - 36 }}>
          {children}
        </div>
      </div>
      {/* Band top */}
      <div className="absolute left-1/2 -top-4 -translate-x-1/2 rounded-t-lg bg-zinc-700" style={{ width: frameW * 0.5, height: 16 }} />
      {/* Band bottom */}
      <div className="absolute left-1/2 -bottom-4 -translate-x-1/2 rounded-b-lg bg-zinc-700" style={{ width: frameW * 0.5, height: 16 }} />
    </div>
  );
}

function LaptopFrame({ children, scale, width, height }: { children: React.ReactNode; scale: number; width: number; height: number }) {
  const frameW = width * scale + 20;
  const frameH = height * scale + 20;
  return (
    <div className="relative inline-block" style={{ width: frameW + 40, height: frameH + 44 }}>
      {/* Screen lid */}
      <div
        className="absolute left-0 top-0 rounded-t-2xl bg-zinc-900 shadow-2xl"
        style={{ width: frameW + 20, height: frameH + 20, border: "3px solid #27272a", borderBottom: "none" }}
      >
        {/* Camera */}
        <div className="absolute left-1/2 top-1.5 -translate-x-1/2 size-1.5 rounded-full bg-zinc-700" />
        {/* Screen */}
        <div className="absolute overflow-hidden rounded-t-xl bg-white" style={{ left: 10, top: 10, width: frameW, height: frameH }}>
          {children}
        </div>
      </div>
      {/* Base / keyboard deck */}
      <div
        className="absolute bottom-0 left-0 rounded-b-2xl bg-zinc-800 shadow-2xl"
        style={{ width: frameW + 60, height: 40, left: -20, border: "3px solid #27272a", borderTop: "1px solid #3f3f46" }}
      >
        {/* Trackpad notch */}
        <div className="absolute left-1/2 top-1 -translate-x-1/2 h-1 w-16 rounded-b-lg bg-zinc-600" />
      </div>
    </div>
  );
}

function DesktopFrame({ children, scale, width, height }: { children: React.ReactNode; scale: number; width: number; height: number }) {
  const frameW = width * scale + 20;
  const frameH = height * scale + 20;
  return (
    <div className="relative inline-block" style={{ width: frameW + 40, height: frameH + 80 }}>
      {/* Monitor */}
      <div
        className="absolute left-0 top-0 rounded-xl bg-zinc-900 shadow-2xl"
        style={{ width: frameW + 20, height: frameH + 20, border: "3px solid #27272a" }}
      >
        {/* Camera */}
        <div className="absolute left-1/2 top-1.5 -translate-x-1/2 size-1.5 rounded-full bg-zinc-700" />
        {/* Bezel text */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-medium text-zinc-600">DEVKIT</div>
        {/* Screen */}
        <div className="absolute overflow-hidden rounded-lg bg-white" style={{ left: 10, top: 10, width: frameW, height: frameH }}>
          {children}
        </div>
      </div>
      {/* Stand neck */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-10 w-12 rounded-b-lg bg-zinc-700" />
      {/* Stand base */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-2.5 w-24 rounded-full bg-zinc-600" />
    </div>
  );
}

function FoldFrame({ children, scale, width, height }: { children: React.ReactNode; scale: number; width: number; height: number }) {
  const innerW = width * scale;
  const innerH = height * scale;
  const halfW = innerW / 2;
  const gap = 6;
  return (
    <div className="relative inline-block" style={{ width: innerW + 30, height: innerH + 20 }}>
      <div className="flex h-full gap-[2px] rounded-2xl bg-zinc-900 p-2 shadow-2xl" style={{ border: "3px solid #27272a" }}>
        {/* Left panel */}
        <div className="overflow-hidden rounded-l-xl bg-white" style={{ width: halfW, height: innerH }}>
          <iframe src="about:blank" className="pointer-events-none size-full border-0" title="fold-left" sandbox="" loading="lazy" />
        </div>
        {/* Hinge */}
        <div className="w-1 bg-zinc-700" />
        {/* Right panel */}
        <div className="overflow-hidden rounded-r-xl bg-white" style={{ width: halfW, height: innerH }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DeviceSimulator({ tool }: { tool: Tool }) {
  const [url, setUrl] = useState("https://devkit.dakshraman.in");
  const [activeDevice, setActiveDevice] = useState<Device>(DEVICES[0]);
  const [showUrlBar, setShowUrlBar] = useState(true);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [history, setHistory] = useState<string[]>(["https://devkit.dakshraman.in"]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigate = (targetUrl: string) => {
    const full = targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`;
    setUrl(full);
    const newHistory = [...history.slice(0, historyIdx + 1), full];
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
  };

  const goBack = () => { if (historyIdx > 0) { setHistoryIdx(historyIdx - 1); setUrl(history[historyIdx - 1]); } };
  const goForward = () => { if (historyIdx < history.length - 1) { setHistoryIdx(historyIdx + 1); setUrl(history[historyIdx + 1]); } };

  const isLandscape = orientation === "landscape";
  const screenW = isLandscape ? activeDevice.height : activeDevice.width;
  const screenH = isLandscape ? activeDevice.width : activeDevice.height;
  const displayW = screenW * activeDevice.scale;
  const displayH = screenH * activeDevice.scale;

  const categories = [...new Set(DEVICES.map((d) => d.category))];

  const renderFrame = () => {
    const iframe = (
      <iframe
        ref={iframeRef}
        src={url}
        className="size-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        loading="lazy"
        title="simulated website"
      />
    );

    const frameProps = { scale: activeDevice.scale, width: screenW, height: screenH };

    switch (activeDevice.frame) {
      case "phone": return <PhoneFrame scale={activeDevice.scale}>{iframe}</PhoneFrame>;
      case "tablet": return <TabletFrame {...frameProps}>{iframe}</TabletFrame>;
      case "watch": return <WatchFrame {...frameProps}>{iframe}</WatchFrame>;
      case "laptop": return <LaptopFrame {...frameProps}>{iframe}</LaptopFrame>;
      case "desktop": return <DesktopFrame {...frameProps}>{iframe}</DesktopFrame>;
      case "fold": return <FoldFrame {...frameProps}>{iframe}</FoldFrame>;
      default: return iframe;
    }
  };

  return (
    <Shell tool={tool}>
      <Panel title="Device Simulator" description="Preview websites in real device frames with accurate screen dimensions and bezels.">
        <div className="space-y-4">
          {/* URL bar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-8" onClick={goBack} disabled={historyIdx === 0}>
                <Icon icon="lucide:chevron-left" className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8" onClick={goForward} disabled={historyIdx >= history.length - 1}>
                <Icon icon="lucide:chevron-right" className="size-4" />
              </Button>
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5">
              <Icon icon="lucide:globe" className="size-4 text-muted-foreground" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && navigate(url)}
                className="flex-1 bg-transparent font-mono text-sm outline-none"
                placeholder="Enter URL..."
              />
            </div>
            <Button onClick={() => navigate(url)} size="sm">
              <Icon icon="lucide:rotate-cw" className="mr-1 size-3.5" />
              Go
            </Button>
          </div>

          {/* Device selector */}
          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => (
              <div key={cat} className="space-y-1.5">
                <div className="text-[10px] font-medium uppercase text-muted-foreground">{cat}</div>
                <div className="flex flex-wrap gap-1">
                  {DEVICES.filter((d) => d.category === cat).map((d) => (
                    <button
                      key={d.name}
                      onClick={() => setActiveDevice(d)}
                      className={`rounded-lg px-2 py-1 text-xs transition-colors ${
                        activeDevice.name === d.name
                          ? "bg-primary text-primary-foreground"
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
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {screenW} × {screenH}
            </span>
            {activeDevice.frame !== "watch" && activeDevice.frame !== "fold" && (
              <div className="flex rounded-lg border border-border">
                <button
                  onClick={() => setOrientation("portrait")}
                  className={`px-2 py-1 text-xs ${orientation === "portrait" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  <Icon icon="lucide:smartphone" className="mr-1 inline size-3" />
                  Portrait
                </button>
                <button
                  onClick={() => setOrientation("landscape")}
                  className={`px-2 py-1 text-xs ${orientation === "landscape" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  <Icon icon="lucide:monitor" className="mr-1 inline size-3" />
                  Landscape
                </button>
              </div>
            )}
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input type="checkbox" checked={showUrlBar} onChange={(e) => setShowUrlBar(e.target.checked)} className="rounded" />
              URL bar
            </label>
          </div>

          {/* Device frame */}
          <div className="flex justify-center overflow-auto rounded-2xl border border-border bg-zinc-950 p-8" style={{ minHeight: displayH + 120 }}>
            {renderFrame()}
          </div>

          {/* Device info */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>Device: {activeDevice.name}</span>
            <span>Category: {activeDevice.category}</span>
            <span>Viewport: {screenW}×{screenH}</span>
            <span>Display: {Math.round(displayW)}×{Math.round(displayH)}</span>
            <span>Scale: {(activeDevice.scale * 100).toFixed(0)}%</span>
          </div>
        </div>
      </Panel>
    </Shell>
  );
}
