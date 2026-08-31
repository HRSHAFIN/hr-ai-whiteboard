import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "70%",
            height: "70%",
            borderRadius: "50%",
            overflow: "hidden",
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          <div style={{ width: "50%", height: "50%", background: "#2563eb" }} />
          <div style={{ width: "50%", height: "50%", background: "#16a34a" }} />
          <div style={{ width: "50%", height: "50%", background: "#ec4899" }} />
          <div style={{ width: "50%", height: "50%", background: "#f59e0b" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
