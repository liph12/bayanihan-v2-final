"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, Select, MenuItem, Skeleton, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import NextLink from "next/link";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AxiosInstance from "@/lib/AxiosInstance";
import { eventUrl } from "@/lib/eventUrl";
import { countryCodes } from "@/lib/countryCodes";
import { POPULAR_ORDER } from "@/lib/popularCountries";
import type { BayanihanEvent } from "@/types";

const FONT_HEAD = "var(--font-urbanist), 'Outfit', sans-serif";
const FONT_BODY = "var(--font-outfit), 'Outfit', sans-serif";
const ACCENT_GRADIENT =
  "linear-gradient(135deg, #c2410c 0%, #F77F00 50%, #FBA833 100%)";

// Countries offered in the picker — the popular set, with names/flags.
const COUNTRY_OPTIONS = POPULAR_ORDER.map((code) =>
  countryCodes.find((c) => c.code.toUpperCase() === code)
).filter((c): c is { code: string; name: string } => Boolean(c));

const MAX_CARDS = 8;

interface EventsSectionProps {
  /** Events for `initialCountry`, fetched on the server for the first paint. */
  initialEvents?: BayanihanEvent[];
  /** ISO code the picker starts on (must be in POPULAR_ORDER). */
  initialCountry?: string;
}

function extractEvents(payload: unknown): BayanihanEvent[] {
  const d = payload as
    | { data?: { events?: BayanihanEvent[] }; events?: BayanihanEvent[] }
    | BayanihanEvent[]
    | undefined;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data?.events)) return d!.data!.events!;
  if (Array.isArray(d?.events)) return d!.events!;
  return [];
}

function ts(ev: BayanihanEvent): number {
  const v = ev?.eventDate || ev?.date;
  const p = Date.parse(v || "");
  return Number.isNaN(p) ? 0 : p;
}

