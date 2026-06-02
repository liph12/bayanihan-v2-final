"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import NextLink from "next/link";
import AxiosInstance from "@/lib/AxiosInstance";
import { useLocale } from "@/providers/LocaleProvider";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import type { BayanihanEvent } from "@/types";
import { eventUrl } from "@/lib/eventUrl";
import StoryRail from "./StoryRail";

const FONT_HEAD = "var(--font-urbanist), 'Outfit', sans-serif";
const FONT_BODY = "var(--font-outfit), 'Outfit', sans-serif";
const ACCENT_GRADIENT =
  "linear-gradient(135deg, #c2410c 0%, #F77F00 50%, #FBA833 100%)";

interface EventsSectionProps {
  initialEvents?: BayanihanEvent[];
}

function formatDate(input?: string): string | null {
  if (!input) return null;
  const d = new Date(input);
  if (isNaN(d.getTime())) return input;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// Full date including year — shown only in the hover-expanded state, where
// there's room for the extra context.
function formatDateLong(input?: string): string | null {
  if (!input) return null;
  const d = new Date(input);
  if (isNaN(d.getTime())) return input;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EventsSection({
  initialEvents = [],
}: EventsSectionProps) {
  const [events, setEvents] = useState<BayanihanEvent[]>(initialEvents);
  const { t } = useLocale();

  useEffect(() => {
    if (initialEvents.length > 0) return;
    let mounted = true;
    (async () => {
      try {
        const resp = await AxiosInstance.get<unknown>("events");
        const d = resp?.data as
          | { data?: { events?: BayanihanEvent[] }; events?: BayanihanEvent[] }
          | BayanihanEvent[]
          | undefined;
        const arr: BayanihanEvent[] = Array.isArray(d)
          ? d
          : Array.isArray(d?.data?.events)
          ? d.data!.events!
          : Array.isArray(d?.events)
          ? d.events!
          : [];
        if (mounted) setEvents(arr);
      } catch {
        if (mounted) setEvents([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialEvents.length]);

  const visible = useMemo(() => events.slice(0, 30), [events]);

  const renderCard = (ev: BayanihanEvent) => {
    const link = eventUrl(ev);
    const isExternal = link.startsWith("http");
    const date = formatDate(ev?.eventDate || ev?.date);
    const dateLong = formatDateLong(ev?.eventDate || ev?.date);
    const host = ev?.subDomain?.name;

    const card = (
      <Box
        sx={{
          position: "relative",
          // Explicit width + height (no aspectRatio) so the card can grow
          // horizontally on hover without dragging its height with it —
          // otherwise the whole rail row would jump vertically on hover.
          // Heights below equal width * 16/9 so the compact state still
          // looks identical to the previous 9:16 portrait poster.
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
              "& .ev-img": { transform: "scale(1.08)" },
              "& .ev-title": { WebkitLineClamp: 3 },
              "& .ev-extra": {
                opacity: 1,
                transform: "translateY(0)",
                pointerEvents: "auto",
              },
            },
          },
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
            <CelebrationRoundedIcon sx={{ fontSize: 36, opacity: 0.8 }} />
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

        {date && (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.4,
              px: 1,
              py: 0.4,
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
            }}
          >
            <EventRoundedIcon sx={{ fontSize: 12 }} />
            {date}
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
          <Typography
            className="ev-title"
            sx={{
              fontFamily: FONT_HEAD,
              fontSize: { xs: 14, md: 15 },
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: "-0.005em",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textShadow: "0 2px 6px rgba(0,0,0,0.5)",
              transition: "all .3s ease",
            }}
          >
            {ev?.title || "Untitled Event"}
          </Typography>

          {/*
            Hover-only "extra" panel. Hidden until the card expands; the
            parent's @media (hover: hover) &:hover rule reveals it.
            pointerEvents is disabled while hidden so it can't intercept
            clicks meant for the card link beneath.
          */}
          <Box
            className="ev-extra"
            sx={{
              mt: 0.75,
              opacity: 0,
              transform: "translateY(6px)",
              pointerEvents: "none",
              transition:
                "opacity .25s ease .05s, transform .3s cubic-bezier(0.22, 1, 0.36, 1) .05s",
            }}
          >
            {dateLong && (
              <Typography
                sx={{
                  fontFamily: FONT_BODY,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.85)",
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                }}
              >
                {dateLong}
              </Typography>
            )}
            {host && (
              <Typography
                sx={{
                  fontFamily: FONT_BODY,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.7)",
                  mt: 0.25,
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                }}
              >
                Hosted by {host}
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
                boxShadow: "0 6px 14px rgba(247,127,0,0.35)",
              }}
            >
              View event
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
        background:
          "radial-gradient(900px 500px at -10% 0%, rgba(247,127,0,0.06), transparent 60%), #fffdf6",
      }}
    >
      {/* Header */}
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
              bgcolor: "#fff4dd",
              border: "1px solid #fde2b3",
              color: "#c2410c",
              fontFamily: FONT_HEAD,
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              mb: 0.75,
            }}
          >
            <CelebrationRoundedIcon sx={{ fontSize: 11 }} />
            Events
            {events.length > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 0.5,
                  pl: 0.75,
                  borderLeft: "1px solid #fde2b3",
                  color: "#0f172a",
                  fontWeight: 900,
                }}
              >
                {events.length}
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
            {t("discoverEventsTitle") || "Discover Filipino events"}
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
          href="/browse-events"
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
            boxShadow: "0 6px 14px rgba(247,127,0,0.28)",
            transition: "all .2s ease",
            flexShrink: 0,
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 8px 18px rgba(247,127,0,0.4)",
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
            bgcolor: "#fff8ec",
            border: "1px dashed #fde2b3",
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
            No events to display yet.
          </Typography>
        </Box>
      ) : (
        <StoryRail
          accentColor="#c2410c"
          deps={[visible.length]}
          autoScroll
        >
          {visible.map((ev, i) => (
            <Box key={ev.id || i}>{renderCard(ev)}</Box>
          ))}
        </StoryRail>
      )}
    </Box>
  );
}
