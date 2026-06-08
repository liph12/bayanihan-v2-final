// SEO/content section for the homepage. Pure server-rendered semantic HTML
// (no client JS) — adds genuine, keyword-rich copy and a proper heading
// hierarchy under the page H1, which thin image-heavy homepages lack.

import type { CSSProperties } from "react";

const FONT_HEAD = "var(--font-urbanist), 'Outfit', sans-serif";
const FONT_BODY = "var(--font-outfit), 'Outfit', sans-serif";

const section: CSSProperties = {
  maxWidth: 920,
  margin: "0 auto",
  padding: "16px 20px 56px",
};
const h2: CSSProperties = {
  fontFamily: FONT_HEAD,
  fontWeight: 800,
  fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
  color: "#0f172a",
  lineHeight: 1.2,
  margin: "0 0 14px",
};
const h3: CSSProperties = {
  fontFamily: FONT_HEAD,
  fontWeight: 700,
  fontSize: "clamp(1.15rem, 2.5vw, 1.35rem)",
  color: "#0f172a",
  lineHeight: 1.3,
  margin: "30px 0 8px",
};
const p: CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: "1rem",
  lineHeight: 1.75,
  color: "#475569",
  margin: "0 0 14px",
};

export default function HomeContent() {
  return (
    <section style={section} aria-label="About Bayanihan">
      <h2 style={h2}>
        Your Global Home for Filipino Events, Festivals &amp; Restaurants
      </h2>
      <p style={p}>
        Bayanihan.com brings the warmth of Filipino community to every corner of
        the world. Whether you are an overseas Filipino worker far from home, a
        member of the diaspora raising the next generation abroad, or simply
        someone who loves Filipino culture, Bayanihan is where you discover
        what&apos;s happening near you — and stay connected to the people, food,
        and traditions that make the Filipino spirit unmistakable. From bustling
        city celebrations to intimate neighbourhood gatherings, this is where the
        global Filipino family comes together.
      </p>

      <h3 style={h3}>Discover Filipino Events and Festivals Near You</h3>
      <p style={p}>
        From Independence Day celebrations and Santo Niño processions to Flores
        de Mayo, town fiestas, and cultural nights, Filipino events are happening
        in cities across the globe every week. Bayanihan gathers them in one
        place so you never miss a gathering. Browse upcoming events by country —
        the Philippines, the United States, Canada, the United Arab Emirates,
        Singapore, Saudi Arabia, the United Kingdom, and many more — and find the
        celebrations that bring our community together. Organisers can publish
        their events for free and reach Filipinos who are actively looking for
        something to attend.
      </p>

      <h3 style={h3}>Find Filipino Restaurants Around the World</h3>
      <p style={p}>
        Nothing connects Filipinos abroad quite like a plate of home. Bayanihan
        helps you discover Filipino-owned restaurants and eateries wherever you
        are — from neighbourhood carinderias serving adobo, sinigang, and
        lechon to modern kitchens reinventing Filipino classics for a new
        generation. Each listing makes it easy to find the flavours of home,
        support Filipino entrepreneurs, and share a taste of the Philippines
        with friends from every background.
      </p>

      <h3 style={h3}>Connecting the Worldwide Filipino Community</h3>
      <p style={p}>
        The Filipino value of <em>bayanihan</em> — neighbours coming together to
        lift a shared load — is the heart of everything we do. Beyond events and
        restaurants, Bayanihan is a hub for Global Pinoy news, cultural stories,
        and community updates that keep you informed and rooted no matter how
        far you live from the islands. We believe that staying connected to
        culture is what turns a place you live into a place that truly feels like
        home.
      </p>

      <h3 style={h3}>Built for Overseas Filipinos and the Diaspora</h3>
      <p style={p}>
        Whether you are searching for Filipino events in Singapore, looking for a
        Filipino restaurant near you, or planning a community celebration of your
        own, Bayanihan.com is built to make those connections effortless. Explore
        events, restaurants, and stories by country, follow the latest Global
        Pinoy updates, and become part of a worldwide community that celebrates
        being Filipino — together, wherever life takes us.
      </p>
    </section>
  );
}
