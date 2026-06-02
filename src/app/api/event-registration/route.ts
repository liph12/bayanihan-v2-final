import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function csrfCookieUrl(apiBase: string): string {
  return apiBase.replace(/\/api\/?$/, "/sanctum/csrf-cookie");
}

interface ParsedCookie {
  name: string;
  rawValue: string;
}

function parseSetCookies(setCookies: string[]): ParsedCookie[] {
  return setCookies
    .map((raw) => {
      const [nv] = raw.split(";");
      const eq = nv.indexOf("=");
      if (eq === -1) return null;
      return {
        name: nv.slice(0, eq).trim(),
        rawValue: nv.slice(eq + 1).trim(),
      };
    })
    .filter((c): c is ParsedCookie => c !== null);
}

export async function POST(request: NextRequest) {
  if (!API_BASE) {
    return NextResponse.json(
      { message: "API base URL not configured." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  try {
    const csrfResp = await fetch(csrfCookieUrl(API_BASE), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      cache: "no-store",
    });

    const setCookies = csrfResp.headers.getSetCookie?.() ?? [];
    const parsed = parseSetCookies(setCookies);
    const cookieHeader = parsed.map((c) => `${c.name}=${c.rawValue}`).join("; ");
    const xsrf = parsed.find((c) => c.name === "XSRF-TOKEN");
    const xsrfTokenDecoded = xsrf ? decodeURIComponent(xsrf.rawValue) : "";

    const resp = await fetch(`${API_BASE}event-registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(xsrfTokenDecoded ? { "X-XSRF-TOKEN": xsrfTokenDecoded } : {}),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const ct = resp.headers.get("content-type") || "";
    const data = ct.includes("application/json")
      ? await resp.json()
      : { message: await resp.text() };

    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    console.error("[api/event-registration] proxy error", err);
    return NextResponse.json(
      { message: "Proxy failed.", error: String(err) },
      { status: 502 }
    );
  }
}
