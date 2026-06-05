"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import NextLink from "next/link";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AxiosInstance from "@/lib/AxiosInstance";
import { useLocale } from "@/providers/LocaleProvider";
import type { Restaurant } from "@/types";
import { restaurantUrl } from "@/lib/eventUrl";
import StoryRail from "./StoryRail";

const FONT_HEAD = "var(--font-urbanist), 'Outfit', sans-serif";
const FONT_BODY = "var(--font-outfit), 'Outfit', sans-serif";
const ACCENT_GRADIENT =
  "linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #06b6d4 100%)";

const COUNTRY_CODE: Record<string, string> = {
  philippines: "ph",
  "united states": "us",
  "united states of america": "us",
  usa: "us",
  canada: "ca",
  australia: "au",
  "united kingdom": "gb",
  uk: "gb",
  "united arab emirates": "ae",
  uae: "ae",
  singapore: "sg",
  "saudi arabia": "sa",
  qatar: "qa",
  kuwait: "kw",
  bahrain: "bh",
  oman: "om",
  italy: "it",
  spain: "es",
  germany: "de",
  france: "fr",
  netherlands: "nl",
  norway: "no",
  sweden: "se",
  japan: "jp",
  korea: "kr",
  "south korea": "kr",
  "hong kong": "hk",
  malaysia: "my",
  taiwan: "tw",
  "new zealand": "nz",
};

function countryToCode(name?: string): string | null {
  if (!name) return null;
  const key = name.trim().toLowerCase();
  return COUNTRY_CODE[key] || (key.length === 2 ? key : null);
}

interface RestaurantsSectionProps {
  initialRestaurants?: Restaurant[];
}

