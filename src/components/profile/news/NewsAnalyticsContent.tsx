"use client";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Skeleton,
  Button,
  Chip,
} from "@mui/material";
import Link from "next/link";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import LaunchOutlinedIcon from "@mui/icons-material/LaunchOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import AxiosInstance from "@/lib/AxiosInstance";
import { normalizeArticle, slugifyTitle } from "@/lib/newsHelpers";
import type { NewsArticle } from "@/types";

interface ListApiResponse {
  data?: NewsArticle[] | { data?: NewsArticle[] };
  meta?: { current_page?: number; last_page?: number };
}

interface StatsApiResponse {
  data?: Array<{ slug?: string; id?: string | number; views_count?: number }>;
}

const formatNum = (n: number) => Number(n || 0).toLocaleString();
const articleViews = (a: NewsArticle | null | undefined) =>
  Number(a?.views_count ?? a?.views ?? 0) || 0;

// True when the article's created date falls on the current local day.
const isCreatedToday = (a: NewsArticle | null | undefined) => {
  const raw = a?.created_at ?? a?.date ?? a?.published_at;
  if (!raw) return false;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent: string;
  subTruncate?: boolean;
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  accent,
  subTruncate,
}: MetricCardProps) {
  return (
    <Paper
      sx={{
        flex: 1,
        p: 2.25,
        borderRadius: "18px",
        border: "1px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        gap: 1.75,
        minWidth: 0,
        bgcolor: "#fff",
        boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: "14px",
          bgcolor: `${accent}1a`,
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 12,
            color: "#64748b",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: { xs: 22, md: 26 },
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.15,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </Typography>
        {sub && (
          <Typography
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              color: "#94a3b8",
              mt: 0.25,
              ...(subTruncate
                ? {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }
                : {}),
            }}
          >
            {sub}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function ChartCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: "18px",
        border: "1px solid #f1f5f9",
        bgcolor: "#fff",
        boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: { xs: 16, md: 18 },
              color: "#0f172a",
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                color: "#64748b",
                mt: 0.25,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Paper>
  );
}

function rankStyle(rank: number) {
  if (rank === 1) return { bg: "#fef3c7", fg: "#b45309", border: "#fcd34d" };
  if (rank === 2) return { bg: "#e2e8f0", fg: "#475569", border: "#cbd5e1" };
  if (rank === 3) return { bg: "#fed7aa", fg: "#9a3412", border: "#fdba74" };
  return { bg: "#f1f5f9", fg: "#64748b", border: "#e2e8f0" };
}

export default function NewsAnalyticsContent() {
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewsAvailable, setViewsAvailable] = useState(true);

  const fetchViewStats = useCallback(async (): Promise<
    Map<string, number> | null
  > => {
    const buildMap = (
      rows: Array<{ slug?: string; id?: string | number; views_count?: number }>
    ) => {
      const m = new Map<string, number>();
      rows.forEach((r) => {
        const v = Number(r?.views_count ?? 0) || 0;
        if (r?.slug) m.set(`slug:${r.slug}`, v);
        if (r?.id != null) m.set(`id:${r.id}`, v);
      });
      return m;
    };

    try {
      const resp = await AxiosInstance.get<StatsApiResponse>(
        "news-articles-v2/stats"
      );
      const root = resp?.data ?? {};
      const rows = Array.isArray(root?.data) ? root.data : null;
      if (rows && rows.length > 0 && rows[0]?.views_count != null) {
        return buildMap(rows);
      }
    } catch {
      /* fall through */
    }

    try {
      const resp = await AxiosInstance.get<ListApiResponse>(
        "news-articles-v2?page=1&include=views_count"
      );
      const root = resp?.data ?? {};
      const rows: NewsArticle[] = Array.isArray(root?.data)
        ? (root.data as NewsArticle[])
        : Array.isArray(
            (root?.data as { data?: NewsArticle[] } | undefined)?.data
          )
        ? ((root.data as { data: NewsArticle[] }).data as NewsArticle[])
        : [];
      if (rows.length > 0 && rows[0]?.views_count != null) {
        return buildMap(
          rows.map((r) => ({
            slug: r.slug,
            id: r.id,
            views_count: r.views_count,
          }))
        );
      }
    } catch {
      /* fall through */
    }

    return null;
  }, []);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const extract = (root: ListApiResponse | undefined): NewsArticle[] => {
        if (!root) return [];
        if (Array.isArray(root.data)) return root.data;
        const nested = (root.data as { data?: NewsArticle[] } | undefined)?.data;
        return Array.isArray(nested) ? nested : [];
      };

      // Fetch page 1, learn the total page count from meta, then fetch the
      // remaining pages in parallel. This guarantees the analytics cards and
      // leaderboard reflect every article, not just the first page.
      const firstResp = await AxiosInstance.get<ListApiResponse>(
        "news-articles-v2?page=1"
      );
      const firstRoot = firstResp?.data ?? {};
      const firstList = extract(firstRoot);
      const lastPage = Number(firstRoot?.meta?.last_page) || 1;

      let allRaw: NewsArticle[] = firstList;
      if (lastPage > 1) {
        const restResponses = await Promise.all(
          Array.from({ length: lastPage - 1 }, (_, i) =>
            AxiosInstance.get<ListApiResponse>(
              `news-articles-v2?page=${i + 2}`
            )
              .then((r) => extract(r?.data ?? {}))
              .catch(() => [] as NewsArticle[])
          )
        );
        allRaw = firstList.concat(...restResponses);
      }

      const normalized = allRaw
        .map((a) => normalizeArticle(a))
        .filter((a): a is NewsArticle => !!a);

      const stats = await fetchViewStats();
      if (stats) {
        const merged = normalized.map((a) => {
          const v =
            (a.slug != null && stats.get(`slug:${a.slug}`)) ??
            (a.id != null && stats.get(`id:${a.id}`));
          return {
            ...a,
            views_count: typeof v === "number" ? v : a.views_count,
          };
        });
        setArticles(merged);
        setViewsAvailable(true);
      } else {
        setArticles(normalized);
        setViewsAvailable(false);
      }
    } catch (e) {
      const err = e as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      console.error("Failed to fetch articles", e);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load analytics."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchViewStats]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchArticles();
  }, [fetchArticles]);

  const stats = useMemo<{
    totalArticles: number;
    totalViews: number;
    avgViews: number;
    createdToday: number;
    top: NewsArticle | null;
    sortedByViews: NewsArticle[];
  }>(() => {
    const totalArticles = articles.length;
    let totalViews = 0;
    let createdToday = 0;
    let top: NewsArticle | null = null;
    articles.forEach((a) => {
      const v = articleViews(a);
      totalViews += v;
      if (isCreatedToday(a)) createdToday += 1;
      if (!top || v > articleViews(top)) top = a;
    });
    const avgViews = totalArticles
      ? Math.round(totalViews / totalArticles)
      : 0;
    const sortedByViews = [...articles].sort(
      (a, b) => articleViews(b) - articleViews(a)
    );
    return {
      totalArticles,
      totalViews,
      avgViews,
      createdToday,
      top,
      sortedByViews,
    };
  }, [articles]);

  const topMaxViews = articleViews(stats.sortedByViews[0]);

  return (
    <Box sx={{ pb: 5, px: { xs: 2, md: 2 } }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              color: "#1e293b",
              fontSize: { xs: "1.6rem", md: "2.2rem" },
            }}
          >
            News Article Analytics
          </Typography>
          <Typography
            sx={{
              color: "#64748b",
              fontFamily: "'Outfit', sans-serif",
              mt: 0.5,
            }}
          >
            {loading
              ? "Loading analytics…"
              : error
              ? "Unable to load analytics."
              : `Insights from ${formatNum(stats.totalArticles)} ${
                  stats.totalArticles === 1 ? "article" : "articles"
                } and ${formatNum(stats.totalViews)} total ${
                  stats.totalViews === 1 ? "view" : "views"
                }.`}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={() => void fetchArticles()}
            startIcon={<RefreshOutlinedIcon />}
            variant="outlined"
            disabled={loading}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              borderColor: "#e2e8f0",
              color: "#475569",
              "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
            }}
          >
            Refresh
          </Button>
          <Button
            component={Link}
            href="/profile/news-articles"
            startIcon={<LaunchOutlinedIcon />}
            variant="contained"
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              bgcolor: "#0ea5e9",
              "&:hover": { bgcolor: "#0284c7" },
            }}
          >
            View Articles
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <Box>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={96}
                sx={{ flex: 1, borderRadius: "18px" }}
              />
            ))}
          </Stack>
          <Skeleton
            variant="rounded"
            height={360}
            sx={{ borderRadius: "18px" }}
          />
        </Box>
      ) : error ? (
        <Paper
          sx={{
            p: 4,
            borderRadius: "16px",
            textAlign: "center",
            border: "1px solid #fee2e2",
            bgcolor: "#fef2f2",
          }}
        >
          <Typography sx={{ color: "#991b1b", fontWeight: 700 }}>
            Failed to load analytics
          </Typography>
          <Typography sx={{ color: "#7f1d1d", fontSize: 14, mt: 0.5 }}>
            {String(error)}
          </Typography>
          <Button
            onClick={() => void fetchArticles()}
            sx={{ mt: 2, textTransform: "none" }}
          >
            Retry
          </Button>
        </Paper>
      ) : stats.totalArticles === 0 ? (
        <Paper
          sx={{
            p: 6,
            borderRadius: "16px",
            textAlign: "center",
            border: "1px dashed #cbd5e1",
            bgcolor: "#fcfdfe",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#334155" }}>
            No articles yet
          </Typography>
          <Typography sx={{ color: "#64748b", mt: 0.5 }}>
            Create an article to start collecting view analytics.
          </Typography>
          <Button
            component={Link}
            href="/profile/create-news"
            variant="contained"
            sx={{
              mt: 2,
              textTransform: "none",
              borderRadius: "10px",
              bgcolor: "#0ea5e9",
              "&:hover": { bgcolor: "#0284c7" },
            }}
          >
            Create your first article
          </Button>
        </Paper>
      ) : (
        <>
          {!viewsAvailable && (
            <Paper
              sx={{
                p: 2,
                mb: 3,
                borderRadius: "14px",
                border: "1px solid #fde68a",
                bgcolor: "#fffbeb",
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
              }}
            >
              <InfoOutlinedIcon sx={{ color: "#b45309", mt: 0.25 }} />
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    color: "#92400e",
                    fontSize: 14,
                  }}
                >
                  View counts unavailable in bulk
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13,
                    color: "#92400e",
                    mt: 0.25,
                  }}
                >
                  The list API doesn&apos;t return <code>views_count</code> yet,
                  and the per-article endpoint increments the counter on each
                  call — so we can&apos;t fan out without inflating the data.
                  Once the backend adds either{" "}
                  <code>news-articles-v2/stats</code> or{" "}
                  <code>?include=views_count</code> on the list endpoint,
                  numbers below will populate automatically.
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Metric cards */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <MetricCard
              icon={<ArticleOutlinedIcon />}
              label="Articles"
              value={formatNum(stats.totalArticles)}
              accent="#0ea5e9"
              sub="total news articles created"
            />
            <MetricCard
              icon={<TodayOutlinedIcon />}
              label="Created Today"
              value={formatNum(stats.createdToday)}
              accent="#ec4899"
              sub={
                stats.createdToday === 1
                  ? "new article today"
                  : "new articles today"
              }
            />
            <MetricCard
              icon={<VisibilityOutlinedIcon />}
              label="Total Views"
              value={formatNum(stats.totalViews)}
              accent="#10b981"
              sub="across all articles"
            />
            <MetricCard
              icon={<TrendingUpOutlinedIcon />}
              label="Avg Views"
              value={formatNum(stats.avgViews)}
              accent="#8b5cf6"
              sub="per article"
            />
            <MetricCard
              icon={<EmojiEventsOutlinedIcon />}
              label="Top Performer"
              value={
                stats.top
                  ? `${formatNum(articleViews(stats.top))} views`
                  : "—"
              }
              accent="#f59e0b"
              sub={stats.top?.title || "—"}
              subTruncate
            />
          </Stack>

          {/* Top Performers leaderboard */}
          <Box sx={{ mb: 3 }}>
            <ChartCard
              title="Top Performers"
              subtitle="All articles ranked by total views — click any card to open"
            >
              <Stack spacing={1.25}>
                {stats.sortedByViews.map((a, idx) => {
                  const rank = idx + 1;
                  const v = articleViews(a);
                  const share = topMaxViews ? (v / topMaxViews) * 100 : 0;
                  const rs = rankStyle(rank);
                  const viewSlug = a.slug || slugifyTitle(a.title || "");
                  return (
                    <Box
                      key={a.id || viewSlug || idx}
                      component={Link}
                      href={`/news/${viewSlug}`}
                      sx={{
                        position: "relative",
                        display: "block",
                        textDecoration: "none",
                        color: "inherit",
                        borderRadius: "14px",
                        border: "1px solid #f1f5f9",
                        bgcolor: "#fff",
                        overflow: "hidden",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "#cbd5e1",
                          transform: "translateY(-1px)",
                          boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          width: `${Math.max(2, share)}%`,
                          background:
                            "linear-gradient(90deg, rgba(14,165,233,0.10) 0%, rgba(14,165,233,0.02) 100%)",
                          pointerEvents: "none",
                        }}
                      />
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                        sx={{ p: 1.25, position: "relative" }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "12px",
                            bgcolor: rs.bg,
                            color: rs.fg,
                            border: `1px solid ${rs.border}`,
                            display: "grid",
                            placeItems: "center",
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 800,
                            fontSize: 15,
                            flexShrink: 0,
                          }}
                        >
                          {rank}
                        </Box>

                        {a.image_url ? (
                          <Box
                            component="img"
                            src={a.image_url}
                            alt={a.title || ""}
                            sx={{
                              width: 64,
                              height: 48,
                              objectFit: "cover",
                              borderRadius: "10px",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 64,
                              height: 48,
                              borderRadius: "10px",
                              bgcolor: "#f1f5f9",
                              color: "#94a3b8",
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            <ImageOutlinedIcon fontSize="small" />
                          </Box>
                        )}

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontFamily: "'Outfit', sans-serif",
                              fontWeight: 700,
                              fontSize: { xs: 14, md: 15 },
                              color: "#0f172a",
                              lineHeight: 1.3,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {a.title || "(Untitled)"}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mt: 0.5 }}
                          >
                            {a.category && (
                              <Chip
                                label={a.category}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  bgcolor: "#e0f2fe",
                                  color: "#0369a1",
                                  fontFamily: "'Outfit', sans-serif",
                                  "& .MuiChip-label": { px: 1 },
                                }}
                              />
                            )}
                            <Typography
                              sx={{
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: 12,
                                color: "#94a3b8",
                                fontWeight: 600,
                              }}
                            >
                              {Math.round(share)}% of #1
                            </Typography>
                          </Stack>
                        </Box>

                        <Box
                          sx={{
                            textAlign: "right",
                            minWidth: 80,
                            pr: 0.5,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                            justifyContent="flex-end"
                            sx={{ color: "#0ea5e9" }}
                          >
                            <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                            <Typography
                              sx={{
                                fontFamily: "'Outfit', sans-serif",
                                fontWeight: 800,
                                fontSize: { xs: 16, md: 18 },
                                color: "#0f172a",
                                lineHeight: 1,
                              }}
                            >
                              {formatNum(v)}
                            </Typography>
                          </Stack>
                          <Typography
                            sx={{
                              fontFamily: "'Outfit', sans-serif",
                              fontSize: 11,
                              color: "#94a3b8",
                              mt: 0.25,
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: 0.4,
                            }}
                          >
                            {v === 1 ? "view" : "views"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </ChartCard>
          </Box>
        </>
      )}
    </Box>
  );
}
