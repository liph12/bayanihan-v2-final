// Articles hub / index page served at /articles. A crawlable landing page
// that links to every article, grouped by category. Acts as the canonical
// internal hub for the article cluster (the footer category headers point
// here), so search engines have one authoritative page that links to all
// of them. Fully static — no data fetching, all content from src/lib/articles.

import type { Metadata } from "next";
import NextLink from "next/link";
import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import {
  ARTICLE_CATEGORIES,
  articleUrl,
  getArticlesByCategory,
} from "@/lib/articles";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bayanihan.com"
).replace(/\/$/, "");

const FONT_HEAD = "var(--font-urbanist), 'Outfit', sans-serif";
const FONT_BODY = "var(--font-outfit), 'Outfit', sans-serif";
const ACCENT = "#c2410c";
const ACCENT_GRADIENT =
  "linear-gradient(135deg, #c2410c 0%, #F77F00 50%, #FBA833 100%)";

const PAGE_TITLE = "Articles & Insights — Filipino Culture, Travel & Community";
const PAGE_DESCRIPTION =
  "Explore Bayanihan articles on Filipino culture, community, travel, and overseas life — stories and insights on heritage, festivals, tourism, and the global Filipino diaspora.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/articles" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/articles",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

export default function ArticlesIndexPage() {
  // CollectionPage + ItemList JSON-LD listing every article so crawlers see
  // the full cluster from this single hub. Spec: https://schema.org/ItemList
  const allArticles = ARTICLE_CATEGORIES.flatMap((c) =>
    getArticlesByCategory(c.key)
  );
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/articles`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: allArticles.length,
      itemListElement: allArticles.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}${articleUrl(a.slug)}`,
        name: a.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <Box
        component="main"
        sx={{ bgcolor: "#fffdf6", minHeight: "100vh", pb: { xs: 6, md: 10 } }}
      >
        {/* ── HERO ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            background:
              "radial-gradient(900px 500px at -10% 0%, rgba(247,127,0,0.10), transparent 60%), radial-gradient(900px 500px at 110% 0%, rgba(251,168,51,0.10), transparent 60%), #fff",
            borderBottom: "1px solid #fde2b3",
            py: { xs: 5, md: 7 },
            px: { xs: 2, md: 4 },
          }}
        >
          <Box sx={{ maxWidth: 1100, mx: "auto", textAlign: "center" }}>
            <Typography
              component="h1"
              sx={{
                fontFamily: FONT_HEAD,
                fontWeight: 900,
                fontSize: { xs: 28, sm: 36, md: 46 },
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "#0f172a",
                mb: 1.5,
              }}
            >
              Articles &amp;{" "}
              <Box
                component="span"
                sx={{
                  background: ACCENT_GRADIENT,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Insights
              </Box>
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT_BODY,
                fontSize: { xs: 15, md: 17 },
                color: "#475569",
                maxWidth: 680,
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              Stories and ideas on Filipino culture, community, travel, and life
              abroad — celebrating the heritage and connections that bring
              people together across the world.
            </Typography>
          </Box>
        </Box>

        {/* ── CATEGORY SECTIONS ────────────────────────────────────── */}
        <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 4 }, pt: { xs: 4, md: 6 } }}>
          {ARTICLE_CATEGORIES.map((category) => {
            const articles = getArticlesByCategory(category.key);
            return (
              <Box
                key={category.key}
                component="section"
                sx={{ mb: { xs: 5, md: 7 } }}
              >
                <Typography
                  component="h2"
                  sx={{
                    fontFamily: FONT_HEAD,
                    fontWeight: 900,
                    fontSize: { xs: 22, md: 28 },
                    color: "#0f172a",
                    mb: 0.5,
                  }}
                >
                  {category.title}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FONT_BODY,
                    fontSize: { xs: 14, md: 15 },
                    color: "#64748b",
                    mb: 2.5,
                    maxWidth: 720,
                    lineHeight: 1.55,
                  }}
                >
                  {category.blurb}
                </Typography>

                <Grid container spacing={{ xs: 1.5, md: 2 }}>
                  {articles.map((a) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={a.slug}>
                      <NextLink
                        href={articleUrl(a.slug)}
                        style={{
                          textDecoration: "none",
                          display: "block",
                          height: "100%",
                        }}
                      >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          p: { xs: 2, md: 2.25 },
                          borderRadius: 2.5,
                          bgcolor: "#fff",
                          border: "1px solid #f1e3c8",
                          transition: "all .25s ease",
                          "&:hover": {
                            borderColor: "#fbbf24",
                            boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
                            transform: "translateY(-2px)",
                            "& .ai-title": { color: ACCENT },
                            "& .ai-arrow": { transform: "translateX(3px)" },
                          },
                        }}
                      >
                        <Typography
                          className="ai-title"
                          sx={{
                            fontFamily: FONT_HEAD,
                            fontWeight: 800,
                            fontSize: 16,
                            lineHeight: 1.3,
                            color: "#0f172a",
                            mb: 1,
                            transition: "color .2s ease",
                          }}
                        >
                          {a.title}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: FONT_BODY,
                            fontSize: 13.5,
                            lineHeight: 1.55,
                            color: "#64748b",
                            mb: 1.5,
                            flex: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {a.description}
                        </Typography>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.25,
                            fontFamily: FONT_HEAD,
                            fontSize: 13,
                            fontWeight: 800,
                            color: ACCENT,
                          }}
                        >
                          Read article
                          <ChevronRightRoundedIcon
                            className="ai-arrow"
                            sx={{ fontSize: 16, transition: "transform .2s ease" }}
                          />
                        </Box>
                      </Box>
                      </NextLink>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })}
        </Box>
      </Box>
    </>
  );
}
