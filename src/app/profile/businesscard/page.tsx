import type { Metadata } from "next";
import BusinessCardPageShell from "@/components/profile/business-card/BusinessCardPageShell";

export const metadata: Metadata = {
  title: "Business Card",
  description: "Design and download your Bayanihan business card.",
  robots: { index: false, follow: false },
};

export default function BusinessCardPage() {
  return <BusinessCardPageShell />;
}
