// Generated favicon. Next.js auto-discovers this file and emits the
// matching <link rel="icon" href="/icon"> tag in every page's <head>.
// Renders at build time via the ImageResponse API — no Photoshop needed.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 900,
          color: "#fff",
          background:
            "linear-gradient(135deg, #FFD166 0%, #FBA833 50%, #F77F00 100%)",
          fontFamily: "sans-serif",
          letterSpacing: -1,
        }}
      >
        B
      </div>
    ),
    { ...size }
  );
}
