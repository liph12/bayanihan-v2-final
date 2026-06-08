"use client";
import { Box } from "@mui/material";
import NextLink from "next/link";
import { POPULAR_ORDER } from "@/lib/popularCountries";
import { countryCodes } from "@/lib/countryCodes";
import type { Country } from "@/types";

// The popular countries are a fixed set with known names, so build the list
// statically from POPULAR_ORDER + countryCodes — no API fetch needed. The
// flags render instantly (server-side too) and never disappear when the
// backend is flaky.
const POPULAR_COUNTRIES: Country[] = POPULAR_ORDER.map((code) =>
  countryCodes.find((c) => c.code.toUpperCase() === code)
).filter((c): c is Country => Boolean(c));

const sx = {
  container: {
    width: { xs: "98%", lg: "96%" },
    maxWidth: 1600,
    mx: "auto",
    my: 3,
  },
  chipsWrap: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: { xs: 1, md: 1.5 },
    mt: 2,
  },
  // Each chip IS the link (the flex item), so sizing applies to the right
  // element. Chips size to their own content and wrap/center — handles names
  // from "Oman" to "United Arab Emirates" cleanly with no truncation or
  // overflow on mobile.
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    px: { xs: 1.2, md: 1.4 },
    py: { xs: 0.75, md: 1 },
    borderRadius: 22,
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    textDecoration: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    fontSize: { xs: 13, sm: 14, md: 15.5 },
    fontFamily: "var(--font-outfit)",
    whiteSpace: "nowrap" as const,
    lineHeight: 1.2,
    maxWidth: "100%",
    transition: "color .2s, background .2s",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.5)",
      color: "#000",
    },
  },
  flag: {
    width: 22,
    height: 16,
    borderRadius: 2,
    objectFit: "cover" as const,
    display: "block" as const,
    flexShrink: 0,
  },
};

interface PopularCountriesProps {
  initialCountries?: Country[];
}

export default function PopularCountries({
  initialCountries = [],
}: PopularCountriesProps) {
  const countries =
    initialCountries.length > 0 ? initialCountries : POPULAR_COUNTRIES;

  return (
    <Box sx={sx.container}>
      <Box sx={sx.chipsWrap}>
        {countries.map((c) => {
          const code = String(c.code).toLowerCase();
          const href = `/country/${code}`;
          const flagSrc = `https://flagcdn.com/w20/${code}.png`;
          const flag2x = `https://flagcdn.com/w40/${code}.png 2x`;
          return (
            <Box component={NextLink} key={c.code} href={href} sx={sx.chip}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={flagSrc}
                srcSet={flag2x}
                alt={`${c.name} flag`}
                style={sx.flag}
              />
              <span>{c.name}</span>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
