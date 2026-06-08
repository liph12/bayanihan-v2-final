"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Typography,
  Link as MLink,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import Grid from "@mui/material/Grid2";
import NextLink from "next/link";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import XIcon from "@mui/icons-material/X";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useLocale } from "@/providers/LocaleProvider";
import { useAuthProvider } from "@/providers/AuthProvider";
import type { Locale } from "@/types";
import {
  ARTICLE_CATEGORIES,
  ARTICLES_BASE_PATH,
  articleUrl,
  getArticlesByCategory,
} from "@/lib/articles";

const BG = "#ECEAE3";
const LOGO_SRC = "/profile/logo.png";

// Social-sharing links (share the site). Plain anchors so they're crawlable
// and need no JS.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bayanihan.com";
const SHARE_TEXT =
  "Discover Filipino events, festivals & restaurants worldwide on Bayanihan.com";
const SHARE_LINKS = {
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`,
  x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`,
};
const shareIconSx = (color: string) => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  color,
  bgcolor: "#fff",
  "&:hover": { bgcolor: color, color: "#fff" },
});

type LangKey =
  | "discover"
  | "organize"
  | "find"
  | "connect"
  | "exploreEvents"
  | "filipinoFestivals"
  | "restaurantsAbroad"
  | "featuredEvents"
  | "upcoming"
  | "communityEvents"
  | "categories"
  | "listings"
  | "postEvent"
  | "promoteFestival"
  | "listRestaurant"
  | "promoTools"
  | "organizerDash"
  | "partner"
  | "nearYouEvents"
  | "festivalsWorld"
  | "foodNear"
  | "cultural"
  | "gatherings"
  | "dining"
  | "support"
  | "partnerships"
  | "language";

interface LangStrings extends Record<LangKey, string> {
  copyright: (year: number) => string;
}

const STRINGS: Record<Locale, LangStrings> = {
  en: {
    discover: "Discover Bayanihan",
    organize: "Organize With Us",
    find: "Find Events & Food",
    connect: "Connect With Us",
    exploreEvents: "Explore Events",
    filipinoFestivals: "Filipino Festivals",
    restaurantsAbroad: "Filipino Restaurants Abroad",
    featuredEvents: "Featured Events",
    upcoming: "Upcoming Celebrations",
    communityEvents: "Community Events",
    categories: "Event Categories",
    listings: "Restaurant Listings",
    postEvent: "Post an Event",
    promoteFestival: "Promote Your Festival",
    listRestaurant: "List Your Restaurant",
    promoTools: "Event Promotion Tools",
    organizerDash: "Organizer Dashboard",
    partner: "Partner With Bayanihan",
    nearYouEvents: "Filipino Events Near You",
    festivalsWorld: "Festivals Around the World",
    foodNear: "Filipino Food Near Me",
    cultural: "Cultural Celebrations",
    gatherings: "Community Gatherings",
    dining: "Food & Dining Events",
    support: "Contact Support",
    partnerships: "Contact Sales / Partnerships",
    copyright: (year: number) =>
      `© ${year} Bayanihan. All Rights Reserved.`,
    language: "Language",
  },
  fil: {
    discover: "Tuklasin ang Bayanihan",
    organize: "Makipag-ayos sa Amin",
    find: "Maghanap ng Events at Pagkain",
    connect: "Makipag-ugnayan sa Amin",
    exploreEvents: "Tumingin ng Events",
    filipinoFestivals: "Mga Kapistahan",
    restaurantsAbroad: "Mga Restawran sa Ibayong-dagat",
    featuredEvents: "Tampok na Events",
    upcoming: "Paparating na Pagdiriwang",
    communityEvents: "Mga Kaganapan sa Komunidad",
    categories: "Mga Kategorya ng Event",
    listings: "Listahan ng mga Restawran",
    postEvent: "Mag-post ng Event",
    promoteFestival: "I-promote ang Iyong Pista",
    listRestaurant: "Ilista ang Iyong Restawran",
    promoTools: "Mga Kasangkapan sa Promo",
    organizerDash: "Organizer Dashboard",
    partner: "Makipag-partner sa Bayanihan",
    nearYouEvents: "Filipino Events Malapit Sa Iyo",
    festivalsWorld: "Mga Pista sa Buong Mundo",
    foodNear: "Filipino Food Malapit Sa Akin",
    cultural: "Mga Kulturang Pagdiriwang",
    gatherings: "Mga Pagtitipon sa Komunidad",
    dining: "Food & Dining Events",
    support: "Suporta",
    partnerships: "Sales / Pakikipag-partner",
    copyright: (year: number) =>
      `© ${year} Bayanihan. Lahat ng Karapatan ay Nakalaan.`,
    language: "Wika",
  },
};

