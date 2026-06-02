"use client";
import { useMemo, useState, type MouseEvent } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NextLink from "next/link";
import {
  getCountryName,
  normalizeToAlpha2,
} from "@/lib/countryCodes";
import PublishForFree from "@/components/about/PublishForFree";
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import type { BayanihanEvent } from "@/types";
import { eventUrl } from "@/lib/eventUrl";

const HERO_IMG = "/browse-events/events.png";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type MonthFilter = "All" | number;

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
        { width: { xs: "98%", lg: "96%" }, maxWidth: 1600, mx: "auto" },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  );
}

function flagSrc(code: string) {
  return `https://flagcdn.com/w20/${code.toLowerCase()}.png`;
}

function getLocation(ev: BayanihanEvent): string {
  const rawLoc = (ev as Record<string, unknown>)?.location;
  if (typeof rawLoc === "string" && rawLoc.trim()) return rawLoc.trim();
  const venue = (ev as { venue?: { city?: string; country?: string } })?.venue;
  const locObj =
    typeof rawLoc === "object" && rawLoc
      ? (rawLoc as { city?: string; country?: string })
      : undefined;
  const city =
    (ev as { city?: string })?.city || venue?.city || locObj?.city || "";
  const country =
    (ev as { country?: string })?.country ||
    venue?.country ||
    locObj?.country ||
    "";
  const loc =
    city && country ? `${city}, ${country}` : city || country || "";
  return String(loc).trim();
}

function getCountryCode(ev: BayanihanEvent): string {
  const raw =
    (ev as { countryCode?: string })?.countryCode ||
    (ev as { country?: string })?.country ||
    (ev as { venue?: { country?: string } })?.venue?.country ||
    "";
  return normalizeToAlpha2(raw);
}

function parseEventDate(ev: BayanihanEvent): Date | null {
  const s = ev?.eventDate || ev?.date;
  if (!s || typeof s !== "string") return null;
  let d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) {
    d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function buildEventLink(ev: BayanihanEvent): string {
  return eventUrl(ev);
}

function getBadge(
  ev: BayanihanEvent
): { label: string; color: string } | null {
  const rawTags =
    ev?.tags ||
    ev?.badges ||
    ev?.labels ||
    (typeof ev?.badge === "string" ? [ev.badge] : []);
  const tags = Array.isArray(rawTags)
    ? rawTags.map((x) => String(x).toLowerCase())
    : [];
  if (ev?.trending || ev?.is_trending || tags.includes("trending"))
    return { label: "Trending", color: "#e65100" };
  if (ev?.featured || ev?.is_featured || tags.includes("featured"))
    return { label: "Featured", color: "#f59e0b" };
  if (ev?.upcoming || tags.includes("upcoming"))
    return { label: "Upcoming", color: "#2563eb" };
  return null;
}

interface EventCardProps {
  ev: BayanihanEvent;
  idx: number;
}

function EventCard({ ev, idx }: EventCardProps) {
  const to = buildEventLink(ev);
  const isExternal = /^https?:\/\//i.test(String(to));
  const badge = getBadge(ev);
  const dateStr = ev?.eventDate || ev?.date;
  const location = getLocation(ev);
  const organizerName =
    typeof (ev as { organizer?: { name?: string } | string })?.organizer ===
    "object"
      ? (ev as { organizer?: { name?: string } }).organizer?.name
      : (ev as { organizer?: string })?.organizer;

  const card = (
    <Card
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        opacity: 0,
        transform: "translateY(8px)",
        animation: "fadeUp .5s ease forwards",
        animationDelay: `${idx * 0.04}s`,
        transition: "transform .25s ease, box-shadow .25s ease",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
        "& .ev-img": { transition: "transform .35s ease" },
        "&:hover .ev-img": { transform: "scale(1.05)" },
        "@keyframes fadeUp": {
          from: { opacity: 0, transform: "translateY(8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {ev?.image && (
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            image={ev.image}
            alt={ev.title}
            className="ev-img"
            sx={{ height: 160, objectFit: "cover" }}
          />
          {badge && (
            <Box
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                px: 1,
                py: 0.25,
                borderRadius: 1.5,
                bgcolor: badge.color,
                color: "#fff",
                fontSize: 11,
                lineHeight: 1,
                fontFamily: "var(--font-outfit)",
              }}
            >
              {badge.label}
            </Box>
          )}
        </Box>
      )}
      <CardContent
        sx={{
          p: 1.25,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          flexGrow: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-urbanist)",
            fontWeight: 700,
            fontSize: 16,
            lineHeight: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {ev?.title || "Untitled Event"}
        </Typography>
        <Box sx={{ mt: "auto", display: "grid", gap: 0.25 }}>
          {dateStr && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <EventIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 400,
                  fontFamily: "var(--font-outfit)",
                }}
                noWrap
              >
                {dateStr}
              </Typography>
            </Box>
          )}
          {location && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <LocationOnIcon
                sx={{ fontSize: 18, color: "text.secondary" }}
              />
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 400,
                  fontFamily: "var(--font-outfit)",
                }}
                noWrap
              >
                {location}
              </Typography>
            </Box>
          )}
          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
              fontFamily: "var(--font-outfit)",
            }}
            noWrap
          >
            Organized by: {organizerName || "—"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return isExternal ? (
    <a href={to} style={{ textDecoration: "none", color: "inherit" }}>
      {card}
    </a>
  ) : (
    <Box
      component={NextLink}
      href={to}
      sx={{ textDecoration: "none", color: "inherit" }}
    >
      {card}
    </Box>
  );
}