export default function RestaurantsSection({
  initialRestaurants = [],
}: RestaurantsSectionProps) {
  const [restaurants, setRestaurants] =
    useState<Restaurant[]>(initialRestaurants);
  const { t } = useLocale();

  useEffect(() => {
    if (initialRestaurants.length > 0) return;
    let mounted = true;
    (async () => {
      try {
        const resp = await AxiosInstance.get<unknown>("restaurants");
        const d = resp?.data as
          | {
              data?: { restaurant?: Restaurant[] };
              restaurant?: Restaurant[];
            }
          | Restaurant[]
          | undefined;
        const arr: Restaurant[] = Array.isArray(d)
          ? d
          : Array.isArray(d?.data?.restaurant)
          ? d.data!.restaurant!
          : Array.isArray(d?.restaurant)
          ? d.restaurant!
          : [];
        if (mounted) setRestaurants(arr);
      } catch {
        if (mounted) setRestaurants([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialRestaurants.length]);

  const visible = useMemo(() => restaurants.slice(0, 30), [restaurants]);

  const renderCard = (r: Restaurant) => {
    const link = restaurantUrl(r);
    const image = r?.photo || r?.cover || r?.image;
    const isExternal = link.startsWith("http");
    const code = countryToCode(r?.country);
    const locationLong = [r?.city, r?.country].filter(Boolean).join(", ");
    const cuisine = r?.category;

    const card = (
      <Box
        sx={{
          position: "relative",
          // Same approach as EventsSection: explicit width + height (no
          // aspectRatio) so we can animate width on hover without dragging
          // the rail row's height with it. Heights = width * 16/9 to
          // preserve the original 9:16 portrait look at rest.
          width: { xs: 140, sm: 160, md: 180 },
          height: { xs: 249, sm: 284, md: 320 },
          flexShrink: 0,
          scrollSnapAlign: "start",
          borderRadius: 2.5,
          overflow: "hidden",
          bgcolor: "#0f172a",
          boxShadow: "0 6px 16px rgba(15,23,42,0.12)",
          cursor: "pointer",
          transition:
            "width .35s cubic-bezier(0.22, 1, 0.36, 1), transform .35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow .35s",
          // Only fire the expand effect on devices that actually support
          // hovering. Touch devices keep the compact tap-to-open behavior.
          "@media (hover: hover)": {
            "&:hover": {
              width: { xs: 240, sm: 300, md: 340 },
              transform: "translateY(-4px)",
              boxShadow: "0 18px 36px rgba(15,23,42,0.22)",
              "& .rest-img": { transform: "scale(1.08)" },
              "& .rest-name": { WebkitLineClamp: 3 },
              "& .rest-extra": {
                opacity: 1,
                transform: "translateY(0)",
                pointerEvents: "auto",
              },
            },
          },
          // Touch / mobile can't hover, so present the expanded state by
          // default: a wider card with the details and "View restaurant"
          // button always visible.
          "@media (hover: none), (max-width: 600px)": {
            width: { xs: 240, sm: 300 },
            "& .rest-name": { WebkitLineClamp: 3 },
            "& .rest-extra": {
              opacity: 1,
              transform: "translateY(0)",
              pointerEvents: "auto",
            },
          },
        }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="rest-img"
            src={image}
            alt={r.name || "Restaurant"}
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
            <RestaurantRoundedIcon sx={{ fontSize: 36, opacity: 0.85 }} />
          </Box>
        )}

        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.32) 0%, transparent 30%, transparent 50%, rgba(15,23,42,0.9) 100%)",
          }}
        />

        {code && (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.45,
              pl: 0.4,
              pr: 1,
              py: 0.3,
              borderRadius: 999,
              background: "rgba(255,255,255,0.22)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              fontFamily: FONT_HEAD,
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://flagcdn.com/w40/${code}.png`}
              alt={r.country || ""}
              width={18}
              height={13}
              style={{ borderRadius: 2, display: "block" }}
            />
            {code}
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
          {r?.city && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.3,
                color: "rgba(255,255,255,0.92)",
                mb: 0.5,
              }}
            >
              <LocationOnRoundedIcon sx={{ fontSize: 12 }} />
              <Typography
                sx={{
                  fontFamily: FONT_BODY,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                }}
              >
                {r.city}
              </Typography>
            </Box>
          )}
          <Typography
            className="rest-name"
            sx={{
              fontFamily: FONT_HEAD,
              fontSize: { xs: 14, md: 15 },
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: "-0.005em",
              textTransform: "capitalize",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textShadow: "0 2px 6px rgba(0,0,0,0.5)",
              transition: "all .3s ease",
            }}
          >
            {r?.name || "Restaurant"}
          </Typography>

          {/*
            Hover-only "extra" panel — revealed by the parent's
            @media (hover: hover) &:hover rule. pointerEvents is off
            while hidden so it never intercepts clicks on the card link.
          */}
          <Box
            className="rest-extra"
            sx={{
              mt: 0.75,
              opacity: 0,
              transform: "translateY(6px)",
              pointerEvents: "none",
              transition:
                "opacity .25s ease .05s, transform .3s cubic-bezier(0.22, 1, 0.36, 1) .05s",
            }}
          >
            {locationLong && (
              <Typography
                sx={{
                  fontFamily: FONT_BODY,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.85)",
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {locationLong}
              </Typography>
            )}
            {cuisine && (
              <Typography
                sx={{
                  fontFamily: FONT_BODY,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.7)",
                  mt: 0.25,
                  textTransform: "capitalize",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                }}
              >
                {cuisine}
              </Typography>
            )}
            <Box
              sx={{
                mt: 1,
                display: "inline-flex",
                alignItems: "center",
                gap: 0.4,
                px: 1.1,
                py: 0.4,
                borderRadius: 999,
                background: ACCENT_GRADIENT,
                color: "#fff",
                fontFamily: FONT_HEAD,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.02em",
                boxShadow: "0 6px 14px rgba(6,182,212,0.35)",
              }}
            >
              View restaurant
              <ArrowForwardRoundedIcon sx={{ fontSize: 12 }} />
            </Box>
          </Box>
        </Box>
      </Box>
    );

    return isExternal ? (
      <a
        href={link}
        draggable={false}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        {card}
      </a>
    ) : (
      <NextLink
        href={link}
        draggable={false}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        {card}
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
              bgcolor: "#ecfeff",
              border: "1px solid #a5f3fc",
              color: "#0e7490",
              fontFamily: FONT_HEAD,
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              mb: 0.75,
            }}
          >
            <RestaurantRoundedIcon sx={{ fontSize: 11 }} />
            Restaurants
            {restaurants.length > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 0.5,
                  pl: 0.75,
                  borderLeft: "1px solid #a5f3fc",
                  color: "#0f172a",
                  fontWeight: 900,
                }}
              >
                {restaurants.length}
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
            {t("discoverRestaurantsTitle") || "Discover Filipino restaurants"}
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
          href="/restaurant"
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
            boxShadow: "0 6px 14px rgba(6,182,212,0.28)",
            transition: "all .2s ease",
            flexShrink: 0,
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 8px 18px rgba(6,182,212,0.4)",
            },
          }}
        >
          See all
          <ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />
        </Box>
      </Box>

      {visible.length === 0 ? (
        <Box
          sx={{
            py: 4,
            textAlign: "center",
            borderRadius: 2.5,
            bgcolor: "#ecfeff",
            border: "1px dashed #a5f3fc",
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
            No restaurants to display yet.
          </Typography>
        </Box>
      ) : (
        <StoryRail
          accentColor="#0e7490"
          deps={[visible.length]}
          autoScroll
        >
          {visible.map((r, i) => (
            <Box key={r.id || i}>{renderCard(r)}</Box>
          ))}
        </StoryRail>
      )}
    </Box>
  );
}
