import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { serverGet } from "@/lib/serverFetch";
import { ogImageUrl } from "@/lib/ogImage";
import { toSchemaDate } from "@/lib/schemaDate";
import { eventUrl } from "@/lib/eventUrl";
import EventDetailClient, {
  type FetchedEvent,
} from "@/components/event/EventDetailClient";
import RestaurantDetailClient, {
  type FetchedRestaurant,
} from "@/components/restaurant/RestaurantDetailClient";
import type { BayanihanEvent, Restaurant } from "@/types";

interface EventsListResponse {
  data?: { events?: BayanihanEvent[] };
  events?: BayanihanEvent[];
}

interface RestaurantsListResponse {
  data?: { restaurants?: Restaurant[]; restaurant?: Restaurant[] };
  restaurants?: Restaurant[];
}

interface EventDetailResponse {
  data?: FetchedEvent;
}

interface RestaurantDetailResponse {
  data?: FetchedRestaurant;
}

const SSR_COOKIE_ID = "ssr-bot";

// ISR window for the lookups below. These used to run with `no-store`, which
// meant every hit — including every crawl — re-fetched the full events list
// and the 668KB restaurants list before the page could start rendering (TTFB
// measured at 2.4–3.7s). 60s keeps a newly published event discoverable
// within a minute while taking the API off the critical path.
const LOOKUP_REVALIDATE = 60;

function getSubdomainName(
  ev: BayanihanEvent | Restaurant
): string | undefined {
  return (
    ev?.subDomain?.name ||
    (typeof (ev as { subdomain?: { name?: string } | string })?.subdomain ===
    "string"
      ? ((ev as { subdomain?: string }).subdomain as string)
      : (ev as { subdomain?: { name?: string } })?.subdomain?.name)
  );
}

type Match =
  | { kind: "event"; event: BayanihanEvent }
  | { kind: "restaurant"; restaurant: Restaurant }
  | null;

const resolveMatch = cache(async (urlSlug: string): Promise<Match> => {
  try {
    const resp = await serverGet<EventsListResponse>("events", {
      revalidate: LOOKUP_REVALIDATE,
    });
    const list = resp?.data?.events ?? resp?.events ?? [];
    const ev = list.find((e) => {
      const sub = getSubdomainName(e);
      if (sub && sub === urlSlug) return true;
      if (e?.slug && e.slug === urlSlug) return true;
      return false;
    });
    if (ev) return { kind: "event", event: ev };
  } catch {}

  try {
    const resp = await serverGet<RestaurantsListResponse>("restaurants", {
      revalidate: LOOKUP_REVALIDATE,
    });
    const list =
      resp?.data?.restaurants ??
      resp?.data?.restaurant ??
      resp?.restaurants ??
      [];
    const r = list.find((rest) => {
      const sub = getSubdomainName(rest);
      if (sub && sub === urlSlug) return true;
      if (rest?.slug && rest.slug === urlSlug) return true;
      return false;
    });
    if (r) return { kind: "restaurant", restaurant: r };
  } catch {}

  // The events list only carries current/upcoming events, so a past event's
  // URL used to 404 even though the detail endpoint still serves it. Ask the
  // detail endpoint directly before giving up. This resolves URLs that match
  // the event's slug; a vanity-subdomain URL for a past event still can't be
  // resolved without a backend lookup that maps subdomain → slug.
  const detail = await fetchEventDetail(urlSlug);
  if (detail?.slug) {
    return {
      kind: "event",
      event: {
        id: detail.id,
        title: detail.title,
        slug: detail.slug,
      } as unknown as BayanihanEvent,
    };
  }

  return null;
});

const fetchEventDetail = cache(
  async (realSlug: string): Promise<FetchedEvent | null> => {
    try {
      const resp = await serverGet<EventDetailResponse>(
        `view-event/${SSR_COOKIE_ID}/${realSlug}`,
        // Safe to cache: EventDetailClient re-requests this with the
        // visitor's own cookie id, and that call is what counts a view.
        { revalidate: LOOKUP_REVALIDATE }
      );
      return resp?.data ?? null;
    } catch {
      return null;
    }
  }
);

const fetchRestaurantDetail = cache(
  async (id: string | number): Promise<FetchedRestaurant | null> => {
    try {
      const resp = await serverGet<RestaurantDetailResponse>(
        `restaurants/${id}`,
        { revalidate: LOOKUP_REVALIDATE }
      );
      return resp?.data ?? null;
    } catch {
      return null;
    }
  }
);

