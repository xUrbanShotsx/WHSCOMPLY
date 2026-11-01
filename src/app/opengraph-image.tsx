import { ImageResponse } from "next/og";

export const alt = "WHSCOMPLY, WHS compliance software for builders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#ffffff",
        padding: 72,
        color: "#1c2230",
      }}
    >
      <div style={{ fontSize: 44, fontWeight: 800, color: "#ff804a" }}>
        WHSCOMPLY
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.02 }}>
          Every worker on site, cleared before they pick up a tool.
        </div>
        <div style={{ marginTop: 28, fontSize: 34, color: "#5a6270" }}>
          WHS compliance software for Australian builders
        </div>
      </div>
      <div style={{ height: 16, width: 220, background: "#ff804a" }} />
    </div>,
    size,
  );
}
