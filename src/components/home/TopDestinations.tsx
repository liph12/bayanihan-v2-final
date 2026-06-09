"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import NextLink from "next/link";
import Image from "next/image";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { DESTINATIONS, destinationUrl } from "@/lib/destinations";

const FONT_HEAD = "var(--font-urbanist), 'Outfit', sans-serif";
const ACCENT_GRADIENT =
  "linear-gradient(135deg, #1d4ed8 0%, #166EF0 50%, #38bdf8 100%)";

export default function TopDestinations() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const VISIBLE_CARDS = isMobile ? 1 : isTablet ? 3 : 5;
  const GAP = 16;
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(0, DESTINATIONS.length - VISIBLE_CARDS);
  const clampedIndex = Math.min(index, maxIndex);

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(maxIndex, i + 1));

  const navBtnSx = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: { xs: 36, md: 42 },
    height: { xs: 36, md: 42 },
    bgcolor: "#fff",
    color: "#166EF0",
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 8px 20px rgba(15,23,42,0.16)",
    zIndex: 4,
    transition: "all .2s ease",
    "&:hover": {
      bgcolor: "#fff",
      transform: "translateY(-50%) scale(1.06)",
      boxShadow: "0 12px 26px rgba(15,23,42,0.22)",
    },
    "&.Mui-disabled": { opacity: 0.35, bgcolor: "#fff" },
  } as const;

  return (
    <Box id="top-destinations" sx={{ px: 2, py: 3, width: "98%", margin: "0 auto" }}>
      <Typography
        component="h2"
        sx={{
          fontFamily: FONT_HEAD,
          fontWeight: 800,
          fontSize: { xs: 22, md: 30 },
          color: "#0f172a",
          mb: 2,
        }}
      >
        Top Destinations in the{" "}
        <Box
          component="span"
          sx={{
            background: ACCENT_GRADIENT,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Philippines
        </Box>
      </Typography>

      <Box sx={{ position: "relative" }}>
        <Box sx={{ overflow: "hidden", width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              gap: `${GAP}px`,
              transition: "transform 0.5s ease",
              // Step by exactly one card + gap so cards always align to the
              // edges (no partially-cut cards). Card width is
              // (100% - (V-1)*GAP)/V, so one step = that + GAP.
              transform: `translateX(calc(-${clampedIndex} * ((100% - ${
                (VISIBLE_CARDS - 1) * GAP
              }px) / ${VISIBLE_CARDS} + ${GAP}px)))`,
            }}
          >
            {DESTINATIONS.map((d) => (
              <Box
                component={NextLink}
                key={d.slug}
                href={destinationUrl(d.slug)}
                sx={{
                  width: `calc((100% - ${GAP * (VISIBLE_CARDS - 1)}px) / ${VISIBLE_CARDS})`,
                  flexShrink: 0,
                  textDecoration: "none",
                }}
              >
                <Card
                  sx={{
                    width: "100%",
                    height: 180,
                    borderRadius: "35px 35px 0 0",
                    overflow: "hidden",
                    position: "relative",
                    borderBottom: "9px solid #166EF0",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    transition: "transform .3s ease, box-shadow .3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 16px 32px rgba(0,0,0,0.14)",
                    },
                    "&:hover .dest-img": { transform: "scale(1.06)" },
                  }}
                >
                  <Image
                    className="dest-img"
                    src={d.img}
                    alt={`${d.title}, ${d.subtitle}`}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 900px) 34vw, 20vw"
                    style={{ objectFit: "cover", transition: "transform .5s ease" }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 20%, rgba(0,0,0,0.85) 100%)",
                      zIndex: 1,
                    }}
                  />
                  <CardContent
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      color: "#fff",
                      p: 1.5,
                      zIndex: 3,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "var(--font-urbanist)",
                        fontWeight: 800,
                        fontSize: isMobile ? 20 : 18,
                        textShadow: "0 1px 8px rgba(0,0,0,.35)",
                      }}
                    >
                      {d.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "var(--font-outfit)",
                        fontWeight: 500,
                        fontSize: isMobile ? 16 : 14,
                        opacity: 0.95,
                      }}
                    >
                      {d.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        <IconButton
          aria-label="Previous destinations"
          onClick={prev}
          disabled={clampedIndex === 0}
          size="small"
          sx={{ ...navBtnSx, left: { xs: 0, md: -18 } }}
        >
          <ChevronLeftRoundedIcon />
        </IconButton>
        <IconButton
          aria-label="Next destinations"
          onClick={next}
          disabled={clampedIndex >= maxIndex}
          size="small"
          sx={{ ...navBtnSx, right: { xs: 0, md: -18 } }}
        >
          <ChevronRightRoundedIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