function formatDate(input?: string | null): string {
  if (!input) return "Date TBA";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const flagUrl = (code: string, w = 40) =>
  `https://flagcdn.com/w${w}/${code.toLowerCase()}.png`;

// Extracted to module scope so the impure Date.now() call doesn't trip the
// React Compiler purity check that fires on calls made inside render/hooks.
// Upcoming first (soonest); falls back to whatever's returned if none parse.
function pickUpcoming(events: BayanihanEvent[]): BayanihanEvent[] {
  const now = Date.now();
  const upcoming = events
    .filter((e) => ts(e) >= now)
    .sort((a, b) => ts(a) - ts(b));
  return (upcoming.length > 0 ? upcoming : events).slice(0, MAX_CARDS);
}

function EventCard({
  ev,
  fallbackCountry,
}: {
  ev: BayanihanEvent;
  fallbackCountry: string;
}) {
  const href = eventUrl(ev) || "#";
  const isExternal = href.startsWith("http");
  const date = formatDate(ev?.eventDate || ev?.date);
  const location = (ev as { location?: string })?.location || fallbackCountry;

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
        border: "1px solid #f1e3c8",
        boxShadow: "0 6px 16px rgba(15,23,42,0.06)",
        transition: "all .3s cubic-bezier(0.22, 1, 0.36, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 18px 36px rgba(15,23,42,0.12)",
          "& .ev-img": { transform: "scale(1.05)" },
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
        {ev?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="ev-img"
            src={ev.image}
            alt={ev.title || "Event"}
            loading="lazy"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
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
          {ev?.title || "Untitled event"}
        </Typography>

        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            color: "#c2410c",
            fontFamily: FONT_BODY,
            fontSize: 12.5,
            fontWeight: 700,
          }}
        >
          <EventRoundedIcon sx={{ fontSize: 14 }} />
          {date}
        </Box>

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

export default function EventsSection({
  initialEvents = [],
  initialCountry = "SG",
}: EventsSectionProps) {
  const [country, setCountry] = useState(initialCountry.toUpperCase());
  const [events, setEvents] = useState<BayanihanEvent[]>(initialEvents);
  const [loading, setLoading] = useState(false);
  const firstRun = useRef(true);

  useEffect(() => {
    // First mount: reuse the server-fetched events for the initial country.
    // Any country change: fetch that country's events client-side.
    if (firstRun.current) {
      firstRun.current = false;
      if (initialEvents.length > 0) return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const resp = await AxiosInstance.get(`events-list/${country}`);
        if (!cancelled) setEvents(extractEvents(resp?.data));
      } catch {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const countryName =
    COUNTRY_OPTIONS.find((c) => c.code.toUpperCase() === country)?.name ||
    country;

  const list = useMemo(() => pickUpcoming(events), [events]);

  return (
    <Box sx={{ position: "relative", px: { xs: 2, md: 4, lg: 5 }, py: { xs: 2.5, md: 3 } }}>
      <Box sx={{ maxWidth: 1650, mx: "auto" }}>
        {/* ── Header: Discover Events in [country picker] ── */}
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
          <Typography
            component="h2"
            sx={{
              fontFamily: FONT_HEAD,
              fontWeight: 800,
              fontSize: { xs: 22, md: 30 },
              color: "#0f172a",
            }}
          >
            Discover Events in
          </Typography>
          <Select
            value={country}
            onChange={(e) => setCountry(String(e.target.value))}
            variant="standard"
            disableUnderline
            renderValue={(val) => {
              const c = String(val);
              const name =
                COUNTRY_OPTIONS.find((o) => o.code.toUpperCase() === c)?.name || c;
              return (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={flagUrl(c)}
                    alt=""
                    width={28}
                    height={20}
                    style={{ borderRadius: 3, objectFit: "cover", display: "block" }}
                  />
                  <Box
                    component="span"
                    sx={{
                      fontFamily: FONT_HEAD,
                      fontWeight: 800,
                      fontSize: { xs: 22, md: 30 },
                      background: ACCENT_GRADIENT,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {name}
                  </Box>
                </Box>
              );
            }}
            sx={{
              "& .MuiSelect-select": {
                display: "inline-flex",
                alignItems: "center",
                p: 0,
                pr: "30px !important",
              },
              "& .MuiSelect-icon": { color: "#F77F00", right: 0 },
            }}
            MenuProps={{ PaperProps: { sx: { maxHeight: 380, borderRadius: 2 } } }}
          >
            {COUNTRY_OPTIONS.map((c) => (
              <MenuItem
                key={c.code}
                value={c.code.toUpperCase()}
                sx={{ fontFamily: FONT_BODY, gap: 1.25 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={flagUrl(c.code)}
                  alt=""
                  width={22}
                  height={16}
                  style={{ borderRadius: 2, objectFit: "cover", display: "block" }}
                />
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </Stack>

        <Typography
          sx={{
            fontFamily: FONT_BODY,
            color: "#64748b",
            fontSize: { xs: 14, md: 15 },
            mt: 0.5,
            mb: 3,
          }}
        >
          Filipino events, festivals, and gatherings in {countryName}.
        </Typography>

        {/* ── Grid ── */}
        {loading ? (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
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
              bgcolor: "#fff8ec",
              border: "1px dashed #fde2b3",
            }}
          >
            <Typography sx={{ fontFamily: FONT_HEAD, fontWeight: 800, color: "#0f172a", mb: 1 }}>
              No upcoming events in {countryName} yet
            </Typography>
            <Typography sx={{ fontFamily: FONT_BODY, fontSize: 14, color: "#64748b", mb: 3 }}>
              Try another country, or browse everything happening worldwide.
            </Typography>
            <NextLink href="/browse-events" style={{ textDecoration: "none" }}>
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
                  boxShadow: "0 8px 18px rgba(247,127,0,0.3)",
                }}
              >
                Browse all events
              </Box>
            </NextLink>
          </Box>
        ) : (
          <>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {list.map((ev, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={ev.id || `ev-${i}`}>
                  <EventCard ev={ev} fallbackCountry={countryName} />
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 3.5, display: "flex", justifyContent: "center" }}>
              <NextLink
                href={`/country/${country.toLowerCase()}`}
                style={{ textDecoration: "none" }}
              >
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
                    color: "#c2410c",
                    border: "2px solid #fde2b3",
                    transition: "background .2s",
                    "&:hover": { background: "#fff8ec" },
                  }}
                >
                  See all events in {countryName}
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
