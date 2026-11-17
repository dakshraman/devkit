import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "DevKit — Local-First Developer Toolkit with 54+ Client-Side Utilities";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
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
          backgroundColor: "#09090b",
          color: "#ededef",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "48px 64px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: "1px solid #232329",
            borderRadius: 24,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 18,
              border: "1px solid #3f3f46",
              backgroundColor: "#18181b",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 800,
              fontFamily: "monospace",
            }}
          >
            DK
          </div>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              letterSpacing: -1.5,
              color: "#ffffff",
            }}
          >
            DevKit
          </div>
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: -0.5,
            color: "#e4e4e7",
            textAlign: "center",
            maxWidth: 960,
          }}
        >
          Developer Utilities That Never Leave Your Browser
        </div>

        <div
          style={{
            marginTop: 16,
            fontSize: 22,
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: 820,
          }}
        >
          54 Tools • 100% In-Memory Execution • Zero Server Egress • PWA Ready
        </div>

        <div
          style={{
            marginTop: 38,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 9999,
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              color: "#10b981",
              fontSize: 16,
              fontWeight: 600,
              fontFamily: "monospace",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ● 0 B Network Egress
          </div>
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 9999,
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              color: "#d4d4d8",
              fontSize: 16,
              fontFamily: "monospace",
            }}
          >
            devkit.dakshraman.in
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
