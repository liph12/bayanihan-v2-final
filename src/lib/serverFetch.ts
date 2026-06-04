const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ServerGetOptions {
  /** When set, uses Next.js fetch cache with this ISR window (seconds). */
  revalidate?: number;
  /** When true, bypasses the fetch cache entirely. Wins over `revalidate`. */
  noStore?: boolean;
  /**
   * Number of *extra* attempts after the first on a transient failure.
   * The Bayanihan origin intermittently resets the connection on some
   * endpoints (notably the single-article route), so a single fetch is
   * unreliable — retrying turns a ~50% per-request failure into a near-zero
   * one. Network errors and 5xx are retried; 4xx (e.g. a genuinely missing
   * slug → 404) are surfaced immediately.
   */
  retries?: number;
  /** Per-attempt timeout in ms, so a hung connection can't block the render. */
  timeoutMs?: number;
}

export async function serverGet<T = unknown>(
  path: string,
  {
    revalidate = 60,
    noStore = false,
    retries = 3,
    timeoutMs = 8000,
  }: ServerGetOptions = {}
): Promise<T> {
  const url = `${API_BASE}${path.replace(/^\//, "")}`;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    let res: Response | undefined;
    try {
      res = await fetch(url, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
        signal: AbortSignal.timeout(timeoutMs),
        ...(noStore ? { cache: "no-store" as const } : { next: { revalidate } }),
      });
    } catch (err) {
      // fetch() rejects on network-level failures — most importantly the
      // intermittent "connection reset" the origin throws on the
      // single-article endpoint, plus our own timeout aborts. Transient: retry.
      lastErr = err;
    }

    if (res) {
      if (res.ok) {
        return (await res.json()) as T;
      }
      // 4xx is a definitive answer (e.g. a genuinely missing slug → 404).
      // Don't waste retries on it — surface immediately.
      if (res.status < 500) {
        throw new Error(`serverGet ${path} -> ${res.status}`);
      }
      // 5xx means the origin is flaky / overloaded — retry.
      lastErr = new Error(`serverGet ${path} -> ${res.status}`);
    }

    if (attempt < retries) {
      // Linear backoff: 150ms, 300ms, 450ms…
      await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
    }
  }

  throw lastErr instanceof Error
    ? lastErr
    : new Error(`serverGet ${path} failed after ${retries + 1} attempts`);
}
