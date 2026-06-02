// Individual editorial / backlink article page served at /articles/<slug>.
//
// Fully static (SSG): generateStaticParams pre-renders one HTML file per
// article at build time, and dynamicParams = false makes any unknown slug
// 404 instead of attempting a runtime render. This is the most SEO-friendly
// setup — every page ships complete, crawlable HTML with its own <title>,
// meta description, canonical URL, OpenGraph/Twitter tags, and JSON-LD.
//
// Content lives in src/lib/articles.ts (the same module the footer reads),
// so the backlinks in the footer and the pages here can never drift apart.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NextLink from "next/link";
import { Box, Typography, Divider } from "@mui/material";
import Grid from "@mui/material/Grid2";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import {
  ARTICLES_PUBLISHED_ISO,
  articleUrl,
  getAllArticleSlugs,
  getArticleBySlug,
  getArticlesByCategory,
  getCategory,
  type Article,
} from "@/lib/articles";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bayanihan.com"
).replace(/\/$/, "");

const FONT_HEAD = "var(--font-urbanist), 'Outfit', sans-serif";
const FONT_BODY = "var(--font-outfit), 'Outfit', sans-serif";
const ACCENT = "#c2410c";
const ACCENT_GRADIENT =
  "linear-gradient(135deg, #c2410c 0%, #F77F00 50%, #FBA833 100%)";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Pre-render every article at build time.
