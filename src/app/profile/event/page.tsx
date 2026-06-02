import type { Metadata } from "next";
import EventListPageShell from "@/components/profile/event/EventListPageShell";

export const metadata: Metadata = {
  title: "Your Events",
  description: "Manage and review the events you've organized.",
  robots: { index: false, follow: false },
};

export default function YourEventsPage() {
  return <EventListPageShell />;
}
