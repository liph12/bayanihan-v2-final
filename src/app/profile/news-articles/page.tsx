import type { Metadata } from "next";
import NewsArticlesPageShell from "@/components/profile/news/NewsArticlesPageShell";

export const metadata: Metadata = {
  title: "News Articles",
  description: "Manage your published news articles.",
  robots: { index: false, follow: false },
};

export default function NewsArticlesPage() {
  return <NewsArticlesPageShell />;
}
