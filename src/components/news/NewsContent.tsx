"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Typography,
  Skeleton,
  Chip,
  Tabs,
  Tab,
  Stack,
  Pagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Link from "next/link";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import AxiosInstance from "@/lib/AxiosInstance";
import { normalizeArticle, slugifyTitle } from "@/lib/newsHelpers";
import type { NewsArticle, NewsPage } from "@/types";

const ACCENT = "#fbbf24"; // gold accent for category tags + indicator

interface NewsApiResponse {
  data?: NewsArticle[] | { data?: NewsArticle[] };
  meta?: { current_page?: number; last_page?: number };
  error?: string;
  message?: string;
}

function Container({
  children,
  sx,
  id,
}: {
  children: ReactNode;
  sx?: Record<string, unknown>;
  id?: string;
}) {
  return (
    <Box
      id={id}
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

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(d);
}

// =============================================================================
//   SUBCOMPONENTS
// =============================================================================

// Image with placeholder fallback when src is missing.
function ArticleImage({
  src,
  alt,
  sx,
}: {
  src?: string | null;
  alt?: string;
  sx?: Record<string, unknown>;
}) {
  if (src) {
    return (
      <Box
        component="img"
        src={src}
        alt={alt || ""}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          ...sx,
        }}
      />
    );
  }
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "#1e293b",
        backgroundImage: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.35)",
        ...sx,
      }}
    >
      <ImageOutlinedIcon sx={{ fontSize: 60 }} />
    </Box>
  );
}

