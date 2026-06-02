import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
  if (!API_BASE) {
    return NextResponse.json(
      { message: "API base URL not configured." },
      { status: 500 }
    );
  }

  const auth = request.headers.get("authorization");
  if (!auth) {
    return NextResponse.json(
      { message: "Missing Authorization bearer token." },
      { status: 401 }
    );
  }

  const incomingContentType = request.headers.get("content-type") || "";
  if (!incomingContentType.startsWith("multipart/form-data")) {
    return NextResponse.json(
      { message: "Expected multipart/form-data." },
      { status: 400 }
    );
  }

  let bodyBuffer: ArrayBuffer;
  try {
    bodyBuffer = await request.arrayBuffer();
  } catch (e) {
    console.error("[api/profile/create-event] read body failed", e);
    return NextResponse.json(
      { message: "Failed to read request body." },
      { status: 400 }
    );
  }

  // Sanctum bearer-token auth bypasses CSRF; no need to fetch /sanctum/csrf-cookie.
  // Send the multipart payload straight through with Authorization header only.
  try {
    const resp = await fetch(`${API_BASE}profile/create-event-test`, {
      method: "POST",
      headers: {
        "Content-Type": incomingContentType,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: auth,
      },
      body: bodyBuffer,
      cache: "no-store",
    });

    const ct = resp.headers.get("content-type") || "";
    const data = ct.includes("application/json")
      ? await resp.json()
      : { message: await resp.text() };

    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    const e = err as { message?: string; cause?: unknown; code?: string };
    console.error(
      "[api/profile/create-event] proxy error",
      e?.message,
      "cause:",
      e?.cause,
      "code:",
      e?.code
    );
    return NextResponse.json(
      {
        message: "Proxy failed.",
        error: e?.message || String(err),
        cause: e?.cause ? String(e.cause) : undefined,
      },
      { status: 502 }
    );
  }
}
