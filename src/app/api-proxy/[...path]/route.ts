// Catch-all proxy that forwards requests to the Bayanihan API while
// stripping the Referer / Origin headers. This avoids Laravel Sanctum's
// `EnsureFrontendRequestsAreStateful` middleware from upgrading our
// requests to stateful mode (and demanding a CSRF token we can't supply
// because the SameSite=Lax XSRF-TOKEN cookie can't flow cross-site).
//
// From the browser's perspective every request is now same-origin
// (localhost:3000 → /api-proxy/...). axios stays simple — just a bearer
// token in the Authorization header, no CSRF dance needed.
//
// Two route prefixes are supported:
//   /api-proxy/...           → https://api.leuteriorealty.com/bayanihan/v1/public/api/...
//   /api-proxy/sanctum/...   → https://api.leuteriorealty.com/bayanihan/v1/public/sanctum/...
//
// Server-side fetches (serverFetch.ts, server components) still hit the
// real API directly — the proxy only exists for browser-originated calls
// where CORS + SameSite are the problem.

import { NextRequest, NextResponse } from "next/server";

const REAL_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
// REAL_API_BASE ends with /api, so derive the host root for sanctum.
const HOST_BASE = REAL_API_BASE.replace(/\/api$/, "");

// Headers we strip from the forwarded request so Sanctum can't recognize
// our origin and force the stateful (CSRF-required) flow.
const STRIP_REQUEST_HEADERS = new Set([
  "referer",
  "origin",
  "host",
  // Next.js / Vercel internal headers that shouldn't leak upstream.
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-for",
  "x-real-ip",
  "x-vercel-id",
  "x-vercel-ip-country",
  "x-vercel-deployment-url",
  "x-vercel-forwarded-for",
  // Always rebuilt by fetch
  "content-length",
  // Connection-level — must not be forwarded
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
]);

const STRIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
]);

async function proxy(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await ctx.params;
  const subPath = path.join("/");

  // Decide the upstream URL: anything starting with `sanctum/` is hoisted
  // to the host root; everything else stays under /api.
  const upstreamUrl = subPath.startsWith("sanctum/")
    ? `${HOST_BASE}/${subPath}${req.nextUrl.search}`
    : `${REAL_API_BASE}/${subPath}${req.nextUrl.search}`;

  // Forward headers, minus the ones we strip.
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!STRIP_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // Body handling: for methods that have one, pass the raw Web stream.
  // For GET / HEAD, no body.
  const method = req.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  let body: BodyInit | undefined;
  if (hasBody) {
    body = req.body ?? undefined;
  }

  const upstream = await fetch(upstreamUrl, {
    method,
    headers,
    body,
    // Required when streaming a Request body to fetch in modern runtimes.
    // @ts-expect-error — `duplex` is a valid fetch option in undici but
    // missing from older TS lib.dom typings.
    duplex: hasBody ? "half" : undefined,
    redirect: "manual",
  });

  // Forward the response (status + headers + body) back to the browser.
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
