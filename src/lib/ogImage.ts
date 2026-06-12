// Social-share (og:image / twitter:image) URLs for CMS-hosted images.
//
// Article/event images are uploaded to S3 as-is and can be multi-megabyte
// originals (e.g. a 4.3 MB PNG). Chat apps enforce hard size caps on link
// previews — WhatsApp/Viber drop images over a few hundred KB, and Facebook's
// first-share scrape times out on slow downloads — so sharing a page whose
// og:image points at the raw upload shows no thumbnail at all.
//
// Fix: route the image through this site's own Next image optimizer
// (/_next/image), which serves a ~300 KB resized PNG (or ~95 KB WebP when the
// crawler accepts it) from our CDN instead of the raw original.
//
// The optimizer only accepts hosts in next.config.mjs `images.remotePatterns`,
// widths in `deviceSizes`, and qualities in `qualities` — keep OPTIMIZABLE_HOSTS
// and the w/q params below in sync with that config or the emitted og:image
// will 400.
const OPTIMIZABLE_HOSTS = new Set([
  "filipinohomes123.s3.ap-southeast-1.amazonaws.com",
  "api.leuteriorealty.com",
  "flagcdn.com",
]);

export function ogImageUrl(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (url.protocol === "https:" && OPTIMIZABLE_HOSTS.has(url.hostname)) {
      // Relative on purpose: Next's metadata system resolves it against
      // `metadataBase` (app/layout.tsx), so dev/preview/prod each emit their
      // own origin.
      return `/_next/image?url=${encodeURIComponent(raw)}&w=1200&q=75`;
    }
  } catch {
    // Not an absolute URL (e.g. a local /images/... path) — use it unchanged;
    // metadataBase still resolves it to an absolute URL.
  }
  return raw;
}
