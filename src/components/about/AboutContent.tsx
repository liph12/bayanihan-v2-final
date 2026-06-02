"use client";

import {
  Box,
  Typography,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import NextLink from "next/link";
import { motion } from "framer-motion";
import { keyframes } from "@mui/system";
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import EventAvailableRounded from "@mui/icons-material/EventAvailableRounded";
import PublicRounded from "@mui/icons-material/PublicRounded";
import FavoriteRounded from "@mui/icons-material/FavoriteRounded";
import HandshakeRounded from "@mui/icons-material/HandshakeRounded";
import ConnectWithoutContactRounded from "@mui/icons-material/ConnectWithoutContactRounded";
import LanguageRounded from "@mui/icons-material/LanguageRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import RocketLaunchRounded from "@mui/icons-material/RocketLaunchRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import DashboardCustomizeRounded from "@mui/icons-material/DashboardCustomizeRounded";
import CampaignRounded from "@mui/icons-material/CampaignRounded";
import ShareRounded from "@mui/icons-material/ShareRounded";
import LocationCityRounded from "@mui/icons-material/LocationCityRounded";
import PublishForFree from "./PublishForFree";

const heroImg =
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/bayanihan/timeline/bayanihanlaunch/bayanihanlaunch.png";

const bayanihan =
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/bayanihan/timeline/houston/houston.png";

const mobileView =
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/bayanihan/banner_images/mobileview.png";

const FONT_HEAD = "var(--font-urbanist), 'Outfit', sans-serif";
const FONT_BODY = "var(--font-outfit), 'Outfit', sans-serif";

const FILIPINO_GRADIENT =
  "linear-gradient(135deg, #c2410c 0%, #F77F00 35%, #FBA833 70%, #FFD166 100%)";

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const floatSlow = keyframes`
  0% { transform: translate(0,0) rotate(0deg); }
  50% { transform: translate(8px,-12px) rotate(4deg); }
  100% { transform: translate(0,0) rotate(0deg); }
`;

const blob = keyframes`
  0%, 100% { border-radius: 42% 58% 70% 30% / 45% 35% 65% 55%; }
  50% { border-radius: 60% 40% 30% 70% / 55% 65% 35% 45%; }
`;

interface ContainerProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

function Container({ children, sx }: ContainerProps) {
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
      {children}
    </Box>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

interface StatProps {
  icon: ReactNode;
  value: string;
  label: string;
  color: string;
}

function Stat({ icon, value, label, color }: StatProps) {
  return (
    <Box
      component={motion.div}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      sx={{
        position: "relative",
        p: { xs: 2.5, md: 3 },
        borderRadius: 4,
        bgcolor: "#fff",
        border: "1px solid rgba(247,127,0,0.12)",
        boxShadow: "0 10px 30px rgba(247,127,0,0.06)",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -28,
          right: -28,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: `${color}14`,
        }}
      />
      <Box
        sx={{
          position: "relative",
          width: 48,
          height: 48,
          borderRadius: 2.5,
          display: "grid",
          placeItems: "center",
          background: `${color}1a`,
          color,
          mb: 2,
          "& svg": { fontSize: 26 },
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontFamily: FONT_HEAD,
          fontWeight: 900,
          fontSize: { xs: 28, md: 34 },
          color: "#0f172a",
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          fontFamily: FONT_BODY,
          fontSize: 13.5,
          fontWeight: 600,
          color: "#64748b",
          mt: 0.75,
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

interface ValueCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  accent: string;
}

function ValueCard({ icon, title, description, accent }: ValueCardProps) {
  return (
    <Box
      component={motion.div}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        position: "relative",
        p: { xs: 3, md: 4 },
        borderRadius: 5,
        bgcolor: "#fff",
        border: "1px solid #f1e3c8",
        boxShadow: "0 20px 50px rgba(247,127,0,0.06)",
        overflow: "hidden",
        height: "100%",
        transition: "all .3s ease",
        "&:hover": {
          boxShadow: "0 30px 70px rgba(247,127,0,0.14)",
          borderColor: "#fbd6a3",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          background: `${accent}22`,
          animation: `${blob} 14s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: "relative",
          width: 60,
          height: 60,
          borderRadius: 3,
          display: "grid",
          placeItems: "center",
          background: `linear-gradient(135deg, ${accent} 0%, ${accent}aa 100%)`,
          color: "#fff",
          boxShadow: `0 12px 24px ${accent}40`,
          mb: 2.5,
          "& svg": { fontSize: 32 },
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontFamily: FONT_HEAD,
          fontWeight: 800,
          fontSize: { xs: 20, md: 22 },
          color: "#0f172a",
          mb: 1,
          lineHeight: 1.25,
          position: "relative",
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontFamily: FONT_BODY,
          fontSize: { xs: 14, md: 15 },
          fontWeight: 500,
          color: "#475569",
          lineHeight: 1.7,
          position: "relative",
        }}
      >
        {description}
      </Typography>
    </Box>
  );
}

interface FeaturePillProps {
  icon: ReactNode;
  title: string;
  description: string;
  accent: string;
}

function FeaturePill({ icon, title, description, accent }: FeaturePillProps) {
  return (
    <Stack
      direction="row"
      spacing={2.5}
      alignItems="flex-start"
      sx={{
        p: { xs: 2.25, md: 2.75 },
        borderRadius: 4,
        bgcolor: "#fff",
        border: "1px solid #f1e3c8",
        transition: "all .25s ease",
        "&:hover": {
          borderColor: "#fbd6a3",
          transform: "translateX(4px)",
          boxShadow: "0 14px 30px rgba(247,127,0,0.08)",
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: 2.5,
          display: "grid",
          placeItems: "center",
          background: `${accent}1a`,
          color: accent,
          "& svg": { fontSize: 26 },
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: FONT_HEAD,
            fontWeight: 800,
            fontSize: { xs: 16.5, md: 18.5 },
            color: "#0f172a",
            lineHeight: 1.3,
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: FONT_BODY,
            fontSize: { xs: 13.5, md: 14.5 },
            color: "#64748b",
            lineHeight: 1.6,
            fontWeight: 500,
          }}
        >
          {description}
        </Typography>
      </Box>
    </Stack>
  );
}

interface PhoneFrameProps {
  src: string;
  alt: string;
}

function PhoneFrame({ src, alt }: PhoneFrameProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: 480,
        mx: "auto",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: "-12% -8% -8% -8%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(247,127,0,0.18) 0%, transparent 65%)",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: -22,
          right: -10,
          width: 92,
          height: 92,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, #FFD166 0%, #FBA833 100%)",
          boxShadow: "0 16px 40px rgba(251,168,51,0.4)",
          animation: `${floatSlow} 9s ease-in-out infinite`,
          opacity: 0.85,
          zIndex: 1,
          display: { xs: "none", sm: "block" },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -28,
          left: -18,
          width: 64,
          height: 64,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, #c2410c 0%, #F77F00 100%)",
          boxShadow: "0 14px 32px rgba(247,127,0,0.45)",
          animation: `${floatSlow} 11s ease-in-out infinite`,
          opacity: 0.9,
          zIndex: 1,
          display: { xs: "none", sm: "block" },
        }}
      />
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          p: { xs: 1.25, md: 1.75 },
          background: FILIPINO_GRADIENT,
          borderRadius: 6,
          boxShadow: "0 30px 70px rgba(247,127,0,0.28)",
          aspectRatio: "10/12",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: 4,
            bgcolor: "#fff8ec",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            style={{
              width: "auto",
              height: "98%",
              objectFit: "contain",
              display: "block",
              animation: `${float} 12s ease-in-out infinite`,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default function AboutContent() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        position: "relative",
        background:
          "radial-gradient(1100px 600px at -10% -10%, rgba(255,209,102,0.25), transparent 60%), radial-gradient(900px 600px at 110% 5%, rgba(247,127,0,0.18), transparent 65%), #fffdf6",
        pb: { xs: 8, md: 12 },
        overflow: "hidden",
      }}
    >
      {/* ── HERO ────────────────────────────────────────────────────── */}
      <Container sx={{ position: "relative", pt: { xs: 6, md: 10 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ staggerChildren: 0.12 }}
            >
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 0.65,
                    borderRadius: 999,
                    bgcolor: "#fff4dd",
                    border: "1px solid #fde2b3",
                    color: "#c2410c",
                    fontFamily: FONT_HEAD,
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    mb: 2.5,
                  }}
                >
                  <FavoriteRounded sx={{ fontSize: 14 }} />
                  About Bayanihan
                </Box>
              </motion.div>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontFamily: FONT_HEAD,
                    fontWeight: 900,
                    fontSize: { xs: 36, sm: 44, md: 56, lg: 64 },
                    lineHeight: 1.05,
                    letterSpacing: "-0.02em",
                    color: "#0f172a",
                    mb: 1,
                  }}
                >
                  Where events &amp; culture unite{" "}
                  <Box
                    component="span"
                    sx={{
                      background: FILIPINO_GRADIENT,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Filipinos globally
                  </Box>
                  .
                </Typography>
              </motion.div>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              >
                <Typography
                  sx={{
                    fontFamily: FONT_BODY,
                    color: "#475569",
                    mt: 2.5,
                    fontWeight: 500,
                    fontSize: { xs: 15, md: 18 },
                    lineHeight: 1.75,
                    maxWidth: 540,
                  }}
                >
                  The all-in-one platform to discover, promote, and manage
                  Filipino events, festivals, and restaurants worldwide —
                  connecting communities everywhere.
                </Typography>
              </motion.div>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ mt: 4 }}
                >
                  <Button
                    component={NextLink}
                    href="/activity-timeline"
                    endIcon={<ArrowForwardRounded />}
                    sx={{
                      fontFamily: FONT_HEAD,
                      textTransform: "none",
                      fontWeight: 800,
                      fontSize: { xs: 14.5, md: 16 },
                      color: "#fff",
                      px: { xs: 3, md: 3.5 },
                      py: { xs: 1.25, md: 1.4 },
                      borderRadius: 999,
                      background: FILIPINO_GRADIENT,
                      boxShadow: "0 14px 32px rgba(247,127,0,0.36)",
                      transition: "all .25s ease",
                      "&:hover": {
                        background: FILIPINO_GRADIENT,
                        transform: "translateY(-2px)",
                        boxShadow: "0 18px 38px rgba(247,127,0,0.46)",
                      },
                    }}
                  >
                    View activity timeline
                  </Button>
                  <Button
                    component={NextLink}
                    href="/contact-us"
                    sx={{
                      fontFamily: FONT_HEAD,
                      textTransform: "none",
                      fontWeight: 800,
                      fontSize: { xs: 14.5, md: 16 },
                      color: "#0f172a",
                      px: { xs: 3, md: 3.5 },
                      py: { xs: 1.25, md: 1.4 },
                      borderRadius: 999,
                      bgcolor: "#fff",
                      border: "1.5px solid #e2e8f0",
                      transition: "all .25s ease",
                      "&:hover": {
                        borderColor: "#F77F00",
                        bgcolor: "#fff8ec",
                      },
                    }}
                  >
                    Contact us
                  </Button>
                </Stack>
              </motion.div>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 6,
                  overflow: "hidden",
                  boxShadow: "0 40px 80px rgba(247,127,0,0.22)",
                  border: "1px solid #fde2b3",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(15,23,42,0) 60%, rgba(15,23,42,0.32) 100%)",
                    zIndex: 1,
                    pointerEvents: "none",
                  }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImg}
                  alt="Bayanihan community launch"
                  style={{
                    width: "100%",
                    height: isXs ? 280 : 480,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 18,
                    left: 18,
                    right: 18,
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    px: 2,
                    py: 1.25,
                    borderRadius: 999,
                    bgcolor: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
                    maxWidth: 360,
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: FILIPINO_GRADIENT,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    <GroupsRounded sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: FONT_BODY,
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: "#0f172a",
                      lineHeight: 1.35,
                    }}
                  >
                    Built for Filipino communities — from Manila to Houston and
                    everywhere between.
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <Container sx={{ position: "relative", mt: { xs: 8, md: 12 } }}>
        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Stat
              icon={<GroupsRounded />}
              value="1M+"
              label="Filipinos reached worldwide"
              color="#F77F00"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Stat
              icon={<EventAvailableRounded />}
              value="10K+"
              label="Events hosted &amp; promoted"
              color="#c2410c"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Stat
              icon={<PublicRounded />}
              value="60+"
              label="Countries connected"
              color="#FBA833"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Stat
              icon={<LocationCityRounded />}
              value="200+"
              label="Cities with active organizers"
              color="#16a34a"
            />
          </Grid>
        </Grid>
      </Container>

      {/* ── MISSION ───────────────────────────────────────────────────── */}
      <Container sx={{ position: "relative", mt: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
          <Typography
            sx={{
              fontFamily: FONT_HEAD,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#F77F00",
              mb: 1.5,
            }}
          >
            Our mission
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontFamily: FONT_HEAD,
              fontWeight: 900,
              fontSize: { xs: 28, sm: 34, md: 44 },
              lineHeight: 1.15,
              letterSpacing: "-0.015em",
              color: "#0f172a",
              maxWidth: 820,
              mx: "auto",
            }}
          >
            Bringing every Filipino moment{" "}
            <Box
              component="span"
              sx={{
                background: FILIPINO_GRADIENT,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              within reach
            </Box>
            .
          </Typography>
          <Typography
            sx={{
              fontFamily: FONT_BODY,
              fontSize: { xs: 14.5, md: 17 },
              fontWeight: 500,
              color: "#475569",
              mt: 2,
              maxWidth: 720,
              mx: "auto",
              lineHeight: 1.75,
            }}
          >
            We build the bridge between Filipino communities and the events,
            festivals, and flavors that make us who we are — wherever in the
            world we call home.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <ValueCard
              icon={<HandshakeRounded />}
              title="Bayanihan in every byte"
              description="Built on the spirit of working together — every feature exists to lift up organizers, businesses, and communities."
              accent="#F77F00"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ValueCard
              icon={<ConnectWithoutContactRounded />}
              title="Connection without borders"
              description="A Filipino in Houston should feel as close to a Manila festival as a kababayan next door. We make the distance disappear."
              accent="#c2410c"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ValueCard
              icon={<LanguageRounded />}
              title="Culture, celebrated everywhere"
              description="From small barangay gatherings to global Independence Day parades — every moment deserves a stage."
              accent="#16a34a"
            />
          </Grid>
        </Grid>
      </Container>

      {/* ── EVENT HOSTING MADE SIMPLE ────────────────────────────────── */}
      <Container sx={{ position: "relative", mt: { xs: 10, md: 14 } }}>
        <Grid
          container
          spacing={{ xs: 4, md: 8 }}
          alignItems="center"
          direction={{ xs: "column-reverse", md: "row" }}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 0.65,
                    borderRadius: 999,
                    bgcolor: "#fef3c7",
                    border: "1px solid #fde2b3",
                    color: "#c2410c",
                    fontFamily: FONT_HEAD,
                    fontSize: 11.5,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    mb: 2.5,
                  }}
                >
                  <RocketLaunchRounded sx={{ fontSize: 14 }} />
                  For organizers
                </Box>
              </motion.div>
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: FONT_HEAD,
                    fontWeight: 900,
                    fontSize: { xs: 28, sm: 34, md: 44 },
                    lineHeight: 1.15,
                    letterSpacing: "-0.015em",
                    color: "#0f172a",
                    mb: 1.5,
                  }}
                >
                  Event hosting, made beautifully simple.
                </Typography>
              </motion.div>
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              >
                <Typography
                  sx={{
                    fontFamily: FONT_BODY,
                    fontSize: { xs: 14.5, md: 16 },
                    fontWeight: 500,
                    color: "#475569",
                    lineHeight: 1.75,
                    mb: 3,
                    maxWidth: 540,
                  }}
                >
                  Create and promote your events easily on a platform trusted
                  by Filipino communities worldwide.
                </Typography>
              </motion.div>

              <Stack spacing={1.5}>
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <FeaturePill
                    icon={<CampaignRounded />}
                    title="Event promotion &amp; discovery"
                    description="Reach more attendees through a platform built for visibility across Filipino communities globally."
                    accent="#F77F00"
                  />
                </motion.div>
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <FeaturePill
                    icon={<InsightsRounded />}
                    title="Insights &amp; engagement tracking"
                    description="See how people discover and interact with your events so every one reaches more people than the last."
                    accent="#c2410c"
                  />
                </motion.div>
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <FeaturePill
                    icon={<DashboardCustomizeRounded />}
                    title="Organizer dashboard"
                    description="Manage event details, updates, and listings in one place — no spreadsheets required."
                    accent="#16a34a"
                  />
                </motion.div>
              </Stack>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <PhoneFrame src={mobileView} alt="Bayanihan organizer app" />
          </Grid>
        </Grid>
      </Container>

      {/* ── REACH THE COMMUNITY WORLDWIDE ────────────────────────────── */}
      <Container sx={{ position: "relative", mt: { xs: 10, md: 14 } }}>
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <PhoneFrame src={bayanihan} alt="Bayanihan community gathering" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 0.65,
                    borderRadius: 999,
                    bgcolor: "#fff4dd",
                    border: "1px solid #fde2b3",
                    color: "#c2410c",
                    fontFamily: FONT_HEAD,
                    fontSize: 11.5,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    mb: 2.5,
                  }}
                >
                  <PublicRounded sx={{ fontSize: 14 }} />
                  For communities
                </Box>
              </motion.div>
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: FONT_HEAD,
                    fontWeight: 900,
                    fontSize: { xs: 28, sm: 34, md: 44 },
                    lineHeight: 1.15,
                    letterSpacing: "-0.015em",
                    color: "#0f172a",
                    mb: 1.5,
                  }}
                >
                  Reach the Filipino community, worldwide.
                </Typography>
              </motion.div>
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              >
                <Typography
                  sx={{
                    fontFamily: FONT_BODY,
                    fontSize: { xs: 14.5, md: 16 },
                    fontWeight: 500,
                    color: "#475569",
                    lineHeight: 1.75,
                    mb: 3,
                    maxWidth: 540,
                  }}
                >
                  Connect your events and businesses with Filipinos around the
                  globe looking for experiences, culture, and community
                  gatherings.
                </Typography>
              </motion.div>

              <Stack spacing={1.5}>
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <FeaturePill
                    icon={<EventAvailableRounded />}
                    title="Discovery across communities"
                    description="Your events show up for Filipinos searching for activities, festivals, and gatherings in their cities and beyond."
                    accent="#F77F00"
                  />
                </motion.div>
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <FeaturePill
                    icon={<CampaignRounded />}
                    title="Greater visibility"
                    description="Boost your event reach through featured placements and community sharing to attract more attendees."
                    accent="#c2410c"
                  />
                </motion.div>
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <FeaturePill
                    icon={<ShareRounded />}
                    title="Built-in promotion tools"
                    description="Share events easily across social media and community networks to grow your audience."
                    accent="#16a34a"
                  />
                </motion.div>
              </Stack>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* ── PUBLISH FOR FREE CTA ─────────────────────────────────────── */}
      <Box sx={{ position: "relative", mt: { xs: 10, md: 14 } }}>
        <PublishForFree />
      </Box>
    </Box>
  );
}
