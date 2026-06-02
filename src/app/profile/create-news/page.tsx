import type { Metadata } from "next";
import CreateNewsPageShell from "@/components/profile/news/CreateNewsPageShell";

export const metadata: Metadata = {
  title: "Create News",
  description: "Publish a new article to Bayanihan.com.",
  robots: { index: false, follow: false },
};

export default function CreateNewsPage() {
  return <CreateNewsPageShell />;
}
