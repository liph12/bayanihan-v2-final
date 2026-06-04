// Per-article Open Graph image. Renders the article's title onto the brand
// template at build/request time via ImageResponse. Next.js automatically
// emits the matching og:image meta tag pointing at this route, overriding
// the site-wide default in app/opengraph-image.tsx.

import { ImageResponse } from "next/og";
import { serverGet } from "@/lib/serverFetch";
import type { NewsArticle } from "@/types";

export const runtime = "edge";
export const alt = "Bayanihan News article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The single-article endpoint returns the article at the top level, not
// wrapped in { data } like the list endpoint. Support both shapes.
type DetailApiResponse = Partial<NewsArticle> & {
  data?: NewsArticle;
};

async function getArticleTitle(slug: string): Promise<{
  title: string;
  category?: string;
}> {
  try {
    const root = await serverGet<DetailApiResponse>(
      `news-articles-v2/${slug}`,
      { revalidate: 600 }
    );
    const a = root?.data ?? root;
    return {
      title: a?.title || "Bayanihan News",
      category: a?.category,
    };
  } catch {
    return { title: "Bayanihan News" };
  }
}

export default async function NewsArticleOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { title, category } = await getArticleTitle(slug);

  // Clamp the rendered title so it stays inside the safe area on cards
  // that crop edges (Slack, X, Discord all do this slightly differently).
  const safeTitle = title.length > 140 ? title.slice(0, 139) + "…" : title;

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
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative orbs (same brand as default OG) */}
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

        {/* Top — category eyebrow */}
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
          {category ? `News · ${category}` : "Bayanihan News"}
        </div>

        {/* Headline — the article title */}
        <div
          style={{
            display: "flex",
            color: "#fff",
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: -1.5,
            lineHeight: 1.1,
            maxWidth: 1040,
          }}
        >
          {safeTitle}
        </div>

        {/* Bottom — brand */}
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
            bayanihan.com/news
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
