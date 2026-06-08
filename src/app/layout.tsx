import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Urbanist, Outfit } from "next/font/google";
import ThemeRegistry from "@/theme/ThemeRegistry";
import LocaleProvider from "@/providers/LocaleProvider";
import AuthProvider from "@/providers/AuthProvider";
import AppChrome from "@/components/layout/AppChrome";
import GlobalLoader from "@/components/layout/GlobalLoader";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-urbanist",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

// Resolve the site origin once for every absolute URL emitted by Next's
// Metadata API. Prefers NEXT_PUBLIC_SITE_URL so preview / dev deployments
// can override the prod default; falls back to https://bayanihan.com.
//
// This is the single source of truth for: canonical URLs (alternates.canonical
// on every page), OpenGraph and Twitter image URLs (when relative), and the
// canonical fields emitted by the metadata system. sitemap.ts and robots.ts
// read the same env value to stay in sync.
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bayanihan.com"
).replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Bayanihan — Discover Filipino Events & Restaurants Worldwide | Bayanihan.com",
    template: "%s | Bayanihan.com",
  },
  // Description leads with "Bayanihan" so the keyword anchors the snippet
  // that Google shows under the result. Repeating it naturally is what
  // helps the search engine associate the page with the brand query.
  description:
    "Bayanihan.com is the global home for Filipino events, festivals, and restaurants. Discover Bayanihan — connecting Filipinos worldwide through community, culture, and cuisine.",
  // Application name appears in tab metadata + some social previews.
  applicationName: "Bayanihan.com",
  // `keywords` carries little weight for Google itself but is still read
  // by some smaller crawlers and social platforms. Cheap to include.
  keywords: [
    "Bayanihan",
    "Bayanihan.com",
    "Filipino events",
    "Filipino restaurants",
    "Filipino community worldwide",
    "Filipino festivals",
    "OFW events",
    "Filipinos abroad",
  ],
  authors: [{ name: "Bayanihan.com" }],
  creator: "Bayanihan.com",
  publisher: "Bayanihan.com",
  category: "Filipino community, events, and restaurants",
  // Browser-tab favicon comes from /public/favicon.ico. The apple-touch-icon
  // is still auto-generated from app/apple-icon.tsx, and the web manifest from
  // app/manifest.ts.
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  // ---------------------------------------------------------------------
  // Search Console / Webmaster Tools verification.
  //
  // TODO: replace these placeholders with the real codes from
  //   - Google Search Console: https://search.google.com/search-console
  //     (Settings → Ownership verification → HTML tag → copy the
  //      content="…" value into `google` below)
  //   - Bing Webmaster Tools: https://www.bing.com/webmasters
  //     (Add the meta-tag content into `other['msvalidate.01']`)
  //   - Yandex (optional): yandex.com/webmaster
  //
  // Until the real codes are filled in, leave these out by setting the
  // values to empty strings — Next will skip the tags rather than emit
  // bogus ones that might fail verification later.
  // ---------------------------------------------------------------------
  verification: {
    // Google Search Console — emits <meta name="google-site-verification" …>.
    google: "PN7sa64np1aDfaD2gwBvawz6FPvcCeO10F_ILjzN0V0",
    // yandex: "REPLACE_WITH_YANDEX_VERIFICATION_TOKEN",
    // other: {
    //   "msvalidate.01": "REPLACE_WITH_BING_WEBMASTER_VERIFICATION_TOKEN",
    // },
  },
  openGraph: {
    type: "website",
    siteName: "Bayanihan.com",
    title:
      "Bayanihan — Discover Filipino Events & Restaurants Worldwide",
    description:
      "Bayanihan.com — connecting Filipinos worldwide through events, culture, and cuisine.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Bayanihan — Discover Filipino Events & Restaurants Worldwide",
    description:
      "Bayanihan.com — connecting Filipinos worldwide through events, culture, and cuisine.",
  },
};

// JSON-LD Organization schema — helps search engines (Google especially)
// understand the brand for the knowledge panel: name, logo, official URL,
// and social profiles. Lives in the root <head> so every page emits it.
const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Bayanihan.com",
  alternateName: "Bayanihan",
  url: "https://bayanihan.com",
  logo: "https://bayanihan.com/profile/logo.png",
  description:
    "Bayanihan.com connects Filipinos worldwide through events, culture, and cuisine.",
  sameAs: ["https://www.facebook.com/bayanihanglobal"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "info@bayanihan.com",
  },
};

// WebSite + SearchAction schema — gives Google the data needed to render
// the "sitelinks search box" right inside the search result for brand
// queries like "Bayanihan". Without this, a search for the brand shows
// only the result link; with it, users can search the site without
// leaving Google. Big visibility win for brand searches.
//
// Spec: https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
//
// The search URL pattern points at a `/search?q=…` route. There's no such
// route yet — when one exists, this JSON-LD will already be wired up. If
// the route never lands, Google just won't render the box; nothing breaks.
const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Bayanihan.com",
  alternateName: "Bayanihan",
  url: SITE_URL,
  description:
    "Bayanihan.com — discover Filipino events, festivals, and restaurants worldwide.",
  publisher: { "@id": `${SITE_URL}#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${urbanist.variable} ${outfit.variable}`}>
      <body>
        {/* Site-wide Organization JSON-LD — emitted once, on every page */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
        />
        {/* WebSite + SearchAction JSON-LD — enables Google's sitelinks
            search box on brand-name searches */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(WEBSITE_SCHEMA),
          }}
        />
        <ThemeRegistry>
          <GlobalLoader />
          <AuthProvider>
            <LocaleProvider>
              <AppChrome>{children}</AppChrome>
            </LocaleProvider>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
