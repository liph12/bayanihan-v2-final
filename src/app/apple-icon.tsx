// Apple touch icon (180×180). Used when a user adds the site to their iOS
// home screen. Next.js auto-discovers this file and emits the matching
// <link rel="apple-touch-icon"> tag in every page's <head>.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 120,
          fontWeight: 900,
          color: "#fff",
          background:
            "linear-gradient(135deg, #FFD166 0%, #FBA833 50%, #F77F00 100%)",
          fontFamily: "sans-serif",
          letterSpacing: -4,
          // iOS rounds the corners automatically, but a subtle inner
          // highlight gives it a more polished look at smaller sizes too.
          boxShadow: "inset 0 6px 24px rgba(255,255,255,0.18)",
        }}
      >
        B
      </div>
    ),
    { ...size }
  );
}
