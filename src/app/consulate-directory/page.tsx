import type { Metadata } from "next";
import { serverGet } from "@/lib/serverFetch";
import ConsulateDirectoryContent from "@/components/consulate-directory/ConsulateDirectoryContent";
import type { ConsulateDirectory, ConsulateOffice } from "@/types";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bayanihan.com"
).replace(/\/$/, "");

const PAGE_TITLE = "Filipino Consulate & Embassy Directory";
const PAGE_DESCRIPTION =
  "Find Philippine consulates and embassies worldwide, organized by country with official contact details.";

// consulate-offices returns the standard Laravel API Resource shape:
// { data: ConsulateOffice[], links: {...}, meta: { current_page, last_page, ... } }
interface ConsulateApiResponse {
  data?: ConsulateOffice[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
  error?: string;
  message?: string;
}

export const metadata: Metadata = {
  title: "Filipino Consulate & Embassy Directory",
  description:
    "Find Philippine consulates and embassies worldwide. Browse official offices by country with their websites, Facebook pages, emails, and contact numbers.",
  alternates: { canonical: "/consulate-directory" },
  openGraph: {
    title: "Filipino Consulate & Embassy Directory",
    description:
      "Find Philippine consulates and embassies worldwide, organized by country with official contact details.",
    url: "/consulate-directory",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Filipino Consulate & Embassy Directory",
    description:
      "Find Philippine consulates and embassies worldwide, organized by country with official contact details.",
  },
};

async function getOffices(): Promise<ConsulateDirectory> {
  try {
    const root = await serverGet<ConsulateApiResponse>(
      "consulate-offices?per_page=1000",
      { revalidate: 300 }
    );
    const apiErr = root?.error || root?.message;
    if (apiErr) {
      return { items: [], error: apiErr };
    }
    const items = Array.isArray(root?.data) ? root.data : [];
    return {
      items,
      error:
        items.length === 0
          ? "The consulate directory is being updated. Please check back soon."
          : null,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { items: [], error: msg };
  }
}

// CollectionPage + ItemList JSON-LD so crawlers see every consulate office
// from this single hub as structured GovernmentOffice entities (name, address,
// phone, email, url). Spec: https://schema.org/ItemList
function buildJsonLd(items: ConsulateOffice[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/consulate-directory`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((o, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "GovernmentOffice",
          name: o.office_name || "Consulate Office",
          ...(o.website ? { url: o.website } : {}),
          ...(o.email ? { email: o.email } : {}),
          ...(o.contact_number ? { telephone: o.contact_number } : {}),
          ...(o.office_logo ? { image: o.office_logo } : {}),
          address: {
            "@type": "PostalAddress",
            ...(o.address ? { streetAddress: o.address } : {}),
            ...(o.country ? { addressCountry: o.country } : {}),
          },
        },
      })),
    },
  };
}

export default async function ConsulateDirectoryRoute() {
  const initial = await getOffices();
  return (
    <>
      {initial.items.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildJsonLd(initial.items)),
          }}
        />
      )}
      <ConsulateDirectoryContent initial={initial} />
    </>
  );
}
