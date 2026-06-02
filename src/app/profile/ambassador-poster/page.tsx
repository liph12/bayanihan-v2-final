import type { Metadata } from "next";
import AmbassadorPosterPageShell from "@/components/profile/ambassador-poster/AmbassadorPosterPageShell";

export const metadata: Metadata = {
  title: "Ambassador Poster",
  description: "Design and download your Bayanihan ambassador poster.",
  robots: { index: false, follow: false },
};

export default function AmbassadorPosterPage() {
  return <AmbassadorPosterPageShell />;
}