function BigHeroCard({ article }: { article?: NewsArticle | null }) {
  if (!article) return null;
  const to = `/news/${article.slug || slugifyTitle(article.title || "")}`;
  return (
    <Box
      component={Link}
      href={to}
      sx={{
        position: "relative",
        display: "block",
        // Heights match the right-column 2x2 grid below: (smallCard*2) + gap
        height: { xs: 320, sm: 536, md: 556, lg: 656 },
        borderRadius: 2,
        overflow: "hidden",
        textDecoration: "none",
        color: "#fff",
        "&:hover img": { transform: "scale(1.03)" },
      }}
    >
      <ArticleImage
        src={article.image_url}
        alt={article.title}
        sx={{ transition: "transform 0.5s ease" }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      {article.category && (
        <Chip
          label={article.category}
          size="small"
          sx={{
            position: "absolute",
            top: { xs: 12, md: 16 },
            left: { xs: 12, md: 16 },
            bgcolor: "rgba(0,0,0,0.55)",
            color: "#fff",
            fontWeight: 700,
            fontSize: { xs: 10, md: 12 },
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        />
      )}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          p: { xs: 2, md: 3 },
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: 20, sm: 24, md: 30, lg: 36 },
            lineHeight: 1.15,
            textShadow: "0 3px 14px rgba(0,0,0,0.6)",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
          <AccessTimeIcon sx={{ fontSize: 14, opacity: 0.85 }} />
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            {formatDate(article.date)}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

function SmallHeroCard({ article }: { article?: NewsArticle | null }) {
  if (!article) return null;
  const to = `/news/${article.slug || slugifyTitle(article.title || "")}`;
  return (
    <Box
      component={Link}
      href={to}
      sx={{
        position: "relative",
        display: "block",
        // Heights ladder up with viewport. The big card on the left uses
        // (smallCardHeight * 2) + gap so they always line up.
        height: { xs: 160, sm: 260, md: 270, lg: 320 },
        borderRadius: 2,
        overflow: "hidden",
        textDecoration: "none",
        color: "#fff",
        "&:hover img": { transform: "scale(1.05)" },
      }}
    >
      <ArticleImage
        src={article.image_url}
        alt={article.title}
        sx={{ transition: "transform 0.5s ease" }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      {article.category && (
        <Chip
          label={article.category}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            bgcolor: "rgba(0,0,0,0.55)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 10,
            height: 22,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        />
      )}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          p: { xs: 1.5, md: 2 },
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: { xs: 13, sm: 14, md: 16, lg: 18 },
            lineHeight: 1.2,
            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.75 }}>
          <AccessTimeIcon sx={{ fontSize: 12, opacity: 0.8 }} />
          <Typography variant="caption" sx={{ fontSize: 11, opacity: 0.8 }}>
            {formatDate(article.date)}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

function PopularCard({ article }: { article?: NewsArticle | null }) {
  if (!article) return null;
  const to = `/news/${article.slug || slugifyTitle(article.title || "")}`;
  const views = Number(article.views_count ?? article.views ?? 0) || 0;
  return (
    <Box
      component={Link}
      href={to}
      sx={{
        position: "relative",
        display: "block",
        height: { xs: 220, sm: 240, md: 240, lg: 280 },
        borderRadius: 2,
        overflow: "hidden",
        textDecoration: "none",
        color: "#fff",
        "&:hover img": { transform: "scale(1.05)" },
      }}
    >
      <ArticleImage
        src={article.image_url}
        alt={article.title}
        sx={{ transition: "transform 0.5s ease" }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      {article.category && (
        <Chip
          label={article.category}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            bgcolor: "rgba(0,0,0,0.55)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        />
      )}
      <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: 2 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: { xs: 15, sm: 16, md: 17, lg: 19 },
            lineHeight: 1.25,
            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTimeIcon sx={{ fontSize: 12, opacity: 0.8 }} />
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {formatDate(article.date)}
            </Typography>
          </Stack>
          <Box
            sx={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.5)",
            }}
          />
          <Stack direction="row" spacing={0.5} alignItems="center">
            <VisibilityOutlinedIcon sx={{ fontSize: 14, opacity: 0.9 }} />
            <Typography
              variant="caption"
              sx={{ opacity: 0.9, fontWeight: 600 }}
            >
              {views.toLocaleString()}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

function LatestNewsItem({ article }: { article?: NewsArticle | null }) {
  if (!article) return null;
  const to = `/news/${article.slug || slugifyTitle(article.title || "")}`;
  return (
    <Box
      component={Link}
      href={to}
      sx={{
        display: "flex",
        gap: 1.5,
        mb: 2,
        textDecoration: "none",
        color: "inherit",
        "&:hover .latest-title": { color: "info.main" },
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 60,
          flexShrink: 0,
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <ArticleImage src={article.image_url} alt={article.title} />
      </Box>
      <Box>
        <Typography
          className="latest-title"
          sx={{
            fontWeight: 600,
            fontSize: 13,
            lineHeight: 1.3,
            color: "#0f172a",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            transition: "color 0.2s",
          }}
        >
          {article.title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block" }}
        >
          {formatDate(article.date)}
        </Typography>
      </Box>
    </Box>
  );
}

function articleExcerpt(a: NewsArticle): string {
  if (a.excerpt) return a.excerpt;
  if (a.description) return a.description;
  if (typeof a.summary === "string") return a.summary;
  if (Array.isArray(a.summary)) return a.summary.join(" ");
  return "";
}

// Larger, more readable article row used inside the calendar day modal.
function ModalNewsItem({
  article,
  onNavigate,
}: {
  article?: NewsArticle | null;
  onNavigate?: () => void;
}) {
  if (!article) return null;
  const to = `/news/${article.slug || slugifyTitle(article.title || "")}`;
  const views = Number(article.views_count ?? article.views ?? 0) || 0;
  const excerpt = articleExcerpt(article);
  return (
    <Box
      component={Link}
      href={to}
      onClick={onNavigate}
      sx={{
        display: "flex",
        gap: { xs: 1.5, sm: 2.5 },
        py: 2,
        textDecoration: "none",
        color: "inherit",
        borderBottom: "1px solid #eef2f7",
        "&:last-of-type": { borderBottom: "none" },
        "&:hover .modal-title": { color: "info.main" },
        "&:hover img": { transform: "scale(1.05)" },
      }}
    >
      <Box
        sx={{
          width: { xs: 110, sm: 170 },
          height: { xs: 80, sm: 115 },
          flexShrink: 0,
          borderRadius: 1.5,
          overflow: "hidden",
        }}
      >
        <ArticleImage
          src={article.image_url}
          alt={article.title}
          sx={{ transition: "transform 0.4s ease" }}
        />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        {article.category && (
          <Chip
            label={article.category}
            size="small"
            sx={{
              mb: 0.75,
              height: 22,
              bgcolor: "#fff7e6",
              color: "#92400e",
              fontWeight: 700,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          />
        )}
        <Typography
          className="modal-title"
          sx={{
            fontWeight: 700,
            fontSize: { xs: 16, sm: 18 },
            lineHeight: 1.3,
            color: "#0f172a",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            transition: "color 0.2s",
          }}
        >
          {article.title}
        </Typography>
        {excerpt && (
          <Typography
            sx={{
              mt: 0.75,
              fontSize: 14,
              lineHeight: 1.5,
              color: "#475569",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {excerpt}
          </Typography>
        )}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ mt: 1, color: "#94a3b8" }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTimeIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontSize: 12.5 }}>
              {formatDate(article.date)}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
            <Typography variant="caption" sx={{ fontSize: 12.5, fontWeight: 600 }}>
              {views.toLocaleString()}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

function SidebarBlock({
  title,
  children,
  sx,
}: {
  title: string;
  children: ReactNode;
  sx?: Record<string, unknown>;
}) {
  return (
    <Box sx={{ mb: 4, ...sx }}>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: 18,
          mb: 2,
          pb: 1,
          borderBottom: "2px solid",
          borderColor: "#e5e7eb",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -2,
            left: 0,
            width: 50,
            height: 2,
            bgcolor: ACCENT,
          },
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Month-view calendar for the sidebar. Highlights today and marks any day in
// the displayed month that has at least one published article with a dot.
// "Today"/month are derived on mount (not during SSR) to avoid a hydration
// mismatch when the server timezone differs from the visitor's.
function SidebarCalendar({ articles }: { articles: NewsArticle[] }) {
  const [today, setToday] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState<Date | null>(null); // 1st of shown month
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    // Derive "today" on the client only — running this during SSR would risk a
    // hydration mismatch when the server timezone differs from the visitor's.
    const now = new Date();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(now);
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);

  // Map each day-of-month in the displayed month to the articles published on
  // it, so clicking a date can list them in the modal.
  const newsByDay = useMemo(() => {
    const map = new Map<number, NewsArticle[]>();
    if (!viewDate) return map;
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    for (const a of articles) {
      if (!a.date) continue;
      const d = new Date(a.date);
      if (Number.isNaN(d.getTime())) continue;
      if (d.getFullYear() === y && d.getMonth() === m) {
        const day = d.getDate();
        const list = map.get(day);
        if (list) list.push(a);
        else map.set(day, [a]);
      }
    }
    return map;
  }, [articles, viewDate]);

  // Reserve space until mounted so the sidebar doesn't shift.
  if (!viewDate || !today) {
    return <Skeleton variant="rounded" height={300} />;
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  const dayCount =
    selectedDay !== null ? newsByDay.get(selectedDay)?.length ?? 0 : 0;

  return (
    <Box
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        p: 2,
        bgcolor: "#fff",
      }}
    >
      {/* Month header + navigation */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1.5 }}
      >
        <IconButton
          size="small"
          aria-label="Previous month"
          onClick={() => {
            setViewDate(new Date(year, month - 1, 1));
            setSelectedDay(null);
          }}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
          {monthLabel}
        </Typography>
        <IconButton
          size="small"
          aria-label="Next month"
          onClick={() => {
            setViewDate(new Date(year, month + 1, 1));
            setSelectedDay(null);
          }}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* Weekday labels */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 0.5 }}>
        {WEEKDAYS.map((w) => (
          <Typography
            key={w}
            sx={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              py: 0.5,
            }}
          >
            {w}
          </Typography>
        ))}
      </Box>

      {/* Day grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          rowGap: 0.5,
        }}
      >
        {cells.map((d, i) => {
          if (d === null) return <Box key={`empty-${i}`} />;
          const isToday = isCurrentMonth && d === todayDate;
          const count = newsByDay.get(d)?.length ?? 0;
          const hasNews = count > 0;
          return (
            <Box
              key={`day-${d}`}
              role="button"
              tabIndex={0}
              aria-label={`${monthLabel} ${d}${
                hasNews ? ` — ${count} article${count > 1 ? "s" : ""}` : ""
              }`}
              onClick={() => setSelectedDay(d)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedDay(d);
                }
              }}
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "1 / 1",
                fontSize: 13,
                fontWeight: isToday ? 800 : 500,
                borderRadius: "50%",
                cursor: "pointer",
                userSelect: "none",
                color: isToday ? "#0f172a" : "#334155",
                bgcolor: isToday ? ACCENT : "transparent",
                transition: "background-color 0.15s",
                "&:hover": { bgcolor: isToday ? ACCENT : "#f1f5f9" },
              }}
            >
              {d}
              {hasNews && !isToday && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 3,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    bgcolor: ACCENT,
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Day detail modal: news published on the clicked date */}
      <Dialog
        open={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        fullWidth
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: { borderRadius: 3, width: "100%" },
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
            pr: 1,
          }}
        >
          <Box>
            <Typography
              sx={{ fontWeight: 800, fontSize: { xs: 20, sm: 24 }, lineHeight: 1.2 }}
            >
              {selectedDay !== null
                ? new Intl.DateTimeFormat("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(year, month, selectedDay))
                : ""}
            </Typography>
            <Typography
              sx={{ mt: 0.75, fontSize: 15, fontWeight: 600, color: "#64748b" }}
            >
              {dayCount} {dayCount === 1 ? "news article" : "news articles"}{" "}
              created
            </Typography>
          </Box>
          <IconButton
            aria-label="Close"
            onClick={() => setSelectedDay(null)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 1 }}>
          {dayCount > 0 ? (
            newsByDay
              .get(selectedDay!)!
              .map((a, idx) => (
                <ModalNewsItem
                  key={`modal-${a.slug || idx}`}
                  article={a}
                  onNavigate={() => setSelectedDay(null)}
                />
              ))
          ) : (
            <Typography
              color="text.secondary"
              sx={{ py: 5, textAlign: "center", fontSize: 16 }}
            >
              No news published on this day.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// =============================================================================
//   MAIN COMPONENT
// =============================================================================

const POPULAR_PER_PAGE = 8;

interface NewsContentProps {
  initial: NewsPage;
}

export default function NewsContent({ initial }: NewsContentProps) {
  // The server hands us page 1 already normalized + a meta lastPage. If
  // there are more pages, fetch them all in parallel after hydration so
  // the popular-news section has the entire pool to work with.
  const [items, setItems] = useState<NewsArticle[]>(
    (initial.items || []).map((a) => normalizeArticle(a)).filter(Boolean) as NewsArticle[]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initial.error ?? null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [popularPage, setPopularPage] = useState(1);

  // Fetch remaining pages client-side if there are any.
  useEffect(() => {
    if (initial.lastPage <= 1) return;
    let cancelled = false;
    const fetchRest = async () => {
      setLoading(true);
      try {
        const extract = (root: NewsApiResponse | undefined): NewsArticle[] => {
          if (!root) return [];
          if (Array.isArray(root.data)) return root.data;
          const nested = (root.data as { data?: NewsArticle[] } | undefined)
            ?.data;
          return Array.isArray(nested) ? nested : [];
        };
        const responses = await Promise.all(
          Array.from({ length: initial.lastPage - 1 }, (_, i) =>
            AxiosInstance.get<NewsApiResponse>(
              `news-articles-v2?page=${i + 2}`
            )
              .then((r) => extract(r?.data))
              .catch(() => [] as NewsArticle[])
          )
        );
        const more = responses.flat().map((a) => normalizeArticle(a)).filter(
          Boolean
        ) as NewsArticle[];
        if (!cancelled && more.length > 0) {
          setItems((prev) => [...prev, ...more]);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Unknown error";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchRest();
    return () => {
      cancelled = true;
    };
  }, [initial.lastPage]);

  // Derive categories from articles (with "All" prepended)
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return ["All", ...Array.from(set)];
  }, [items]);

  // De-duplicate first: the API returns the same article (same id/slug) on
  // more than one page, which showed up as doubled cards. Keep the first
  // occurrence of each id (falling back to slug/title).
  const uniqueItems = useMemo(() => {
    const seen = new Set<string>();
    const out: NewsArticle[] = [];
    for (const a of items) {
      const key = String(a.id ?? a.slug ?? a.title ?? "");
      if (key && seen.has(key)) continue;
      if (key) seen.add(key);
      out.push(a);
    }
    return out;
  }, [items]);

  // Split articles into sections
  const heroBig = uniqueItems[0];
  const heroSmall = uniqueItems.slice(1, 5);

  // Popular news: every unique article ranked by views (most-viewed first), so
  // the single most-viewed article always leads. Filtered by category, then
  // paginated below. (Previously excluded the hero set, which hid the genuine
  // top articles from this list.)
  const popularFiltered = useMemo(() => {
    return uniqueItems
      .filter((a) => activeCategory === "All" || a.category === activeCategory)
      .slice()
      .sort(
        (a, b) =>
          (Number(b?.views_count ?? b?.views ?? 0) || 0) -
          (Number(a?.views_count ?? a?.views ?? 0) || 0)
      );
  }, [uniqueItems, activeCategory]);
  const popularPageCount = Math.max(
    1,
    Math.ceil(popularFiltered.length / POPULAR_PER_PAGE)
  );

  // Reset to first page when category changes or pool shrinks below page.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPopularPage(1);
  }, [activeCategory]);
  useEffect(() => {
    if (popularPage > popularPageCount) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPopularPage(1);
    }
  }, [popularPageCount, popularPage]);

  const popularStart = (popularPage - 1) * POPULAR_PER_PAGE;
  const popularArticles = popularFiltered.slice(
    popularStart,
    popularStart + POPULAR_PER_PAGE
  );

  const latestArticles = uniqueItems.slice(0, 10);

  // ----- Render -----

  if (loading && items.length === 0) {
    return (
      <Container sx={{ py: 5 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton
              variant="rounded"
              sx={{ height: { xs: 320, sm: 536, md: 556, lg: 656 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Grid size={{ xs: 6 }} key={i}>
                  <Skeleton
                    variant="rounded"
                    sx={{ height: { xs: 160, sm: 260, md: 270, lg: 320 } }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          {error ? "Failed to load news." : "No news articles yet."}
        </Typography>
        <Typography color="text.secondary">
          {error ? String(error) : "Check back soon for the latest stories."}
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 8, bgcolor: "#fff" }}>
      {/* =================== HERO =================== */}
      <Container sx={{ pt: 4 }}>
        <Typography
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: 24, md: 32 },
            fontStyle: "italic",
            color: "#0f172a",
            mb: { xs: 2, md: 2.5 },
          }}
        >
          Global Pinoy Updates
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <BigHeroCard article={heroBig} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={2}>
              {heroSmall.map((a, idx) => (
                <Grid size={{ xs: 6 }} key={`hero-small-${a.slug || idx}`}>
                  <SmallHeroCard article={a} />
                </Grid>
              ))}
              {/* Pad with placeholders if fewer than 4 */}
              {Array.from({ length: Math.max(0, 4 - heroSmall.length) }).map(
                (_, i) => (
                  <Grid size={{ xs: 6 }} key={`hero-pad-${i}`}>
                    <Box
                      sx={{
                        height: { xs: 160, sm: 260, md: 270, lg: 320 },
                        borderRadius: 2,
                        bgcolor: "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#94a3b8",
                      }}
                    >
                      <ImageOutlinedIcon sx={{ fontSize: 40 }} />
                    </Box>
                  </Grid>
                )
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* =================== POPULAR NEWS =================== */}
      <Container id="popular-news" sx={{ mt: 6, scrollMarginTop: 90 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3, borderBottom: "1px solid #e5e7eb", pb: 1 }}
        >
          <Typography
            component="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: 22, md: 28 },
              fontStyle: "italic",
            }}
          >
            Popular news
          </Typography>
          <Tabs
            value={activeCategory}
            onChange={(_, v) => setActiveCategory(v as string)}
            variant="scrollable"
            scrollButtons="auto"
            slotProps={{
              indicator: { sx: { bgcolor: ACCENT, height: 3 } },
            }}
            sx={{
              minHeight: 40,
              "& .MuiTab-root": {
                minHeight: 40,
                textTransform: "none",
                fontWeight: 600,
                fontSize: 14,
                color: "#64748b",
                "&.Mui-selected": { color: ACCENT },
              },
            }}
          >
            {categories.map((c) => (
              <Tab key={c} value={c} label={c} />
            ))}
          </Tabs>
        </Stack>

        <Grid container spacing={4}>
          {/* Articles grid */}
          <Grid size={{ xs: 12, md: 8 }}>
            {popularArticles.length === 0 ? (
              <Box
                sx={{
                  p: 6,
                  textAlign: "center",
                  border: "1px dashed #cbd5e1",
                  borderRadius: 2,
                }}
              >
                <Typography sx={{ fontWeight: 600, color: "#475569" }}>
                  No articles found.
                </Typography>
              </Box>
            ) : (
              <>
                <Grid container spacing={3}>
                  {popularArticles.map((a, idx) => (
                    <Grid
                      size={{ xs: 12, sm: 6 }}
                      key={`popular-${a.slug || idx}`}
                    >
                      <PopularCard article={a} />
                    </Grid>
                  ))}
                </Grid>

                {popularPageCount > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 4,
                    }}
                  >
                    <Pagination
                      count={popularPageCount}
                      page={popularPage}
                      onChange={(_, v) => {
                        setPopularPage(v);
                        // Scroll the section into view so the user doesn't
                        // lose context after clicking a page number.
                        if (typeof document !== "undefined") {
                          const el = document.getElementById("popular-news");
                          if (el) {
                            el.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }
                        }
                      }}
                      shape="rounded"
                      color="primary"
                      siblingCount={1}
                      sx={{
                        "& .MuiPaginationItem-root": {
                          fontFamily: "'Outfit', sans-serif",
                          fontWeight: 700,
                          borderRadius: "10px",
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <SidebarBlock title="Latest news">
              {latestArticles.map((a, idx) => (
                <LatestNewsItem
                  key={`latest-${a.slug || idx}`}
                  article={a}
                />
              ))}
            </SidebarBlock>
            <SidebarBlock title="Calendar">
              <SidebarCalendar articles={uniqueItems} />
            </SidebarBlock>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
