import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverGet } from "@/lib/serverFetch";
import NewsDetailContent from "@/components/news/NewsDetailContent";
import { normalizeArticle } from "@/lib/newsHelpers";
import type { NewsArticle } from "@/types";

interface DetailApiResponse {
  data?: NewsArticle;
  error?: string;
  message?: string;
}

interface ListApiResponse {
  data?: {
    data?: NewsArticle[];
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string): Promise<NewsArticle | null> {
  try {
    // Note: the single-article endpoint increments views_count on every fetch,
    // so we bypass the Next cache to ensure each visit counts.
    const root = await serverGet<DetailApiResponse>(
      `news-articles-v2/${slug}`,
      { noStore: true }
    );
    const raw = root?.data ?? null;
    return normalizeArticle(raw);
  } catch {
    return null;
  }
}

async function getRelatedAndAll(slug: string) {
  try {
    const root = await serverGet<ListApiResponse>("news-articles-v2?page=1", {
      revalidate: 300,
    });
    const raw = Array.isArray(root?.data?.data) ? root.data!.data! : [];
    const normalized = raw
      .map((a) => normalizeArticle(a))
      .filter((a): a is NewsArticle => !!a);
    const related = normalized.filter((a) => a.slug !== slug).slice(0, 4);
    return { allArticles: normalized, related };
  } catch {
    return { allArticles: [], related: [] };
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) {
    return {
      title: "Article not found",
      description: "The article you're looking for doesn't exist.",
    };
  }
  const summaryText =
    typeof article.summary === "string"
      ? article.summary.slice(0, 200)
      : Array.isArray(article.summary)
      ? article.summary.join(" ").slice(0, 200)
      : "";
  const canonicalPath = `/news/${slug}`;
  return {
    title: article.title || "News",
    description: summaryText,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: article.title,
      description: summaryText,
      url: canonicalPath,
      type: "article",
      images: article.image_url ? [{ url: article.image_url }] : undefined,
      publishedTime: article.published_at || article.date || undefined,
      modifiedTime: article.updated_at || undefined,
      authors: article.author ? [article.author] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: summaryText,
      images: article.image_url ? [article.image_url] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [article, listing] = await Promise.all([
    getArticle(slug),
    getRelatedAndAll(slug),
  ]);
  if (!article) notFound();

  // Build the NewsArticle JSON-LD on the server so it ships in the initial
  // HTML response — search engines pick it up without executing client JS.
  // Spec: https://schema.org/NewsArticle
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://bayanihan.com"
  ).replace(/\/$/, "");
  const summaryText =
    typeof article.summary === "string"
      ? article.summary.slice(0, 200)
      : Array.isArray(article.summary)
      ? article.summary.join(" ").slice(0, 200)
      : undefined;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: summaryText,
    image: article.image_url || undefined,
    datePublished: article.published_at || article.date,
    dateModified: article.updated_at || article.published_at,
    author: article.author
      ? { "@type": "Person", name: article.author }
      : undefined,
    articleSection: article.category || undefined,
    mainEntityOfPage: `${siteUrl}/news/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <NewsDetailContent
        article={article}
        allArticles={listing.allArticles}
        related={listing.related}
        slug={slug}
      />
    </>
  );
}
