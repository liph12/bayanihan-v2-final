// Helpers for the bare-slug URL convention used by both events and restaurants.
// Public URL preserves hyphens: backend slug "my-event-2025" → URL "/my-event-2025".
// Subdomain field is preferred (it's the vanity URL); if absent, fall back to slug.

import type { BayanihanEvent, Restaurant } from "@/types";

export function slugToUrl(slug?: string | null): string {
  return slug ? `/${slug}` : "";
}

type Linkable = BayanihanEvent | Restaurant;

function getSubdomainName(item: Linkable): string | undefined {
  return (
    item.subDomain?.name ||
    (typeof (item as { subdomain?: { name?: string } | string }).subdomain ===
    "string"
      ? ((item as { subdomain?: string }).subdomain as string)
      : (item as { subdomain?: { name?: string } }).subdomain?.name)
  );
}

// Build a same-origin URL for an event, preferring the subdomain (vanity)
// over the raw slug. Both are used as-is (hyphens preserved).
export function eventUrl(ev: Linkable | null | undefined): string {
  if (!ev) return "";
  const sub = getSubdomainName(ev);
  if (sub) return `/${sub}`;
  if (ev.slug) return `/${ev.slug}`;
  return `/${ev.id || ""}`;
}

export const restaurantUrl = eventUrl;
