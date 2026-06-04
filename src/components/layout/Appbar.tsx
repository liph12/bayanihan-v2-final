"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import NextLink from "next/link";
import Image from "next/image";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  Menu,
  MenuItem,
  Avatar,
  Stack,
  Button,
  Divider,
  useMediaQuery,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import ContactMailRoundedIcon from "@mui/icons-material/ContactMailRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import type { SvgIconComponent } from "@mui/icons-material";
import { useAuthProvider } from "@/providers/AuthProvider";
import { useHideOnScroll } from "@/lib/useHideOnScroll";

interface NavItem {
  label: string;
  Icon: SvgIconComponent;
  to: string;
}

// High-resolution local logo (1740x396) — natively crisp on HiDPI displays.
// The old S3 URL was a small webp that pixelated when scaled up by the
// device pixel ratio.
const LOGO_SRC = "/profile/logo.png";
const LOGO_INTRINSIC_WIDTH = 1740;
const LOGO_INTRINSIC_HEIGHT = 396;
const LOGO_DISPLAY_HEIGHT = 44;
// Match the source's 4.39:1 aspect ratio so Next.js Image can size it
// correctly without warnings.
const LOGO_DISPLAY_WIDTH = Math.round(
  (LOGO_INTRINSIC_WIDTH / LOGO_INTRINSIC_HEIGHT) * LOGO_DISPLAY_HEIGHT
);

const FONT_HEAD = "var(--font-urbanist), 'Outfit', sans-serif";
const FONT_BODY = "var(--font-outfit), 'Outfit', sans-serif";

const NAV_GRADIENT = "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)";
const ORANGE_GRADIENT =
  "linear-gradient(135deg, #c2410c 0%, #F77F00 50%, #FBA833 100%)";

interface UserShape {
  name?: string;
  email?: string;
  role_id?: number;
  photo?: string;
  details?: { photo?: string };
}

