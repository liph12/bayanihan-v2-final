"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Image from "next/image";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";
import AxiosInstance from "@/lib/AxiosInstance";
import PopularCountries from "./PopularCountries";
import type { Country } from "@/types";

const slidesDefault = [
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/bayanihan/banner_images/banner.webp",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/bayanihan/banner_images/banner2.webp",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/bayanihan/banner_images/banner3.webp",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/bayanihan/banner_images/banner4.webp",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/bayanihan/banner_images/banner5.webp",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/bayanihan/banner_images/banner6.webp",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/bayanihan/banner_images/banner7.webp",
];

interface SearchResult {
  title?: string;
  subDomain?: string;
  country_code?: string;
}

interface SearchResponse {
  data?: { searchResults?: SearchResult[] };
}

const sx = {
  container: {
    width: { xs: "100%", md: "98%", lg: "98%" },
    maxWidth: "98%",
    mx: "auto",
    px: { xs: 0.5, sm: 0, md: 0 },
  },
  wrap: {
    position: "relative",
    width: "100%",
    height: { xs: 650, sm: 450, md: 380 },
    borderRadius: "30px 30px 5px 5px",
    overflow: "hidden",
    my: 1.5,
  },
  slideBase: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: { xs: "center", lg: "center -100px" },
    opacity: 0,
    transform: "scale(1.08)",
    transition: "opacity 1000ms ease-in-out, transform 5000ms ease-in-out",
    willChange: "opacity, transform",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.65)",
      zIndex: 1,
    },
  },
  slideActive: { opacity: 1, transform: "scale(1)" },
  foreground: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "end center",
  },
  content: {
    width: { xs: "100%", md: 1100 },
    mb: 1.5,
    textAlign: "center",
    position: "absolute",
    top: { xs: "120px", lg: "145px" },
    zIndex: 9,
  },
  headline: {
    // Outfit is preloaded via next/font in app/layout.tsx and exposed as
    // the --font-outfit CSS variable. Sans-serif fallback covers SSR before
    // hydration and any rare fetch failure.
    fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
    color: "#fff",
    textShadow: "0 2px 14px rgba(0,0,0,0.45)",
    fontWeight: 500,
    fontSize: { xs: 22, sm: 26, md: 36 },
    mt: 0.5,
    mb: { xs: 2, md: 1 },
  },
  searchWrap: {
    mt: 1.25,
    mb: 0.75,
    mx: "auto",
    width: { xs: "95%", md: 1000 },
  },
  searchPill: { background: "#fff", p: 0.5 },
  resultsBoxBase: {
    mx: "auto",
    width: "100%",
    maxWidth: { xs: "100%", md: 1000 },
    borderRadius: "0 0 16px 16px",
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(4px)",
    overflow: "hidden",
  },
  resultsBoxScrollable: { maxHeight: 260, overflowY: "auto" },
  dots: {
    display: "flex",
    gap: 1,
    justifyContent: "center",
    mt: 1,
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    border: "none",
    background: "#ffffffb3",
    cursor: "pointer",
  },
  dotActive: { background: "#fff", width: 22, transition: "width .2s" },
  resultCard: { border: "none", boxShadow: "none", textAlign: "left" },
  resultCardContent: { p: "10px !important" },
} as const;

interface BannerProps {
  slides?: string[];
  initialCountries?: Country[];
}

