import type { Metadata } from "next";
import { serverGet } from "@/lib/serverFetch";
import BrowseEventsContent from "@/components/browse-events/BrowseEventsContent";
import type { BayanihanEvent } from "@/types";

interface EventsResponse {
  data?: { events?: BayanihanEvent[] };
  events?: BayanihanEvent[];
}

export const metadata: Metadata = {
  title: "Browse Filipino Events Worldwide",
  description:
    "Discover Filipino events, festivals, and community gatherings happening worldwide. Filter by country and month to find events near you.",
  alternates: { canonical: "/browse-events" },
  openGraph: {
    title: "Browse Filipino Events Worldwide",
    description:
      "Discover Filipino events, festivals, and community gatherings around the globe.",
    url: "/browse-events",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Filipino Events Worldwide",
    description:
      "Discover Filipino events, festivals, and community gatherings around the globe.",
  },
};

async function getEvents(): Promise<BayanihanEvent[]> {
  try {
    const data = await serverGet<EventsResponse | BayanihanEvent[]>("events", {
      revalidate: 60,
    });
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data?.events)) return data.data!.events!;
    if (Array.isArray(data?.events)) return data.events!;
    return [];
  } catch {
    return [];
  }
}

export default async function BrowseEventsPage() {
  const events = await getEvents();
  return <BrowseEventsContent initialEvents={events} />;
}