function stripHtml(html?: string, max = 160): string {
  if (!html) return "";
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const match = await resolveMatch(slug);
  if (!match) return { title: "Not Found" };

  // Events and restaurants answer on BOTH their vanity subdomain name and
  // their raw slug (/imexamerica and /imex-america are both live), and each
  // used to declare itself canonical — two identical pages competing in the
  // index. Point every variant at the one URL the cards and sitemap use.
  const canonicalPath =
    (match.kind === "event"
      ? eventUrl(match.event)
      : eventUrl(match.restaurant)) || `/${slug}`;

  if (match.kind === "event") {
    if (!match.event.slug) return { title: "Event Not Found" };
    const detail = await fetchEventDetail(match.event.slug);
    const title = detail?.title || match.event.title || "Event";
    const description = stripHtml(detail?.description) || title;
    const image = ogImageUrl(detail?.image);
    return {
      title,
      description,
      alternates: { canonical: canonicalPath },
      openGraph: {
        title,
        description,
        url: canonicalPath,
        type: "website",
        ...(image ? { images: [{ url: image }] } : {}),
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  }

  // Restaurant
  if (!match.restaurant.id) return { title: "Restaurant" };
  const detail = await fetchRestaurantDetail(match.restaurant.id);
  const name = detail?.name || match.restaurant.name || "Restaurant";
  const description =
    detail?.description ||
    [detail?.address, detail?.city, detail?.country].filter(Boolean).join(", ") ||
    name;
  const image = ogImageUrl(detail?.cover || detail?.logo);
  return {
    title: name,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: name,
      description,
      url: canonicalPath,
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: name,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

// Shared site origin for absolute URLs in JSON-LD. Crawlers expect
// `mainEntityOfPage` / `url` to be absolute, not relative.
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bayanihan.com"
).replace(/\/$/, "");

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const match = await resolveMatch(slug);
  if (!match) notFound();

  // Same preferred URL the canonical tag declares, so the structured data
  // and the <link rel="canonical"> agree on one address per event.
  const canonicalUrl = `${SITE_URL}${
    (match.kind === "event" ? eventUrl(match.event) : eventUrl(match.restaurant)) ||
    `/${slug}`
  }`;

  if (match.kind === "event") {
    if (!match.event.slug) notFound();
    const initialEvent = await fetchEventDetail(match.event.slug);

    // schema.org needs ISO 8601; the API hands back "September 27, 2026".
    const schemaStart = toSchemaDate(
      initialEvent?.eventDate,
      initialEvent?.startTime
    );
    // Only emit endDate when it genuinely falls after the start — some rows
    // carry an endTime earlier in the day than startTime, and an end before
    // the start makes the whole Event invalid.
    const schemaEndCandidate = toSchemaDate(
      initialEvent?.eventDate,
      initialEvent?.endTime
    );
    const schemaEnd =
      schemaStart && schemaEndCandidate && schemaEndCandidate > schemaStart
        ? schemaEndCandidate
        : undefined;

    // Event JSON-LD — server-rendered so it ships in the initial HTML.
    // Spec: https://schema.org/Event
    const eventJsonLd = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: initialEvent?.title || match.event.title,
      description: stripHtml(initialEvent?.description) || undefined,
      image: initialEvent?.image || undefined,
      startDate: schemaStart,
      endDate: schemaEnd,
      location: initialEvent?.location
        ? {
            "@type": "Place",
            name: initialEvent.location,
            address: initialEvent.location,
          }
        : undefined,
      organizer: initialEvent?.organizer
        ? { "@type": "Organization", name: initialEvent.organizer }
        : initialEvent?.user?.name
        ? { "@type": "Person", name: initialEvent.user.name }
        : undefined,
      url: canonicalUrl,
      mainEntityOfPage: canonicalUrl,
      // Google reads this — defaults to OfflineEventAttendanceMode if absent.
      eventAttendanceMode:
        "https://schema.org/OfflineEventAttendanceMode",
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
        <EventDetailClient
          realSlug={match.event.slug}
          initialEvent={initialEvent}
        />
      </>
    );
  }

  if (!match.restaurant.id) notFound();
  const initialData = await fetchRestaurantDetail(match.restaurant.id);

  // Restaurant JSON-LD — Google honors the Filipino cuisine signal via
  // `servesCuisine`, plus the address gives the result a richer card.
  // Spec: https://schema.org/Restaurant
  const restaurantJsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: initialData?.name || match.restaurant.name,
    description: initialData?.description || undefined,
    image: initialData?.cover || initialData?.logo || undefined,
    servesCuisine: "Filipino",
    address: {
      "@type": "PostalAddress",
      streetAddress: initialData?.address || undefined,
      addressLocality: initialData?.city || undefined,
      addressCountry: initialData?.country || undefined,
    },
    telephone: initialData?.contact_number || undefined,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    ...(initialData?.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(initialData.rating),
            // ratingCount is unknown from this API; omit so Google doesn't
            // reject the rich snippet as incomplete.
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
      />
      <RestaurantDetailClient
        restaurantId={match.restaurant.id}
        initialData={initialData}
      />
    </>
  );
}
