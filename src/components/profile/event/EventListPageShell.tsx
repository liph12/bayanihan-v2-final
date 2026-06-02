"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useAuthProvider } from "@/providers/AuthProvider";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileTopNav from "@/components/profile/ProfileTopNav";
import EventListContent from "./EventListContent";

export default function EventListPageShell() {
  const router = useRouter();
  const { userData, ready } = useAuthProvider();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    if (ready && !userData) router.replace("/sign-in");
  }, [ready, userData, router]);

  if (!ready || !userData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container sx={{ background: "#f3f3f3", minHeight: "100vh" }}>
      {desktop && (
        <Grid size={{ lg: 2, md: 12, xs: 12 }} sx={{ background: "#fff" }}>
          <ProfileSidebar />
        </Grid>
      )}
      <Grid
        size={{ lg: 10, md: 12, xs: 12 }}
        sx={{
          padding: { xs: "10px", md: "0 15px" },
          paddingBottom: desktop ? "0px" : { xs: "100px", md: "100px" },
          backgroundColor: "#f8fafc",
        }}
      >
        <ProfileTopNav />
        <Box
          sx={{
            height: "100vh",
            overflow: "auto",
            pt: { xs: "84px", md: "88px" },
          }}
        >
          <EventListContent />
        </Box>
      </Grid>
    </Grid>
  );
}
