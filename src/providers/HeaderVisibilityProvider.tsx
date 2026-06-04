"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

// Single source of truth for "is the sticky header currently hidden?".
//
// The header (Appbar), the news breadcrumb, and the related-stories sidebar
// all need to agree on this exact value as you scroll — if they each tracked
// scroll independently they'd transiently disagree (e.g. header stays hidden
// while the breadcrumb reveals), which looked like a blank header bar near the
// top. One listener + one state here keeps them perfectly in sync.

const HeaderHiddenContext = createContext(false);

export const useHeaderHidden = () => useContext(HeaderHiddenContext);

const THRESHOLD = 80; // px scrolled before hide-on-scroll engages

export default function HeaderVisibilityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  // Only news article detail pages (/news/<slug>) hide the header on scroll.
  // The /news index and every other page keep the always-visible header.
  const enabled = !!pathname && pathname.startsWith("/news/");

  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // Reset to "shown" on every navigation — Next restores scroll to the top,
  // so a stale `hidden` from the previous page must not carry over.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHidden(false);
    lastY.current = 0;
  }, [pathname]);

  useEffect(() => {
    if (!enabled) return;
    lastY.current = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      if (y < THRESHOLD) {
        // Always reveal near the top.
        setHidden(false);
      } else if (Math.abs(y - lastY.current) > 6) {
        // Ignore jitter; hide on the way down, reveal on the way up.
        setHidden(y > lastY.current);
      }
      lastY.current = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  return (
    <HeaderHiddenContext.Provider value={enabled ? hidden : false}>
      {children}
    </HeaderHiddenContext.Provider>
  );
}
