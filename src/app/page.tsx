import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { serverGet } from "@/lib/serverFetch";
import Banner from "@/components/home/Banner";
import EventsSection from "@/components/home/EventsSection";
import RestaurantsSection from "@/components/home/RestaurantsSection";
import NewsSection from "@/components/home/NewsSection";
import HomeContent from "@/components/home/HomeContent";
import { normalizeArticle } from "@/lib/newsHelpers";
import type { BayanihanEvent, NewsArticle, Restaurant } from "@/types";

// Below-the-fold sections are code-split so their JS isn't in the initial
// bundle (they still render on the server).
const TopDestinations = dynamic(
  () => import("@/components/home/TopDestinations")
);
const AboutSection = dynamic(() => import("@/components/home/AboutSection"));

// The home page inherits its title/description from the root layout. We
// override here only to pin a canonical URL and a page-specific OG URL —
// without an explicit canonical, search engines can treat the bare "/" and
// any tracking-param variants as competing URLs.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

interface EventsResponse {
  data?: { events?: BayanihanEvent[] };
  events?: BayanihanEvent[];
}
interface RestaurantsResponse {
  data?: { restaurant?: Restaurant[] };
  restaurant?: Restaurant[];
}

// The events section defaults to "ALL" (every event); the picker can narrow
// to a country client-side.
const DEFAULT_EVENTS_COUNTRY = "ALL";

async function getEvents(): Promise<BayanihanEvent[]> {
  try {
    const data = await serverGet<EventsResponse | BayanihanEvent[]>("events", {
      revalidate: 300,
    });
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data?.events)) return data.data!.events!;
    if (Array.isArray(data?.events)) return data.events!;
    return [];
  } catch {
    return [];
  }
}

async function getRestaurants(): Promise<Restaurant[]> {
  try {
    const data = await serverGet<RestaurantsResponse | Restaurant[]>(
      "restaurants",
      { revalidate: 60 }
    );
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data?.restaurant)) return data.data!.restaurant!;
    if (Array.isArray(data?.restaurant)) return data.restaurant!;
    return [];
  } catch {
    return [];
  }
}

interface NewsListResponse {
  data?: NewsArticle[];
  meta?: { last_page?: number };
}

async function getNews(): Promise<NewsArticle[]> {
  try {
    // Page 1 tells us how many pages there are; fetch the rest in parallel so
    // the homepage shows every article.
    const first = await serverGet<NewsListResponse>("news-articles-v2?page=1", {
      revalidate: 300,
    });
    const raw: NewsArticle[] = Array.isArray(first?.data) ? [...first.data] : [];
    const lastPage =
      typeof first?.meta?.last_page === "number" ? first.meta.last_page : 1;
    if (lastPage > 1) {
      const rest = await Promise.all(
        Array.from({ length: lastPage - 1 }, (_, i) =>
          serverGet<NewsListResponse>(`news-articles-v2?page=${i + 2}`, {
            revalidate: 300,
          })
            .then((r) => (Array.isArray(r?.data) ? r.data : []))
            .catch(() => [] as NewsArticle[])
        )
      );
      rest.forEach((arr) => raw.push(...arr));
    }
    // De-duplicate (the API repeats articles across pages) + normalize, then
    // keep ONLY the fields the homepage card renders. The full article bodies
    // (summary/content/etc.) would otherwise be serialized into the HTML for
    // every article, bloating the document by megabytes.
    const seen = new Set<string>();
    const out: NewsArticle[] = [];
    for (const a of raw) {
      const n = normalizeArticle(a);
      if (!n) continue;
      const key = String(n.id ?? n.slug ?? n.title ?? "");
      if (key && seen.has(key)) continue;
      if (key) seen.add(key);
      out.push({
        id: n.id,
        slug: n.slug,
        title: n.title,
        image_url: n.image_url,
        date: n.date,
        views_count: n.views_count,
        category: n.category,
      });
    }
    return out;
  } catch {
    return [];
  }
}

// Each data section streams in its own <Suspense> boundary, so NO backend
// fetch blocks the initial HTML — the shell + Banner (the LCP) flush
// immediately and the sections fill in as their data resolves.
async function EventsLoader() {
  const events = await getEvents();
  return (
    <EventsSection
      initialEvents={events}
      initialCountry={DEFAULT_EVENTS_COUNTRY}
    />
  );
}

async function RestaurantsLoader() {
  const restaurants = await getRestaurants();
  return <RestaurantsSection initialRestaurants={restaurants} />;
}

async function NewsLoader() {
  const news = await getNews();
  return <NewsSection initialArticles={news} />;
}

export default function HomePage() {
  return (
    <>
      {/*
        Semantic H1 — present in the SSR'd HTML for crawlers + screen readers,
        but visually hidden so the existing Banner design stays untouched.
        Repeats "Bayanihan" in natural prose so the keyword is unambiguously
        associated with this page (it's the single biggest on-page signal
        for the brand search). Don't remove this without replacing the
        H1 with another visible-and-keyword-rich heading on the page.
      */}
      <h1
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        Bayanihan.com — Filipino Events, Festivals &amp; Restaurants Worldwide
      </h1>
      {/* One unified page background — the individual sections are
          transparent so the whole homepage reads as a single surface. */}
      <div style={{ background: "#ffffff", flexGrow: 1 }}>
        {/* Banner needs no server data — it renders immediately so the LCP
            hero paints fast. Popular-country chips load client-side. */}
        <Banner initialCountries={[]} />
        <Suspense fallback={<div style={{ minHeight: 700 }} />}>
          <EventsLoader />
        </Suspense>
        <Suspense fallback={<div style={{ minHeight: 700 }} />}>
          <RestaurantsLoader />
        </Suspense>
        <Suspense fallback={<div style={{ minHeight: 360 }} />}>
          <NewsLoader />
        </Suspense>
        <TopDestinations />
        <AboutSection />
        <HomeContent />
      </div>
    </>
  );
}
