import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "DevKit — all-in-one developer toolkit that runs in your browser";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 45%,#4c1d95 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 26,
              background: "linear-gradient(135deg,#818cf8,#a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
              fontWeight: 800,
            }}
          >
            D
          </div>
          <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2 }}>DevKit</div>
        </div>
        <div style={{ marginTop: 30, fontSize: 34, color: "#c7d2fe" }}>
          All-in-one developer toolkit — 38+ tools, 100% local
        </div>
        <div style={{ marginTop: 42, fontSize: 24, color: "#a5b4fc" }}>devkit.dakshraman.in</div>
      </div>
    ),
    { ...size }
  );
}