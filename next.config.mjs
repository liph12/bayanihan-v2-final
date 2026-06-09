/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't advertise the framework via the X-Powered-By response header.
  poweredByHeader: false,

  // Serve modern image formats (smaller than JPEG/PNG) when next/image is used.
  images: {
    formats: ["image/avif", "image/webp"],
    // Allowed quality values for the `quality` prop (Next 16 requires this).
    // The hero uses 55 (it sits behind a dark overlay, so it's imperceptible).
    qualities: [55, 75],
    // Hosts allowed for next/image optimization (flags, banner bucket, API).
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "filipinohomes123.s3.ap-southeast-1.amazonaws.com" },
      { protocol: "https", hostname: "api.leuteriorealty.com" },
    ],
  },

  // Tree-shake large libraries so only the components actually used ship to
  // the browser — a big JS-bundle win for MUI + icon barrel imports.
  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/x-date-pickers",
      "recharts",
    ],
    // Inline the page's CSS directly into the HTML <head> instead of emitting
    // a separate render-blocking <link rel="stylesheet"> chunk. That CSS chunk
    // sat on the LCP critical path (Lighthouse "Avoid chaining critical
    // requests"): the browser had to download the HTML, discover the CSS link,
    // then make a second round-trip before it could paint. Inlining removes
    // that round-trip entirely. Our CSS footprint is tiny (~1 KiB), so the
    // small HTML-size bump is far outweighed by dropping a critical request.
    inlineCss: true,
  },

  // Drop console.* (except errors) from the production bundle.
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },

  // Long-lived caching for the PWA manifest. It's a low-priority subresource
  // the document links to, so the browser re-requests it on navigations unless
  // it's cacheable. Caching it on the CDN + in the browser means it serves
  // instantly (and drops off the request chain entirely after the first hit).
  // The manifest changes only on deploy, and stale-while-revalidate refreshes
  // it in the background, so a long max-age is safe.
  async headers() {
    return [
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
