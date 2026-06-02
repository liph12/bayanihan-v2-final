// PWA web manifest served at /manifest.webmanifest. Lets users "Add to
// Home Screen" on mobile devices and tells the OS how the app should
// look when launched standalone (full-screen, branded splash colors).

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bayanihan.com — Filipino Events & Restaurants Worldwide",
    short_name: "Bayanihan",
    description:
      "Discover Filipino events, festivals, and restaurants worldwide.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    // Matches the warm gradient end used across the brand (Banner CTA,
    // icons, OG image accent).
    theme_color: "#F77F00",
    icons: [
      // Next.js auto-resolves the generated icon routes — point at them
      // by path. The OS chooses the closest match for the device.
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
