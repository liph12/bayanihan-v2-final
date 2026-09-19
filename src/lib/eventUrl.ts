// Helpers for the bare-slug URL convention used by both events and restaurants.
// Public URL preserves hyphens: backend slug "my-event-2025" → URL "/my-event-2025".
// Subdomain field is preferred (it's the vanity URL); if absent, fall back to slug.

export function slugToUrl(slug?: string | null): string {
  return slug ? `/${slug}` : "";
}

// Structural shape — covers BayanihanEvent / Restaurant as well as the
// lighter records the search endpoint returns (where subDomain is a string).
type Linkable = {
  id?: string | number;
  slug?: string | null;
  subDomain?: { name?: string | null } | string | null;
  subdomain?: { name?: string | null } | string | null;
};

function getSubdomainName(item: Linkable): string | undefined {
  for (const field of [item.subDomain, item.subdomain]) {
    if (typeof field === "string" && field) return field;
    if (field && typeof field === "object" && field.name) return field.name;
  }
  return undefined;
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
