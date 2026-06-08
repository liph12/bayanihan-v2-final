"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Box } from "@mui/material";

// Full-screen branded loader: a centered logo with a gradient sheen sweeping
// left -> right on a loop. Shown on initial page load and during in-app
// navigations.
//
// App Router has no router events, so we detect a navigation START by
// intercepting internal link clicks + back/forward, and detect the FINISH
// when usePathname() commits. A safety timeout guarantees it never sticks.

const SHOW_MIN_MS = 400; // keep it on screen at least this long (no flicker)
const SAFETY_MS = 8000; // hard backstop so a missed "finish" can't freeze it

export default function GlobalLoader() {
  const pathname = usePathname();
  // Starts hidden: the loader only appears for in-app navigations, NOT on the
  // initial page load — the SSR content is already painted, so covering it
  // would only delay first paint / LCP.
  const [visible, setVisible] = useState(false);

  const shownAt = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstPath = useRef(true);

  const show = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    shownAt.current = performance.now();
    setVisible(true);
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    safetyTimer.current = setTimeout(() => setVisible(false), SAFETY_MS);
  }, []);

  const hide = useCallback(() => {
    const wait = Math.max(0, SHOW_MIN_MS - (performance.now() - shownAt.current));
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      if (safetyTimer.current) {
        clearTimeout(safetyTimer.current);
        safetyTimer.current = null;
      }
    }, wait);
  }, []);

  // Clean up any pending timers on unmount (set by show()/hide() during
  // navigations). No initial-load show — see the `visible` initializer above.
  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, []);

  // Navigation finished when the path commits. Skip the first run (mount).
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    hide();
  }, [pathname, hide]);

  // Navigation started: internal link clicks + browser back/forward.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      const target = anchor.getAttribute("target");
      if (target && target !== "_self") return; // new tab/window
      if (anchor.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return; // external
      if (url.href === window.location.href) return; // same page
      if (url.pathname === window.location.pathname && url.hash) return; // in-page anchor
      show();
    };
    const onPop = () => show();
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
    };
  }, [show]);

  return (
    <Box
      aria-hidden={!visible}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "grid",
        placeItems: "center",
        bgcolor: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        opacity: visible ? 1 : 0,
        visibility: visible ? "visible" : "hidden",
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity .35s ease, visibility .35s ease",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: { xs: 170, sm: 210, md: 240 },
          overflow: "hidden",
          // The sheen band sweeps left -> right across the logo, forever.
          "@keyframes logoSheen": {
            "0%": { transform: "translateX(-130%) skewX(-18deg)" },
            "100%": { transform: "translateX(260%) skewX(-18deg)" },
          },
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/profile/logo.png"
          alt="Loading"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            position: "relative",
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: "55%",
            zIndex: 2,
            pointerEvents: "none",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.78) 50%, transparent 100%)",
            animation: "logoSheen 1.3s ease-in-out infinite",
          }}
        />
      </Box>
    </Box>
  );
}
