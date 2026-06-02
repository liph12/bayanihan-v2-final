import type { Metadata } from "next";
import { serverGet } from "@/lib/serverFetch";
import NewsContent from "@/components/news/NewsContent";
import type { NewsArticle, NewsPage } from "@/types";

// news-articles-v2 returns Laravel API Resources shape:
// { data: NewsArticle[], links: {...}, meta: { current_page, last_page, ... } }
interface NewsApiResponse {
  data?: NewsArticle[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
  error?: string;
  message?: string;
}

export const metadata: Metadata = {
  title: "Filipino Global News & Updates",
  description:
    "Stay informed with the latest Filipino global news, community stories, and updates from around the world.",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "Filipino Global News & Updates",
    description:
      "Stay informed with the latest Filipino global news, community stories, and updates from around the world.",
    url: "/news",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Filipino Global News & Updates",
    description:
      "Stay informed with the latest Filipino global news, community stories, and updates from around the world.",
  },
};

async function getInitialNews(): Promise<NewsPage> {
  try {
    const root = await serverGet<NewsApiResponse>("news-articles-v2?page=1", {
      revalidate: 300,
    });
    const apiErr = root?.error || root?.message;
    if (apiErr) {
      return { items: [], page: 1, lastPage: 1, error: apiErr };
    }
    const items = Array.isArray(root?.data) ? root.data : [];
    const lastPage =
      typeof root?.meta?.last_page === "number" ? root.meta.last_page : 1;
    return {
      items,
      page: 1,
      lastPage,
      error: items.length === 0 ? "No news available at the moment." : null,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { items: [], page: 1, lastPage: 1, error: msg };
  }
}

export default async function NewsPageRoute() {
  const initial = await getInitialNews();
  return <NewsContent initial={initial} />;
}
