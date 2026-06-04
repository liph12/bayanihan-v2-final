"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Tracks scroll direction and returns whether a pinned top bar should hide.
 *
 * Hides while scrolling DOWN once past `threshold`px; reveals while scrolling
 * UP or whenever near the top. Used to coordinate the header (which slides
 * away) and the news breadcrumb (which pins to the very top once the header
 * is gone) — both call this with the same logic so they stay in sync.
 *
 * When `enabled` is false it always returns false (never hides).
 */
export function useHideOnScroll(enabled = true, threshold = 80): boolean {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    // When disabled we simply don't attach a listener; the hook returns false
    // below regardless of the last `hidden` value, so no state reset is needed.
    if (!enabled) return;
    lastY.current = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      if (y < threshold) {
        // Always reveal near the top so the header is there when you arrive.
        setHidden(false);
      } else if (Math.abs(y - lastY.current) > 6) {
        // Ignore sub-pixel jitter; hide on the way down, reveal on the way up.
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
  }, [enabled, threshold]);

  return enabled ? hidden : false;
}
