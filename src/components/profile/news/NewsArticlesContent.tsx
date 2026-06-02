"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AxiosInstance from "@/lib/AxiosInstance";
import { normalizeArticle, slugifyTitle } from "@/lib/newsHelpers";
import type { NewsArticle } from "@/types";

interface ListApiResponse {
  data?:
    | NewsArticle[]
    | { data?: NewsArticle[] }
    | { error?: string; message?: string };
  meta?: { current_page?: number; last_page?: number };
  error?: string;
  message?: string;
}

interface StatsApiResponse {
  data?: Array<{ slug?: string; id?: string | number; views_count?: number }>;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(d);
}

function statusColor(status?: string): { bg: string; fg: string } {
  switch ((status || "").toLowerCase()) {
    case "published":
      return { bg: "#dcfce7", fg: "#166534" };
    case "draft":
      return { bg: "#fef3c7", fg: "#92400e" };
    case "trashed":
      return { bg: "#fee2e2", fg: "#991b1b" };
    default:
      return { bg: "#e2e8f0", fg: "#475569" };
  }
}

interface AnalyticsCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent: string;
  subTruncate?: boolean;
}

function AnalyticsCard({
  icon,
  label,
  value,
  sub,
  accent,
  subTruncate,
}: AnalyticsCardProps) {
  return (
    <Paper
      sx={{
        flex: 1,
        p: 2,
        borderRadius: "16px",
        border: "1px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "12px",
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
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: { xs: 18, md: 20 },
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.2,
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
              fontSize: 11,
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

const articleViews = (a: NewsArticle | null | undefined) =>
  Number(a?.views_count ?? a?.views ?? 0) || 0;
const formatNum = (n: number) => Number(n || 0).toLocaleString();

export default function NewsArticlesContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<NewsArticle | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: "success" | "error" | "info";
  }>({ open: false, msg: "", severity: "info" });

  const showToast = (
    msg: string,
    severity: "success" | "error" | "info"
  ) => setSnack({ open: true, msg, severity });

  // Try to enrich articles with views_count via a bulk endpoint.
  // The single-article GET increments views, so fan-out is unsafe.
  const fetchViewStats = async (): Promise<Map<string, number> | null> => {
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
        : Array.isArray((root?.data as { data?: NewsArticle[] } | undefined)?.data)
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
  };

  // p = 1 replaces the list (initial load / refresh).
  // p > 1 appends — used by the Load more button.
  const fetchArticles = async (p: number = 1) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      const resp = await AxiosInstance.get<ListApiResponse>(
        `news-articles-v2?page=${p}`
      );
      const root = resp?.data ?? {};
      // v2 returns Laravel API Resources shape:
      //   { data: NewsArticle[], meta: { last_page, ... } }
      const rawList: NewsArticle[] = Array.isArray(root?.data)
        ? (root.data as NewsArticle[])
        : Array.isArray((root?.data as { data?: NewsArticle[] } | undefined)?.data)
        ? ((root.data as { data: NewsArticle[] }).data as NewsArticle[])
        : [];
      const normalized = rawList
        .map((a) => normalizeArticle(a))
        .filter((a): a is NewsArticle => !!a);

      // Only run the views-stats fetch on the first page — stats covers all
      // articles, so re-running it for each page would be wasted work.
      const stats = p === 1 ? await fetchViewStats() : null;
      let merged = stats
        ? normalized.map((a) => {
            const v =
              (a.slug != null && stats.get(`slug:${a.slug}`)) ??
              (a.id != null && stats.get(`id:${a.id}`));
            return {
              ...a,
              views_count: typeof v === "number" ? v : a.views_count,
            };
          })
        : normalized;

      // When appending, look up the cached views map from already-loaded
      // articles so new rows pick up their counts without another request.
      if (p > 1) {
        const knownViews = new Map<string, number>();
        articles.forEach((a) => {
          if (a.slug != null && typeof a.views_count === "number") {
            knownViews.set(`slug:${a.slug}`, a.views_count);
          }
        });
        merged = merged.map((a) => {
          const v =
            a.slug != null ? knownViews.get(`slug:${a.slug}`) : undefined;
          return v != null ? { ...a, views_count: v } : a;
        });
      }

      setArticles((prev) => (p === 1 ? merged : [...prev, ...merged]));
      if (typeof root?.meta?.last_page === "number") {
        setLastPage(root.meta.last_page);
      }
      setPage(p);
    } catch (e) {
      const err = e as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      console.error("Failed to fetch articles", e);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load articles."
      );
    } finally {
      if (p === 1) setLoading(false);
      else setLoadingMore(false);
    }
  };

  useEffect(() => {
    // Intentionally fire-once on mount; fetch is async and we accept the
    // initial setState cascade as a one-time data-load cost.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchArticles(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    if (loadingMore || page >= lastPage) return;
    void fetchArticles(page + 1);
  };

  const handleHide = async () => {
    if (!confirmTarget) return;
    const target = confirmTarget;
    setDeleting(true);
    try {
      const formData = new FormData();
      formData.append("slug", target.slug || "");
      formData.append("status", "trashed");

      await AxiosInstance.post("news-articles-v2/hide", formData, {
        headers: { Accept: "application/json" },
      });
      setArticles((prev) => prev.filter((a) => a.slug !== target.slug));
      showToast("Article hidden successfully.", "info");
      setConfirmTarget(null);
    } catch (e) {
      console.error("Hide failed", e);
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      showToast(
        err.response?.data?.message ||
          err.message ||
          "Failed to hide article.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return articles;
    const q = search.trim().toLowerCase();
    return articles.filter(
      (a) =>
        (a.title || "").toLowerCase().includes(q) ||
        (a.category || "").toLowerCase().includes(q) ||
        (a.country || "").toLowerCase().includes(q) ||
        (a.status || "").toLowerCase().includes(q)
    );
  }, [articles, search]);

  const counts = useMemo(() => {
    return articles.reduce(
      (acc, a) => {
        const s = (a.status || "").toLowerCase();
        if (s === "published") acc.published += 1;
        else if (s === "draft") acc.drafts += 1;
        else if (s === "trashed") acc.trashed += 1;
        return acc;
      },
      { published: 0, drafts: 0, trashed: 0 }
    );
  }, [articles]);

  const analytics = useMemo<{ total: number; top: NewsArticle | null }>(() => {
    let total = 0;
    let top: NewsArticle | null = null;
    articles.forEach((a) => {
      const v = articleViews(a);
      total += v;
      if (!top || v > articleViews(top)) top = a;
    });
    return { total, top };
  }, [articles]);

  const avgViews = articles.length
    ? Math.round(analytics.total / articles.length)
    : 0;

  const buildDescription = () => {
    if (loading && articles.length === 0) return "Loading articles…";
    if (error) return "Unable to load articles.";
    if (articles.length === 0)
      return "No articles yet — create your first one.";

    const isFiltering = search.trim().length > 0;
    if (isFiltering) {
      return `Showing ${filtered.length} of ${articles.length} ${
        articles.length === 1 ? "article" : "articles"
      } matching "${search.trim()}".`;
    }

    const total = articles.length;
    const parts: string[] = [];
    if (counts.published) parts.push(`${counts.published} published`);
    if (counts.drafts)
      parts.push(`${counts.drafts} draft${counts.drafts === 1 ? "" : "s"}`);
    if (counts.trashed) parts.push(`${counts.trashed} trashed`);
    const breakdown = parts.length > 0 ? ` (${parts.join(" · ")})` : "";
    return `${total} ${total === 1 ? "article" : "articles"}${breakdown}.`;
  };

  const SkeletonRow = () => (
    <Paper
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: "16px",
        border: "1px solid #f1f5f9",
        mb: 1.5,
      }}
    >
      <Skeleton variant="rounded" width={90} height={64} />
      <Box sx={{ flex: 1 }}>
        <Skeleton height={24} width="60%" />
        <Skeleton height={18} width="40%" />
      </Box>
      <Skeleton variant="rounded" width={80} height={28} />
      <Skeleton variant="circular" width={36} height={36} />
      <Skeleton variant="circular" width={36} height={36} />
    </Paper>
  );

  return (
    <>
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: "100%", fontWeight: 600 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>

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
              News Articles
            </Typography>
            <Typography
              sx={{
                color: "#64748b",
                fontFamily: "'Outfit', sans-serif",
                mt: 0.5,
              }}
            >
              {buildDescription()}
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/profile/create-news"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              px: 3,
              py: 1.25,
              bgcolor: "#0ea5e9",
              "&:hover": { bgcolor: "#0284c7" },
            }}
          >
            Create Article
          </Button>
        </Stack>

        {articles.length > 0 && !error && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ mb: 3 }}
          >
            <AnalyticsCard
              icon={<ArticleOutlinedIcon />}
              label="Articles"
              value={formatNum(articles.length)}
              accent="#0ea5e9"
              sub={
                counts.published
                  ? `${counts.published} published`
                  : "no published"
              }
            />
            <AnalyticsCard
              icon={<VisibilityOutlinedIcon />}
              label="Total Views"
              value={formatNum(analytics.total)}
              accent="#10b981"
              sub="across all articles"
            />
            <AnalyticsCard
              icon={<TrendingUpOutlinedIcon />}
              label="Avg Views"
              value={formatNum(avgViews)}
              accent="#8b5cf6"
              sub="per article"
            />
            <AnalyticsCard
              icon={<EmojiEventsOutlinedIcon />}
              label="Top Performer"
              value={
                analytics.top
                  ? `${formatNum(articleViews(analytics.top))} views`
                  : "—"
              }
              accent="#f59e0b"
              sub={analytics.top?.title || "No data yet"}
              subTruncate
            />
          </Stack>
        )}

        <TextField
          placeholder="Search by title, category, country, or status…"
          fullWidth
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: "12px",
                bgcolor: "#fff",
                fontFamily: "'Outfit', sans-serif",
              },
            },
          }}
          sx={{ mb: 3 }}
        />

        {loading && articles.length === 0 ? (
          <Box>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonRow key={i} />
            ))}
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
            <Typography sx={{ color: "#991b1b", fontWeight: 600 }}>
              Failed to load articles
            </Typography>
            <Typography sx={{ color: "#7f1d1d", fontSize: 14, mt: 0.5 }}>
              {String(error)}
            </Typography>
            <Button
              onClick={() => void fetchArticles(1)}
              sx={{ mt: 2, textTransform: "none" }}
            >
              Retry
            </Button>
          </Paper>
        ) : filtered.length === 0 ? (
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
              {articles.length === 0
                ? "No articles yet"
                : "No articles match your search"}
            </Typography>
            <Typography sx={{ color: "#64748b", mt: 0.5 }}>
              {articles.length === 0
                ? "Create your first article to see it here."
                : "Try a different search term."}
            </Typography>
          </Paper>
        ) : (
          <Box>
            {filtered.map((a) => {
              const status = statusColor(a.status);
              const viewSlug = a.slug || slugifyTitle(a.title || "");
              return (
                <Paper
                  key={a.id || a.slug || viewSlug}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: "16px",
                    border: "1px solid #f1f5f9",
                    mb: 1.5,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#cbd5e1",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  {a.image_url ? (
                    <Box
                      component="img"
                      src={a.image_url}
                      alt={a.title || ""}
                      sx={{
                        width: 90,
                        height: 64,
                        objectFit: "cover",
                        borderRadius: "10px",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 90,
                        height: 64,
                        borderRadius: "10px",
                        bgcolor: "#f1f5f9",
                        color: "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ImageOutlinedIcon />
                    </Box>
                  )}

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 700,
                        color: "#1e293b",
                        fontSize: { xs: 14, md: 16 },
                        lineHeight: 1.3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.title || "(Untitled)"}
                    </Typography>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      sx={{ mt: 0.5, color: "#64748b", fontSize: 12 }}
                    >
                      <Typography variant="caption">
                        {formatDate(a.date)}
                      </Typography>
                      {a.category && (
                        <>
                          <Box
                            sx={{
                              width: 3,
                              height: 3,
                              borderRadius: "50%",
                              bgcolor: "#cbd5e1",
                            }}
                          />
                          <Typography variant="caption">
                            {a.category}
                          </Typography>
                        </>
                      )}
                      {a.country && (
                        <>
                          <Box
                            sx={{
                              width: 3,
                              height: 3,
                              borderRadius: "50%",
                              bgcolor: "#cbd5e1",
                            }}
                          />
                          <Typography variant="caption">
                            {a.country}
                          </Typography>
                        </>
                      )}
                    </Stack>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{
                      color: "#475569",
                      bgcolor: "#f1f5f9",
                      px: 1.25,
                      py: 0.5,
                      borderRadius: "999px",
                      display: { xs: "none", md: "inline-flex" },
                    }}
                    title={`${formatNum(articleViews(a))} views`}
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                    <Typography
                      sx={{
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      {formatNum(articleViews(a))}
                    </Typography>
                  </Stack>

                  <Chip
                    label={a.status || "unknown"}
                    size="small"
                    sx={{
                      bgcolor: status.bg,
                      color: status.fg,
                      fontWeight: 700,
                      textTransform: "capitalize",
                      fontFamily: "'Outfit', sans-serif",
                      display: { xs: "none", sm: "inline-flex" },
                    }}
                  />

                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="View">
                      <IconButton
                        component={Link}
                        href={`/news/${viewSlug}`}
                        size="small"
                        sx={{ color: "#0ea5e9" }}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() =>
                          router.push(
                            `/profile/news-articles/${viewSlug}/edit`
                          )
                        }
                        size="small"
                        sx={{ color: "#10b981" }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hide">
                      <IconButton
                        onClick={() => setConfirmTarget(a)}
                        size="small"
                        sx={{ color: "#ef4444" }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Paper>
              );
            })}
          </Box>
        )}

        {!loading && !error && !search.trim() && page < lastPage && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outlined"
              startIcon={
                loadingMore ? (
                  <CircularProgress size={16} sx={{ color: "inherit" }} />
                ) : null
              }
              sx={{
                borderRadius: 999,
                px: 4,
                py: 1.25,
                borderColor: "#cbd5e1",
                color: "#0f172a",
                fontWeight: 700,
                textTransform: "none",
                fontFamily: "'Outfit', sans-serif",
                "&:hover": {
                  borderColor: "#0ea5e9",
                  bgcolor: "#f0f9ff",
                  color: "#0ea5e9",
                },
              }}
            >
              {loadingMore
                ? "Loading…"
                : `Load more (page ${page + 1} of ${lastPage})`}
            </Button>
          </Box>
        )}
      </Box>

      <Dialog
        open={Boolean(confirmTarget)}
        onClose={() => !deleting && setConfirmTarget(null)}
        slotProps={{ paper: { sx: { borderRadius: "16px" } } }}
      >
        <DialogTitle
          sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}
        >
          Hide this article?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{confirmTarget?.title || "This article"}</strong> will be
            hidden from the public news page. The data stays in the database
            and you can restore it later by changing its status back to{" "}
            <em>published</em>.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmTarget(null)}
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleHide}
            disabled={deleting}
            variant="contained"
            color="warning"
            sx={{ textTransform: "none", borderRadius: "10px" }}
          >
            {deleting ? "Hiding…" : "Hide article"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
