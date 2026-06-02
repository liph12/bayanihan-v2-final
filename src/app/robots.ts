// Dynamic /robots.txt served by Next.js. Tells crawlers what they can
// index and where to find the sitemap. Stays in sync with sitemap.ts via
// the shared NEXT_PUBLIC_SITE_URL env variable.

import type { MetadataRoute } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bayanihan.com"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Block everything that has no SEO value or that we explicitly
      // don't want indexed:
      //   /profile/*    — authenticated dashboard (also noindex'd at the
      //                   page level via metadata.robots)
      //   /api-proxy/*  — internal API proxy route (not user-facing)
      //   /sign-in      — auth entry point, no content
      //   /registration — same
      disallow: ["/profile/", "/api-proxy/", "/sign-in", "/registration"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
