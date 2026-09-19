// Derives the URL path segment an event or restaurant is published under
// (bayanihan.com/<segment>). Stored backend-side as `sub_domain`.

interface Options {
  // Hard ceiling on the generated segment.
  maxLength: number;
  // Used when the source text has no usable characters at all.
  fallback: string;
}

// Lowercase, strip diacritics, collapse anything non-alphanumeric to single
// hyphens, and trim hyphens off both ends.
function normalize(text: string): string {
  let s = (text || "").toString().toLowerCase();
  try {
    s = s.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  } catch {}
  return s
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Cut to maxLength on a word boundary so the link stays readable:
// "from-broadway-to-disney-lea-salonga" → "from-broadway-to", not
// "from-broadway-to-dis". Falls back to a hard cut when the first word
// alone already exceeds the limit.
function trimToWordBoundary(s: string, maxLength: number): string {
  if (s.length <= maxLength) return s;
  const cut = s.slice(0, maxLength);
  const lastHyphen = cut.lastIndexOf("-");
  const trimmed = lastHyphen > 0 ? cut.slice(0, lastHyphen) : cut;
  return trimmed.replace(/-+$/g, "");
}

export function toSubdomain(text: string, opts: Options): string {
  const normalized = normalize(text);
  if (!normalized) return opts.fallback;
  return trimToWordBoundary(normalized, opts.maxLength) || opts.fallback;
}

// Events are published at bayanihan.com/<title-derived segment>, capped at
// the same 20 characters the manual field used to enforce.
export const EVENT_SUBDOMAIN_MAX_LENGTH = 20;

export function toEventSubdomain(title: string): string {
  return toSubdomain(title, {
    maxLength: EVENT_SUBDOMAIN_MAX_LENGTH,
    fallback: "event",
  });
}
