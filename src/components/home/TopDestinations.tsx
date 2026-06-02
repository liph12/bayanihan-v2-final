"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardMedia, Typography, Box, useTheme, useMediaQuery } from "@mui/material";
import { useLocale } from "@/providers/LocaleProvider";

const DESTINATIONS = [
  { title: "Boracay Island", subtitle: "Aklan", img: "/destinations/Boracay.png" },
  { title: "El Nido", subtitle: "Palawan", img: "/destinations/elnido.jpg" },
  { title: "Chocolate Hills", subtitle: "Bohol", img: "/destinations/chocolatehills.jpg" },
  { title: "Kawasan Falls", subtitle: "Cebu", img: "/destinations/kawasan.webp" },
  { title: "Siargao Island", subtitle: "Surigao del Norte", img: "/destinations/siargao.jpg" },
  { title: "Mayon Volcano", subtitle: "Albay", img: "/destinations/mayon.jpg" },
  { title: "Vigan City", subtitle: "Ilocos Sur", img: "/destinations/vigan.jpeg" },
  { title: "Banaue Rice Terraces", subtitle: "Ifugao", img: "/destinations/banaue.webp" },
];

export default function TopDestinations() {
  const { t } = useLocale();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const VISIBLE_CARDS = isMobile ? 1 : isTablet ? 3 : 5;
  const GAP = 16;
  const [index, setIndex] = useState(0);
  const maxIndex = DESTINATIONS.length - VISIBLE_CARDS;

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [maxIndex]);

  return (
    <Box sx={{ px: 2, py: 3, width: "98%", margin: "0 auto" }}>
      <Typography
        component="h2"
        sx={{
          fontFamily: "var(--font-urbanist)",
          fontWeight: 800,
          fontSize: 24,
          mb: 2,
        }}
      >
        {t("topDestinationsTitle")}
      </Typography>

      <Box sx={{ overflow: "hidden", width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            gap: `${GAP}px`,
            transition: "transform 0.7s ease",
            transform: `translateX(calc(-${index} * (100% / ${VISIBLE_CARDS} + ${GAP}px)))`,
          }}
        >
          {DESTINATIONS.map((d, i) => (
            <Card
              key={i}
              sx={{
                width: `calc((100% - ${GAP * (VISIBLE_CARDS - 1)}px) / ${VISIBLE_CARDS})`,
                height: 180,
                borderRadius: "35px 35px 0 0",
                overflow: "hidden",
                position: "relative",
                flexShrink: 0,
                borderBottom: "9px solid #166EF0",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
            >
              <CardMedia
                component="img"
                image={d.img}
                alt={d.title}
                sx={{ height: "100%", objectFit: "cover" }}
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
          ))}
        </Box>
      </Box>
    </Box>
  );
}
