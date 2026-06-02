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
import ProfileSidebar from "./ProfileSidebar";
import ProfileTopNav from "./ProfileTopNav";
import ProfileHero from "./ProfileHero";
import ProfileSummaryDonut from "./ProfileSummaryDonut";
import ProfileCountryDistribution from "./ProfileCountryDistribution";
import ProfileStatsBar from "./ProfileStatsBar";
import RestaurantStats from "./RestaurantStats";

const ROLE_SUPERADMIN = 1;
const ROLE_VENDOR = 3;
const ROLE_RESTAURANT_OWNER = 6;

export default function ProfileContent() {
  const router = useRouter();
  const { userData, ready } = useAuthProvider();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const isUpMd = useMediaQuery(theme.breakpoints.up("md"));

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

  const u = userData as {
    role?: { id?: number; name?: string };
    role_id?: number;
    roleId?: number;
  };
  const roleId = Number(u?.role?.id ?? u?.role_id ?? u?.roleId ?? 0);

  const isSuperAdmin = roleId === ROLE_SUPERADMIN;
  const isVendor = roleId === ROLE_VENDOR;
  const isRestaurantOwner = roleId === ROLE_RESTAURANT_OWNER;

  const canSeeStats = isSuperAdmin || isVendor || isRestaurantOwner;
  const canSeeGeneralStats = isSuperAdmin || isVendor;
  const canSeeRestaurantStats = isSuperAdmin || isRestaurantOwner;

  return (
    <Grid container sx={{ background: "#fff" }}>
      {desktop && (
        <Grid size={{ lg: 2, md: 12, xs: 12 }} sx={{ background: "#fff" }}>
          <ProfileSidebar />
        </Grid>
      )}
      <Grid
        size={{ lg: 10, md: 12, xs: 12 }}
        sx={{
          padding: "0",
        }}
      >
        <ProfileTopNav />
        <Box
          sx={{
            height: "100vh",
            overflow: "auto",
            background: "#f8fafc",
            padding: "10px 20px",
            pt: { xs: "84px", md: "88px" },
          }}
        >
          <Grid container spacing={3}>
            <Grid size={12}>
              <Box
                sx={{
                  mb: 2,
                  mt: { xs: "8px", md: "8px" },
                  pt: { xs: "10px", md: "10px", lg: "0" },
                }}
              >
                <ProfileHero user={u} showInfoRight />
              </Box>

              {canSeeStats && (
                <Grid
                  container
                  spacing={2}
                  sx={{ mb: 2, pb: { xs: "90px", md: "90px", lg: "10px" } }}
                >
                  {canSeeGeneralStats && (
                    <>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <ProfileSummaryDonut />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <ProfileCountryDistribution />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <ProfileStatsBar
                          direction={isUpMd ? "column" : "row"}
                        />
                      </Grid>
                    </>
                  )}

                  {canSeeRestaurantStats && (
                    <Grid size={12}>
                      <RestaurantStats />
                    </Grid>
                  )}
                </Grid>
              )}
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
}