function pickName(u: UserShape | null | undefined): string {
  if (!u) return "Account";
  if (u.name) return u.name;
  if (u.email) return u.email.split("@")[0];
  return "Account";
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

export default function Appbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userData, logout } = useAuthProvider();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [open, setOpen] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);

  const u = userData as UserShape | null;
  const isEventSubdomain = false;

  // On news article detail pages (/news/<slug>) the header slides away on
  // scroll-down so the breadcrumb can pin to the very top (see
  // NewsDetailContent). The /news index and every other page keep the
  // always-visible sticky header.
  const enableHideOnScroll = !!pathname && pathname.startsWith("/news/");
  const hidden = useHideOnScroll(enableHideOnScroll);

  const handleLogout = () => {
    setAccountAnchor(null);
    setOpen(false);
    logout();
    router.push("/");
  };

  const isActive = (to: string): boolean => {
    if (!pathname) return false;
    if (to === "/browse-events") {
      return pathname === to || isEventSubdomain;
    }
    if (to === "/") return pathname === "/" && !isEventSubdomain;
    return pathname === to || pathname.startsWith(to);
  };

  const primaryNav: NavItem[] = [
    { label: "Home", to: "/", Icon: HomeRoundedIcon },
    { label: "About", to: "/about", Icon: InfoRoundedIcon },
    { label: "Events", to: "/browse-events", Icon: EventRoundedIcon },
    {
      label: "Restaurants",
      to: "/restaurant",
      Icon: RestaurantRoundedIcon,
    },
    {
      label: "Calendar",
      to: "/global-calendar",
      Icon: CalendarMonthRoundedIcon,
    },
    { label: "News", to: "/news", Icon: NewspaperRoundedIcon },
    {
      label: "Contact",
      to: "/contact-us",
      Icon: ContactMailRoundedIcon,
    },
  ];

  const name = pickName(u);
  const photo = pickPhoto(u);
  const initials = initialsOf(name);

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        backgroundColor: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(15,23,42,0.06)",
        boxShadow: "0 1px 12px rgba(15,23,42,0.04)",
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 0.3s ease",
        willChange: "transform",
      }}
    >
      <Box
        sx={{
          width: "100%",
          px: { xs: 1.5, sm: 2.5, lg: 4, xl: 6 },
          py: { xs: 1.25, lg: 1.5 },
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr auto" : "1fr auto 1fr",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {/* LOGO */}
        <NextLink
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifySelf: "start",
          }}
        >
          <Image
            src={LOGO_SRC}
            alt="Bayanihan"
            width={LOGO_DISPLAY_WIDTH}
            height={LOGO_DISPLAY_HEIGHT}
            // The logo is above the fold on every page — load eagerly and
            // let Next.js generate the right srcset so it renders crisply
            // on HiDPI / retina displays without burning a giant download.
            priority
            style={{ height: LOGO_DISPLAY_HEIGHT, width: "auto", display: "block" }}
          />
        </NextLink>

        {/* DESKTOP NAV — centered column */}
        {!isMobile && (
          <Box
            sx={{
              justifySelf: "center",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              p: 0.5,
              borderRadius: "999px",
              bgcolor: "rgba(241,245,249,0.7)",
              border: "1px solid rgba(15,23,42,0.04)",
            }}
          >
            {primaryNav.map(({ label, to, Icon }) => {
              const active = isActive(to);
              return (
                <Box
                  key={label}
                  component={NextLink}
                  href={to}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    textDecoration: "none",
                    px: { md: 1.5, lg: 1.85 },
                    py: 0.9,
                    borderRadius: "999px",
                    fontFamily: FONT_HEAD,
                    fontSize: { md: "0.85rem", lg: "0.92rem" },
                    fontWeight: active ? 700 : 500,
                    color: active ? "#fff" : "#475569",
                    background: active ? NAV_GRADIENT : "transparent",
                    boxShadow: active
                      ? "0 6px 18px rgba(14,165,233,0.32)"
                      : "none",
                    transition: "all .2s ease",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      backgroundColor: active
                        ? undefined
                        : "rgba(15,23,42,0.05)",
                      color: active ? "#fff" : "#0f172a",
                    },
                    "& svg": {
                      fontSize: { md: "1rem", lg: "1.05rem" },
                      color: active ? "#fff" : "#64748b",
                    },
                  }}
                >
                  <Icon />
                  {label}
                </Box>
              );
            })}
          </Box>
        )}

        {/* DESKTOP RIGHT — Avatar / Auth */}
        {!isMobile && (
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            justifyContent="flex-end"
          >
            {userData ? (
              <>
                <Box
                  onClick={(e) =>
                    setAccountAnchor(e.currentTarget as HTMLElement)
                  }
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1.25,
                    pl: 0.5,
                    pr: 1.5,
                    py: 0.5,
                    borderRadius: "999px",
                    bgcolor: "rgba(241,245,249,0.7)",
                    border: "1px solid rgba(15,23,42,0.04)",
                    cursor: "pointer",
                    transition: "all .2s ease",
                    "&:hover": {
                      bgcolor: "rgba(241,245,249,1)",
                      borderColor: "rgba(15,23,42,0.08)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      p: "2px",
                      background: NAV_GRADIENT,
                    }}
                  >
                    <Avatar
                      src={photo || undefined}
                      alt={name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        bgcolor: "#fff",
                        color: "#0ea5e9",
                        fontFamily: FONT_HEAD,
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        border: "2px solid #fff",
                      }}
                    >
                      {!photo && initials}
                    </Avatar>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: FONT_BODY,
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: "#0f172a",
                      whiteSpace: "nowrap",
                      maxWidth: 140,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: { md: "none", lg: "block" },
                    }}
                  >
                    {name}
                  </Typography>
                </Box>
                <Menu
                  anchorEl={accountAnchor}
                  open={Boolean(accountAnchor)}
                  onClose={() => setAccountAnchor(null)}
                  disableScrollLock
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1,
                        borderRadius: 3,
                        border: "1px solid #eef2f6",
                        boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
                        minWidth: 220,
                        overflow: "hidden",
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      bgcolor: "#f8fafc",
                      borderBottom: "1px solid #eef2f6",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: FONT_HEAD,
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#94a3b8",
                      }}
                    >
                      Signed in as
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: FONT_BODY,
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#0f172a",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {u?.email || name}
                    </Typography>
                  </Box>
                  <MenuItem
                    onClick={() => {
                      setAccountAnchor(null);
                      router.push("/profile");
                    }}
                    sx={{ fontFamily: FONT_BODY, fontWeight: 500, py: 1.25 }}
                  >
                    <DashboardRoundedIcon
                      sx={{ mr: 1.25, fontSize: 18, color: "#06b6d4" }}
                    />
                    Dashboard
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setAccountAnchor(null);
                      router.push("/profile/editting");
                    }}
                    sx={{ fontFamily: FONT_BODY, fontWeight: 500, py: 1.25 }}
                  >
                    <AccountCircleRoundedIcon
                      sx={{ mr: 1.25, fontSize: 18, color: "#7c3aed" }}
                    />
                    Edit profile
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      fontFamily: FONT_BODY,
                      fontWeight: 600,
                      color: "#ef4444",
                      py: 1.25,
                    }}
                  >
                    <LogoutRoundedIcon sx={{ mr: 1.25, fontSize: 18 }} />
                    Sign out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  component={NextLink}
                  href="/sign-in"
                  sx={{
                    fontFamily: FONT_HEAD,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    color: "#0f172a",
                    px: 1.75,
                    py: 1,
                    borderRadius: "999px",
                    "&:hover": { bgcolor: "rgba(15,23,42,0.05)" },
                  }}
                >
                  Sign in
                </Button>
                <Button
                  component={NextLink}
                  href="/registration"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{
                    fontFamily: FONT_HEAD,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    color: "#fff",
                    px: 2.25,
                    py: 1,
                    borderRadius: "999px",
                    background: NAV_GRADIENT,
                    boxShadow: "0 10px 24px rgba(14,165,233,0.32)",
                    transition: "all .2s ease",
                    "&:hover": {
                      background: NAV_GRADIENT,
                      transform: "translateY(-1px)",
                      boxShadow: "0 12px 28px rgba(14,165,233,0.42)",
                    },
                  }}
                >
                  Get started
                </Button>
              </>
            )}
          </Stack>
        )}

        {/* MOBILE HAMBURGER */}
        {isMobile && (
          <IconButton
            aria-label="menu"
            onClick={() => setOpen(true)}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: "rgba(241,245,249,0.7)",
              border: "1px solid rgba(15,23,42,0.04)",
              color: "#0f172a",
              "&:hover": { bgcolor: "rgba(241,245,249,1)" },
            }}
          >
            <MenuRoundedIcon />
          </IconButton>
        )}
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "88%", sm: 360 },
              borderTopLeftRadius: 24,
              borderBottomLeftRadius: 24,
              overflow: "hidden",
              bgcolor: "#f8fafc",
            },
          },
        }}
      >
        {/* Drawer header */}
        <Box
          sx={{
            position: "relative",
            px: 2.5,
            pt: 2.5,
            pb: userData ? 2.5 : 3.5,
            background: NAV_GRADIENT,
            color: "#fff",
            overflow: "hidden",
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: -60,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.16)",
              filter: "blur(6px)",
            }}
          />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ position: "relative", mb: userData ? 1.5 : 2 }}
          >
            <Typography
              sx={{
                fontFamily: FONT_HEAD,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                opacity: 0.92,
              }}
            >
              Bayanihan.com
            </Typography>
            <IconButton
              aria-label="Close"
              onClick={() => setOpen(false)}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.18)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
              size="small"
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          {userData ? (
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ position: "relative" }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  p: "3px",
                  background: "rgba(255,255,255,0.32)",
                  flexShrink: 0,
                }}
              >
                <Avatar
                  src={photo || undefined}
                  alt={name}
                  sx={{
                    width: "100%",
                    height: "100%",
                    bgcolor: "#fff",
                    color: "#0ea5e9",
                    fontFamily: FONT_HEAD,
                    fontWeight: 800,
                    border: "2px solid #fff",
                  }}
                >
                  {!photo && initials}
                </Avatar>
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: FONT_HEAD,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    opacity: 0.85,
                  }}
                >
                  Welcome
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FONT_HEAD,
                    fontSize: 16,
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {name}
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Box sx={{ position: "relative" }}>
              <Typography
                sx={{
                  fontFamily: FONT_HEAD,
                  fontSize: 22,
                  fontWeight: 900,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                Welcome to Bayanihan.
              </Typography>
              <Typography
                sx={{
                  fontFamily: FONT_BODY,
                  fontSize: 13.5,
                  fontWeight: 500,
                  opacity: 0.92,
                  mt: 0.5,
                }}
              >
                Discover Filipino events &amp; communities worldwide.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Nav list */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 2,
            py: 2,
            pb: "calc(env(safe-area-inset-bottom) + 100px)",
          }}
        >
          <Typography
            sx={{
              fontFamily: FONT_HEAD,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#94a3b8",
              px: 1,
              mb: 1.25,
            }}
          >
            Explore
          </Typography>
          <Stack spacing={0.5}>
            {primaryNav.map(({ label, to, Icon }) => {
              const active = isActive(to);
              return (
                <Box
                  key={label}
                  component={NextLink}
                  href={to}
                  onClick={() => setOpen(false)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2.5,
                    textDecoration: "none",
                    transition: "all .2s ease",
                    bgcolor: active ? "rgba(14,165,233,0.1)" : "transparent",
                    "&:hover": {
                      bgcolor: active
                        ? "rgba(14,165,233,0.14)"
                        : "rgba(15,23,42,0.04)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      color: active ? "#fff" : "#06b6d4",
                      bgcolor: active ? "transparent" : "rgba(6,182,212,0.12)",
                      background: active ? NAV_GRADIENT : undefined,
                      boxShadow: active
                        ? "0 6px 14px rgba(14,165,233,0.32)"
                        : "none",
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: FONT_BODY,
                      fontSize: 15,
                      fontWeight: active ? 800 : 600,
                      color: active ? "#0ea5e9" : "#0f172a",
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              );
            })}
          </Stack>

          {userData && (
            <>
              <Typography
                sx={{
                  fontFamily: FONT_HEAD,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#94a3b8",
                  px: 1,
                  mb: 1.25,
                  mt: 3,
                }}
              >
                Account
              </Typography>
              <Stack spacing={0.5}>
                <Box
                  component={NextLink}
                  href="/profile"
                  onClick={() => setOpen(false)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2.5,
                    textDecoration: "none",
                    transition: "all .2s ease",
                    "&:hover": { bgcolor: "rgba(15,23,42,0.04)" },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      color: "#06b6d4",
                      bgcolor: "rgba(6,182,212,0.12)",
                    }}
                  >
                    <DashboardRoundedIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: FONT_BODY,
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    Dashboard
                  </Typography>
                </Box>
                <Box
                  component={NextLink}
                  href="/profile/editting"
                  onClick={() => setOpen(false)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2.5,
                    textDecoration: "none",
                    transition: "all .2s ease",
                    "&:hover": { bgcolor: "rgba(15,23,42,0.04)" },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      color: "#7c3aed",
                      bgcolor: "rgba(124,58,237,0.12)",
                    }}
                  >
                    <AccountCircleRoundedIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: FONT_BODY,
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    Edit profile
                  </Typography>
                </Box>
                <Box
                  onClick={handleLogout}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2.5,
                    cursor: "pointer",
                    transition: "all .2s ease",
                    "&:hover": { bgcolor: "rgba(239,68,68,0.08)" },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      color: "#ef4444",
                      bgcolor: "rgba(239,68,68,0.12)",
                    }}
                  >
                    <LogoutRoundedIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: FONT_BODY,
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#ef4444",
                    }}
                  >
                    Sign out
                  </Typography>
                </Box>
              </Stack>
            </>
          )}
        </Box>

        {/* Drawer footer CTAs */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            p: 2,
            pt: 2,
            background:
              "linear-gradient(180deg, rgba(248,250,252,0) 0%, rgba(248,250,252,0.92) 30%, #f8fafc 100%)",
            backdropFilter: "blur(8px)",
          }}
        >
          {userData ? (
            <Button
              fullWidth
              component={NextLink}
              href="/profile"
              onClick={() => setOpen(false)}
              startIcon={<DashboardRoundedIcon />}
              sx={{
                fontFamily: FONT_HEAD,
                textTransform: "none",
                fontWeight: 800,
                fontSize: "0.98rem",
                color: "#fff",
                py: 1.35,
                borderRadius: "999px",
                background: NAV_GRADIENT,
                boxShadow: "0 12px 28px rgba(14,165,233,0.36)",
                "&:hover": { background: NAV_GRADIENT },
              }}
            >
              Go to dashboard
            </Button>
          ) : (
            <Stack direction="row" spacing={1.25}>
              <Button
                component={NextLink}
                href="/sign-in"
                onClick={() => setOpen(false)}
                fullWidth
                startIcon={<LoginRoundedIcon />}
                sx={{
                  fontFamily: FONT_HEAD,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#0f172a",
                  py: 1.3,
                  borderRadius: "999px",
                  bgcolor: "#fff",
                  border: "1.5px solid #e2e8f0",
                  "&:hover": { bgcolor: "#fff", borderColor: "#cbd5e1" },
                }}
              >
                Sign in
              </Button>
              <Button
                component={NextLink}
                href="/registration"
                onClick={() => setOpen(false)}
                fullWidth
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  fontFamily: FONT_HEAD,
                  textTransform: "none",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  color: "#fff",
                  py: 1.3,
                  borderRadius: "999px",
                  background: NAV_GRADIENT,
                  boxShadow: "0 10px 24px rgba(14,165,233,0.36)",
                  "&:hover": { background: NAV_GRADIENT },
                }}
              >
                Get started
              </Button>
            </Stack>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
