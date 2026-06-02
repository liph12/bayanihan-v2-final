"use client";
import { Box, Typography, Button, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import NextLink from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import RocketLaunchRounded from "@mui/icons-material/RocketLaunchRounded";

const FONT_HEAD = "var(--font-urbanist), 'Outfit', sans-serif";
const FONT_BODY = "var(--font-outfit), 'Outfit', sans-serif";
const FILIPINO_GRADIENT =
  "linear-gradient(135deg, #c2410c 0%, #F77F00 35%, #FBA833 70%, #FFD166 100%)";

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={1.25}>
      <CheckCircleRounded
        sx={{ color: "#fff", fontSize: 22, mt: "1px", flexShrink: 0 }}
      />
      <Typography
        sx={{
          fontFamily: FONT_BODY,
          fontSize: { xs: 14.5, md: 15.5 },
          color: "rgba(255,255,255,0.94)",
          fontWeight: 500,
          lineHeight: 1.55,
        }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

interface PublishForFreeProps {
  sx?: SxProps<Theme>;
}

export default function PublishForFree({ sx }: PublishForFreeProps) {
  return (
    <Box
      sx={[
        {
          width: "100%",
          maxWidth: 1400,
          mx: "auto",
          px: { xs: 2.5, sm: 3, md: 4, lg: 5 },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        sx={{
          position: "relative",
          borderRadius: { xs: 5, md: 7 },
          overflow: "hidden",
          background: FILIPINO_GRADIENT,
          boxShadow: "0 40px 90px rgba(247,127,0,0.32)",
        }}
      >
        {/* Decorative blobs */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: -120,
            right: -100,
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.16)",
            filter: "blur(8px)",
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            bottom: -140,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.08)",
            filter: "blur(12px)",
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18), transparent 55%)",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "relative",
            p: { xs: 3.5, sm: 5, md: 6 },
          }}
        >
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 0.65,
                  borderRadius: 999,
                  bgcolor: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.32)",
                  backdropFilter: "blur(10px)",
                  color: "#fff",
                  fontFamily: FONT_HEAD,
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  mb: 2.5,
                }}
              >
                <RocketLaunchRounded sx={{ fontSize: 14 }} />
                Free for organizers
              </Box>

              <Typography
                component="h2"
                sx={{
                  fontFamily: FONT_HEAD,
                  fontWeight: 900,
                  fontSize: { xs: 30, sm: 38, md: 48, lg: 54 },
                  color: "#fff",
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                  mb: 2,
                  textShadow: "0 2px 24px rgba(0,0,0,0.18)",
                }}
              >
                Publish your events for free.
              </Typography>
              <Typography
                sx={{
                  fontFamily: FONT_BODY,
                  fontSize: { xs: 14.5, md: 16.5 },
                  lineHeight: 1.75,
                  color: "rgba(255,255,255,0.92)",
                  mb: 3.5,
                  maxWidth: 560,
                  fontWeight: 500,
                }}
              >
                Share your events with Filipino communities around the world
                through a platform built to celebrate culture, connection, and
                community gatherings. Bayanihan.com helps organizers promote
                events, reach new audiences, and grow their communities — all
                in one place.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                useFlexGap
                flexWrap="wrap"
              >
                <Button
                  component={NextLink}
                  href="/registration"
                  endIcon={<ArrowForwardRounded />}
                  sx={{
                    fontFamily: FONT_HEAD,
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: { xs: 14.5, md: 16 },
                    color: "#c2410c",
                    px: { xs: 3, md: 3.5 },
                    py: { xs: 1.25, md: 1.4 },
                    borderRadius: 999,
                    bgcolor: "#fff",
                    boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
                    transition: "all .25s ease",
                    "&:hover": {
                      bgcolor: "#fff8ec",
                      transform: "translateY(-2px)",
                      boxShadow: "0 18px 36px rgba(0,0,0,0.24)",
                    },
                  }}
                >
                  Get started free
                </Button>
                <Button
                  component={NextLink}
                  href="/contact-us"
                  sx={{
                    fontFamily: FONT_HEAD,
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: { xs: 14.5, md: 16 },
                    color: "#fff",
                    px: { xs: 3, md: 3.5 },
                    py: { xs: 1.25, md: 1.4 },
                    borderRadius: 999,
                    bgcolor: "rgba(255,255,255,0.14)",
                    border: "1.5px solid rgba(255,255,255,0.5)",
                    backdropFilter: "blur(10px)",
                    transition: "all .25s ease",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.24)",
                      borderColor: "#fff",
                    },
                  }}
                >
                  Talk to us
                </Button>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  p: { xs: 3, md: 3.5 },
                  borderRadius: 4,
                  bgcolor: "rgba(0,0,0,0.18)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(14px)",
                }}
              >
                <Typography
                  component="h3"
                  sx={{
                    fontFamily: FONT_HEAD,
                    fontWeight: 900,
                    fontSize: { xs: 18, md: 20 },
                    color: "#fff",
                    mb: 2.5,
                    letterSpacing: "-0.005em",
                  }}
                >
                  Everything you need
                </Typography>
                <Stack spacing={1.5}>
                  <CheckItem>Publish and update events easily.</CheckItem>
                  <CheckItem>Reach Filipinos seeking community events.</CheckItem>
                  <CheckItem>Promote events across social networks.</CheckItem>
                  <CheckItem>Manage details from an organizer dashboard.</CheckItem>
                  <CheckItem>Track engagement to improve future events.</CheckItem>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
