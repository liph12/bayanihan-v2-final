"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid2";
import NextLink from "next/link";
import Image from "next/image";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AxiosInstance from "@/lib/AxiosInstance";
import { restaurantUrl } from "@/lib/eventUrl";
import type { Restaurant } from "@/types";

const FONT_HEAD = "var(--font-urbanist), 'Outfit', sans-serif";
const FONT_BODY = "var(--font-outfit), 'Outfit', sans-serif";
const ACCENT_GRADIENT =
  "linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #06b6d4 100%)";

const MAX_CARDS = 10;

// 20-column base so cards divide evenly into 5 per row on large screens
// (12-col MUI default only gives 4). Responsive: 1 / 2 / 4 / 5 per row.
const GRID_COLUMNS = 20;
const CARD_SIZE = { xs: 20, sm: 10, md: 5, lg: 4 };

interface RestaurantsSectionProps {
  initialRestaurants?: Restaurant[];
}

function extractRestaurants(payload: unknown): Restaurant[] {
  const d = payload as
    | { data?: { restaurant?: Restaurant[] }; restaurant?: Restaurant[] }
    | Restaurant[]
    | undefined;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data?.restaurant)) return d!.data!.restaurant!;
  if (Array.isArray(d?.restaurant)) return d!.restaurant!;
  return [];
}

function RestaurantCard({ r }: { r: Restaurant }) {
  const href = restaurantUrl(r) || "#";
  const isExternal = href.startsWith("http");
  const image = r.photo || r.cover || r.image || r.logo || "";
  const location = [r.city, r.country].filter(Boolean).join(", ") || r.address || "";

  const card = (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "#fff",
        border: "1px solid #d7f0ec",
        boxShadow: "0 6px 16px rgba(15,23,42,0.06)",
        transition: "all .3s cubic-bezier(0.22, 1, 0.36, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 18px 36px rgba(15,23,42,0.12)",
          "& .rs-img": { transform: "scale(1.05)" },
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 10",
          overflow: "hidden",
          bgcolor: "#0f172a",
        }}
      >
        {image ? (
          <Image
            className="rs-img"
            src={image}
            alt={r.name || "Restaurant"}
            fill
            quality={40}
            sizes="(max-width:600px) 100vw, (max-width:900px) 50vw, (max-width:1200px) 25vw, (max-width:1700px) 20vw, 340px"
            style={{
              objectFit: "cover",
              transition: "transform .5s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        ) : (
          <Box sx={{ position: "absolute", inset: 0, background: ACCENT_GRADIENT }} />
        )}
      </Box>

      <Box sx={{ p: { xs: 2, md: 2.25 }, display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
        <Typography
          sx={{
            fontFamily: FONT_HEAD,
            fontWeight: 800,
            fontSize: { xs: 15, md: 16 },
            lineHeight: 1.3,
            color: "#0f172a",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {r.name || "Filipino restaurant"}
        </Typography>

        {r.category && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              color: "#0f766e",
              fontFamily: FONT_BODY,
              fontSize: 12.5,
              fontWeight: 700,
            }}
          >
            <RestaurantRoundedIcon sx={{ fontSize: 14 }} />
            {r.category}
          </Box>
        )}

        {location && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              color: "#64748b",
              fontFamily: FONT_BODY,
              fontSize: 12,
              fontWeight: 600,
              mt: "auto",
            }}
          >
            <LocationOnRoundedIcon sx={{ fontSize: 13 }} />
            <Box
              component="span"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {location}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );

  const linkStyle = {
    textDecoration: "none",
    color: "inherit",
    display: "block",
    height: "100%",
  } as const;

  return isExternal ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
      {card}
    </a>
  ) : (
    <NextLink href={href} style={linkStyle}>
      {card}
    </NextLink>
  );
}

export default function RestaurantsSection({
  initialRestaurants = [],
}: RestaurantsSectionProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [loading, setLoading] = useState(initialRestaurants.length === 0);

  useEffect(() => {
    if (initialRestaurants.length > 0) return;
    let mounted = true;
    (async () => {
      try {
        const resp = await AxiosInstance.get<unknown>("restaurants");
        if (mounted) setRestaurants(extractRestaurants(resp?.data));
      } catch {
        if (mounted) setRestaurants([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialRestaurants.length]);

  const list = useMemo(() => restaurants.slice(0, MAX_CARDS), [restaurants]);

  return (
    <Box sx={{ position: "relative", px: { xs: 2, md: 4, lg: 5 }, py: { xs: 2.5, md: 3 } }}>
      <Box sx={{ maxWidth: 1650, mx: "auto" }}>
        {/* ── Header ── */}
        <Typography
          component="h2"
          sx={{
            fontFamily: FONT_HEAD,
            fontWeight: 800,
            fontSize: { xs: 22, md: 30 },
            color: "#0f172a",
          }}
        >
          Discover Filipino{" "}
          <Box
            component="span"
            sx={{
              background: ACCENT_GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Restaurants
          </Box>
        </Typography>
        <Typography
          sx={{
            fontFamily: FONT_BODY,
            color: "#64748b",
            fontSize: { xs: 14, md: 15 },
            mt: 0.5,
            mb: 3,
          }}
        >
          Filipino-owned restaurants and eateries around the world.
        </Typography>

        {/* ── Grid ── */}
        {loading ? (
          <Grid container columns={GRID_COLUMNS} spacing={{ xs: 2, md: 3 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Grid size={CARD_SIZE} key={i}>
                <Skeleton
                  variant="rounded"
                  sx={{ width: "100%", aspectRatio: "16/10", borderRadius: 3 }}
                />
                <Skeleton width="80%" sx={{ mt: 1 }} />
                <Skeleton width="50%" />
              </Grid>
            ))}
          </Grid>
        ) : list.length === 0 ? (
          <Box
            sx={{
              py: 6,
              textAlign: "center",
              borderRadius: 3,
              bgcolor: "#f0fdfa",
              border: "1px dashed #99f6e4",
            }}
          >
            <Typography sx={{ fontFamily: FONT_HEAD, fontWeight: 800, color: "#0f172a", mb: 1 }}>
              No restaurants to show yet
            </Typography>
            <Typography sx={{ fontFamily: FONT_BODY, fontSize: 14, color: "#64748b", mb: 3 }}>
              Check back soon, or explore the full directory.
            </Typography>
            <NextLink href="/restaurant" style={{ textDecoration: "none" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 2.5,
                  py: 1.25,
                  borderRadius: 999,
                  fontFamily: FONT_HEAD,
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#fff",
                  background: ACCENT_GRADIENT,
                  boxShadow: "0 8px 18px rgba(20,184,166,0.3)",
                }}
              >
                Browse all restaurants
              </Box>
            </NextLink>
          </Box>
        ) : (
          <>
            <Grid container columns={GRID_COLUMNS} spacing={{ xs: 2, md: 3 }}>
              {list.map((r, i) => (
                <Grid size={CARD_SIZE} key={r.id || `rs-${i}`}>
                  <RestaurantCard r={r} />
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 3.5, display: "flex", justifyContent: "center" }}>
              <NextLink href="/restaurant" style={{ textDecoration: "none" }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 3,
                    py: 1.25,
                    borderRadius: 999,
                    fontFamily: FONT_HEAD,
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#0f766e",
                    border: "2px solid #99f6e4",
                    transition: "background .2s",
                    "&:hover": { background: "#f0fdfa" },
                  }}
                >
                  See all restaurants
                  <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
              </NextLink>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
