import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import NextLink from "next/link";
import { Box, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import {
  DESTINATIONS,
  destinationUrl,
  getDestinationBySlug,
} from "@/lib/destinations";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bayanihan.com"
).replace(/\/$/, "");
const FONT_HEAD = "var(--font-urbanist), 'Outfit', sans-serif";
const FONT_BODY = "var(--font-outfit), 'Outfit', sans-serif";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Pre-render every destination at build time (static, no API) — fast + SEO.
export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const d = getDestinationBySlug(slug);
  if (!d) return { title: "Destination Not Found" };
  const canonical = destinationUrl(slug);
  const title = `${d.title}, ${d.subtitle} — Travel Guide`;
  return {
    title,
    description: d.description,
    keywords: [
      d.title,
      `${d.title} ${d.subtitle}`,
      `${d.title} travel guide`,
      `things to do in ${d.title}`,
      "Philippines destinations",
      "Filipino travel",
    ],
    alternates: { canonical },
    openGraph: {
      title,
      description: d.description,
      url: canonical,
      type: "article",
      images: [{ url: d.img }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: d.description,
      images: [d.img],
    },
  };
}

export default async function DestinationPage({ params }: PageProps) {
  const { slug } = await params;
  const d = getDestinationBySlug(slug);
  if (!d) notFound();

  const canonicalUrl = `${SITE_URL}${destinationUrl(slug)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: d.title,
    description: d.description,
    url: canonicalUrl,
    image: `${SITE_URL}${d.img}`,
    address: {
      "@type": "PostalAddress",
      addressRegion: d.subtitle,
      addressCountry: "PH",
    },
  };

  const related = DESTINATIONS.filter((x) => x.slug !== slug).slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Box component="main" sx={{ bgcolor: "#fff", pb: { xs: 6, md: 10 } }}>
        {/* ── Hero ── */}
        <Box
          sx={{
            position: "relative",
            height: { xs: 320, md: 460 },
            overflow: "hidden",
          }}
        >
          <Image
            src={d.img}
            alt={`${d.title}, ${d.subtitle}, Philippines`}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.8) 100%)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2.5, md: 4 }, pb: { xs: 3, md: 4.5 } }}>
              <Box
                component={NextLink}
                href="/#top-destinations"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "rgba(255,255,255,0.9)",
                  textDecoration: "none",
                  fontFamily: FONT_BODY,
                  fontSize: 14,
                  mb: 1.5,
                  "&:hover": { color: "#fff" },
                }}
              >
                <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
                Back to destinations
              </Box>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "#fbbf24",
                  fontFamily: FONT_HEAD,
                  fontWeight: 700,
                  fontSize: { xs: 13, md: 15 },
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  mb: 0.5,
                }}
              >
                <LocationOnRoundedIcon sx={{ fontSize: 18 }} />
                {d.subtitle}, Philippines
              </Box>
              <Typography
                component="h1"
                sx={{
                  fontFamily: FONT_HEAD,
                  fontWeight: 900,
                  fontSize: { xs: 32, md: 52 },
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  color: "#fff",
                  textShadow: "0 2px 18px rgba(0,0,0,0.45)",
                }}
              >
                {d.title}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Content ── */}
        <Box sx={{ maxWidth: 820, mx: "auto", px: { xs: 2.5, md: 3 }, pt: { xs: 4, md: 6 } }}>
          <Typography
            sx={{
              fontFamily: FONT_BODY,
              fontSize: { xs: 17, md: 19 },
              lineHeight: 1.7,
              color: "#334155",
              mb: { xs: 3.5, md: 5 },
            }}
          >
            {d.lead}
          </Typography>

          {d.sections.map((s) => (
            <Box key={s.heading} sx={{ mb: { xs: 3.5, md: 4.5 } }}>
              <Typography
                component="h2"
                sx={{
                  fontFamily: FONT_HEAD,
                  fontWeight: 800,
                  fontSize: { xs: 21, md: 27 },
                  color: "#0f172a",
                  mb: 1.5,
                }}
              >
                {s.heading}
              </Typography>
              {s.body.map((p, i) => (
                <Typography
                  key={i}
                  sx={{
                    fontFamily: FONT_BODY,
                    fontSize: 16,
                    lineHeight: 1.8,
                    color: "#475569",
                    mb: 1.5,
                  }}
                >
                  {p}
                </Typography>
              ))}
            </Box>
          ))}
        </Box>

        {/* ── Explore more destinations ── */}
        <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2.5, md: 3 }, mt: { xs: 4, md: 7 } }}>
          <Typography
            component="h2"
            sx={{
              fontFamily: FONT_HEAD,
              fontWeight: 800,
              fontSize: { xs: 20, md: 26 },
              color: "#0f172a",
              mb: 2.5,
            }}
          >
            Explore more destinations
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: { xs: 1.5, md: 2.5 },
            }}
          >
            {related.map((r) => (
              <Box
                key={r.slug}
                component={NextLink}
                href={destinationUrl(r.slug)}
                sx={{
                  position: "relative",
                  height: { xs: 150, md: 180 },
                  borderRadius: 3,
                  overflow: "hidden",
                  textDecoration: "none",
                  display: "block",
                  boxShadow: "0 6px 16px rgba(15,23,42,0.08)",
                  "&:hover img": { transform: "scale(1.06)" },
                }}
              >
                <Image
                  src={r.img}
                  alt={`${r.title}, ${r.subtitle}`}
                  fill
                  sizes="(max-width:600px) 50vw, 25vw"
                  style={{
                    objectFit: "cover",
                    transition: "transform .5s ease",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.82) 100%)",
                  }}
                />
                <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, p: 1.5, color: "#fff" }}>
                  <Typography
                    sx={{
                      fontFamily: FONT_HEAD,
                      fontWeight: 800,
                      fontSize: { xs: 14, md: 16 },
                      lineHeight: 1.2,
                    }}
                  >
                    {r.title}
                  </Typography>
                  <Typography sx={{ fontFamily: FONT_BODY, fontSize: 12, opacity: 0.9 }}>
                    {r.subtitle}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}
