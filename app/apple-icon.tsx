import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 40,
          color: "#ffffff",
          fontSize: 104,
          fontWeight: 800,
        }}
      >
        D
      </div>
    ),
    { ...size }
  );
}
