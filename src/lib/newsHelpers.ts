import type { NewsArticle } from "@/types";

export function normalizeArticle(a: NewsArticle | null | undefined): NewsArticle | null {
  if (!a) return a ?? null;
  return {
    ...a,
    image_url: a.image_url || a.image || null,
    date: a.date || a.published_at || a.created_at || null,
    summary:
      a.summary || a.description || a.content || a.body || a.excerpt || "",
  };
}

export function slugifyTitle(title: string = ""): string {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function parseSummary(summary: unknown): string[] {
  if (!summary) return [];
  if (Array.isArray(summary)) return summary.filter(Boolean).map(String);
  if (typeof summary === "string") {
    const trimmed = summary.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
      } catch {
        /* fall through */
      }
    }
    return trimmed
      .split(/\r?\n\s*\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [];
}

export function parseTags(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t).trim()).filter(Boolean);
  }
  return String(raw)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
