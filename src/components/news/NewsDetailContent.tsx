"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Divider,
  Button,
  Avatar,
  Stack,
  Breadcrumbs,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import UpdateIcon from "@mui/icons-material/Update";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import merchAds from "@/assets/ads/merch_ads.gif";
import merchAds2 from "@/assets/ads/merch_ads2.gif";
import { parseSummary, parseTags, slugifyTitle } from "@/lib/newsHelpers";
import type { NewsArticle } from "@/types";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(d);
}

function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(d);
}

interface NewsDetailContentProps {
  article: NewsArticle;
  allArticles: NewsArticle[];
  related: NewsArticle[];
  slug: string;
}

function Container({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: Record<string, unknown>;
}) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1650,
        px: { xs: 2, sm: 3, md: 4, lg: 5 },
        mx: "auto",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export default function NewsDetailContent({
  article,
  allArticles,
  related,
  slug,
}: NewsDetailContentProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  const paragraphs = useMemo(
    () => parseSummary(article.summary),
    [article.summary]
  );

  const readingTimeMin = useMemo(() => {
    const text = paragraphs.join(" ");
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [paragraphs]);

  const tagList = useMemo(() => parseTags(article.tags), [article.tags]);

  const lastUpdatedDifferent = useMemo(() => {
    if (!article.updated_at || !article.published_at) return false;
    const u = new Date(article.updated_at).getTime();
    const p = new Date(article.published_at).getTime();
    if (Number.isNaN(u) || Number.isNaN(p)) return false;
    return u - p > 24 * 60 * 60 * 1000;
  }, [article.updated_at, article.published_at]);

  const { prevArticle, nextArticle } = useMemo(() => {
    if (allArticles.length === 0)
      return {
        prevArticle: null as NewsArticle | null,
        nextArticle: null as NewsArticle | null,
      };
    const idx = allArticles.findIndex(
      (a) => (a.slug || slugifyTitle(a.title || "")) === slug
    );
    if (idx < 0) return { prevArticle: null, nextArticle: null };
    return {
      prevArticle: idx > 0 ? allArticles[idx - 1] : null,
      nextArticle:
        idx < allArticles.length - 1 ? allArticles[idx + 1] : null,
    };
  }, [allArticles, slug]);

  const handleExploreMore = () => {
    if (article.category) {
      router.push(`/news?category=${encodeURIComponent(article.category)}`);
    } else {
      router.push("/news");
    }
  };

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // (NewsArticle JSON-LD lives in app/news/[slug]/page.tsx — server-rendered
  // so it ships in the initial HTML for crawlers.)

  return (
    <Box sx={{ pb: 8 }}>
      {/* ===== Reading progress bar (fixed top) ===== */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: "transparent",
          zIndex: 1101,
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${progress}%`,
            bgcolor: "#fbbf24",
            transition: "width 0.1s linear",
          }}
        />
      </Box>

      {/* ===== Breadcrumbs top bar (steady, sticky just below the header) ===== */}
      <Box
        sx={{
          position: "sticky",
          top: 70,
          zIndex: 999,
          bgcolor: "#fff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Container sx={{ py: { xs: 1.25, md: 1.5 } }}>
          <Breadcrumbs
            separator={
              <NavigateNextIcon fontSize="small" sx={{ color: "#cbd5e1" }} />
            }
            sx={{
              "& .MuiBreadcrumbs-ol": { color: "#64748b" },
              "& a": {
                color: "#64748b",
                textDecoration: "none",
                fontWeight: 500,
              },
              "& a:hover": { color: "#0ea5e9" },
              fontSize: 13,
            }}
          >
            <Link href="/">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <HomeIcon sx={{ fontSize: 16 }} />
                <span>Home</span>
              </Stack>
            </Link>
            <Link href="/news">News</Link>
            {article.category && (
              <Link
                href={`/news?category=${encodeURIComponent(article.category)}`}
              >
                {article.category}
              </Link>
            )}
            <Typography
              sx={{
                color: "#0f172a",
                fontWeight: 600,
                fontSize: 13,
                maxWidth: { xs: 200, sm: 500, md: 700 },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {article.title}
            </Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      {/* ===== Hero image with title overlay ===== */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 320, md: 480 },
          overflow: "hidden",
        }}
      >
        {article.image_url ? (
          <Box
            component="img"
            src={article.image_url}
            alt={article.title || "Article cover"}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              backgroundImage:
                "linear-gradient(135deg, #0ea5e9 0%, #1e293b 100%)",
            }}
          />
        )}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%)",
          }}
        />
        <Container
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            py: { xs: 2, md: 3 },
          }}
        >
          <Box sx={{ pb: { xs: 1, md: 2 } }}>
            {article.category && (
              <Chip
                label={article.category}
                color="info"
                size="small"
                sx={{ alignSelf: "flex-start", mb: 1.5, fontWeight: 700 }}
              />
            )}
            <Typography
              sx={{
                color: "#fff",
                fontWeight: 800,
                fontSize: { xs: 22, md: 38 },
                lineHeight: 1.2,
                textShadow: "0 3px 14px rgba(0,0,0,0.6)",
                maxWidth: 900,
              }}
            >
              {article.title}
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container sx={{ mt: { xs: 3, md: 5 } }}>
        <Button
          component={Link}
          href="/news"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2, color: "text.secondary", textTransform: "none" }}
        >
          Back to News
        </Button>

        <Grid container spacing={4}>
          {/* ============== Main article column ============== */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Meta row */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1.5,
                rowGap: 1,
                mb: 2,
              }}
            >
              {article.author && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: "info.main" }}>
                    {article.author?.[0]?.toUpperCase() ?? "?"}
                  </Avatar>
                  <Typography sx={{ fontWeight: 600 }}>
                    {article.author}
                  </Typography>
                </Box>
              )}
              <Divider orientation="vertical" flexItem />
              <Typography variant="body2" color="text.secondary">
                {formatDate(article.date || article.published_at)}
              </Typography>
              {lastUpdatedDifferent && (
                <>
                  <Divider orientation="vertical" flexItem />
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{ color: "text.secondary" }}
                  >
                    <UpdateIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">
                      Updated {formatShortDate(article.updated_at)}
                    </Typography>
                  </Stack>
                </>
              )}
              {article.country && (
                <>
                  <Divider orientation="vertical" flexItem />
                  <Typography variant="body2" color="text.secondary">
                    {article.country}
                  </Typography>
                </>
              )}
              <Divider orientation="vertical" flexItem />
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ color: "text.secondary" }}
              >
                <AccessTimeIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2">{readingTimeMin} min read</Typography>
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ color: "text.secondary" }}
              >
                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">
                  <b>{(article.views_count ?? 0).toLocaleString()}</b> views
                </Typography>
              </Stack>
            </Box>

            {/* Article body */}
            {paragraphs.length > 0 ? (
              paragraphs.map((para, idx) => (
                <Typography
                  key={`p-${idx}`}
                  component="p"
                  sx={{
                    fontSize: { xs: 15, md: 17 },
                    lineHeight: 1.75,
                    color: "text.primary",
                    mb: 2.5,
                  }}
                >
                  {para}
                </Typography>
              ))
            ) : (
              <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                No content available for this article.
              </Typography>
            )}

            {article.original_url && (
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="outlined"
                  endIcon={<OpenInNewIcon />}
                  component="a"
                  href={article.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read original source
                </Button>
              </Box>
            )}

            {/* Tags */}
            {tagList.length > 0 && (
              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <LocalOfferOutlinedIcon sx={{ fontSize: 18, color: "#64748b" }} />
                {tagList.map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    size="small"
                    component={Link}
                    href={`/news?tag=${encodeURIComponent(tag)}`}
                    clickable
                    sx={{
                      bgcolor: "#f1f5f9",
                      color: "#475569",
                      fontWeight: 600,
                      "&:hover": { bgcolor: "#e2e8f0" },
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Engagement actions — only "Explore more like this" remains */}
            <Box
              sx={{
                mt: 5,
                pt: 4,
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: 16, md: 18 },
                  color: "#0f172a",
                  mb: 2,
                }}
              >
                Enjoyed this story?
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ flexWrap: "wrap", rowGap: 1.5 }}
              >
                <Button
                  onClick={handleExploreMore}
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 999,
                    px: 2.5,
                    bgcolor: "#fbbf24",
                    color: "#0f172a",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#f59e0b", boxShadow: "none" },
                  }}
                >
                  Explore more like this
                </Button>
              </Stack>
            </Box>

            {/* About the author */}
            {article.author && (
              <Box
                sx={{
                  mt: 5,
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "info.main",
                    fontSize: 28,
                  }}
                >
                  {article.author?.[0]?.toUpperCase() ?? "?"}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Typography
                    variant="overline"
                    sx={{ color: "text.secondary", letterSpacing: 1.2 }}
                  >
                    Written by
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
                    {article.author}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Contributor at Bayanihan.com — sharing Filipino stories
                    from around the world.
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Previous / Next navigation */}
            {(prevArticle || nextArticle) && (
              <Grid container spacing={2} sx={{ mt: 5 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  {prevArticle ? (
                    <Box
                      component={Link}
                      href={`/news/${prevArticle.slug || slugifyTitle(prevArticle.title || "")}`}
                      sx={{
                        display: "block",
                        p: 2.5,
                        borderRadius: 2,
                        border: "1px solid #e5e7eb",
                        textDecoration: "none",
                        color: "inherit",
                        height: "100%",
                        "&:hover": {
                          bgcolor: "#f8fafc",
                          borderColor: "#0ea5e9",
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{ color: "text.secondary", mb: 1 }}
                      >
                        <NavigateBeforeIcon sx={{ fontSize: 18 }} />
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, letterSpacing: 1 }}
                        >
                          PREVIOUS
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        {prevArticle.title}
                      </Typography>
                    </Box>
                  ) : (
                    <Box />
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  {nextArticle ? (
                    <Box
                      component={Link}
                      href={`/news/${nextArticle.slug || slugifyTitle(nextArticle.title || "")}`}
                      sx={{
                        display: "block",
                        p: 2.5,
                        borderRadius: 2,
                        border: "1px solid #e5e7eb",
                        textDecoration: "none",
                        color: "inherit",
                        height: "100%",
                        textAlign: "right",
                        "&:hover": {
                          bgcolor: "#f8fafc",
                          borderColor: "#0ea5e9",
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        justifyContent="flex-end"
                        sx={{ color: "text.secondary", mb: 1 }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, letterSpacing: 1 }}
                        >
                          NEXT
                        </Typography>
                        <NavigateNextIcon sx={{ fontSize: 18 }} />
                      </Stack>
                      <Typography sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        {nextArticle.title}
                      </Typography>
                    </Box>
                  ) : (
                    <Box />
                  )}
                </Grid>
              </Grid>
            )}
          </Grid>

          {/* ============== Sticky Sidebar (steady) ============== */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: "sticky", top: 130 }}>
              {related.length > 0 && (
                <>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 18,
                      mb: 2,
                      borderBottom: "2px solid",
                      borderColor: "info.main",
                      pb: 1,
                    }}
                  >
                    Related Stories
                  </Typography>
                  {related.map((r) => (
                    <Box
                      key={r.slug || r.id}
                      component={Link}
                      href={`/news/${r.slug || slugifyTitle(r.title || "")}`}
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        mb: 2,
                        textDecoration: "none",
                        color: "inherit",
                        ":hover .related-title": { color: "info.main" },
                      }}
                    >
                      {r.image_url && (
                        <Box
                          component="img"
                          src={r.image_url}
                          alt={r.title || ""}
                          sx={{
                            width: 100,
                            height: 70,
                            objectFit: "cover",
                            borderRadius: 1,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <Box>
                        <Typography
                          className="related-title"
                          sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            lineHeight: 1.3,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {r.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          {formatDate(r.date || r.published_at)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </>
              )}

              <Box
                sx={{
                  mt: 3,
                  display: { xs: "none", md: "flex" },
                  flexDirection: "row",
                  gap: 2,
                  alignItems: "stretch",
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0, position: "relative", height: 500 }}>
                  <Image
                    src={merchAds}
                    alt="Merch Ad"
                    fill
                    sizes="(min-width: 900px) 200px, 100vw"
                    style={{
                      objectFit: "cover",
                      borderRadius: 4,
                      border: "1px solid #e5e7eb",
                    }}
                    unoptimized
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, position: "relative", height: 500 }}>
                  <Image
                    src={merchAds2}
                    alt="Merch Ad 2"
                    fill
                    sizes="(min-width: 900px) 200px, 100vw"
                    style={{
                      objectFit: "cover",
                      borderRadius: 4,
                      border: "1px solid #e5e7eb",
                    }}
                    unoptimized
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
