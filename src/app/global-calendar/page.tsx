import type { Metadata } from "next";
import { serverGet } from "@/lib/serverFetch";
import GlobalCalendarContent from "@/components/global-calendar/GlobalCalendarContent";
import type { BayanihanEvent } from "@/types";
import type { CalendarEventResource } from "@/components/global-calendar/calendar-helpers";

interface EventsResponse {
  data?: { events?: CalendarEventResource[] };
  events?: CalendarEventResource[];
}

export const metadata: Metadata = {
  title: "Global Calendar — Filipino Events Worldwide",
  description:
    "Browse Filipino events, festivals, and community gatherings on a global calendar. See what's happening today, this week, or upcoming worldwide.",
  alternates: { canonical: "/global-calendar" },
  openGraph: {
    title: "Global Calendar — Filipino Events Worldwide",
    description:
      "All Filipino events, festivals, and community gatherings in one calendar.",
    url: "/global-calendar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Calendar — Filipino Events Worldwide",
    description:
      "All Filipino events, festivals, and community gatherings in one calendar.",
  },
};

async function getEvents(): Promise<CalendarEventResource[]> {
  try {
    const data = await serverGet<EventsResponse | BayanihanEvent[]>("events", {
      revalidate: 60,
    });
    if (Array.isArray(data)) return data as CalendarEventResource[];
    const d = data as EventsResponse;
    if (Array.isArray(d?.data?.events)) return d.data!.events!;
    if (Array.isArray(d?.events)) return d.events!;
    return [];
  } catch {
    return [];
  }
}

export default async function GlobalCalendarPage() {
  const events = await getEvents();
  return <GlobalCalendarContent initialEvents={events} />;
}
