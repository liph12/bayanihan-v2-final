// Reuse the Open Graph image for the Twitter (X) summary_large_image card.
// Next.js requires route-segment config fields (runtime, alt, size,
// contentType) to be statically declared in this file — they can't be
// re-exported from another module. So we duplicate them here and just
// delegate the actual render to opengraph-image's default export.

import OpengraphImage from "./opengraph-image";

export const runtime = "edge";
export const alt =
  "Bayanihan.com — Discover Filipino Events & Restaurants Worldwide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default OpengraphImage;
