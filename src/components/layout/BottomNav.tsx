"use client";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Portal,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ExploreIcon from "@mui/icons-material/Explore";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ArticleIcon from "@mui/icons-material/Article";
import PersonIcon from "@mui/icons-material/Person";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const value = useMemo(() => {
    if (pathname.startsWith("/news")) return "news";
    if (pathname.startsWith("/browse-events")) return "events";
    if (pathname.startsWith("/restaurant")) return "restaurant";
    if (pathname === "/") return "home";
    return false;
  }, [pathname]);

  // TODO: subdomain detection (HOSTNAME prefix). For now route relatively.
  const go = (key: string) => {
    switch (key) {
      case "home":
        router.push("/");
        break;
      case "events":
        router.push("/browse-events");
        break;
      case "restaurant":
        router.push("/restaurant");
        break;
      case "news":
        router.push("/news");
        break;
      case "profile":
        router.push("/sign-in");
        break;
      default:
        break;
    }
  };

  return (
    <Portal>
      <Paper
        elevation={10}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: "block", md: "none" },
          zIndex: 1400,
          height: 72,
          borderRadius: "18px 18px 0 0",
          pb: "max(0px, env(safe-area-inset-bottom))",
          backgroundColor: "#ffffff",
          borderTop: "1px solid",
          borderColor: "divider",
          boxShadow: "0 -4px 22px rgba(0,0,0,0.06)",
          overflow: "hidden",
          transform: "translateZ(0)",
          willChange: "transform",
          contain: "layout paint size",
        }}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(_, nv) => go(nv)}
          sx={{
            height: "100%",
            background: "transparent",
            "& .MuiBottomNavigationAction-root": {
              minWidth: 0,
              color: "text.secondary",
              px: 1,
              "& .MuiSvgIcon-root": { fontSize: 26 },
            },
            "& .Mui-selected": { color: "primary.main" },
            "& .MuiBottomNavigationAction-label": {
              fontSize: 11,
              fontWeight: 600,
            },
          }}
        >
          <BottomNavigationAction label="Home" value="home" icon={<HomeIcon />} />
          <BottomNavigationAction
            label="Events"
            value="events"
            icon={<ExploreIcon />}
          />
          <BottomNavigationAction
            label="Restaurant"
            value="restaurant"
            icon={<RestaurantIcon />}
          />
          <BottomNavigationAction
            label="News"
            value="news"
            icon={<ArticleIcon />}
          />
          <BottomNavigationAction
            label="Profile"
            value="profile"
            icon={<PersonIcon />}
          />
        </BottomNavigation>
      </Paper>
    </Portal>
  );
}