interface ColLink {
  to?: string;
  href?: string;
  label: string;
}

function isAbsoluteUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ColLink[];
}) {
  return (
    <Box>
      <Typography
        sx={{ fontWeight: 700, mb: { xs: 1, md: 1.5 }, color: "#111" }}
      >
        {title}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {links.map((l, i) => {
          const target = l.to ?? l.href ?? "#";
          const linkStyle = {
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            transition: "transform 0.2s ease, color 0.2s ease",
            color: "#444",
            textDecoration: "none",
            "&:hover": { color: "#f67f00", transform: "translateX(2px)" },
          } as const;

          const inner: ReactNode = (
            <>
              <ChevronRightIcon sx={{ fontSize: 16 }} />
              {l.label}
            </>
          );

          // External / explicit href links use a plain <a>. Internal nav
          // (relative paths or empty hostname after SSR) uses Next's Link.
          if (l.href || isAbsoluteUrl(target)) {
            return (
              <MLink
                key={i}
                component="a"
                href={target}
                target={l.href ? "_blank" : undefined}
                rel={l.href ? "noopener noreferrer" : undefined}
                underline="none"
                sx={linkStyle}
              >
                {inner}
              </MLink>
            );
          }

          return (
            <MLink
              key={i}
              component={NextLink}
              href={target}
              underline="none"
              sx={linkStyle}
            >
              {inner}
            </MLink>
          );
        })}
      </Box>
    </Box>
  );
}

