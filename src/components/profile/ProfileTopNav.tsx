"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import HomeRounded from "@mui/icons-material/HomeRounded";
import AccountCircleRounded from "@mui/icons-material/AccountCircleRounded";
import ManageAccountsRounded from "@mui/icons-material/ManageAccountsRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import { useAuthProvider } from "@/providers/AuthProvider";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: <HomeRounded fontSize="small" /> },
  {
    label: "Profile",
    href: "/profile",
    icon: <AccountCircleRounded fontSize="small" />,
  },
  {
    label: "Edit Profile",
    href: "/profile/editting",
    icon: <ManageAccountsRounded fontSize="small" />,
  },
];

interface UserShape {
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  photo?: string;
  details?: { photo?: string };
}

function pickName(u: UserShape | null | undefined): string {
  if (!u) return "User";
  if (u.name) return u.name;
  const fl = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
  if (fl) return fl;
  if (u.email) return u.email.split("@")[0];
  return "User";
}

function pickPhoto(u: UserShape | null | undefined): string {
  return u?.details?.photo || u?.photo || "";
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfileTopNav() {
  const { userData, logout } = useAuthProvider();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isUpLg = useMediaQuery(theme.breakpoints.up("lg"));
  const [signingOut, setSigningOut] = useState(false);

  const u = userData as UserShape | null;
  const name = pickName(u);
  const photo = pickPhoto(u);
  const initials = initialsOf(name);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      logout();
      router.replace("/sign-in");
    } finally {
      setSigningOut(false);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href;
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(15,23,42,0.06)",
        boxShadow: "0 1px 12px rgba(15,23,42,0.04)",
        width: { xs: "100%", lg: "calc(100% - 16.6667%)" },
        left: { xs: 0, lg: "16.6667%" },
        zIndex: (t) => t.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, md: 68 },
          px: { xs: 1.5, sm: 2.5 },
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        {/* LEFT — Pill nav */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            p: 0.5,
            borderRadius: "999px",
            bgcolor: "rgba(241,245,249,0.7)",
            border: "1px solid rgba(15,23,42,0.04)",
            // leave room for hamburger on mobile
            ml: { xs: isUpLg ? 0 : 5, lg: 0 },
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Box
                key={item.href}
                component={Link}
                href={item.href}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  textDecoration: "none",
                  px: { xs: 1.25, sm: 1.75 },
                  py: 0.85,
                  borderRadius: "999px",
                  fontFamily: "Outfit, sans-serif",
                  fontSize: { xs: "0.85rem", md: "0.92rem" },
                  fontWeight: active ? 700 : 500,
                  color: active ? "#fff" : "#475569",
                  background: active
                    ? "linear-gradient(135deg, #1e3a8a 0%, #06b6d4 100%)"
                    : "transparent",
                  boxShadow: active
                    ? "0 6px 18px rgba(30,58,138,0.28)"
                    : "none",
                  transition: "all .2s ease",
                  "&:hover": {
                    backgroundColor: active
                      ? undefined
                      : "rgba(15,23,42,0.05)",
                    color: active ? "#fff" : "#0f172a",
                  },
                  "& svg": {
                    fontSize: "1.05rem",
                    color: active ? "#fff" : "#64748b",
                  },
                }}
              >
                {item.icon}
                <Box
                  component="span"
                  sx={{ display: { xs: "none", sm: "inline" } }}
                >
                  {item.label}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* RIGHT — Avatar / name / sign out */}
        <Stack
          direction="row"
          spacing={{ xs: 1, sm: 1.5 }}
          alignItems="center"
        >
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 1.25,
              pl: 1.25,
              pr: 1.5,
              py: 0.5,
              borderRadius: "999px",
              bgcolor: "rgba(241,245,249,0.7)",
              border: "1px solid rgba(15,23,42,0.04)",
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                p: "2px",
                background:
                  "linear-gradient(135deg, #1e3a8a 0%, #06b6d4 100%)",
              }}
            >
              <Avatar
                src={photo || undefined}
                alt={name}
                sx={{
                  width: "100%",
                  height: "100%",
                  bgcolor: "#fff",
                  color: "#1e3a8a",
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  border: "2px solid #fff",
                }}
              >
                {!photo && initials}
              </Avatar>
            </Box>
            <Box sx={{ lineHeight: 1.1 }}>
              <Typography
                sx={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#94a3b8",
                }}
              >
                Welcome
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: { sm: "0.92rem", md: "0.98rem" },
                  fontWeight: 700,
                  color: "#0f172a",
                  whiteSpace: "nowrap",
                  maxWidth: 180,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {name}
              </Typography>
            </Box>
          </Box>

          {isMobile ? (
            <Tooltip title="Sign out" arrow>
              <IconButton
                onClick={handleSignOut}
                disabled={signingOut}
                sx={{
                  color: "#ef4444",
                  bgcolor: "rgba(239,68,68,0.08)",
                  "&:hover": { bgcolor: "rgba(239,68,68,0.14)" },
                }}
              >
                <LogoutRounded />
              </IconButton>
            </Tooltip>
          ) : (
            <Box
              component="button"
              onClick={handleSignOut}
              disabled={signingOut}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.85,
                px: 1.85,
                py: 1,
                borderRadius: "999px",
                border: 0,
                cursor: signingOut ? "default" : "pointer",
                background:
                  "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                color: "#fff",
                fontFamily: "Outfit, sans-serif",
                fontSize: "0.9rem",
                fontWeight: 700,
                letterSpacing: "0.01em",
                boxShadow: "0 8px 20px rgba(239,68,68,0.32)",
                opacity: signingOut ? 0.7 : 1,
                transition: "all .2s ease",
                "&:hover": {
                  transform: signingOut ? "none" : "translateY(-1px)",
                  boxShadow: signingOut
                    ? "0 8px 20px rgba(239,68,68,0.32)"
                    : "0 10px 24px rgba(239,68,68,0.4)",
                },
              }}
            >
              <LogoutRounded sx={{ fontSize: "1.05rem" }} />
              Sign Out
            </Box>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
