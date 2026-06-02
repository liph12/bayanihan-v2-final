import { ImageResponse } from "next/og";

// This file is picked up automatically by Next.js as the default Open Graph
// image for every route, unless a route exports its own `opengraph-image`
// file. It renders the image at build/request time using JSX — no Photoshop
// or design pipeline required, and it always reflects the current brand.

export const runtime = "edge";
export const alt =
  "Bayanihan.com — Discover Filipino Events & Restaurants Worldwide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          // Brand gradient — warm Filipino flag-inspired sunrise.
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative orbs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(247,127,0,0.55) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.45) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top row: eyebrow pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "12px 24px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.22)",
            color: "#FFD166",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            alignSelf: "flex-start",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #FFD166, #FBA833 50%, #F77F00)",
              display: "flex",
            }}
          />
          For Filipinos worldwide
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "#fff",
            lineHeight: 1.05,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: -2,
              display: "flex",
              flexWrap: "wrap",
              gap: 18,
            }}
          >
            <span>Filipino events &amp;</span>
            <span>restaurants,</span>
            <span
              style={{
                background:
                  "linear-gradient(135deg, #FFD166 0%, #FBA833 50%, #F77F00 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              worldwide.
            </span>
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 30,
              color: "rgba(255,255,255,0.75)",
              maxWidth: 900,
              display: "flex",
            }}
          >
            One platform connecting Filipinos across every continent — events,
            festivals, food.
          </div>
        </div>

        {/* Bottom row: brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: -1,
              display: "flex",
            }}
          >
            Bayanihan.com
          </div>
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.6)",
              fontWeight: 600,
              letterSpacing: 1,
              display: "flex",
            }}
          >
            bayanihan.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