export default function Footer() {
  const { lang, setLang } = useLocale();
  const { isSubDomain } = useAuthProvider();
  const t = useMemo(() => STRINGS[lang] ?? STRINGS.en, [lang]);

  // On a subdomain, link out to the main bayanihan.com host. Otherwise use
  // relative paths so links stay within the current origin. We defer reading
  // window.location.origin to a mount effect because the component renders
  // server-side first and window isn't defined there.
  const [hostname, setHostname] = useState<string>("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHostname(
      isSubDomain ? "https://bayanihan.com" : window.location.origin
    );
  }, [isSubDomain]);

  const currentYear = new Date().getFullYear();
  const HOSTNAME = hostname;

  return (
    <Box
      sx={{
        background: BG,
        mt: 4,
        pt: { xs: 3.5, md: 5 },
        // Extra bottom padding on mobile so the fixed BottomNav doesn't
        // cover the footer logo/content.
        pb: { xs: "calc(92px + env(safe-area-inset-bottom))", md: 3 },
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", lg: "96%" },
          px: { xs: 2, md: 0 },
          maxWidth: "98%",
          mx: "auto",
        }}
      >
        {/* Nav columns */}
        <Grid
          container
          spacing={{ xs: 1.5, md: 3 }}
          columns={{ xs: 12, md: 12 }}
        >
          <Grid size={{ xs: 6, md: 3 }}>
            <FooterColumn
              title={t.discover}
              links={[
                { to: HOSTNAME + "/browse-events", label: t.exploreEvents },
                { to: HOSTNAME + "/browse-events", label: t.filipinoFestivals },
                { to: HOSTNAME + "/restaurant", label: t.restaurantsAbroad },
                { to: HOSTNAME + "/browse-events", label: t.featuredEvents },
                { to: HOSTNAME + "/browse-events", label: t.upcoming },
                { to: HOSTNAME + "/browse-events", label: t.communityEvents },
                { to: HOSTNAME + "/browse-events", label: t.categories },
                { to: HOSTNAME + "/restaurant", label: t.listings },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <FooterColumn
              title={t.organize}
              links={[
                { to: HOSTNAME + "/sign-in", label: t.postEvent },
                { to: HOSTNAME + "/contact-us", label: t.promoteFestival },
                { to: HOSTNAME + "/sign-in", label: t.listRestaurant },
                { to: HOSTNAME + "/contact-us", label: t.promoTools },
                { to: HOSTNAME + "/sign-in", label: t.organizerDash },
                { to: HOSTNAME + "/contact-us", label: t.partner },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <FooterColumn
              title={t.find}
              links={[
                { to: HOSTNAME + "/browse-events", label: t.nearYouEvents },
                { to: HOSTNAME + "/global-calendar", label: t.festivalsWorld },
                { to: HOSTNAME + "/restaurant", label: t.foodNear },
                { to: HOSTNAME + "/browse-events", label: t.cultural },
                { to: HOSTNAME + "/browse-events", label: t.gatherings },
                { to: HOSTNAME + "/browse-events", label: t.dining },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <FooterColumn
              title={t.connect}
              links={[
                { to: HOSTNAME + "/contact-us", label: t.support },
                { to: HOSTNAME + "/contact-us", label: t.partnerships },
                {
                  href: "https://www.facebook.com/bayanihanglobal",
                  label: "Facebook",
                },
              ]}
            />
          </Grid>
        </Grid>

        {/* Explore More — editorial backlinks. Sourced from src/lib/articles
            so these links can never drift from the pages under /articles. */}
        <Box sx={{ mt: { xs: 3, md: 4 } }}>
          <Box
            sx={{
              borderTop: "1px solid rgba(0,0,0,0.10)",
              pt: { xs: 3, md: 3.5 },
              mb: { xs: 2, md: 2.5 },
              display: "flex",
              alignItems: "baseline",
              justifyContent: { xs: "center", md: "space-between" },
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 16, md: 18 }, color: "#111" }}>
              Explore More
            </Typography>
            <MLink
              component={NextLink}
              href={HOSTNAME + ARTICLES_BASE_PATH}
              underline="none"
              sx={{
                fontSize: 14,
                fontWeight: 700,
                color: "#f67f00",
                display: "inline-flex",
                alignItems: "center",
                "&:hover": { color: "#c2410c" },
              }}
            >
              View all articles
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            </MLink>
          </Box>
          <Grid container spacing={{ xs: 1.5, md: 3 }} columns={{ xs: 12, md: 12 }}>
            {ARTICLE_CATEGORIES.map((cat) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cat.key}>
                <FooterColumn
                  title={cat.title}
                  links={getArticlesByCategory(cat.key).map((a) => ({
                    to: HOSTNAME + articleUrl(a.slug),
                    label: a.title,
                  }))}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Row 1: CTA buttons + social icons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", md: "space-between" },
            mt: 2,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: { xs: "center", md: "flex-start" },
            }}
          >
            <Button
              component={NextLink}
              href="/registration"
              variant="contained"
              color="inherit"
              sx={{
                background: "#111",
                color: "#fff",
                borderColor: "#fff",
                borderRadius: 999,
                textTransform: "none",
                px: 2.25,
                py: 0.75,
                boxShadow: "none",
                "&:hover": {
                  background: "#fff",
                  borderColor: "#111",
                  color: "#111",
                  boxShadow: "none",
                },
              }}
            >
              Get Started
            </Button>
            <Button
              href="https://wa.me/+639204929888"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              color="inherit"
              startIcon={<WhatsAppIcon />}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                px: 2.25,
                py: 0.75,
                bgcolor: "#fff",
                color: "#075E54",
                borderColor: "#075E54",
                "&:hover": {
                  bgcolor: "#075E54",
                  color: "#fff",
                  borderColor: "#075E54",
                },
              }}
            >
              Whatsapp
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: { xs: "center", md: "flex-end" },
              width: { xs: "100%", md: "auto" },
            }}
          >
            <IconButton
              component="a"
              href="https://www.facebook.com/bayanihanglobal"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                color: "#1877F2",
                bgcolor: "#fff",
                "&:hover": { bgcolor: "#1877F2", color: "#fff" },
              }}
              aria-label="Facebook"
            >
              <FacebookIcon fontSize="small" />
            </IconButton>
            <IconButton
              component="a"
              href="https://wa.me/+639204929888"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                color: "#075E54",
                bgcolor: "#fff",
                "&:hover": { bgcolor: "#075E54", color: "#fff" },
              }}
              aria-label="WhatsApp"
            >
              <WhatsAppIcon fontSize="small" />
            </IconButton>

            {/* Divider between "follow" profiles and "share this page" */}
            <Box
              sx={{
                width: "1px",
                height: 20,
                bgcolor: "rgba(0,0,0,0.15)",
                mx: 0.5,
                alignSelf: "center",
              }}
            />
            {/* Share Bayanihan.com */}
            <IconButton
              component="a"
              href={SHARE_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share Bayanihan.com on Facebook"
              sx={shareIconSx("#1877F2")}
            >
              <FacebookIcon fontSize="small" />
            </IconButton>
            <IconButton
              component="a"
              href={SHARE_LINKS.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share Bayanihan.com on X"
              sx={shareIconSx("#000000")}
            >
              <XIcon fontSize="small" />
            </IconButton>
            <IconButton
              component="a"
              href={SHARE_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share Bayanihan.com on LinkedIn"
              sx={shareIconSx("#0A66C2")}
            >
              <LinkedInIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ borderBottom: "1px solid rgba(0,0,0,0.10)", mt: 2 }} />

        {/* Row 2: legal links + language selector */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", md: "space-between" },
            mt: 1.5,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "center", md: "flex-start" },
              flexWrap: "wrap",
              gap: 1,
              color: "#555",
              fontSize: 13,
            }}
          >
            <MLink
              component="a"
              href={HOSTNAME + "/termsofservice"}
              underline="none"
              color="inherit"
              sx={{ "&:hover": { color: "#111" } }}
            >
              Terms
            </MLink>
            <span>•</span>
            <MLink
              component="a"
              href={HOSTNAME + "/privacypolicy"}
              underline="none"
              color="inherit"
              sx={{ "&:hover": { color: "#111" } }}
            >
              Privacy
            </MLink>
            <span>•</span>
            <Typography component="span" sx={{ fontSize: 13 }}>
              Accessibility
            </Typography>
            <span>•</span>
            <Typography component="span" sx={{ fontSize: 13 }}>
              Cookies
            </Typography>
            <span>•</span>
            <Typography component="span" sx={{ fontSize: 13 }}>
              Manage Cookie Preferences
            </Typography>
            <span>•</span>
            <Typography component="span" sx={{ fontSize: 13 }}>
              {t.copyright(currentYear)}
            </Typography>
          </Box>

          <FormControl
            size="small"
            sx={{ width: { xs: 220, sm: 240, md: "auto" } }}
          >
            <InputLabel id="lang-lbl">{t.language}</InputLabel>
            <Select
              labelId="lang-lbl"
              value={lang}
              label={t.language}
              onChange={(e: SelectChangeEvent) =>
                setLang(e.target.value as Locale)
              }
              sx={{
                minWidth: { xs: 200, md: 200 },
                bgcolor: "#c7c7c7",
                borderRadius: 999,
              }}
            >
              <MenuItem value="en">English (United States)</MenuItem>
              <MenuItem value="fil">Filipino</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Row 3: bottom-left logo */}
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            justifyContent: { xs: "center", md: "flex-start" },
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_SRC}
            alt="Bayanihan"
            style={{ height: 46, width: "auto", filter: "saturate(100%)" }}
          />
        </Box>
      </Box>
    </Box>
  );
}