interface BrowseEventsContentProps {
  initialEvents: BayanihanEvent[];
}

export default function BrowseEventsContent({
  initialEvents,
}: BrowseEventsContentProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [countryAnchor, setCountryAnchor] = useState<HTMLElement | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<MonthFilter>("All");
  const [monthAnchor, setMonthAnchor] = useState<HTMLElement | null>(null);
  const [pageSize, setPageSize] = useState(12);

  const uniqueCountries = useMemo(() => {
    const codes = Array.from(
      new Set(
        initialEvents
          .map(getCountryCode)
          .filter((x) => x && x.length === 2)
      )
    );
    codes.sort((a, b) => getCountryName(a).localeCompare(getCountryName(b)));
    return codes;
  }, [initialEvents]);

  const filtered = useMemo(() => {
    return initialEvents.filter((ev) => {
      if (selectedCountry !== "All" && getCountryCode(ev) !== selectedCountry)
        return false;
      if (selectedMonth !== "All") {
        const d = parseEventDate(ev);
        if (!d || d.getMonth() !== selectedMonth) return false;
      }
      return true;
    });
  }, [initialEvents, selectedCountry, selectedMonth]);

  const onOpenCountry = (e: MouseEvent<HTMLButtonElement>) =>
    setCountryAnchor(e.currentTarget);
  const onOpenMonth = (e: MouseEvent<HTMLButtonElement>) =>
    setMonthAnchor(e.currentTarget);

  return (
    <Box sx={{ py: 4 }}>
      {/* Hero */}
      <Container>
        <Box
          sx={{
            background: "#002F49",
            position: "relative",
            height: { xs: 420, md: 450 },
            borderRadius: "30px 30px 10px 10px",
            overflow: "hidden",
          }}
        >
          <Box sx={{ position: "absolute", inset: 0 }}>
            <Box
              component="img"
              src={HERO_IMG}
              alt="Events"
              sx={{
                position: "absolute",
                width: { xs: "100%", md: "100%", lg: 762 },
                height: { xs: "100%", md: "100%", lg: 450 },
                objectFit: { xs: "cover", md: "cover", lg: "contain" },
                left: { xs: 0, md: 0, lg: "auto" },
                right: { xs: 0, md: 0, lg: 0 },
                top: 0,
                margin: { xs: "auto", lg: 0 },
              }}
            />
          </Box>

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: {
                xs: "rgba(18,46,85,0.85)",
                md: "rgba(18,46,85,0.6)",
                lg: "linear-gradient(90deg, rgb(18, 46, 85) 53%, rgba(18, 46, 85, 0.69) 57%, rgba(18, 46, 85, 0) 61%)",
              },
            }}
          />

          <Box
            sx={{
              position: "relative",
              height: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                color: "#fff",
                px: { xs: 2, md: 4 },
                width: { xs: "100%", lg: "55%" },
              }}
            >
              <Typography
                component="h1"
                sx={{
                  fontFamily: "var(--font-urbanist)",
                  fontWeight: 900,
                  fontSize: { xs: 34, sm: 42, md: 52, lg: 65 },
                  lineHeight: 1.1,
                }}
              >
                Best Events Near You
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-outfit)",
                  opacity: 0.95,
                  maxWidth: 720,
                  mt: 1.5,
                  mb: 2,
                  fontSize: { xs: 16, md: 18 },
                }}
              >
                Looking for things to do? Whether you&rsquo;re a local, new in
                town, or just exploring, discover great events and activities
                happening around you. Browse by location, see what&rsquo;s
                popular, and find free events. Ready to explore?
              </Typography>

              <Button
                variant="contained"
                onClick={onOpenCountry}
                sx={{
                  background: "#f67f00",
                  boxShadow: "none",
                  color: "#eeeff2",
                  textTransform: "none",
                  fontSize: { xs: 16, md: 20 },
                  borderRadius: 10,
                  px: 3,
                  py: 0.8,
                  "&:hover": { background: "#5d5e5f" },
                }}
              >
                <Box
                  sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
                >
                  {selectedCountry !== "All" && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={flagSrc(selectedCountry)}
                      alt=""
                      style={{ width: 20, height: 14, borderRadius: 2 }}
                    />
                  )}
                  <span>
                    {selectedCountry === "All"
                      ? "Select Country"
                      : getCountryName(selectedCountry)}
                  </span>
                  <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
                </Box>
              </Button>

              <Menu
                anchorEl={countryAnchor}
                open={Boolean(countryAnchor)}
                onClose={() => setCountryAnchor(null)}
                disableScrollLock
              >
                <MenuItem
                  onClick={() => {
                    setSelectedCountry("All");
                    setPageSize(12);
                    setCountryAnchor(null);
                  }}
                >
                  All countries
                </MenuItem>
                {uniqueCountries.map((code) => (
                  <MenuItem
                    key={code}
                    onClick={() => {
                      setSelectedCountry(code);
                      setPageSize(12);
                      setCountryAnchor(null);
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={flagSrc(code)}
                        alt=""
                        style={{ width: 18, height: 12, borderRadius: 2 }}
                      />
                      <span>{getCountryName(code)}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Upcoming Events */}
      <Container sx={{ mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            mb: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontFamily: "var(--font-urbanist)",
              fontWeight: 800,
              fontSize: { xs: 26, md: 32 },
            }}
          >
            Upcoming Events
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                display: { xs: "none", sm: "inline" },
                color: "text.secondary",
              }}
            >
              Filter by month:
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CalendarMonthIcon />}
              endIcon={<KeyboardArrowDownIcon />}
              onClick={onOpenMonth}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                px: 1.5,
                py: 0.75,
                boxShadow: "0 4px 14px rgba(43, 123, 255, 0.25)",
                background: (theme) =>
                  `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              }}
            >
              {selectedMonth === "All"
                ? "All months"
                : MONTH_NAMES[selectedMonth]}
            </Button>
            {selectedMonth !== "All" && (
              <Chip
                label={MONTH_NAMES[selectedMonth]}
                onDelete={() => {
                  setSelectedMonth("All");
                  setPageSize(12);
                }}
                variant="outlined"
                color="primary"
              />
            )}
            <Menu
              anchorEl={monthAnchor}
              open={Boolean(monthAnchor)}
              onClose={() => setMonthAnchor(null)}
              disableScrollLock
            >
              <MenuItem
                onClick={() => {
                  setSelectedMonth("All");
                  setPageSize(12);
                  setMonthAnchor(null);
                }}
              >
                All months
              </MenuItem>
              {MONTH_NAMES.map((name, idx) => (
                <MenuItem
                  key={idx}
                  onClick={() => {
                    setSelectedMonth(idx);
                    setPageSize(12);
                    setMonthAnchor(null);
                  }}
                >
                  {name}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {filtered.slice(0, pageSize).map((ev, idx) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              key={`${ev?.id || ev?.slug || idx}-cell`}
            >
              <EventCard ev={ev} idx={idx} />
            </Grid>
          ))}
        </Grid>

        {filtered.length > pageSize && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setPageSize((s) => s + 12)}
              sx={{ textTransform: "none" }}
            >
              Load more events
            </Button>
          </Box>
        )}
      </Container>

      {/* CTA */}
      <Box sx={{ mt: 0 }}>
        <PublishForFree sx={{ my: 2, mb: 1 }} />
      </Box>
    </Box>
  );
}