export function generateStaticParams(): Array<{ slug: string }> {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

// Only the slugs above exist — anything else is a genuine 404.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };

  const category = getCategory(article.category);
  const canonical = articleUrl(slug);
  return {
    title: article.title,
    description: article.description,
    keywords: category?.keywords,
    alternates: { canonical },
    openGraph: {
      title: article.title,
      description: article.description,
      url: canonical,
      type: "article",
      publishedTime: ARTICLES_PUBLISHED_ISO,
      section: category?.title,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

// Internal links shown in the "Continue exploring" block. Tailored per
// category so each article interlinks with the most relevant site sections
// — good for users and for spreading crawl/link equity across the site.
const SITE_LINKS_BY_CATEGORY: Record<
  Article["category"],
  Array<{ href: string; label: string }>
> = {
  culture: [
    { href: "/browse-events", label: "Browse Filipino Events" },
    { href: "/global-calendar", label: "Global Events Calendar" },
    { href: "/news", label: "Community News" },
  ],
  travel: [
    { href: "/browse-events", label: "Discover Events Worldwide" },
    { href: "/restaurant", label: "Filipino Restaurants Abroad" },
    { href: "/global-calendar", label: "Global Events Calendar" },
  ],
  communities: [
    { href: "/browse-events", label: "Find Community Events" },
    { href: "/restaurant", label: "Filipino Restaurants" },
    { href: "/about", label: "About Bayanihan" },
  ],
};

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const category = getCategory(article.category);
  const canonicalUrl = `${SITE_URL}${articleUrl(slug)}`;

  // Sibling articles in the same category (excluding the current one) feed
  // the "Related reading" block — internal linking that keeps these pages
  // from being orphaned and helps search engines crawl the whole cluster.
  const related = getArticlesByCategory(article.category)
    .filter((a) => a.slug !== slug)
    .slice(0, 4);

  const siteLinks = SITE_LINKS_BY_CATEGORY[article.category];

  // Article JSON-LD — ships in the initial HTML so crawlers read it without
  // executing client JS. Spec: https://schema.org/Article
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    articleSection: category?.title,
    datePublished: ARTICLES_PUBLISHED_ISO,
    dateModified: ARTICLES_PUBLISHED_ISO,
    inLanguage: "en",
    author: { "@type": "Organization", name: "Bayanihan.com" },
    publisher: {
      "@type": "Organization",
      name: "Bayanihan.com",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/profile/logo.png`,
      },
    },
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
  };

  // BreadcrumbList JSON-LD — Home › Articles › <title>. Lets Google render
  // a breadcrumb trail in the search result instead of a bare URL.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: `${SITE_URL}/articles`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Box
        component="main"
        sx={{ bgcolor: "#fffdf6", minHeight: "100vh", pb: { xs: 6, md: 10 } }}
      >
        {/* ── HERO HEADER ─────────────────────────────────────────── */}
        <Box
          sx={{
            position: "relative",
            background:
              "radial-gradient(900px 500px at -10% 0%, rgba(247,127,0,0.10), transparent 60%), radial-gradient(900px 500px at 110% 0%, rgba(251,168,51,0.10), transparent 60%), #fff",
            borderBottom: "1px solid #fde2b3",
            py: { xs: 4, md: 6 },
            px: { xs: 2, md: 4 },
          }}
        >
          <Box sx={{ maxWidth: 820, mx: "auto" }}>
            {/* Breadcrumbs */}
            <Box
              component="nav"
              aria-label="Breadcrumb"
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 0.5,
                mb: 2,
                fontFamily: FONT_BODY,
                fontSize: 13,
                color: "#64748b",
              }}
            >
              <Box
                component={NextLink}
                href="/"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.25,
                  color: "#64748b",
                  textDecoration: "none",
                  "&:hover": { color: ACCENT },
                }}
              >
                <HomeRoundedIcon sx={{ fontSize: 15 }} /> Home
              </Box>
              <ChevronRightRoundedIcon sx={{ fontSize: 15 }} />
              <Box
                component={NextLink}
                href="/articles"
                sx={{
                  color: "#64748b",
                  textDecoration: "none",
                  "&:hover": { color: ACCENT },
                }}
              >
                Articles
              </Box>
              <ChevronRightRoundedIcon sx={{ fontSize: 15 }} />
              <Box component="span" sx={{ color: "#0f172a", fontWeight: 600 }}>
                {category?.title}
              </Box>
            </Box>

            {/* Category eyebrow */}
            {category && (
              <Box
                component={NextLink}
                href="/articles"
                sx={{
                  display: "inline-block",
                  mb: 1.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999,
                  fontFamily: FONT_HEAD,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "#fff",
                  textDecoration: "none",
                  background: ACCENT_GRADIENT,
                }}
              >
                {category.title}
              </Box>
            )}

            {/* H1 */}
            <Typography
              component="h1"
              sx={{
                fontFamily: FONT_HEAD,
                fontWeight: 900,
                fontSize: { xs: 28, sm: 34, md: 42 },
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
                color: "#0f172a",
                mb: 2,
              }}
            >
              {article.title}
            </Typography>

            {/* Lead */}
            <Typography
              sx={{
                fontFamily: FONT_BODY,
                fontSize: { xs: 16, md: 18 },
                lineHeight: 1.6,
                color: "#334155",
              }}
            >
              {article.lead}
            </Typography>
          </Box>
        </Box>

        {/* ── ARTICLE BODY ────────────────────────────────────────── */}
        <Box
          component="article"
          sx={{ maxWidth: 820, mx: "auto", px: { xs: 2, md: 4 }, pt: { xs: 4, md: 6 } }}
        >
          {article.sections.map((section, i) => (
            <Box key={i} sx={{ mb: { xs: 3.5, md: 4.5 } }}>
              <Typography
                component="h2"
                sx={{
                  fontFamily: FONT_HEAD,
                  fontWeight: 800,
                  fontSize: { xs: 20, md: 24 },
                  lineHeight: 1.25,
                  color: "#0f172a",
                  mb: 1.5,
                }}
              >
                {section.heading}
              </Typography>
              {section.body.map((para, j) => (
                <Typography
                  key={j}
                  sx={{
                    fontFamily: FONT_BODY,
                    fontSize: { xs: 15.5, md: 17 },
                    lineHeight: 1.75,
                    color: "#334155",
                    mb: 1.5,
                  }}
                >
                  {para}
                </Typography>
              ))}
            </Box>
          ))}

          {/* Continue exploring — internal links into the live site */}
          <Divider sx={{ my: { xs: 4, md: 5 } }} />
          <Typography
            component="h2"
            sx={{
              fontFamily: FONT_HEAD,
              fontWeight: 800,
              fontSize: { xs: 18, md: 22 },
              color: "#0f172a",
              mb: 2,
            }}
          >
            Continue exploring on Bayanihan
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.25,
              mb: { xs: 4, md: 5 },
            }}
          >
            {siteLinks.map((l) => (
              <Box
                key={l.href}
                component={NextLink}
                href={l.href}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 2,
                  py: 1,
                  borderRadius: 999,
                  fontFamily: FONT_HEAD,
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: ACCENT,
                  textDecoration: "none",
                  bgcolor: "#fff",
                  border: "1px solid #fde2b3",
                  transition: "all .2s ease",
                  "&:hover": {
                    bgcolor: "#fff4dd",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {l.label}
                <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
              </Box>
            ))}
          </Box>

          {/* Related reading — sibling articles in the same category */}
          {related.length > 0 && (
            <>
              <Divider sx={{ mb: { xs: 3, md: 4 } }} />
              <Typography
                component="h2"
                sx={{
                  fontFamily: FONT_HEAD,
                  fontWeight: 800,
                  fontSize: { xs: 18, md: 22 },
                  color: "#0f172a",
                  mb: 2,
                }}
              >
                Related reading
              </Typography>
              <Grid container spacing={{ xs: 1.5, md: 2 }}>
                {related.map((r) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={r.slug}>
                    <Box
                      component={NextLink}
                      href={articleUrl(r.slug)}
                      sx={{
                        display: "block",
                        height: "100%",
                        p: { xs: 2, md: 2.25 },
                        borderRadius: 2.5,
                        bgcolor: "#fff",
                        border: "1px solid #f1e3c8",
                        textDecoration: "none",
                        transition: "all .25s ease",
                        "&:hover": {
                          borderColor: "#fbbf24",
                          boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
                          transform: "translateY(-2px)",
                          "& .ra-title": { color: ACCENT },
                        },
                      }}
                    >
                      <Typography
                        className="ra-title"
                        sx={{
                          fontFamily: FONT_HEAD,
                          fontWeight: 800,
                          fontSize: 15.5,
                          lineHeight: 1.3,
                          color: "#0f172a",
                          mb: 0.75,
                          transition: "color .2s ease",
                        }}
                      >
                        {r.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: FONT_BODY,
                          fontSize: 13,
                          lineHeight: 1.5,
                          color: "#64748b",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {r.description}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}
