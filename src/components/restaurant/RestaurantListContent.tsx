"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  Pagination,
  Tooltip,
  IconButton,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import SearchIcon from "@mui/icons-material/Search";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import LocalDiningRoundedIcon from "@mui/icons-material/LocalDiningRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  countryCodes,
  getCountryName,
  normalizeToAlpha2,
} from "@/lib/countryCodes";
import { useAuthProvider } from "@/providers/AuthProvider";
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import type { Restaurant } from "@/types";
import { restaurantUrl } from "@/lib/eventUrl";

const HERO_IMG =
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/bayanihan/restaurant/bayanihan-cover.webp";

const PAGE_SIZE = 9;

function flagSrc(code: string) {
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

function Container({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      sx={[
        {
          width: "100%",
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
          mx: "auto",
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  );
}

interface Props {
  initialRestaurants: Restaurant[];
}

export default function RestaurantListContent({
  initialRestaurants,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData } = useAuthProvider();

  const restaurants = initialRestaurants;
  const [query, setQuery] = useState("");
  const [selCountries, setSelCountries] = useState<string[]>([]);
  const [selCats, setSelCats] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Parallax: hero image translates down + scales slightly as user scrolls past.
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1.12, 1.32]);

  useEffect(() => {
    const qpCountry = searchParams.get("country") || "";
    const qpCity = searchParams.get("city") || "";
    if (qpCountry) {
      const code = normalizeToAlpha2(qpCountry);
      const displayName = code ? getCountryName(code) : qpCountry;
      setSelCountries([displayName]);
    }
    if (qpCity) setQuery(qpCity);
  }, [searchParams]);

  const countryOptions = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((r) => {
      if (r.country) set.add(r.country);
    });
    return Array.from(set).sort();
  }, [restaurants]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((r) => {
      const c = (r.category || "").trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [restaurants]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return restaurants.filter((r) => {
      const matchesCountry =
        selCountries.length === 0 ||
        selCountries.includes(String(r.country || ""));
      const matchesQ =
        !q ||
        String(r.name || "")
          .toLowerCase()
          .includes(q) ||
        String(r.city || "")
          .toLowerCase()
          .includes(q);
      const matchesCat =
        selCats.length === 0 || selCats.includes(String(r.category || ""));
      return matchesCountry && matchesQ && matchesCat;
    });
  }, [restaurants, query, selCountries, selCats]);

  useEffect(() => {
    setPage(1);
  }, [query, selCountries, selCats]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  const totalRestaurants = restaurants.length;
  const uniqueCountries = countryOptions.length;
  const hasActiveFilters =
    !!query || selCountries.length > 0 || selCats.length > 0;

  const clearAll = () => {
    setQuery("");
    setSelCountries([]);
    setSelCats([]);
    router.replace("?", { scroll: false });
  };

  const handleAddRestaurant = () => {
    if (userData) router.push("/profile/create-restaurant");
    else router.push("/sign-in");
  };

  const toggleCountry = (c: string) => {
    setSelCountries((prev) => {
      const selected = prev.includes(c);
      const next = selected
        ? prev.filter((x) => x !== c)
        : prev.length < 3
          ? [...prev, c]
          : prev;
      const first = next[0] || "";
      const params = new URLSearchParams(searchParams.toString());
      if (first) params.set("country", first);
      else params.delete("country");
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
      return next;
    });
  };

  const toggleCategory = (c: string) =>
    setSelCats((prev) =>
      prev.includes(c)
        ? prev.filter((x) => x !== c)
        : prev.length < 3
          ? [...prev, c]
          : prev
    );

  const activeFilterCount =
    (query ? 1 : 0) + selCountries.length + selCats.length;

  /* ──────────── Filters panel (shared by sidebar + mobile drawer) ──────── */
  const FiltersPanel = (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "#fff",
        borderRadius: 4,
        border: "1px solid #eef2f7",
        boxShadow: "0 16px 40px -20px rgba(15,23,42,0.18)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: { md: "calc(100vh - 32px)" },
        minHeight: { xs: 0, md: 720 },
      }}
    >
      {/* ── Header (gradient) ────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0ea5e9 140%)",
          color: "#fff",
          px: 2.8,
          py: 2.4,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -28,
            right: -28,
            width: 120,
            height: 120,
            borderRadius: "50%",
            bgcolor: "rgba(14,165,233,0.22)",
            filter: "blur(2px)",
          }}
        />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ position: "relative" }}
        >
          <Stack direction="row" alignItems="center" spacing={1.4}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.14)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.22)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <TuneRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-outfit), Outfit, sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1,
                }}
              >
                Refine
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-urbanist), Urbanist, sans-serif",
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  lineHeight: 1.1,
                  mt: 0.3,
                }}
              >
                Filters
              </Typography>
            </Box>
          </Stack>
          {activeFilterCount > 0 && (
            <Box
              sx={{
                px: 1.2,
                py: 0.3,
                borderRadius: 999,
                bgcolor: "#fbbf24",
                color: "#0f172a",
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: "0.04em",
              }}
            >
              {activeFilterCount} active
            </Box>
          )}
        </Stack>

        {/* Quick stats inside header */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 2, position: "relative" }}
        >
          <Box
            sx={{
              flex: 1,
              bgcolor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 2,
              px: 1.2,
              py: 1,
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase",
              }}
            >
              Showing
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-urbanist), Urbanist, sans-serif",
                fontWeight: 900,
                fontSize: "1.3rem",
                lineHeight: 1,
                mt: 0.2,
              }}
            >
              {filtered.length}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              bgcolor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 2,
              px: 1.2,
              py: 1,
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase",
              }}
            >
              Total
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-urbanist), Urbanist, sans-serif",
                fontWeight: 900,
                fontSize: "1.3rem",
                lineHeight: 1,
                mt: 0.2,
              }}
            >
              {restaurants.length}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ── Scrollable filter body ────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: 2.8,
          py: 2.6,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": {
            background: "#e2e8f0",
            borderRadius: 10,
          },
        }}
      >
        {/* Search */}
        <Box sx={{ mb: 2.8 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-outfit), Outfit, sans-serif",
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: "0.12em",
              color: "#94a3b8",
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            Search
          </Typography>
          <TextField
            placeholder="Name or city…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
                endAdornment: query ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setQuery("")}
                      sx={{ color: "#94a3b8" }}
                    >
                      <ClearRoundedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                bgcolor: "#f8fafc",
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
                "& fieldset": { borderColor: "transparent" },
                "&:hover fieldset": { borderColor: "#cbd5e1" },
                "&.Mui-focused fieldset": {
                  borderColor: "#0ea5e9",
                  borderWidth: 1.5,
                },
              },
            }}
          />
        </Box>

        {/* Divider */}
        <Box
          sx={{
            height: 1,
            bgcolor: "#f1f5f9",
            mb: 2.4,
          }}
        />

        {/* Countries */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.8}
          sx={{ mb: 1.4 }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              bgcolor: "#fef3c7",
              color: "#92400e",
              display: "grid",
              placeItems: "center",
            }}
          >
            <PublicRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: "0.06em",
                color: "#0f172a",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              Countries
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                color: "#94a3b8",
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
                mt: 0.2,
              }}
            >
              {selCountries.length > 0
                ? `${selCountries.length} selected`
                : `${countryOptions.length} available`}
            </Typography>
          </Box>
          {selCountries.length > 0 && (
            <Button
              size="small"
              onClick={() => {
                setSelCountries([]);
                router.replace("?", { scroll: false });
              }}
              sx={{
                minWidth: "auto",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "none",
                color: "#64748b",
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
                p: 0.4,
              }}
            >
              Reset
            </Button>
          )}
        </Stack>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.8,
            mb: 3,
          }}
        >
          {countryOptions.map((c) => {
            const selected = selCountries.includes(c);
            const cc = (
              countryCodes.find((cc) => cc.name === c)?.code || ""
            ).toUpperCase();
            return (
              <Chip
                key={c}
                onClick={() => toggleCountry(c)}
                label={
                  <Stack direction="row" spacing={0.7} alignItems="center">
                    {cc && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={flagSrc(cc)}
                        alt=""
                        style={{
                          width: 18,
                          height: 13,
                          borderRadius: 2,
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <span>{c}</span>
                  </Stack>
                }
                sx={{
                  borderRadius: 999,
                  px: 0.5,
                  height: 32,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-outfit), Outfit, sans-serif",
                  bgcolor: selected ? "#0f172a" : "#f8fafc",
                  color: selected ? "#fff" : "#475569",
                  border: "1px solid",
                  borderColor: selected ? "#0f172a" : "#e2e8f0",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  "&:hover": {
                    bgcolor: selected ? "#0f172a" : "#f1f5f9",
                    borderColor: selected ? "#0f172a" : "#cbd5e1",
                    transform: "translateY(-1px)",
                  },
                }}
              />
            );
          })}
          {countryOptions.length === 0 && (
            <Typography
              sx={{
                fontSize: 13,
                color: "#94a3b8",
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
              }}
            >
              No countries yet.
            </Typography>
          )}
        </Box>

        {/* Divider */}
        <Box
          sx={{
            height: 1,
            bgcolor: "#f1f5f9",
            mb: 2.4,
          }}
        />

        {/* Categories */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.8}
          sx={{ mb: 1.4 }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              bgcolor: "#dbeafe",
              color: "#1e40af",
              display: "grid",
              placeItems: "center",
            }}
          >
            <LocalDiningRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: "0.06em",
                color: "#0f172a",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              Cuisine
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                color: "#94a3b8",
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
                mt: 0.2,
              }}
            >
              {selCats.length > 0
                ? `${selCats.length} selected`
                : `${categories.length} available`}
            </Typography>
          </Box>
          {selCats.length > 0 && (
            <Button
              size="small"
              onClick={() => setSelCats([])}
              sx={{
                minWidth: "auto",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "none",
                color: "#64748b",
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
                p: 0.4,
              }}
            >
              Reset
            </Button>
          )}
        </Stack>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
          {categories.map((c) => {
            const selected = selCats.includes(c);
            return (
              <Chip
                key={c}
                onClick={() => toggleCategory(c)}
                label={c}
                sx={{
                  borderRadius: 999,
                  px: 0.5,
                  height: 32,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-outfit), Outfit, sans-serif",
                  bgcolor: selected ? "#0ea5e9" : "#f8fafc",
                  color: selected ? "#fff" : "#475569",
                  border: "1px solid",
                  borderColor: selected ? "#0ea5e9" : "#e2e8f0",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  "&:hover": {
                    bgcolor: selected ? "#0ea5e9" : "#f1f5f9",
                    borderColor: selected ? "#0ea5e9" : "#cbd5e1",
                    transform: "translateY(-1px)",
                  },
                }}
              />
            );
          })}
          {categories.length === 0 && (
            <Typography
              sx={{
                fontSize: 13,
                color: "#94a3b8",
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
              }}
            >
              No categories yet.
            </Typography>
          )}
        </Box>
      </Box>

      {/* ── Sticky footer ─────────────────────────────────────────── */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2.5,
          py: 2,
          borderTop: "1px solid #f1f5f9",
          bgcolor: "rgba(248,250,252,0.7)",
          backdropFilter: "blur(6px)",
        }}
      >
        {hasActiveFilters ? (
          <Button
            fullWidth
            onClick={clearAll}
            startIcon={<ClearRoundedIcon />}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 800,
              fontFamily: "var(--font-outfit), Outfit, sans-serif",
              py: 1.1,
              bgcolor: "#fee2e2",
              color: "#b91c1c",
              "&:hover": { bgcolor: "#fecaca" },
            }}
          >
            Clear all filters
          </Button>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
            <RestaurantRoundedIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
            <Typography
              sx={{
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: "#94a3b8",
              }}
            >
              Pick a country or cuisine to narrow down
            </Typography>
          </Stack>
        )}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh", pb: 10 }}>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <Box
        ref={heroRef}
        sx={{
          position: "relative",
          overflow: "hidden",
          height: { xs: 360, sm: 440, md: 520 },
          bgcolor: "#000",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={HERO_IMG}
          alt="Filipino cuisine"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 35%",
            y: heroY,
            scale: heroScale,
            willChange: "transform",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.9) 100%)",
          }}
        />

        <Container
          sx={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            color: "#fff",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              mb: 2,
              px: 1.2,
              py: 0.4,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.22)",
              bgcolor: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
            }}
          >
            <RestaurantRoundedIcon sx={{ fontSize: 16, color: "#fbbf24" }} />
            <Typography
              sx={{
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.88)",
              }}
            >
              Authentic Filipino Cuisine
            </Typography>
          </Stack>

          <Typography
            sx={{
              fontFamily: "var(--font-outfit), Outfit, sans-serif",
              fontWeight: 300,
              fontSize: { xs: 22, sm: 28, md: 38 },
              opacity: 0.92,
              letterSpacing: 0.3,
              mb: 0.5,
            }}
          >
            Connecting the world through
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-urbanist), Urbanist, sans-serif",
              fontWeight: 900,
              fontSize: { xs: 42, sm: 60, md: 86 },
              letterSpacing: "-2px",
              lineHeight: 1.0,
              maxWidth: 900,
              mb: 2,
              textShadow: "0 4px 28px rgba(0,0,0,0.4)",
            }}
          >
            Filipino Cuisine
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mb: 3, flexWrap: "wrap" }}
          >
            <Stack
              direction="row"
              spacing={0.8}
              alignItems="center"
              sx={{
                px: 1.5,
                py: 0.6,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
              }}
            >
              <StorefrontRoundedIcon sx={{ fontSize: 16, color: "#fbbf24" }} />
              <Typography
                sx={{
                  fontFamily: "var(--font-outfit), Outfit, sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {totalRestaurants} restaurants
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={0.8}
              alignItems="center"
              sx={{
                px: 1.5,
                py: 0.6,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
              }}
            >
              <PublicRoundedIcon sx={{ fontSize: 16, color: "#34d399" }} />
              <Typography
                sx={{
                  fontFamily: "var(--font-outfit), Outfit, sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {uniqueCountries} countries
              </Typography>
            </Stack>
          </Stack>

          {(!userData ||
            (userData as { role_id?: number })?.role_id !== 3) && (
            <Button
              onClick={handleAddRestaurant}
              variant="contained"
              startIcon={<StorefrontRoundedIcon />}
              sx={{
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                color: "#0f172a",
                textTransform: "none",
                fontFamily: "var(--font-urbanist), Urbanist, sans-serif",
                fontWeight: 800,
                fontSize: 17,
                px: 3.5,
                py: 1.3,
                borderRadius: 999,
                boxShadow: "0 14px 32px rgba(251,191,36,0.4)",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  filter: "brightness(0.96)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 18px 40px rgba(251,191,36,0.55)",
                },
              }}
            >
              Add Your Restaurant
            </Button>
          )}
        </Container>
      </Box>

      <Container sx={{ pt: 4 }}>
        {/* ── Results header ────────────────────────────────────────── */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: "var(--font-urbanist), Urbanist, sans-serif",
                fontWeight: 900,
                fontSize: { xs: 26, md: 32 },
                color: "#0f172a",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {filtered.length === 0
                ? "No restaurants found"
                : filtered.length === 1
                  ? "1 restaurant"
                  : `${filtered.length} restaurants`}
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
                color: "#64748b",
                fontSize: 14,
                mt: 0.4,
              }}
            >
              {hasActiveFilters
                ? "Filtered results"
                : "Showing all available restaurants"}
            </Typography>
          </Box>

          <Button
            onClick={() => setFiltersOpen((v) => !v)}
            variant="outlined"
            startIcon={<TuneRoundedIcon />}
            endIcon={
              <KeyboardArrowDownRoundedIcon
                sx={{
                  transition: "transform 0.2s ease",
                  transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            }
            sx={{
              display: { xs: "inline-flex", md: "none" },
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              borderColor: "#cbd5e1",
              color: "#0f172a",
              "&:hover": { borderColor: "#0f172a" },
            }}
          >
            Filters
          </Button>
        </Stack>

        {/* Active filter pills */}
        {hasActiveFilters && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}
            useFlexGap
          >
            {query && (
              <Chip
                label={`"${query}"`}
                onDelete={() => setQuery("")}
                sx={chipPill}
              />
            )}
            {selCountries.map((c) => (
              <Chip
                key={c}
                label={c}
                onDelete={() => toggleCountry(c)}
                sx={chipPill}
              />
            ))}
            {selCats.map((c) => (
              <Chip
                key={c}
                label={c}
                onDelete={() => toggleCategory(c)}
                sx={chipPill}
              />
            ))}
            <Button
              size="small"
              onClick={clearAll}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                color: "#0f172a",
                fontFamily: "var(--font-outfit), Outfit, sans-serif",
              }}
            >
              Clear all
            </Button>
          </Stack>
        )}

        <Grid container spacing={3}>
          {/* Sidebar (desktop) */}
          <Grid
            size={{ xs: 12, md: 3.5, lg: 3 }}
            sx={{ display: { xs: filtersOpen ? "block" : "none", md: "block" } }}
          >
            <Box
              sx={{
                position: { md: "sticky" },
                top: { md: 16 },
                height: { md: "calc(100vh - 32px)" },
              }}
            >
              {FiltersPanel}
            </Box>
          </Grid>

          {/* Results grid */}
          <Grid size={{ xs: 12, md: 8.5, lg: 9 }}>
            {paged.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  textAlign: "center",
                  py: 8,
                  px: 3,
                  borderRadius: 4,
                  bgcolor: "#fff",
                  border: "1px dashed #cbd5e1",
                }}
              >
                <RestaurantRoundedIcon
                  sx={{ fontSize: 56, color: "#cbd5e1", mb: 1 }}
                />
                <Typography
                  sx={{
                    fontFamily: "var(--font-urbanist), Urbanist, sans-serif",
                    fontWeight: 800,
                    color: "#0f172a",
                    fontSize: 20,
                  }}
                >
                  No restaurants match your filters
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-outfit), Outfit, sans-serif",
                    color: "#64748b",
                    fontSize: 14,
                    mt: 0.5,
                    mb: 2,
                  }}
                >
                  Try clearing filters or searching for a different keyword.
                </Typography>
                {hasActiveFilters && (
                  <Button
                    onClick={clearAll}
                    variant="contained"
                    disableElevation
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 700,
                      bgcolor: "#0f172a",
                      "&:hover": { bgcolor: "#1e293b" },
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </Paper>
            ) : (
              <Grid container spacing={2.5}>
                {paged.map((r) => {
                  const href = restaurantUrl(r);
                  const countryDisplay = r.country
                    ? getCountryName(normalizeToAlpha2(r.country)) || r.country
                    : "";
                  const cc = (
                    countryCodes.find((cc) => cc.name === r.country)?.code || ""
                  ).toUpperCase();

                  return (
                    <Grid
                      size={{ xs: 12, sm: 6, md: 6, lg: 3 }}
                      key={String(r.id ?? r.slug)}
                    >
                      <Paper
                        component={NextLink}
                        href={href}
                        elevation={0}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          borderRadius: 4,
                          overflow: "hidden",
                          bgcolor: "#fff",
                          border: "1px solid #eef2f7",
                          textDecoration: "none",
                          color: "inherit",
                          boxShadow:
                            "0 8px 24px -16px rgba(15,23,42,0.10)",
                          transition:
                            "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow:
                              "0 24px 48px -16px rgba(15,23,42,0.16)",
                            borderColor: "#cbd5e1",
                            "& .card-cover": { transform: "scale(1.06)" },
                          },
                        }}
                      >
                        {/* Cover */}
                        <Box
                          sx={{
                            position: "relative",
                            pt: "62%",
                            overflow: "hidden",
                            bgcolor: "#f1f5f9",
                          }}
                        >
                          {r.cover && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              className="card-cover"
                              src={r.cover}
                              alt={r.name || ""}
                              style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition:
                                  "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                              }}
                            />
                          )}
                          <Box
                            sx={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)",
                              pointerEvents: "none",
                            }}
                          />

                          {r.city && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 12,
                                left: 12,
                                px: 1.1,
                                py: 0.4,
                                borderRadius: 999,
                                bgcolor: "rgba(15,23,42,0.6)",
                                backdropFilter: "blur(8px)",
                                color: "#fff",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.4,
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily:
                                  "var(--font-outfit), Outfit, sans-serif",
                                border: "1px solid rgba(255,255,255,0.18)",
                              }}
                            >
                              <PlaceRoundedIcon sx={{ fontSize: 14 }} />
                              {r.city}
                            </Box>
                          )}

                          {cc && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                width: 36,
                                height: 26,
                                borderRadius: 1,
                                overflow: "hidden",
                                border: "2px solid rgba(255,255,255,0.85)",
                                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={flagSrc(cc)}
                                alt={r.country || ""}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </Box>
                          )}

                          {/* Logo bottom-left of cover */}
                          {r.logo && (
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: -22,
                                left: 16,
                                width: 56,
                                height: 56,
                                borderRadius: 2,
                                overflow: "hidden",
                                bgcolor: "#fff",
                                border: "3px solid #fff",
                                boxShadow:
                                  "0 8px 20px rgba(15,23,42,0.18)",
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={r.logo}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </Box>
                          )}
                        </Box>

                        {/* Body */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            flex: 1,
                            p: 2.5,
                            pt: r.logo ? 4 : 2.5,
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily:
                                "var(--font-urbanist), Urbanist, sans-serif",
                              fontWeight: 800,
                              fontSize: 19,
                              color: "#0f172a",
                              lineHeight: 1.25,
                              letterSpacing: "-0.01em",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              minHeight: 48,
                            }}
                          >
                            {r.name || "Untitled Restaurant"}
                          </Typography>

                          {r.category && (
                            <Box
                              sx={{
                                mt: 0.6,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.5,
                                color: "#0ea5e9",
                                alignSelf: "flex-start",
                              }}
                            >
                              <LocalDiningRoundedIcon sx={{ fontSize: 16 }} />
                              <Typography
                                sx={{
                                  fontFamily:
                                    "var(--font-outfit), Outfit, sans-serif",
                                  fontWeight: 700,
                                  fontSize: 13,
                                }}
                              >
                                {r.category}
                              </Typography>
                            </Box>
                          )}

                          <Box sx={{ flex: 1 }} />

                          <Box
                            sx={{
                              mt: 2,
                              pt: 2,
                              borderTop: "1px solid #f1f5f9",
                              display: "flex",
                              alignItems: "center",
                              gap: 1.2,
                            }}
                          >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontFamily:
                                    "var(--font-outfit), Outfit, sans-serif",
                                  fontWeight: 700,
                                  fontSize: 14,
                                  color: "#0f172a",
                                }}
                                noWrap
                              >
                                {countryDisplay || "—"}
                              </Typography>
                              <Tooltip title={r.address || ""} arrow>
                                <Typography
                                  sx={{
                                    fontFamily:
                                      "var(--font-outfit), Outfit, sans-serif",
                                    fontSize: 13,
                                    color: "#64748b",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {r.address || "Address not provided"}
                                </Typography>
                              </Tooltip>
                            </Box>
                            <IconButton
                              size="small"
                              sx={{
                                bgcolor: "#f1f5f9",
                                color: "#0f172a",
                                "&:hover": {
                                  bgcolor: "#0f172a",
                                  color: "#fff",
                                },
                              }}
                            >
                              <KeyboardArrowDownRoundedIcon
                                sx={{ transform: "rotate(-90deg)" }}
                              />
                            </IconButton>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}

                {filtered.length > PAGE_SIZE && (
                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 2,
                      }}
                    >
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, v) => setPage(v)}
                        shape="rounded"
                        showFirstButton
                        showLastButton
                        sx={{
                          "& .MuiPaginationItem-root": {
                            borderRadius: 2,
                            fontFamily:
                              "var(--font-outfit), Outfit, sans-serif",
                            fontWeight: 700,
                          },
                          "& .Mui-selected": {
                            bgcolor: "#0f172a !important",
                            color: "#fff",
                            "&:hover": { bgcolor: "#1e293b !important" },
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

const chipPill = {
  borderRadius: 999,
  height: 30,
  fontSize: 13,
  fontWeight: 600,
  fontFamily: "var(--font-outfit), Outfit, sans-serif",
  bgcolor: "#f1f5f9",
  color: "#0f172a",
  "& .MuiChip-deleteIcon": {
    color: "#64748b",
    "&:hover": { color: "#ef4444" },
  },
} as const;
