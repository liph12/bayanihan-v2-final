// Next 16 calls this file convention `proxy` (formerly `middleware`).
//
// 301s the legacy per-event subdomains onto the path URLs the site uses now:
//   philippinefoodfest.bayanihan.com/*  →  bayanihan.com/philippinefoodfest
//
// Google still has hundreds of those subdomain URLs indexed from the previous
// architecture. Their DNS records are gone, so today they resolve to nothing:
// anyone arriving from a search result gets a connection error, and none of
// the ranking history those URLs built up passes to the page that replaced
// them. A redirect is the only thing that transfers it.
//
// This stays dormant until the infrastructure side is in place:
//   1. DNS: a wildcard record for *.bayanihan.com pointing at Vercel
//      (CNAME → cname.vercel-dns.com).
//   2. Vercel: add *.bayanihan.com as a domain on the project so it issues
//      the wildcard certificate and routes those hosts here.
// Until then it is a no-op, because no request ever arrives on those hosts.

import { NextResponse, type NextRequest } from "next/server";

const APEX = "bayanihan.com";

// Hosts that are not legacy event subdomains and must pass through untouched.
const RESERVED = new Set(["www", "api", "mail", "admin", "staging", "preview"]);

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0].toLowerCase();

  // Only act on <something>.bayanihan.com — the apex, preview deploys and
  // localhost all fall through.
  if (!host.endsWith(`.${APEX}`)) return NextResponse.next();

  const label = host.slice(0, -(APEX.length + 1));
  if (!label || label.includes(".") || RESERVED.has(label)) {
    return NextResponse.next();
  }

  // The subdomain label is the vanity name, so it becomes the path. Deep
  // paths on those old single-event hosts have no equivalent here, so
  // everything collapses onto the event's page rather than 404ing.
  const target = new URL(req.url);
  target.protocol = "https:";
  target.hostname = APEX;
  // Assigning `host` alone leaves an inherited port on the redirect target.
  target.port = "";
  target.pathname = `/${label}`;
  target.search = "";

  return NextResponse.redirect(target, 301);
}

export const config = {
  // Skip Next internals, the API proxy and static files — they never need
  // host-based redirecting.
  matcher: ["/((?!_next/|api-proxy/|.*\\.[a-z0-9]+$).*)"],
};
