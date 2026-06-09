"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardMedia, Typography, Box, useTheme, useMediaQuery } from "@mui/material";
import NextLink from "next/link";
import { useLocale } from "@/providers/LocaleProvider";
import { DESTINATIONS, destinationUrl } from "@/lib/destinations";

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
    <Box id="top-destinations" sx={{ px: 2, py: 3, width: "98%", margin: "0 auto" }}>
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
                <CardMedia
                  component="img"
                  className="dest-img"
                  image={d.img}
                  alt={`${d.title}, ${d.subtitle}`}
                  sx={{
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform .5s ease",
                  }}
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
    </Box>
  );
}
