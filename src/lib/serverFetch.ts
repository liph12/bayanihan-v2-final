const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ServerGetOptions {
  /** When set, uses Next.js fetch cache with this ISR window (seconds). */
  revalidate?: number;
  /** When true, bypasses the fetch cache entirely. Wins over `revalidate`. */
  noStore?: boolean;
}

export async function serverGet<T = unknown>(
  path: string,
  { revalidate = 60, noStore = false }: ServerGetOptions = {}
): Promise<T> {
  const url = `${API_BASE}${path.replace(/^\//, "")}`;
  const res = await fetch(url, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
    ...(noStore ? { cache: "no-store" as const } : { next: { revalidate } }),
  });
  if (!res.ok) {
    throw new Error(`serverGet ${path} -> ${res.status}`);
  }
  return (await res.json()) as T;
}
