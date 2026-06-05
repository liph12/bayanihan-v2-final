"use client";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import NextLink from "next/link";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AxiosInstance from "@/lib/AxiosInstance";
import { normalizeArticle, slugifyTitle } from "@/lib/newsHelpers";
import type { NewsArticle } from "@/types";
import StoryRail from "./StoryRail";

const FONT_HEAD = "var(--font-urbanist), 'Outfit', sans-serif";
const FONT_BODY = "var(--font-outfit), 'Outfit', sans-serif";
const ACCENT_GRADIENT =
  "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f97316 100%)";

interface NewsListResponse {
  data?: NewsArticle[];
  meta?: { last_page?: number };
}

// The API can return the same article (same id/slug) on more than one page,
// so collapse duplicates while normalizing.
function dedupeNormalize(raw: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  const out: NewsArticle[] = [];
  for (const a of raw) {
    const n = normalizeArticle(a);
    if (!n) continue;
    const key = String(n.id ?? n.slug ?? n.title ?? "");
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    out.push(n);
  }
  return out;
}

function formatDate(d?: string | null): string {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

interface NewsSectionProps {
  initialArticles?: NewsArticle[];
}

export default function NewsSection({ initialArticles = [] }: NewsSectionProps) {
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles);

  useEffect(() => {
    if (initialArticles.length > 0) return;
    let mounted = true;
    (async () => {
      try {
        const first = await AxiosInstance.get<NewsListResponse>(
          "news-articles-v2?page=1"
        );
        const all: NewsArticle[] = Array.isArray(first?.data?.data)
          ? [...first.data!.data!]
          : [];
        const lastPage =
          typeof first?.data?.meta?.last_page === "number"
            ? first.data.meta.last_page
            : 1;
        if (lastPage > 1) {
          const rest = await Promise.all(
            Array.from({ length: lastPage - 1 }, (_, i) =>
              AxiosInstance.get<NewsListResponse>(
                `news-articles-v2?page=${i + 2}`
              )
                .then((r) => (Array.isArray(r?.data?.data) ? r.data!.data! : []))
                .catch(() => [] as NewsArticle[])
            )
          );
          rest.forEach((arr) => all.push(...arr));
        }
        if (mounted) setArticles(dedupeNormalize(all));
      } catch {
        if (mounted) setArticles([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialArticles.length]);

  const renderCard = (a: NewsArticle) => {
    const slug = a.slug || slugifyTitle(a.title || "");
    const href = `/news/${slug}`;
    const image = a.image_url;
    const date = formatDate(a.date);
    const views = Number(a.views_count ?? 0) || 0;

    return (
      <NextLink
        href={href}
        draggable={false}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        <Box
          sx={{
            position: "relative",
            width: { xs: 260, sm: 290, md: 320 },
            height: { xs: 165, sm: 185, md: 200 },
            flexShrink: 0,
            scrollSnapAlign: "start",
            borderRadius: 2.5,
            overflow: "hidden",
            bgcolor: "#0f172a",
            boxShadow: "0 6px 16px rgba(15,23,42,0.12)",
            cursor: "pointer",
            transition: "transform .35s, box-shadow .35s",
            "@media (hover: hover)": {
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 18px 36px rgba(15,23,42,0.22)",
                "& .news-img": { transform: "scale(1.06)" },
              },
            },
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="news-img"
              loading="lazy"
              src={image}
              alt={a.title || "News"}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transition: "transform .5s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          ) : (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: ACCENT_GRADIENT,
                display: "grid",
                placeItems: "center",
                color: "#fff",
              }}
            >
              <ArticleRoundedIcon sx={{ fontSize: 36, opacity: 0.85 }} />
            </Box>
          )}

          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.15) 0%, transparent 35%, transparent 45%, rgba(15,23,42,0.92) 100%)",
            }}
          />

          {a.category && (
            <Box
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                px: 1,
                py: 0.35,
                borderRadius: 999,
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                color: "#fff",
                fontFamily: FONT_HEAD,
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {a.category}
            </Box>
          )}

          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              p: 1.25,
              color: "#fff",
            }}
          >
            <Typography
              sx={{
                fontFamily: FONT_HEAD,
                fontSize: { xs: 14, md: 15 },
                fontWeight: 800,
                lineHeight: 1.25,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textShadow: "0 2px 6px rgba(0,0,0,0.5)",
              }}
            >
              {a.title}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 0.5,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              {date && (
                <Typography
                  sx={{
                    fontFamily: FONT_BODY,
                    fontSize: 11.5,
                    fontWeight: 600,
                    textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {date}
                </Typography>
              )}
              {views > 0 && (
                <>
                  <Box
                    sx={{
                      width: 3,
                      height: 3,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.5)",
                    }}
                  />
                  <Box
                    sx={{ display: "inline-flex", alignItems: "center", gap: 0.4 }}
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 13 }} />
                    <Typography
                      sx={{
                        fontFamily: FONT_BODY,
                        fontSize: 11.5,
                        fontWeight: 700,
                      }}
                    >
                      {views.toLocaleString()}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </NextLink>
    );
  };

  return (
    <Box
      sx={{
        position: "relative",
        px: { xs: 2, md: 4, lg: 5 },
        py: { xs: 2.5, md: 3 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 1.5,
        }}
      >
        <Box>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.6,
              px: 1,
              py: 0.25,
              borderRadius: 999,
              bgcolor: "#fffbeb",
              border: "1px solid #fde68a",
              color: "#b45309",
              fontFamily: FONT_HEAD,
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              mb: 0.75,
            }}
          >
            <ArticleRoundedIcon sx={{ fontSize: 11 }} />
            Updates
            {articles.length > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 0.5,
                  pl: 0.75,
                  borderLeft: "1px solid #fde68a",
                  color: "#0f172a",
                  fontWeight: 900,
                }}
              >
                {articles.length}
              </Box>
            )}
          </Box>
          <Typography
            component="h2"
            sx={{
              fontFamily: FONT_HEAD,
              fontWeight: 900,
              fontSize: { xs: 18, sm: 20, md: 22 },
              lineHeight: 1.15,
              letterSpacing: "-0.015em",
              color: "#0f172a",
            }}
          >
            Global Pinoy Updates
            <Box
              component="span"
              sx={{
                background: ACCENT_GRADIENT,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              .
            </Box>
          </Typography>
        </Box>

        <Box
          component={NextLink}
          href="/news"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.3,
            px: 1.25,
            py: 0.55,
            borderRadius: 999,
            fontFamily: FONT_HEAD,
            fontSize: 11.5,
            fontWeight: 800,
            color: "#fff",
            textDecoration: "none",
            background: ACCENT_GRADIENT,
            boxShadow: "0 6px 14px rgba(245,158,11,0.28)",
            transition: "all .2s ease",
            flexShrink: 0,
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 8px 18px rgba(245,158,11,0.4)",
            },
          }}
        >
          See all
          <ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />
        </Box>
      </Box>

      {articles.length === 0 ? (
        <Box
          sx={{
            py: 4,
            textAlign: "center",
            borderRadius: 2.5,
            bgcolor: "#fffbeb",
            border: "1px dashed #fde68a",
          }}
        >
          <Typography
            sx={{
              fontFamily: FONT_BODY,
              fontSize: 13,
              fontWeight: 600,
              color: "#94a3b8",
            }}
          >
            No news to display yet.
          </Typography>
        </Box>
      ) : (
        <StoryRail accentColor="#b45309" deps={[articles.length]} autoScroll>
          {articles.map((a, i) => (
            <Box key={a.id || a.slug || i}>{renderCard(a)}</Box>
          ))}
        </StoryRail>
      )}
    </Box>
  );
}
