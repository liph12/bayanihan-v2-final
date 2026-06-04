"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

// Single source of truth for "is the sticky header currently hidden?".
//
// The header (Appbar), the news breadcrumb, and the related-stories sidebar
// all read this exact value so they move as one unit. One scroll listener +
// one state here means they can never disagree.
//
// Behaviour (position-based, with hysteresis — NOT scroll-direction):
//   • Scrolled away from the top  → header hidden. The breadcrumb takes the
//     very top and STAYS there the whole time you're reading.
//   • Back near the very top      → header shown. The breadcrumb adjusts back
//     down to sit beneath the header.
// Using position (not direction) is what makes the breadcrumb "stay on top
// until the header shows" instead of flipping the instant you scroll up.

const HeaderHiddenContext = createContext(false);

export const useHeaderHidden = () => useContext(HeaderHiddenContext);

const HIDE_AT = 90; // hide once scrolled past this many px
const SHOW_AT = 60; // reveal once back above this many px (hysteresis gap)

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

  // Reset to "shown" on every navigation — Next restores scroll to the top,
  // so a stale `hidden` from the previous page must not carry over.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHidden(false);
  }, [pathname]);

  useEffect(() => {
    if (!enabled) return;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      setHidden((prev) => {
        if (!prev && y > HIDE_AT) return true; // scrolled down → hide
        if (prev && y < SHOW_AT) return false; // back near top → show
        return prev; // inside the hysteresis band → no change
      });
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    // Sync once in case the page loads already scrolled (rAF keeps the
    // setState out of the effect body).
    const initial = window.requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(initial);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled]);

  return (
    <HeaderHiddenContext.Provider value={enabled ? hidden : false}>
      {children}
    </HeaderHiddenContext.Provider>
  );
}
