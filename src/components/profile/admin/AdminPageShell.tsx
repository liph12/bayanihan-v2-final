"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  CircularProgress,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import { useAuthProvider } from "@/providers/AuthProvider";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileTopNav from "@/components/profile/ProfileTopNav";

interface AdminPageShellProps {
  title: string;
  /**
   * Optional content. When omitted, a "Coming soon" placeholder is rendered.
   * Each Super Admin tab uses this shell while its real content is migrated.
   */
  children?: ReactNode;
  /**
   * If true, the page is gated to admins only and non-admins get redirected
   * to /profile. Defaults to true.
   */
  requireAdmin?: boolean;
}

const ROLE_SUPERADMIN_NAMES = ["SUPERADMIN", "SUPER ADMIN", "SUPER-ADMIN"];
const ROLE_SUPERADMIN_ID = 1;

function isAdmin(u: unknown): boolean {
  if (!u || typeof u !== "object") return false;
  const user = u as {
    role?: { id?: number; name?: string };
    role_id?: number;
    roleId?: number;
  };
  const roleId = Number(
    user?.role?.id ?? user?.role_id ?? user?.roleId ?? 0
  );
  if (roleId === ROLE_SUPERADMIN_ID) return true;
  const name = String(user?.role?.name || "").toUpperCase();
  return ROLE_SUPERADMIN_NAMES.includes(name);
}

export default function AdminPageShell({
  title,
  children,
  requireAdmin = true,
}: AdminPageShellProps) {
  const router = useRouter();
  const { userData, ready } = useAuthProvider();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    if (!ready) return;
    if (!userData) {
      router.replace("/sign-in");
      return;
    }
    if (requireAdmin && !isAdmin(userData)) {
      router.replace("/profile");
    }
  }, [ready, userData, requireAdmin, router]);

  if (!ready || !userData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (requireAdmin && !isAdmin(userData)) {
    // While the redirect-effect runs, render nothing to avoid flashing
    // restricted content.
    return null;
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
          {children ?? <ComingSoonPanel title={title} />}
        </Box>
      </Grid>
    </Grid>
  );
}

function ComingSoonPanel({ title }: { title: string }) {
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography
        variant="h3"
        sx={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          color: "#1e293b",
          fontSize: { xs: "1.6rem", md: "2.2rem" },
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontFamily: "'Outfit', sans-serif",
          color: "#64748b",
          mb: 4,
        }}
      >
        This page is being migrated from the React version.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          borderRadius: "20px",
          border: "1px dashed #cbd5e1",
          bgcolor: "#fff",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            mx: "auto",
            mb: 2,
            borderRadius: "16px",
            bgcolor: "#fef3c7",
            color: "#b45309",
            display: "grid",
            placeItems: "center",
          }}
        >
          <ConstructionRoundedIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            color: "#0f172a",
            fontSize: 18,
            mb: 1,
          }}
        >
          Coming soon
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Outfit', sans-serif",
            color: "#64748b",
            fontSize: 14,
            maxWidth: 480,
            mx: "auto",
          }}
        >
          We&apos;re porting <strong>{title}</strong> from the React version of
          the dashboard. The route is wired and the sidebar link is working —
          full functionality lands in a follow-up.
        </Typography>
      </Paper>
    </Box>
  );
}
