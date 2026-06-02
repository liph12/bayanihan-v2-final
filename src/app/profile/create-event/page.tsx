import type { Metadata } from "next";
import CreateEventPageShell from "@/components/profile/create/CreateEventPageShell";

export const metadata: Metadata = {
  title: "Create Event",
  description: "Create a new Filipino event on Bayanihan.com.",
  robots: { index: false, follow: false },
};

export default function CreateEventPage() {
  return <CreateEventPageShell />;
}
