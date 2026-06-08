// Full-width "About / Why Bayanihan" band for the homepage. Pure server-
// rendered semantic HTML (zero client JS) — keeps the keyword-rich copy and a
// proper heading hierarchy under the page H1, presented as a modern feature
// grid with inline SVG icons.

import type { CSSProperties, ReactNode } from "react";

const FONT_HEAD = "var(--font-urbanist), 'Outfit', sans-serif";
const FONT_BODY = "var(--font-outfit), 'Outfit', sans-serif";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const FEATURES: {
  color: string;
  title: string;
  body: string;
  icon: ReactNode;
}[] = [
  {
    color: "#fb923c",
    title: "Discover Events and Festivals Near You",
    body: "From Independence Day celebrations and Santo Niño processions to Flores de Mayo, town fiestas, and cultural nights, Filipino events happen in cities across the globe every week. Browse upcoming events by country and never miss a gathering — organisers can publish for free.",
    icon: (
      <Icon>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </Icon>
    ),
  },
  {
    color: "#2dd4bf",
    title: "Find Filipino Restaurants Worldwide",
    body: "Nothing connects Filipinos abroad like a plate of home. Discover Filipino-owned restaurants and eateries wherever you are — from neighbourhood carinderias serving adobo and sinigang to modern kitchens reinventing Filipino classics — and support Filipino entrepreneurs.",
    icon: (
      <Icon>
        <path d="M7 2v8a2 2 0 0 0 2 2 2 2 0 0 0 2-2V2M9 12v10" />
        <path d="M17 2c-1.7 0-3 2-3 5s1.3 5 3 5v10" />
      </Icon>
    ),
  },
  {
    color: "#fbbf24",
    title: "Connect the Worldwide Community",
    body: "The Filipino value of bayanihan — neighbours coming together to lift a shared load — is the heart of what we do. Beyond events and restaurants, Bayanihan is a hub for Global Pinoy news, cultural stories, and community updates that keep you informed and rooted.",
    icon: (
      <Icon>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </Icon>
    ),
  },
  {
    color: "#38bdf8",
    title: "Built for Overseas Filipinos & the Diaspora",
    body: "Whether you are searching for Filipino events in Singapore, a Filipino restaurant near you, or planning a celebration of your own, Bayanihan.com makes those connections effortless — explore by country, follow Global Pinoy updates, and belong to a worldwide community.",
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </Icon>
    ),
  },
];

const section: CSSProperties = {
  width: "100%",
  marginTop: 24,
  padding: "clamp(48px, 7vw, 88px) 20px",
  background:
    "radial-gradient(900px 480px at 0% 0%, rgba(247,127,0,0.14), transparent 60%), radial-gradient(900px 480px at 100% 100%, rgba(20,184,166,0.14), transparent 60%), #0f172a",
};
const inner: CSSProperties = {
  maxWidth: 1240,
  margin: "0 auto",
};
const eyebrow: CSSProperties = {
  fontFamily: FONT_HEAD,
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#fbbf24",
  textAlign: "center",
  margin: "0 0 12px",
};
const h2: CSSProperties = {
  fontFamily: FONT_HEAD,
  fontWeight: 800,
  fontSize: "clamp(1.7rem, 4vw, 2.6rem)",
  color: "#ffffff",
  lineHeight: 1.15,
  letterSpacing: "-0.01em",
  textAlign: "center",
  maxWidth: 900,
  margin: "0 auto 18px",
};
const lead: CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: "clamp(1rem, 1.6vw, 1.15rem)",
  lineHeight: 1.75,
  color: "rgba(226,232,240,0.85)",
  textAlign: "center",
  maxWidth: 760,
  margin: "0 auto",
};
const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 20,
  marginTop: "clamp(36px, 5vw, 56px)",
};
const card: CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 18,
  padding: "28px 24px",
};
const iconWrap = (color: string): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 52,
  height: 52,
  borderRadius: 14,
  color,
  background: "rgba(255,255,255,0.06)",
  border: `1px solid ${color}33`,
  marginBottom: 16,
});
const cardTitle: CSSProperties = {
  fontFamily: FONT_HEAD,
  fontWeight: 800,
  fontSize: "1.15rem",
  color: "#ffffff",
  lineHeight: 1.3,
  margin: "0 0 10px",
};
const cardBody: CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: "0.95rem",
  lineHeight: 1.7,
  color: "rgba(203,213,225,0.85)",
  margin: 0,
};

export default function HomeContent() {
  return (
    <section style={section} aria-label="About Bayanihan">
      <div style={inner}>
        <p style={eyebrow}>The Global Filipino Network</p>
        <h2 style={h2}>
          Your Global Home for Filipino Events, Festivals &amp; Restaurants
        </h2>
        <p style={lead}>
          Bayanihan.com brings the warmth of Filipino community to every corner
          of the world. Whether you are an overseas Filipino worker, part of the
          diaspora, or simply someone who loves Filipino culture, this is where
          you discover what&apos;s happening near you and stay connected to the
          people, food, and traditions that make the Filipino spirit
          unmistakable.
        </p>

        <div style={grid}>
          {FEATURES.map((f) => (
            <div key={f.title} style={card}>
              <span style={iconWrap(f.color)}>{f.icon}</span>
              <h3 style={cardTitle}>{f.title}</h3>
              <p style={cardBody}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
