import type { Metadata } from "next";
import AboutContent from "@/components/about/AboutContent";

export const metadata: Metadata = {
  title: "About Bayanihan.com — Where Filipino Events and Culture Unite",
  description:
    "Bayanihan.com is the all-in-one platform to discover, promote, and manage Filipino events, festivals, and restaurants worldwide. Learn how we connect Filipino communities globally.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Bayanihan.com — Where Filipino Events and Culture Unite",
    description:
      "Discover how Bayanihan.com connects Filipino communities worldwide through events, festivals, and restaurants.",
    url: "/about",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Bayanihan.com — Where Filipino Events and Culture Unite",
    description:
      "Discover how Bayanihan.com connects Filipino communities worldwide through events, festivals, and restaurants.",
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
