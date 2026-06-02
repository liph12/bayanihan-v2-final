import type { Metadata } from "next";
import NewsAnalyticsPageShell from "@/components/profile/news/NewsAnalyticsPageShell";

export const metadata: Metadata = {
  title: "News Article Analytics",
  description: "Insights and top performers across your news articles.",
  robots: { index: false, follow: false },
};

export default function NewsAnalyticsPage() {
  return <NewsAnalyticsPageShell />;
}
