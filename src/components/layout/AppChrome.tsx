"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Box } from "@mui/material";
import Appbar from "./Appbar";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
import HeaderVisibilityProvider from "@/providers/HeaderVisibilityProvider";

const HIDE_CHROME_ON = new Set(["/sign-in", "/registration"]);
const HIDE_CHROME_PREFIXES = ["/profile"];

export default function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hide =
    HIDE_CHROME_ON.has(pathname) ||
    HIDE_CHROME_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <HeaderVisibilityProvider>
      {!hide && <Appbar />}
      <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </Box>
      {!hide && <Footer />}
      {!hide && (
        <>
          <Box sx={{ height: 72, display: { xs: "block", md: "none" } }} />
          <BottomNav />
        </>
      )}
    </HeaderVisibilityProvider>
  );
}
