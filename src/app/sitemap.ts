// Dynamic sitemap.xml served at /sitemap.xml. Next.js builds it at request
// time using the current site origin so we never have to hard-code the
// production URL here. Search engines crawl this to learn what we want
// indexed and how often it changes.

import type { MetadataRoute } from "next";
import { serverGet } from "@/lib/serverFetch";
import { POPULAR_ORDER } from "@/lib/popularCountries";
import { ARTICLES, articleUrl } from "@/lib/articles";
import type { BayanihanEvent, NewsArticle, Restaurant } from "@/types";

// metadataBase is set in app/layout.tsx — Next applies it automatically to
// the entries below, so we return root-relative paths.
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bayanihan.com"
).replace(/\/$/, "");

const STATIC_PATHS: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/browse-events", priority: 0.9, changeFrequency: "daily" },
  { path: "/restaurant", priority: 0.9, changeFrequency: "daily" },
  { path: "/news", priority: 0.9, changeFrequency: "daily" },
  { path: "/global-calendar", priority: 0.8, changeFrequency: "daily" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/articles", priority: 0.6, changeFrequency: "weekly" },
  { path: "/contact-us", priority: 0.5, changeFrequency: "monthly" },
  { path: "/sitemap", priority: 0.3, changeFrequency: "weekly" },
];

interface EventsResponse {
  data?: { events?: BayanihanEvent[] };
  events?: BayanihanEvent[];
}

interface RestaurantsResponse {
  data?: { restaurant?: Restaurant[]; restaurants?: Restaurant[] };
  restaurant?: Restaurant[];
}

interface NewsResponse {
  data?: NewsArticle[];
  meta?: { last_page?: number };
}

async function fetchEvents(): Promise<BayanihanEvent[]> {
  try {
    const root = await serverGet<EventsResponse | BayanihanEvent[]>("events", {
      revalidate: 600,
    });
    if (Array.isArray(root)) return root;
    if (Array.isArray(root?.data?.events)) return root.data!.events!;
    if (Array.isArray(root?.events)) return root.events!;
    return [];
  } catch {
    return [];
  }
}

async function fetchRestaurants(): Promise<Restaurant[]> {
  try {
    const root = await serverGet<RestaurantsResponse>("restaurants", {
      revalidate: 600,
    });
    const arr =
      root?.data?.restaurants ??
      root?.data?.restaurant ??
      root?.restaurant ??
      [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// The news API is hard-capped at 10 items/page (per_page is ignored) AND the
// origin intermittently resets connections, so pulling every article means
// many flaky requests. serverGet already retries; we bump it high here and
// re-fetch any page that comes back empty, because every page up to last_page
// has rows — an empty result means a dropped connection, not a real gap.
const NEWS_PAGE_RETRIES = 6;

async function fetchNewsPage(page: number): Promise<NewsArticle[]> {
  try {
    const r = await serverGet<NewsResponse>(`news-articles-v2?page=${page}`, {
      revalidate: 600,
      retries: NEWS_PAGE_RETRIES,
    });
    return Array.isArray(r?.data) ? r.data : [];
  } catch {
    return [];
  }
}

async function fetchNews(): Promise<NewsArticle[]> {
  try {
    const first = await serverGet<NewsResponse>("news-articles-v2?page=1", {
      revalidate: 600,
      retries: NEWS_PAGE_RETRIES,
    });
    const lastPage =
      typeof first?.meta?.last_page === "number" ? first.meta.last_page : 1;
    const byPage: NewsArticle[][] = [
      Array.isArray(first?.data) ? first.data : [],
    ];

    if (lastPage > 1) {
      const pages = Array.from({ length: lastPage - 1 }, (_, i) => i + 2);
      const rest = await Promise.all(pages.map((p) => fetchNewsPage(p)));
      // Second pass: any page that returned empty almost certainly failed
      // (the origin reset the connection), so retry it once more.
      for (let i = 0; i < pages.length; i++) {
        if (rest[i].length === 0) rest[i] = await fetchNewsPage(pages[i]);
      }
      byPage.push(...rest);
    }

    // Flatten + de-dupe by slug (the API repeats articles across pages) so the
    // sitemap doesn't list duplicate <url> entries.
    const seen = new Set<string>();
    const unique: NewsArticle[] = [];
    for (const arr of byPage) {
      for (const a of arr) {
        const key = a.slug || String(a.id ?? "");
        if (!key || seen.has(key)) continue;
        seen.add(key);
        unique.push(a);
      }
    }
    return unique;
  } catch {
    return [];
  }
}

function subdomainOf(item: BayanihanEvent | Restaurant): string | undefined {
  const sub = (item as { subDomain?: { name?: string } }).subDomain?.name;
  if (sub) return sub;
  const slug = (item as { slug?: string }).slug;
  return slug || undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  // Fetch all dynamic content in parallel — single sitemap build call.
  const [events, restaurants, news] = await Promise.all([
    fetchEvents(),
    fetchRestaurants(),
    fetchNews(),
  ]);

  // Events and restaurants are both served from the top-level /[slug] route.
  for (const e of events) {
    const slug = subdomainOf(e);
    if (!slug) continue;
    entries.push({
      url: `${SITE_URL}/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  for (const r of restaurants) {
    const slug = subdomainOf(r);
    if (!slug) continue;
    entries.push({
      url: `${SITE_URL}/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // Popular country pages live under /country/<code>. Only the 14 we
  // surface on the homepage are guaranteed to have content worth indexing,
  // so we don't emit one entry per ISO country.
  for (const cc of POPULAR_ORDER) {
    entries.push({
      url: `${SITE_URL}/country/${cc.toLowerCase()}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // News articles live under /news/<slug>.
  for (const article of news) {
    if (!article.slug) continue;
    const lastModified =
      article.updated_at || article.published_at || article.date || undefined;
    entries.push({
      url: `${SITE_URL}/news/${article.slug}`,
      lastModified: lastModified ? new Date(lastModified) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Editorial / backlink articles live under /articles/<slug>. These are
  // static content (defined in src/lib/articles.ts), so no network call.
  for (const article of ARTICLES) {
    entries.push({
      url: `${SITE_URL}${articleUrl(article.slug)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
