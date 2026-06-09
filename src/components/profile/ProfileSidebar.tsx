"use client";
import { useState, type ReactElement } from "react";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Drawer,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  MenuRounded,
  CloseRounded,
  EditCalendarRounded,
  AddBusinessRounded,
  EventNoteRounded,
  QueryStatsRounded,
  LeaderboardRounded,
  BadgeRounded,
  AutoAwesomeRounded,
  FactCheckRounded,
  StorefrontRounded,
  DateRangeRounded,
  AlternateEmailRounded,
  GroupsRounded,
  NewspaperRounded,
  PostAddRounded,
  DashboardRounded,
  InsightsRounded,
} from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthProvider } from "@/providers/AuthProvider";

interface SidebarRoute {
  icon: ReactElement;
  name: string;
  path: string;
}
interface SidebarSection {
  title: string;
  routes: SidebarRoute[];
}

const SECTION_THEME: Record<string, { color: string; bg: string }> = {
  Overview: { color: "#2d50d3", bg: "#dbeafe" },
  "Create/Add": { color: "#6366f1", bg: "#e0e7ff" },
  Listings: { color: "#10b981", bg: "#d1fae5" },
  "Super Admin": { color: "#f59e0b", bg: "#fef3c7" },
  News: { color: "#0ea5e9", bg: "#e0f2fe" },
};

const DEFAULT_THEME = { color: "#64748b", bg: "#f1f5f9" };

