import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
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
    ),
    { ...size }
  );
}
