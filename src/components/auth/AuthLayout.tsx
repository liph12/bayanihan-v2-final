"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2";

const BG = "/auth/signinbg.png";
const SLIDES = ["/auth/reg_bg2.webp", "/auth/reg_bg3.webp"];

export default function AuthLayout({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((p) => (p + 1) % SLIDES.length);
        setFade(true);
      }, 500);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const slide = (img: string, isActive: boolean, borderRadius: string) => ({
    backgroundImage: `url(${img})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    width: "100%",
    height: "100%",
    borderRadius,
    transition: "opacity 0.5s ease-in-out",
    opacity: isActive && fade ? 1 : 0,
    position: "absolute" as const,
    top: 0,
    left: 0,
    zIndex: isActive ? 1 : 0,
  });

  return (
    <Box
      sx={{
        backgroundImage: { xs: "none", lg: `url(${BG})` },
        backgroundSize: "cover",
        backgroundPosition: "bottom",
        backgroundRepeat: "no-repeat",
        minHeight: { xs: "auto", lg: "100vh" },
        position: "relative",
      }}
    >
      <Box sx={{ p: { xs: 2.5, sm: "50px", lg: "60px 120px" } }}>
        <Grid container>
          {desktop ? (
            <>
              <Grid size={{ lg: 4, md: 6, xs: 12 }}>
                <Box
                  sx={{
                    background: "#151515",
                    p: "5px 3px",
                    minHeight: "70vh",
                    borderRadius: "30px 0 0 30px",
                  }}
                >
                  {children}
                </Box>
              </Grid>
              <Grid size={{ lg: 8, md: 6, xs: 12 }} sx={{ position: "relative", minHeight: "70vh" }}>
                {SLIDES.map((img, i) => (
                  <Box key={img} sx={slide(img, i === index, "0px 30px 30px 0px")} />
                ))}
              </Grid>
            </>
          ) : (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  background: "#151515",
                  p: "5px 1px",
                  borderRadius: "30px 30px 0 0",
                }}
              >
                {children}
              </Box>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: 300,
                  borderRadius: "0 0 30px 30px",
                  overflow: "hidden",
                }}
              >
                {SLIDES.map((img, i) => (
                  <Box key={img} sx={slide(img, i === index, "0 0 30px 30px")} />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
}