export default function ProfileSidebar() {
  const { userData } = useAuthProvider();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const u = userData as
    | { role?: { name?: string } | null; role_id?: number }
    | null;
  const roleName = u?.role?.name;
  const ORG = roleName === "VENDOR";
  const RES = roleName === "RESTAURANT OWNER";
  const ADMIN = roleName === "SUPERADMIN";

  const navItemStyle = (isActive: boolean) => ({
    my: 0.5,
    borderRadius: "12px",
    px: 1.1,
    py: 0.8,
    backgroundColor: isActive ? "#f8fafc" : "transparent",
    transition: "all .2s ease",
    "&:hover": {
      backgroundColor: "#f1f5f9",
      transform: "translateX(4px)",
    },
  });

  const buttonTextStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "16px",
    fontWeight: 400,
    color: "#334155",
  } as const;

  const sectionHeaderStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "13px",
    letterSpacing: ".1em",
    fontWeight: 800,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    mt: 1.8,
    mb: 1,
    px: 1.5,
  };

  const sections: (SidebarSection | false)[] = [
    {
      title: "Overview",
      routes: [
        {
          icon: <DashboardRounded />,
          name: "Dashboard",
          path: "/profile",
        },
      ],
    },
    {
      title: "Create/Add",
      routes: [
        (ADMIN || ORG) && {
          icon: <EditCalendarRounded />,
          name: "Create Event",
          path: "/profile/create-event",
        },
        (ADMIN || RES) && {
          icon: <AddBusinessRounded />,
          name: "Create Restaurant",
          path: "/profile/create-restaurant",
        },
        {
          icon: <BadgeRounded />,
          name: "Business Card",
          path: "/profile/businesscard",
        },
        {
          icon: <AutoAwesomeRounded />,
          name: "Ambassador Poster",
          path: "/profile/ambassador-poster",
        },
      ].filter(Boolean) as SidebarRoute[],
    },
    {
      title: "Listings",
      routes: [
        (ADMIN || ORG) && {
          icon: <EventNoteRounded />,
          name: "Your Events",
          path: "/profile/event",
        },
        (ADMIN || RES) && {
          icon: <StorefrontRounded />,
          name: "Your Restaurants",
          path: "/profile/my-restaurants",
        },
        (ADMIN || RES) && {
          icon: <StorefrontRounded />,
          name: "Global Restaurants",
          path: "/restaurant",
        },
        (ADMIN || ORG) && {
          icon: <DateRangeRounded />,
          name: "Global Calendar",
          path: "/global-calendar",
        },
      ].filter(Boolean) as SidebarRoute[],
    },
    ADMIN && {
      title: "News",
      routes: [
        {
          icon: <PostAddRounded />,
          name: "Create News",
          path: "/profile/create-news",
        },
        {
          icon: <NewspaperRounded />,
          name: "News Articles",
          path: "/profile/news-articles",
        },
        {
          icon: <InsightsRounded />,
          name: "News Article Analytics",
          path: "/profile/news-analytics",
        },
      ],
    },
    ADMIN && {
      title: "Super Admin",
      routes: [
        {
          icon: <AlternateEmailRounded />,
          name: "Mailer",
          path: "/profile/mailer",
        },
        {
          icon: <GroupsRounded />,
          name: "Organizer List",
          path: "/profile/organizers",
        },
        {
          icon: <StorefrontRounded />,
          name: "Restaurant List",
          path: "/profile/restaurants",
        },
        {
          icon: <QueryStatsRounded />,
          name: "Statistics",
          path: "/profile/adminstatistics",
        },
        {
          icon: <LeaderboardRounded />,
          name: "Organizer Statistics",
          path: "/profile/organizer-statistics",
        },
        {
          icon: <FactCheckRounded />,
          name: "Event Validation",
          path: "/profile/admineventvalidation",
        },
      ],
    },
  ];

  const filteredSections = sections.filter(
    (s): s is SidebarSection => Boolean(s) && (s as SidebarSection).routes.length > 0
  );

  const sidebarContent = (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        position: "relative",
        left: 0,
        top: 0,
        overflowY: "auto",
        overflowX: "hidden",
        px: 2,
        py: 1.5,
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-thumb": {
          background: "#e2e8f0",
          borderRadius: "10px",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0,
          px: 1,
          background: "#fff",
        }}
      >
        <Image
          src="/profile/logo.webp"
          alt="Bayanihan"
          width={120}
          height={45}
          style={{ height: 45, width: "auto", objectFit: "contain" }}
        />
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)}>
            <CloseRounded />
          </IconButton>
        )}
      </Box>

      {filteredSections.map((section, i) => (
        <Box key={i} sx={{ mb: 2 }}>
          <Typography sx={sectionHeaderStyle}>{section.title}</Typography>
          <List sx={{ p: 0 }}>
            {section.routes.map((route, j) => {
              const isActive = pathname === route.path;
              const themeColors =
                SECTION_THEME[section.title] || DEFAULT_THEME;

              return (
                <ListItemButton
                  key={j}
                  component={Link}
                  href={route.path}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={navItemStyle(isActive)}
                >
                  <ListItemIcon sx={{ minWidth: 42 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "10px",
                        color: isActive ? "#fff" : themeColors.color,
                        bgcolor: isActive ? themeColors.color : themeColors.bg,
                        boxShadow: isActive
                          ? `0 4px 12px ${themeColors.color}40`
                          : "none",
                        transition: "all 0.3s ease",
                        "& svg": { fontSize: "1.2rem" },
                      }}
                    >
                      {route.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={route.name}
                    slotProps={{
                      primary: {
                        sx: {
                          ...buttonTextStyle,
                          color: isActive ? themeColors.color : "#475569",
                        },
                      },
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      ))}
    </Box>
  );

  if (!userData) return null;

  return (
    <>
      {isMobile ? (
        <>
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{
              position: "fixed",
              top: 12,
              right: 16,
              zIndex: 1100,
              bgcolor: "#fff",
              boxShadow: 1,
            }}
          >
            <MenuRounded />
          </IconButton>
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            slotProps={{ paper: { sx: { width: 300, border: "none" } } }}
          >
            {sidebarContent}
          </Drawer>
        </>
      ) : (
        <Box sx={{ width: "auto", flexShrink: 0, background: "#fff" }}>
          {sidebarContent}
        </Box>
      )}
    </>
  );
}
