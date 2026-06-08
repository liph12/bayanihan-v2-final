/** @type {import('next').NextConfig} */
const nextConfig = {
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
  },

  // Drop console.* (except errors) from the production bundle.
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
};

export default nextConfig;