export default function Banner({
  slides = slidesDefault,
  initialCountries = [],
}: BannerProps) {
  const [active, setActive] = useState(0);
  // Only the active slide (and the next, ready for the cross-fade) load their
  // background image — loading all 7 hero images at once was wrecking LCP
  // under throttled connections.
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const images = useMemo(
    () => (slides?.length ? slides : slidesDefault),
    [slides]
  );

  useEffect(() => {
    const id = setInterval(
      () => setActive((i) => (i + 1) % images.length),
      5000
    );
    return () => clearInterval(id);
  }, [images.length]);

  // Lazily mark the current + next slide as loaded so their images are
  // fetched just-in-time rather than all upfront.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded((prev) => {
      const next = (active + 1) % images.length;
      if (prev.has(active) && prev.has(next)) return prev;
      const s = new Set(prev);
      s.add(active);
      s.add(next);
      return s;
    });
  }, [active, images.length]);

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!value.trim()) {
        setSearchResults(null);
        return;
      }
      setSearching(true);
      try {
        const response = await AxiosInstance.get<SearchResponse>(
          `search/${encodeURIComponent(value)}`
        );
        setSearchResults(response.data?.data?.searchResults ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  return (
    <Box component="section" sx={sx.container}>
      <Box sx={sx.wrap}>
        {images.map((src, idx) => (
          <Box
            key={idx}
            sx={{
              ...sx.slideBase,
              ...(idx === active ? sx.slideActive : {}),
            }}
            aria-hidden={idx !== active}
          >
            {loaded.has(idx) && (
              <Image
                src={src}
                alt=""
                fill
                priority={idx === 0}
                sizes="100vw"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            )}
          </Box>
        ))}
        <Box sx={sx.dots}>
          {images.map((_, idx) => (
            <Box
              key={idx}
              component="button"
              aria-label={`Slide ${idx + 1}`}
              onClick={() => setActive(idx)}
              sx={{ ...sx.dot, ...(idx === active ? sx.dotActive : {}) }}
            />
          ))}
        </Box>
      </Box>
      <Box sx={sx.foreground}>
        <Box sx={sx.content}>
          <Box sx={sx.searchWrap}>
            {/*
              Rendered as <h2> for correct heading hierarchy under the
              page's H1 (defined in app/page.tsx). The `variant="h4"`
              keeps the same visual styling as before — semantic level
              and visual level are decoupled here, which is the right
              tradeoff for SEO without changing the design.
            */}
            <Typography component="h2" variant="h4" sx={sx.headline}>
              Discover Filipino Events &amp; Restaurants all over the world
            </Typography>
            <Box
              sx={[
                sx.searchPill,
                { borderRadius: searchResults ? `20px 20px 0px 0px` : "50px" },
              ]}
            >
              <TextField
                type="text"
                name="keywords"
                placeholder="Search Events & Restaurants"
                onChange={onSearchChange}
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        {searching ? (
                          <CircularProgress size={16} />
                        ) : (
                          <SearchIcon fontSize="small" />
                        )}
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    background: "#fff",
                    borderRadius: 8,
                    "& fieldset": { border: "none" },
                  },
                }}
              />
            </Box>
            {searchResults &&
              searchResults.length === 0 &&
              searchQuery !== "" && (
                <Paper elevation={0} sx={sx.resultsBoxBase}>
                  <Box sx={{ color: "#111", textAlign: "center", py: 3 }}>
                    <InfoIcon />
                    <Typography variant="body1">Search not found.</Typography>
                  </Box>
                </Paper>
              )}

            {searchResults && searchResults.length > 0 && (
              <Paper
                elevation={0}
                sx={{ ...sx.resultsBoxBase, ...sx.resultsBoxScrollable }}
              >
                <Grid container>
                  {searchResults.map((result, i) => {
                    const routePath = result?.subDomain
                      ? `https://${result.subDomain}.bayanihan.com`
                      : "#";
                    return (
                      <Grid size={{ xs: 12 }} key={i}>
                        <a
                          href={routePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none" }}
                        >
                          <Card
                            variant="outlined"
                            sx={{
                              ...sx.resultCard,
                              ":hover": {
                                backgroundColor: "#eee",
                                transition: "0.2s",
                              },
                            }}
                          >
                            <CardContent sx={sx.resultCardContent}>
                              <Grid container spacing={5} alignItems="center">
                                <Grid>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    loading="lazy"
                                    width={35}
                                    src={`https://flagcdn.com/w40/${result.country_code}.png`}
                                    alt="Country Flag"
                                  />
                                </Grid>
                                <Grid size="grow">
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ color: "#111" }}
                                  >
                                    {result.title}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </a>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            )}
            <Box sx={{ mt: 2 }}>
              <PopularCountries initialCountries={initialCountries} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
