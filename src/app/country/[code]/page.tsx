// Country-scoped events page served at /country/<code> (e.g. /country/us).
// Links into this route originate from the homepage's flag chips in
// PopularCountries — until this file existed, those clicks 404'd.
// Mirrors the v2 Vite page in shape: header with country name, grid of
// upcoming events fetched from `events-list/<CODE>`.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NextLink from "next/link";
import {
  Box,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import { serverGet } from "@/lib/serverFetch";
import { countryCodes } from "@/lib/countryCodes";
import { eventUrl } from "@/lib/eventUrl";
import type { BayanihanEvent } from "@/types";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bayanihan.com"
).replace(/\/$/, "");

interface PageProps {
  params: Promise<{ code: string }>;
}

function findCountry(code: string) {
  const upper = String(code || "").toUpperCase();
  return countryCodes.find((c) => c.code.toUpperCase() === upper);
}

interface EventsListResponse {
  data?: { events?: BayanihanEvent[] };
  events?: BayanihanEvent[];
}

async function fetchEventsForCountry(
  code: string
): Promise<BayanihanEvent[]> {
  try {
    const data = await serverGet<EventsListResponse | BayanihanEvent[]>(
      `events-list/${code.toUpperCase()}`,
      { revalidate: 300 }
    );
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data?.events)) return data.data!.events!;
    if (Array.isArray(data?.events)) return data.events!;
    return [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { code } = await params;
  const country = findCountry(code);
  if (!country) return { title: "Country Not Found" };
  const canonical = `/country/${code.toLowerCase()}`;
  const title = `Filipino Events in ${country.name}`;
  const description = `Discover Filipino events, festivals, and community gatherings happening in ${country.name}. Stay connected with the Filipino community worldwide on Bayanihan.com.`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function getEventTimestamp(event: BayanihanEvent): number {
  const val = event?.eventDate || event?.date;
  const parsed = Date.parse(val || "");
  return Number.isNaN(parsed) ? 0 : parsed;
}

// Extracted to a helper so the impure Date.now() call doesn't trip the
// React Compiler purity check that fires on calls made directly inside
// a component's render body.
function filterUpcomingSorted(events: BayanihanEvent[]): BayanihanEvent[] {
  const now = Date.now();
  return events
    .filter((e) => getEventTimestamp(e) >= now)
    .sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a));
}

function formatDate(input?: string | null): string {
  if (!input) return "Date TBA";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const ACCENT_GRADIENT =
  "linear-gradient(135deg, #c2410c 0%, #F77F00 50%, #FBA833 100%)";
const FONT_HEAD = "var(--font-urbanist), 'Outfit', sans-serif";
const FONT_BODY = "var(--font-outfit), 'Outfit', sans-serif";

export default async function CountryEventsPage({ params }: PageProps) {
  const { code } = await params;
  const country = findCountry(code);
  if (!country) notFound();

  const events = await fetchEventsForCountry(code);

  // Match the Vite page: only show upcoming events, newest-first by event
  // date. Events with unparseable dates fall out (timestamp 0 < now).
  const upcoming = filterUpcomingSorted(events);

  const flagCode = code.toLowerCase();
  const canonicalUrl = `${SITE_URL}/country/${flagCode}`;

  // JSON-LD CollectionPage — gives crawlers a clear signal that this is a
  // listing of events in a single country, plus a few event entries so
  // they can show up in rich results.
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Filipino Events in ${country.name}`,
    description: `Discover Filipino events, festivals, and community gatherings happening in ${country.name}.`,
    url: canonicalUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: upcoming.length,
      itemListElement: upcoming.slice(0, 20).map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}${eventUrl(e)}`,
        name: e.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <Box
        component="main"
        sx={{
          bgcolor: "#fffdf6",
          minHeight: "100vh",
          pb: { xs: 6, md: 10 },
        }}
      >
        {/* ── HERO HEADER ─────────────────────────────────────────── */}
        <Box
          sx={{
            position: "relative",
            background:
              "radial-gradient(900px 500px at -10% 0%, rgba(247,127,0,0.10), transparent 60%), radial-gradient(900px 500px at 110% 0%, rgba(251,168,51,0.10), transparent 60%), #fff",
            borderBottom: "1px solid #fde2b3",
            py: { xs: 5, md: 7 },
            px: { xs: 2, md: 4 },
          }}
        >
          <Box sx={{ maxWidth: 1280, mx: "auto", textAlign: "center" }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://flagcdn.com/w80/${flagCode}.png`}
                srcSet={`https://flagcdn.com/w160/${flagCode}.png 2x`}
                alt={`${country.name} flag`}
                width={48}
                height={36}
                style={{
                  borderRadius: 4,
                  display: "block",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                }}
              />
            </Box>
            <Typography
              component="h1"
              sx={{
                fontFamily: FONT_HEAD,
                fontWeight: 900,
                fontSize: { xs: 28, sm: 36, md: 48 },
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "#0f172a",
                mb: 1.5,
              }}
            >
              Filipino events in{" "}
              <Box
                component="span"
                sx={{
                  background: ACCENT_GRADIENT,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {country.name}
              </Box>
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT_BODY,
                fontSize: { xs: 14, md: 16 },
                color: "#475569",
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.55,
              }}
            >
              {upcoming.length > 0
                ? `${upcoming.length} upcoming ${upcoming.length === 1 ? "event" : "events"} for the Filipino community in ${country.name}.`
                : `No upcoming events yet in ${country.name} — check back soon, or browse events worldwide.`}
            </Typography>
          </Box>
        </Box>

        {/* ── EVENTS GRID ────────────────────────────────────────── */}
        <Box
          sx={{
            maxWidth: 1280,
            mx: "auto",
            px: { xs: 2, md: 4 },
            pt: { xs: 4, md: 6 },
          }}
        >
          {upcoming.length === 0 ? (
            <Box
              sx={{
                py: 6,
                textAlign: "center",
                borderRadius: 3,
                bgcolor: "#fff8ec",
                border: "1px dashed #fde2b3",
              }}
            >
              <Typography
                sx={{
                  fontFamily: FONT_HEAD,
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#0f172a",
                  mb: 1,
                }}
              >
                No upcoming events in {country.name}
              </Typography>
              <Typography
                sx={{
                  fontFamily: FONT_BODY,
                  fontSize: 14,
                  color: "#64748b",
                  mb: 3,
                }}
              >
                Be the first to know when new events are announced.
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
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {upcoming.map((ev, i) => {
                const href = eventUrl(ev) || "#";
                const isExternal = href.startsWith("http");
                const date = formatDate(ev?.eventDate || ev?.date);
                const location =
                  (ev as { location?: string })?.location || country.name;

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
                    {/* Image */}
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
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition:
                              "transform .5s cubic-bezier(0.22, 1, 0.36, 1)",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            background: ACCENT_GRADIENT,
                          }}
                        />
                      )}
                    </Box>

                    {/* Body */}
                    <Box
                      sx={{
                        p: { xs: 2, md: 2.25 },
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        flex: 1,
                      }}
                    >
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
                        {location}
                      </Box>
                    </Box>
                  </Box>
                );

                return (
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    key={ev.id || `${href}-${i}`}
                  >
                    {isExternal ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                          display: "block",
                          height: "100%",
                        }}
                      >
                        {card}
                      </a>
                    ) : (
                      <NextLink
                        href={href}
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                          display: "block",
                          height: "100%",
                        }}
                      >
                        {card}
                      </NextLink>
                    )}
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Box>
    </>
  );
}
