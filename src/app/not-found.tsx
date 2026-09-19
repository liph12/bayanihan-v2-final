// Custom 404. Next's built-in one is an unbranded black screen with no way
// onward, and most 404s here are people following an old link to an event
// that has ended or whose URL changed — so the page names that reason and
// offers the places they most likely wanted.

import type { Metadata } from "next";
import Link from "next/link";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NewspaperIcon from "@mui/icons-material/Newspaper";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "That page isn't on Bayanihan.com. Browse Filipino events, restaurants, and news worldwide instead.",
  // No `robots` here — Next already emits noindex for the not-found route,
  // and setting it again just duplicates the meta tag.
};

const FONT_HEAD = "var(--font-urbanist), 'Outfit', sans-serif";
const FONT_BODY = "var(--font-outfit), 'Outfit', sans-serif";
const ACCENT_GRADIENT =
  "linear-gradient(135deg, #c2410c 0%, #F77F00 50%, #FBA833 100%)";

const DESTINATIONS = [
  {
    href: "/browse-events",
    label: "Browse events",
    icon: <EventIcon />,
  },
  {
    href: "/global-calendar",
    label: "Global calendar",
    icon: <CalendarMonthIcon />,
  },
  {
    href: "/restaurant",
    label: "Restaurants",
    icon: <RestaurantIcon />,
  },
  {
    href: "/news",
    label: "News",
    icon: <NewspaperIcon />,
  },
];

export default function NotFound() {
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        bgcolor: "#f8fafc",
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontFamily: FONT_HEAD,
              fontWeight: 900,
              fontSize: { xs: 72, md: 104 },
              lineHeight: 1,
              background: ACCENT_GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </Typography>

          <Typography
            component="h1"
            sx={{
              fontFamily: FONT_HEAD,
              fontWeight: 800,
              color: "#0f172a",
              fontSize: { xs: "1.5rem", md: "2.1rem" },
              mt: 1,
            }}
          >
            We couldn&apos;t find that page
          </Typography>

          <Typography
            sx={{
              fontFamily: FONT_BODY,
              color: "#475569",
              fontSize: { xs: 15, md: 17 },
              maxWidth: 560,
              mx: "auto",
              mt: 1.5,
            }}
          >
            The link may be out of date, or the event it pointed to has already
            wrapped up. Here&apos;s where to pick things back up.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            useFlexGap
            flexWrap="wrap"
            justifyContent="center"
            sx={{ mt: 4 }}
          >
            {DESTINATIONS.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                style={{ textDecoration: "none" }}
              >
                <Button
                  startIcon={d.icon}
                  variant="outlined"
                  sx={{
                    fontFamily: FONT_BODY,
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: 3,
                    px: 2.5,
                    py: 1.2,
                    color: "#0f172a",
                    borderColor: "#e2e8f0",
                    bgcolor: "#fff",
                    "&:hover": { borderColor: "#F77F00", bgcolor: "#fff7ed" },
                  }}
                >
                  {d.label}
                </Button>
              </Link>
            ))}
          </Stack>

          <Box sx={{ mt: 4 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                sx={{
                  fontFamily: FONT_BODY,
                  fontWeight: 800,
                  textTransform: "none",
                  borderRadius: 3,
                  px: 4,
                  py: 1.4,
                  background: ACCENT_GRADIENT,
                  boxShadow: "0 10px 24px rgba(247,127,0,0.25)",
                }}
              >
                Back to Bayanihan.com
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
