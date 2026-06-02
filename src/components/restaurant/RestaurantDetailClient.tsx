"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  Avatar,
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Fade,
  IconButton,
  Stack,
  ButtonBase,
  CircularProgress,
  InputAdornment,
  Chip,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { keyframes } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import DirectionsRoundedIcon from "@mui/icons-material/DirectionsRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import AxiosInstance from "@/lib/AxiosInstance";
import StaticMap from "./StaticMap";

const heroFloat = keyframes`
  0%,100% { transform: scale(1.02); }
  50% { transform: scale(1.06); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const clamp2 = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden",
};

const clamp3 = {
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden",
};

interface MenuItem {
  id?: string | number;
  name?: string;
  price?: number | string;
  description?: string;
  avatar?: string;
  category?: string;
}

export interface FetchedRestaurant {
  id?: string | number;
  name?: string;
  category?: string;
  rating?: string | number;
  cover?: string;
  logo?: string;
  feature_image?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  contact_number?: string;
  menus?: MenuItem[];
  geo_coordinate?: unknown;
  geo_coordinates?: unknown;
  geo?: unknown;
  location?: { geo_coordinate?: unknown };
  details?: { geo_coordinate?: unknown };
}

const COUNTRY_CURRENCY: Record<string, string> = {
  Philippines: "PHP",
  Japan: "JPY",
  "United States of America": "USD",
  "United Arab Emirates": "AED",
  Singapore: "SGD",
  Australia: "AUD",
  Canada: "CAD",
  "Saudi Arabia": "SAR",
  Qatar: "QAR",
  "United Kingdom": "GBP",
  "South Korea": "KRW",
  Taiwan: "TWD",
  China: "CNY",
  HongKong: "HKD",
  Malaysia: "MYR",
  Thailand: "THB",
  Vietnam: "VND",
  Italy: "EUR",
  France: "EUR",
  Spain: "EUR",
  Germany: "EUR",
  Greece: "EUR",
  Netherlands: "EUR",
};

const COUNTRY_FLAGS: Record<string, string> = {
  Philippines: "https://flagcdn.com/w320/ph.png",
  Japan: "https://flagcdn.com/w320/jp.png",
  "United States of America": "https://flagcdn.com/w320/us.png",
  Singapore: "https://flagcdn.com/w320/sg.png",
  Australia: "https://flagcdn.com/w320/au.png",
  Canada: "https://flagcdn.com/w320/ca.png",
  "United Kingdom": "https://flagcdn.com/w320/gb.png",
  "South Korea": "https://flagcdn.com/w320/kr.png",
  Taiwan: "https://flagcdn.com/w320/tw.png",
  China: "https://flagcdn.com/w320/cn.png",
  Malaysia: "https://flagcdn.com/w320/my.png",
  Thailand: "https://flagcdn.com/w320/th.png",
  Vietnam: "https://flagcdn.com/w320/vn.png",
};

function brandColorFromCategory(cat?: string): string {
  const c = String(cat || "").toLowerCase();
  if (c.includes("fine")) return "#6b21a8";
  if (c.includes("casual")) return "#0ea5e9";
  if (c.includes("cafe")) return "#b45309";
  if (c.includes("seafood")) return "#0369a1";
  if (c.includes("japanese")) return "#ef4444";
  if (c.includes("mexican")) return "#f59e0b";
  if (c.includes("italian")) return "#16a34a";
  if (c.includes("bbq") || c.includes("barbecue")) return "#7c2d12";
  if (c.includes("fast")) return "#dc2626";
  return "#0f172a";
}

function MenuItemImage({ src, alt }: { src?: string; alt?: string }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
        }}
      >
        <RestaurantRoundedIcon sx={{ fontSize: 36, opacity: 0.5 }} />
      </Box>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || ""}
      onError={() => setErrored(true)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transition: "transform 350ms cubic-bezier(0.22,1,0.36,1)",
      }}
    />
  );
}

export default function RestaurantDetailClient({
  restaurantId,
  initialData,
}: {
  restaurantId: string | number;
  initialData?: FetchedRestaurant | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(!initialData);
  const [rest, setRest] = useState<FetchedRestaurant | null>(
    initialData ?? null
  );
  const [activeCat, setActiveCat] = useState("All");
  const [q, setQ] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const catScrollRef = useRef<HTMLDivElement>(null);

  const scrollCats = (dir: "left" | "right") => {
    if (!catScrollRef.current) return;
    catScrollRef.current.scrollBy({
      left: dir === "right" ? 220 : -220,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (initialData) return;
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const response = await AxiosInstance.get(`restaurants/${restaurantId}`);
        const data = (response?.data as { data?: FetchedRestaurant })?.data;
        if (mounted) setRest(data ?? null);
      } catch (e) {
        console.error("[RestaurantDetailClient] fetch error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [restaurantId, initialData]);

  const groupedMenus = useMemo<[string, MenuItem[]][]>(() => {
    const map = new Map<string, MenuItem[]>();
    (rest?.menus || []).forEach((m) => {
      const key = m.category || "Menu";
      const list = map.get(key) || [];
      list.push(m);
      map.set(key, list);
    });
    return Array.from(map.entries());
  }, [rest]);

  const categories = useMemo(
    () => ["All", ...groupedMenus.map(([c]) => c)],
    [groupedMenus]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: rest?.menus?.length || 0 };
    groupedMenus.forEach(([cat, items]) => {
      counts[cat] = items.length;
    });
    return counts;
  }, [rest, groupedMenus]);

  const currencyCode = useMemo(
    () => COUNTRY_CURRENCY[rest?.country || ""] || "PHP",
    [rest]
  );
  const flagSrc = rest?.country ? COUNTRY_FLAGS[rest.country] : undefined;

  const formatPrice = useMemo(() => {
    try {
      const nf = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyCode,
      });
      return (n: number | string | undefined) => nf.format(Number(n));
    } catch {
      return (n: number | string | undefined) => Number(n).toLocaleString();
    }
  }, [currencyCode]);

  if (loading && !rest) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!rest) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "#f5f5f5",
          px: 2,
        }}
      >
        <Typography variant="h5" fontWeight={900}>
          Restaurant not found.
        </Typography>
      </Box>
    );
  }

  const accent = brandColorFromCategory(rest.category);

  const heroSrc =
    rest.cover ||
    rest.logo ||
    (rest.menus && rest.menus.find((m) => m?.avatar)?.avatar) ||
    "";

  const geoCoord =
    rest?.geo_coordinate ||
    rest?.geo_coordinates ||
    rest?.geo ||
    rest?.details?.geo_coordinate ||
    rest?.location?.geo_coordinate ||
    null;

  const addressLine = [rest.address, rest.city, rest.country]
    .filter(Boolean)
    .join(", ");

  const directionsUrl = addressLine
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}`
    : "";

  const totalMenuItems = rest.menus?.length || 0;
  const totalCategories = groupedMenus.length;

  return (
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh", pb: 10 }}>
      {/* ── HERO ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 320, sm: 420, md: 560 },
          overflow: "hidden",
          bgcolor: "#1e293b",
        }}
      >
        {heroSrc && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              animation: `${heroFloat} 14s ease-in-out infinite`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroSrc}
              alt={rest.name || "Restaurant"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
          </Box>
        )}

        {/* Multi-stop gradient overlay for legibility */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.75) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Back button */}
        <IconButton
          aria-label="Go back"
          onClick={() => router.push("/restaurant")}
          sx={{
            position: "absolute",
            top: { xs: 14, md: 22 },
            left: { xs: 14, md: 22 },
            color: "#fff",
            bgcolor: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.24)" },
            zIndex: 3,
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        {/* Action buttons */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: "absolute",
            top: { xs: 14, md: 22 },
            right: { xs: 14, md: 22 },
            zIndex: 3,
          }}
        >
          <IconButton
            aria-label="Share"
            onClick={() => setShareOpen((v) => !v)}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.14)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.24)" },
            }}
          >
            <ShareRoundedIcon />
          </IconButton>
        </Stack>

        {/* Breadcrumb (over hero, desktop only) */}
        <Box
          sx={{
            position: "absolute",
            top: 78,
            left: { md: 32, lg: 64 },
            zIndex: 2,
            display: { xs: "none", md: "block" },
            color: "rgba(255,255,255,0.85)",
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.8}>
            <Link
              href={`/restaurant?country=${encodeURIComponent(rest.country || "")}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {rest.country || "All Countries"}
            </Link>
            {rest.city && (
              <>
                <Box component="span" sx={{ opacity: 0.5 }}>
                  ›
                </Box>
                <Link
                  href={`/restaurant?country=${encodeURIComponent(
                    rest.country || ""
                  )}&city=${encodeURIComponent(rest.city)}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {rest.city}
                </Link>
              </>
            )}
            <Box component="span" sx={{ opacity: 0.5 }}>
              ›
            </Box>
            <Box component="span" sx={{ color: "#fff", fontWeight: 700 }}>
              {rest.name}
            </Box>
          </Stack>
        </Box>

        {/* Floating restaurant card at bottom of hero */}
        <Container
          maxWidth="lg"
          sx={{
            position: "absolute",
            bottom: { xs: -36, md: -56 },
            left: 0,
            right: 0,
            zIndex: 3,
            px: { xs: 2, md: 3 },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              animation: `${fadeUp} 0.55s cubic-bezier(0.22,1,0.36,1) both`,
              borderRadius: { xs: 4, md: 5 },
              p: { xs: 2, md: 3 },
              bgcolor: "#fff",
              border: "1px solid #e2e8f0",
              boxShadow:
                "0 28px 80px -16px rgba(15,23,42,0.18), 0 8px 24px -8px rgba(15,23,42,0.10)",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "center", md: "stretch" },
              gap: { xs: 2, md: 3 },
            }}
          >
            {/* Logo block */}
            <Box
              sx={{
                width: { xs: 100, md: 132 },
                height: { xs: 100, md: 132 },
                borderRadius: 3,
                overflow: "hidden",
                border: "3px solid #fff",
                bgcolor: "#f8fafc",
                flexShrink: 0,
                boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
                mt: { xs: -7, md: -8 },
              }}
            >
              <Avatar
                src={rest.logo || heroSrc}
                alt={rest.name || ""}
                variant="square"
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 0,
                  bgcolor: "transparent",
                }}
              />
            </Box>

            {/* Info block */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{ mb: 0.6 }}
              >
                <Typography
                  sx={{
                    fontFamily: "Outfit, sans-serif",
                    fontWeight: 900,
                    color: "#0f172a",
                    fontSize: { xs: "1.5rem", md: "2.1rem" },
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  {rest.name}
                </Typography>
                {flagSrc && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={flagSrc}
                    alt={rest.country || ""}
                    style={{
                      width: 28,
                      height: 20,
                      borderRadius: 3,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      objectFit: "cover",
                    }}
                  />
                )}
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                spacing={1.2}
                flexWrap="wrap"
                useFlexGap
                sx={{ mb: 1.5 }}
              >
                {rest.category && (
                  <Chip
                    icon={<LocalOfferRoundedIcon sx={{ fontSize: 16 }} />}
                    label={rest.category}
                    size="small"
                    sx={{
                      bgcolor: `${accent}15`,
                      color: accent,
                      border: `1px solid ${accent}40`,
                      fontWeight: 700,
                      fontFamily: "Outfit, sans-serif",
                      "& .MuiChip-icon": { color: accent },
                    }}
                  />
                )}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.3}
                  sx={{
                    bgcolor: "#fef3c7",
                    border: "1px solid #fde68a",
                    px: 1.1,
                    py: 0.3,
                    borderRadius: 99,
                  }}
                >
                  <StarRoundedIcon sx={{ fontSize: 18, color: "#f59e0b" }} />
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      color: "#92400e",
                      fontFamily: "Outfit, sans-serif",
                    }}
                  >
                    {rest?.rating ?? "5.0"}
                  </Typography>
                </Stack>
                {totalMenuItems > 0 && (
                  <Chip
                    label={`${totalMenuItems} items`}
                    size="small"
                    sx={{
                      bgcolor: "#f1f5f9",
                      color: "#475569",
                      fontWeight: 700,
                      fontFamily: "Outfit, sans-serif",
                    }}
                  />
                )}
              </Stack>

              {addressLine && (
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  spacing={0.7}
                  sx={{ color: "#64748b" }}
                >
                  <PlaceRoundedIcon sx={{ fontSize: 18, mt: 0.2 }} />
                  <Typography
                    sx={{
                      fontFamily: "Outfit, sans-serif",
                      fontWeight: 500,
                      fontSize: "0.95rem",
                    }}
                  >
                    {addressLine}
                  </Typography>
                </Stack>
              )}
            </Box>

            {/* CTA block */}
            <Stack
              direction={{ xs: "row", md: "column" }}
              spacing={1}
              sx={{
                alignItems: { xs: "stretch", md: "stretch" },
                justifyContent: "center",
                minWidth: { md: 180 },
              }}
            >
              {directionsUrl && (
                <Button
                  component="a"
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<DirectionsRoundedIcon />}
                  variant="contained"
                  fullWidth
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 700,
                    py: 1.1,
                    bgcolor: accent,
                    boxShadow: `0 10px 24px ${accent}40`,
                    "&:hover": {
                      bgcolor: accent,
                      filter: "brightness(0.92)",
                      boxShadow: `0 14px 30px ${accent}60`,
                    },
                  }}
                >
                  Directions
                </Button>
              )}
              {rest.contact_number && (
                <Button
                  component="a"
                  href={`tel:${rest.contact_number}`}
                  startIcon={<PhoneRoundedIcon />}
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 700,
                    py: 1.1,
                    borderColor: "#cbd5e1",
                    color: "#0f172a",
                    "&:hover": { borderColor: accent, color: accent },
                  }}
                >
                  Call
                </Button>
              )}
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* Spacer for floating card overlap */}
      <Box sx={{ height: { xs: 64, md: 96 } }} />

      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        {/* ── Quick stats row ──────────────────────────────────────── */}
        {rest.description && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 4,
              bgcolor: "#fff",
              border: "1px solid #f1f5f9",
              mb: 3,
              animation: `${fadeUp} 0.5s ease both 0.1s`,
            }}
          >
            <Typography
              sx={{
                color: "#0f172a",
                fontFamily: "Outfit, sans-serif",
                fontSize: "1.05rem",
                lineHeight: 1.65,
                ...clamp3,
              }}
            >
              {rest.description}
            </Typography>
          </Paper>
        )}

        {/* ── Main + sidebar grid ──────────────────────────────────── */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Sticky search + tabs */}
            <Paper
              elevation={0}
              sx={{
                position: "sticky",
                top: 12,
                zIndex: 10,
                borderRadius: 4,
                p: 2,
                bgcolor: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(12px)",
                border: "1px solid #f1f5f9",
                boxShadow: "0 8px 22px rgba(15,23,42,0.06)",
                mb: 3,
              }}
            >
              <TextField
                placeholder="Search in menu..."
                size="small"
                fullWidth
                value={q}
                onChange={(e) => setQ(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 999,
                    bgcolor: "#f1f5f9",
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: "#cbd5e1" },
                    "&.Mui-focused fieldset": {
                      borderColor: accent,
                      borderWidth: 1.5,
                    },
                  },
                }}
              />

              {/* Pill category tabs */}
              <Box
                ref={catScrollRef}
                sx={{
                  display: "flex",
                  gap: 1,
                  overflowX: "auto",
                  mt: 1.5,
                  pb: 0.5,
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {categories.map((c) => {
                  const active = activeCat === c;
                  return (
                    <ButtonBase
                      key={c}
                      onClick={() => setActiveCat(c)}
                      sx={{
                        flexShrink: 0,
                        px: 2,
                        py: 0.9,
                        borderRadius: 999,
                        bgcolor: active ? accent : "#f1f5f9",
                        color: active ? "#fff" : "#475569",
                        transition: "all 0.18s ease",
                        boxShadow: active
                          ? `0 6px 18px ${accent}40`
                          : "none",
                        "&:hover": {
                          bgcolor: active ? accent : "#e2e8f0",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "Outfit, sans-serif",
                          fontSize: "0.88rem",
                          fontWeight: active ? 800 : 700,
                          whiteSpace: "nowrap",
                          letterSpacing: "0.01em",
                        }}
                      >
                        {c}{" "}
                        <Box
                          component="span"
                          sx={{
                            opacity: 0.7,
                            ml: 0.3,
                            fontWeight: 500,
                          }}
                        >
                          {categoryCounts[c]}
                        </Box>
                      </Typography>
                    </ButtonBase>
                  );
                })}
                {/* Scroll buttons inline (desktop) */}
                <Box sx={{ display: { xs: "none", md: "flex" }, ml: "auto" }}>
                  <IconButton
                    size="small"
                    onClick={() => scrollCats("left")}
                    sx={{ color: "#94a3b8" }}
                  >
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => scrollCats("right")}
                    sx={{
                      color: "#94a3b8",
                      transform: "rotate(180deg)",
                    }}
                  >
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Paper>

            {/* Menu sections */}
            {totalMenuItems === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 4,
                  border: "1px dashed #cbd5e1",
                  bgcolor: "#fff",
                }}
              >
                <RestaurantRoundedIcon
                  sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }}
                />
                <Typography
                  sx={{
                    fontFamily: "Outfit, sans-serif",
                    fontWeight: 700,
                    color: "#475569",
                    fontSize: "1.1rem",
                  }}
                >
                  No menu items yet
                </Typography>
                <Typography
                  sx={{
                    color: "#94a3b8",
                    fontSize: "0.9rem",
                    mt: 0.5,
                  }}
                >
                  Check back later for delicious offerings.
                </Typography>
              </Paper>
            ) : (
              groupedMenus
                .filter(([cat]) => activeCat === "All" || cat === activeCat)
                .map(([cat, items]) => {
                  const filtered = items.filter((it) =>
                    String(it.name || "")
                      .toLowerCase()
                      .includes(q.toLowerCase())
                  );
                  if (!filtered.length) return null;

                  return (
                    <Fade in timeout={350} key={cat}>
                      <Box sx={{ mb: 4 }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.2}
                          sx={{ mb: 2 }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 28,
                              borderRadius: 99,
                              bgcolor: accent,
                            }}
                          />
                          <Typography
                            sx={{
                              fontFamily: "Outfit, sans-serif",
                              fontWeight: 900,
                              fontSize: { xs: "1.5rem", md: "1.8rem" },
                              color: "#0f172a",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {cat}
                          </Typography>
                          <Chip
                            label={filtered.length}
                            size="small"
                            sx={{
                              bgcolor: "#f1f5f9",
                              color: "#64748b",
                              fontWeight: 700,
                            }}
                          />
                        </Stack>

                        <Grid container spacing={2}>
                          {filtered.map((it, idx) => (
                            <Grid
                              size={{ xs: 12, sm: 6 }}
                              key={String(it.id ?? it.name ?? idx)}
                            >
                              <Paper
                                elevation={0}
                                sx={{
                                  borderRadius: 4,
                                  overflow: "hidden",
                                  bgcolor: "#fff",
                                  border: "1px solid #f1f5f9",
                                  display: "flex",
                                  gap: 2,
                                  p: 2,
                                  transition:
                                    "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                                  cursor: "default",
                                  "&:hover": {
                                    transform: "translateY(-3px)",
                                    boxShadow:
                                      "0 14px 32px -8px rgba(15,23,42,0.10)",
                                    borderColor: `${accent}40`,
                                    "& img": {
                                      transform: "scale(1.06)",
                                    },
                                  },
                                }}
                              >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    sx={{
                                      fontFamily: "Outfit, sans-serif",
                                      fontWeight: 800,
                                      fontSize: "1.1rem",
                                      color: "#0f172a",
                                      ...clamp2,
                                      mb: 0.4,
                                    }}
                                  >
                                    {it.name}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontFamily: "Outfit, sans-serif",
                                      fontWeight: 800,
                                      color: accent,
                                      fontSize: "1.05rem",
                                      mb: 0.6,
                                    }}
                                  >
                                    {formatPrice(it.price)}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      color: "#64748b",
                                      fontSize: "0.88rem",
                                      lineHeight: 1.5,
                                      ...clamp3,
                                    }}
                                  >
                                    {it.description || "Prepared fresh daily."}
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    width: { xs: 96, sm: 120 },
                                    height: { xs: 96, sm: 120 },
                                    flexShrink: 0,
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    bgcolor: "#f1f5f9",
                                  }}
                                >
                                  <MenuItemImage
                                    src={it.avatar}
                                    alt={it.name}
                                  />
                                </Box>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </Fade>
                  );
                })
            )}
          </Grid>

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: { md: "sticky" }, top: { md: 12 } }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 4,
                  bgcolor: "#fff",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 8px 22px rgba(15,23,42,0.04)",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.2}
                  sx={{ mb: 2 }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      bgcolor: `${accent}15`,
                      color: accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PlaceRoundedIcon />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: "#94a3b8",
                        textTransform: "uppercase",
                      }}
                    >
                      Find us
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        color: "#0f172a",
                        fontFamily: "Outfit, sans-serif",
                        lineHeight: 1.2,
                      }}
                    >
                      Location
                    </Typography>
                  </Box>
                </Stack>

                {addressLine && (
                  <Typography
                    sx={{
                      color: "#475569",
                      mb: 2,
                      fontSize: "0.95rem",
                      lineHeight: 1.5,
                      fontFamily: "Outfit, sans-serif",
                    }}
                  >
                    {addressLine}
                  </Typography>
                )}

                <Box sx={{ borderRadius: 3, overflow: "hidden", mb: 1.5 }}>
                  <StaticMap
                    geo={geoCoord}
                    address={rest.address}
                    city={rest.city}
                    country={rest.country}
                    height={320}
                  />
                </Box>

                {(totalCategories > 0 || totalMenuItems > 0) && (
                  <Box
                    sx={{
                      mt: 2,
                      pt: 2,
                      borderTop: "1px solid #f1f5f9",
                      display: "flex",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        textAlign: "center",
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: "#f8fafc",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: "1.4rem",
                          color: accent,
                          fontFamily: "Outfit, sans-serif",
                        }}
                      >
                        {totalMenuItems}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: "#94a3b8",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Menu items
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        textAlign: "center",
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: "#f8fafc",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: "1.4rem",
                          color: accent,
                          fontFamily: "Outfit, sans-serif",
                        }}
                      >
                        {totalCategories}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: "#94a3b8",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Categories
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Share menu (inline expander, simple for now) */}
      {shareOpen && (
        <Box
          onClick={() => setShareOpen(false)}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(15,23,42,0.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
            p: 2,
          }}
        >
          <Paper
            onClick={(e) => e.stopPropagation()}
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              minWidth: 320,
              maxWidth: 380,
              bgcolor: "#fff",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 800,
                fontSize: "1.2rem",
                mb: 0.5,
              }}
            >
              Share this restaurant
            </Typography>
            <Typography
              sx={{ color: "#64748b", fontSize: "0.9rem", mb: 2 }}
            >
              Copy the link or open it on another device.
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={typeof window !== "undefined" ? window.location.href : ""}
              slotProps={{ input: { readOnly: true } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  fontSize: "0.85rem",
                },
              }}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard
                      .writeText(window.location.href)
                      .catch(() => {});
                  }
                  setShareOpen(false);
                }}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: accent,
                  "&:hover": { bgcolor: accent, filter: "brightness(0.92)" },
                }}
              >
                Copy link
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setShareOpen(false)}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 700,
                  borderColor: "#cbd5e1",
                  color: "#475569",
                }}
              >
                Close
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
