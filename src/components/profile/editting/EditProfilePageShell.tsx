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
import EditProfileContent from "./EditProfileContent";

export default function EditProfilePageShell() {
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
    <Grid container sx={{ background: "#f8fafc", minHeight: "100vh" }}>
      {desktop && (
        <Grid size={{ lg: 2, md: 12, xs: 12 }} sx={{ background: "#fff" }}>
          <ProfileSidebar />
        </Grid>
      )}
      <Grid
        size={{ lg: 10, md: 12, xs: 12 }}
        sx={{
          padding: 0,
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
          <EditProfileContent />
        </Box>
      </Grid>
    </Grid>
  );
}
