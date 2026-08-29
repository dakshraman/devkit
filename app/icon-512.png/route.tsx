import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          borderRadius: 96,
          color: "#ffffff",
          fontSize: 256,
          fontWeight: 800,
        }}
      >
        D
      </div>
    ),
    { width: 512, height: 512 }
  );
}