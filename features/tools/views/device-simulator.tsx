"use client";

import { useState, useRef, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";
import { DeviceFrame } from "react-device-bezels";
import "react-device-bezels/styles.css";

/* ── Device catalog ─────────────────────────────────────────────── */

interface Device {
  name: string;
  preset: string;
  category: string;
  color: string;
}

const DEVICES: Device[] = [
  // iPhones
  { name: "iPhone 16 Pro Max", preset: "iphone-16-pro-max", category: "iPhones", color: "natural" },
  { name: "iPhone 16 Pro", preset: "iphone-16-pro", category: "iPhones", color: "natural" },
  { name: "iPhone 16 Plus", preset: "iphone-16-plus", category: "iPhones", color: "blue" },
  { name: "iPhone 16", preset: "iphone-16", category: "iPhones", color: "blue" },
  { name: "iPhone 15 Pro Max", preset: "iphone-15-pro-max", category: "iPhones", color: "natural" },
  { name: "iPhone 15 Pro", preset: "iphone-15-pro", category: "iPhones", color: "natural" },
  { name: "iPhone 15", preset: "iphone-15", category: "iPhones", color: "blue" },
  { name: "iPhone 14 Pro Max", preset: "iphone-14-pro-max", category: "iPhones", color: "black" },
  { name: "iPhone 14 Pro", preset: "iphone-14-pro", category: "iPhones", color: "black" },
  { name: "iPhone 14", preset: "iphone-14", category: "iPhones", color: "black" },
  { name: "iPhone SE", preset: "iphone-se", category: "iPhones", color: "black" },
  { name: "iPhone X", preset: "iphone-x", category: "iPhones", color: "black" },

  // iPads
  { name: "iPad Pro 13\"", preset: "ipad-pro-13", category: "iPads", color: "black" },
  { name: "iPad Pro 11\"", preset: "ipad-pro-11", category: "iPads", color: "black" },
  { name: "iPad Air 13\"", preset: "ipad-air-13", category: "iPads", color: "blue" },
  { name: "iPad Air 11\"", preset: "ipad-air-11", category: "iPads", color: "blue" },
  { name: "iPad 10", preset: "ipad-10", category: "iPads", color: "blue" },
  { name: "iPad Mini", preset: "ipad-mini", category: "iPads", color: "black" },

  // Pixel
  { name: "Pixel 9 Pro XL", preset: "pixel-9-pro-xl", category: "Pixel", color: "black" },
  { name: "Pixel 9 Pro", preset: "pixel-9-pro", category: "Pixel", color: "black" },
  { name: "Pixel 9", preset: "pixel-9", category: "Pixel", color: "black" },
  { name: "Pixel 8 Pro", preset: "pixel-8-pro", category: "Pixel", color: "black" },
  { name: "Pixel 8", preset: "pixel-8", category: "Pixel", color: "black" },
  { name: "Pixel 7", preset: "pixel-7", category: "Pixel", color: "black" },

  // Samsung Galaxy
  { name: "Galaxy S25 Ultra", preset: "galaxy-s25-ultra", category: "Galaxy", color: "black" },
  { name: "Galaxy S25", preset: "galaxy-s25", category: "Galaxy", color: "black" },
  { name: "Galaxy S24 Ultra", preset: "galaxy-s24-ultra", category: "Galaxy", color: "black" },
  { name: "Galaxy S24", preset: "galaxy-s24", category: "Galaxy", color: "black" },
  { name: "Galaxy S23", preset: "galaxy-s23", category: "Galaxy", color: "black" },

  // Foldables
  { name: "Galaxy Z Fold 6", preset: "galaxy-z-fold-6", category: "Foldables", color: "black" },
  { name: "Galaxy Z Flip 6", preset: "galaxy-z-flip-6", category: "Foldables", color: "black" },
  { name: "Pixel 9 Pro Fold", preset: "pixel-9-pro-fold", category: "Foldables", color: "black" },
  { name: "OnePlus Open", preset: "oneplus-open", category: "Foldables", color: "black" },

  // Tablets (Android)
  { name: "Galaxy Tab S10 Ultra", preset: "galaxy-tab-s10-ultra", category: "Tablets", color: "black" },
  { name: "Pixel Tablet", preset: "pixel-tablet", category: "Tablets", color: "black" },

  // Others
  { name: "OnePlus 13", preset: "oneplus-13", category: "Others", color: "black" },
  { name: "Xiaomi 15", preset: "xiaomi-15", category: "Others", color: "black" },
];

/* ── Custom frames for laptop/desktop/watch ──────────────────────── */

function LaptopFrame({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const bezel = 8;
  const lidW = w + bezel * 2;
  const lidH = h + bezel * 2 + 4;
  const baseH = Math.max(14, Math.round(lidH * 0.055));
  const totalW = lidW + 24;
  const totalH = lidH + baseH;

  return (
    <div style={{ width: totalW, height: totalH, position: "relative", flexShrink: 0 }}>
      <div style={{
        width: lidW, height: lidH, borderRadius: "10px 10px 0 0",
        background: "linear-gradient(160deg, #2c2c2e 0%, #1c1c1e 100%)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
        position: "relative",
      }}>
        <div style={{ position: "absolute", left: "50%", top: 3, transform: "translateX(-50%)", width: 5, height: 5, borderRadius: "50%", background: "#222", border: "1px solid #333" }} />
        <div style={{ position: "absolute", left: bezel, top: bezel, width: w, height: h, borderRadius: 6, overflow: "hidden", background: "#fff" }}>{children}</div>
        <div style={{ position: "absolute", bottom: 1, left: "50%", transform: "translateX(-50%)", fontSize: 6, color: "#555", letterSpacing: 2, fontWeight: 600 }}>DEVKIT</div>
      </div>
      <div style={{ width: lidW, height: 2, background: "linear-gradient(90deg, #333, #555, #333)" }} />
      <div style={{
        width: totalW, height: baseH, borderRadius: "0 0 10px 10px",
        background: "linear-gradient(180deg, #333 0%, #252525 100%)",
        boxShadow: "0 8px 25px rgba(0,0,0,0.5)", position: "relative",
      }}>
        <div style={{ position: "absolute", left: "50%", top: 3, transform: "translateX(-50%)", width: Math.round(lidW * 0.3), height: 2, borderRadius: 1, background: "rgba(255,255,255,0.05)" }} />
      </div>
    </div>
  );
}

function DesktopFrame({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const bezel = 8;
  const monitorW = w + bezel * 2;
  const monitorH = h + bezel * 2 + 6;
  const neckW = Math.max(12, Math.round(monitorW * 0.025));
  const neckH = Math.max(12, Math.round(monitorH * 0.05));
  const baseW = Math.max(36, Math.round(monitorW * 0.18));
  const totalW = monitorW + 16;
  const totalH = monitorH + neckH + 6;

  return (
    <div style={{ width: totalW, height: totalH, position: "relative", flexShrink: 0 }}>
      <div style={{
        width: monitorW, height: monitorH, borderRadius: 8,
        background: "linear-gradient(160deg, #2c2c2e 0%, #1c1c1e 100%)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        position: "relative",
      }}>
        <div style={{ position: "absolute", left: "50%", top: 3, transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#333" }} />
        <div style={{ position: "absolute", left: bezel, top: bezel + 3, width: w, height: h, borderRadius: 4, overflow: "hidden", background: "#fff" }}>{children}</div>
        <div style={{ position: "absolute", bottom: 1, left: "50%", transform: "translateX(-50%)", fontSize: 5, color: "#555", letterSpacing: 1, fontWeight: 600 }}>DEVKIT</div>
      </div>
      <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", width: neckW, height: neckH, background: "linear-gradient(180deg, #444, #333)", borderRadius: "0 0 3px 3px" }} />
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: baseW, height: 5, borderRadius: 3, background: "linear-gradient(180deg, #555, #3a3a3a)" }} />
    </div>
  );
}

function WatchFrame({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const bezel = 6;
  const r = Math.round(w * 0.3);
  const bodyW = w + bezel * 2;
  const bodyH = h + bezel * 2;
  const bandW = Math.round(w * 0.5);
  const totalW = bodyW + 6;
  const totalH = bodyH + 24;

  return (
    <div style={{ width: totalW, height: totalH, position: "relative", flexShrink: 0 }}>
      <div style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)", width: bandW, height: 12, background: "#555", borderRadius: "5px 5px 0 0" }} />
      <div style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", width: bandW, height: 12, background: "#555", borderRadius: "0 0 5px 5px" }} />
      <div style={{
        position: "absolute", left: 3, top: 12, width: bodyW, height: bodyH, borderRadius: r,
        background: "linear-gradient(160deg, #333 0%, #1a1a1a 100%)",
        boxShadow: "0 15px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
      }}>
        <div style={{ position: "absolute", right: -3, top: "32%", width: 3, height: 8, borderRadius: 2, background: "#666" }} />
        <div style={{ position: "absolute", right: -3, top: "50%", width: 3, height: 6, borderRadius: 2, background: "#555" }} />
        <div style={{ position: "absolute", left: bezel, top: bezel, width: w, height: h, borderRadius: r - 4, overflow: "hidden", background: "#000" }}>{children}</div>
      </div>
    </div>
  );
}

const CUSTOM_DEVICES: Device[] = [
  { name: "MacBook Air", preset: "macbook-air", category: "Laptops", color: "" },
  { name: "MacBook Pro 14\"", preset: "macbook-pro-14", category: "Laptops", color: "" },
  { name: "MacBook Pro 16\"", preset: "macbook-pro-16", category: "Laptops", color: "" },
  { name: "ThinkPad X1", preset: "thinkpad-x1", category: "Laptops", color: "" },
  { name: "Windows 1080p", preset: "windows-1080p", category: "Desktops", color: "" },
  { name: "iMac 24\"", preset: "imac-24", category: "Desktops", color: "" },
  { name: "Apple Watch Ultra", preset: "apple-watch-ultra", category: "Watches", color: "" },
  { name: "Apple Watch S10", preset: "apple-watch-s10", category: "Watches", color: "" },
];

const CUSTOM_DIMS: Record<string, { w: number; h: number }> = {
  "macbook-air": { w: 1280, h: 800 },
  "macbook-pro-14": { w: 1512, h: 982 },
  "macbook-pro-16": { w: 1728, h: 1117 },
  "thinkpad-x1": { w: 1920, h: 1200 },
  "windows-1080p": { w: 1920, h: 1080 },
  "imac-24": { w: 2048, h: 1152 },
  "apple-watch-ultra": { w: 410, h: 502 },
  "apple-watch-s10": { w: 368, h: 448 },
};

const ALL_DEVICES = [...DEVICES, ...CUSTOM_DEVICES];

/* ── Main Component ─────────────────────────────────────────────── */

export default function DeviceSimulator({ tool }: { tool: Tool }) {
  const [url, setUrl] = useState("https://devkit.dakshraman.in");
  const [active, setActive] = useState<Device>(DEVICES[0]);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [zoom, setZoom] = useState(0.75);
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

  const isLandscape = orientation === "landscape";
  const isCustom = ALL_DEVICES.find((d) => d.preset === active.preset && !DEVICES.some((ld) => ld.preset === active.preset));
  const dims = isCustom ? CUSTOM_DIMS[active.preset] : null;
  const vpW = dims ? dims.w : (isLandscape ? 0 : 0);
  const vpH = dims ? dims.h : (isLandscape ? 0 : 0);

  const categories = useMemo(() => {
    const cats = new Map<string, Device[]>();
    for (const d of ALL_DEVICES) {
      if (!cats.has(d.category)) cats.set(d.category, []);
      cats.get(d.category)!.push(d);
    }
    return cats;
  }, []);

  const showOrientation = active.category === "iPhones" || active.category === "Galaxy" || active.category === "Pixel" || active.category === "Others";

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

  const renderFrame = () => {
    // Custom CSS frames for laptops/desktops/watches
    if (active.category === "Laptops" && dims) {
      return <LaptopFrame w={dims.w} h={dims.h}>{iframe}</LaptopFrame>;
    }
    if (active.category === "Desktops" && dims) {
      return <DesktopFrame w={dims.w} h={dims.h}>{iframe}</DesktopFrame>;
    }
    if (active.category === "Watches" && dims) {
      return <WatchFrame w={dims.w} h={dims.h}>{iframe}</WatchFrame>;
    }
    // react-device-bezels for phones, tablets, foldables
    return (
      <DeviceFrame
        device={active.preset as never}
        color={active.color || undefined}
        orientation={isLandscape ? "landscape" : "portrait"}
        zoom={zoom}
      >
        {iframe}
      </DeviceFrame>
    );
  };

  return (
    <Shell tool={tool}>
      <Panel title="Device Simulator" description="Preview websites in real device frames — phones, tablets, foldables, laptops and desktops.">
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
            {Array.from(categories.entries()).map(([cat, devices]) => (
              <div key={cat} className="flex items-start gap-2">
                <span className="mt-1 w-20 shrink-0 text-[10px] font-medium uppercase text-muted-foreground">{cat}</span>
                <div className="flex flex-wrap gap-1">
                  {devices.map((d) => (
                    <button
                      key={d.preset}
                      onClick={() => { setActive(d); setOrientation("portrait"); }}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                        active.preset === d.preset
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
          <div className="flex flex-wrap items-center gap-3">
            {showOrientation && (
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
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Zoom:</span>
              <input
                type="range"
                min={0.3}
                max={1.2}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-24 accent-primary"
              />
              <span className="text-xs tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
            </div>
          </div>

          {/* Frame viewport */}
          <div
            className="mx-auto flex items-center justify-center overflow-auto rounded-3xl p-6"
            style={{
              background: "radial-gradient(ellipse at 50% 40%, #1e1e32 0%, #0c0c18 100%)",
              minHeight: 500,
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
            <span>{active.preset}</span>
          </div>
        </div>
      </Panel>
    </Shell>
  );
}
