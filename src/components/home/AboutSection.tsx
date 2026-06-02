"use client";
import { Box, Typography, Button } from "@mui/material";
import NextLink from "next/link";
import { useLocale } from "@/providers/LocaleProvider";

const aboutImg = "/homepage/about.png";
const timelineBg =
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/bayanihan/timeline/background.png";

export default function AboutSection() {
  const { t } = useLocale();
  const sx = {
    container: {
      width: { xs: "98%", lg: "98%" },
      maxWidth: "98%",
      mx: "auto",
      my: 3,
    },
    wrap: {
      position: "relative",
      height: { xs: "auto", md: 500 },
      pt: { xs: 65, md: 0 },
      borderRadius: 3,
      overflow: "hidden",
      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    },
    bg: {
      position: "absolute",
      inset: 0,
      backgroundImage: `url(${aboutImg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      filter: "saturate(105%)",
    },
    overlay: {
      position: "absolute",
      inset: 0,
      background: {
        xs: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.85) 100%)",
        md: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.85) 100%)",
      },
      display: "block",
    },
    content: {
      position: "absolute",
      left: { xs: 12, md: 28 },
      right: { xs: 12, md: 28 },
      bottom: { xs: 12, md: 22 },
      color: "#fff",
    },
  };

  return (
    <Box sx={sx.container}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 2,
        }}
      >
        <Box sx={sx.wrap} component="section">
          <Box sx={sx.bg} />
          <Box sx={sx.overlay} />
          <Box sx={sx.content}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mb: 1 }}>
              {t("aboutTitle")}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.95, mb: 1, fontSize: 18 }}>
              {t("aboutP1")}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.95, fontSize: 18 }}>
              {t("aboutP2")}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            position: "relative",
            height: { xs: 260, md: 500 },
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${timelineBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: {
                xs: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.85) 100%)",
                md: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.85) 100%)",
              },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: { xs: 12, md: 22 },
              right: { xs: 12, md: 22 },
              bottom: { xs: 12, md: 20 },
              color: "#fff",
            }}
          >
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
              Activity Timeline
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.95, mb: 1.5, fontSize: 16 }}>
              Tracking our milestones and initiatives that empower communities,
              engage youth, and drive positive change.
            </Typography>
            <Button
              component={NextLink}
              href="/activity-timeline"
              size="small"
              sx={{
                backgroundColor: "#fff",
                color: "#111",
                borderRadius: 999,
                px: 1.5,
                py: 0.5,
                textTransform: "none",
                fontWeight: 600,
                fontSize: 15,
                "&:hover": { backgroundColor: "#f3f4f6" },
              }}
            >
              ◉ View All Activities
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
