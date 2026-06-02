"use client";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import NextLink from "next/link";
import AxiosInstance from "@/lib/AxiosInstance";
import { POPULAR_ORDER } from "@/lib/popularCountries";
import type { Country } from "@/types";

interface ApiCountry {
  code?: string;
  alpha2?: string;
  alpha3?: string;
  name?: string;
  country?: string;
  label?: string;
}

interface CountriesResponse {
  data?: { countries?: ApiCountry[] };
  countries?: ApiCountry[];
}

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
    gap: 1.5,
    rowGap: 2,
    mt: 2,
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    px: 1.4,
    py: 1,
    borderRadius: 22,
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    textDecoration: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    fontSize: 15.5,
    fontFamily: "var(--font-outfit)",
    textAlign: "left" as const,
    width: { xs: "48%", sm: "30%", md: "auto", lg: "auto" },
    margin: { xs: "0 2px 10px", sm: "0 1% 10px", md: "0" },
    transition: "color .2s",
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
  },
};

interface PopularCountriesProps {
  initialCountries?: Country[];
}

export default function PopularCountries({
  initialCountries = [],
}: PopularCountriesProps) {
  const [countries, setCountries] = useState<Country[]>(initialCountries);

  useEffect(() => {
    if (initialCountries.length > 0) return;
    let mounted = true;
    (async () => {
      try {
        const resp =
          await AxiosInstance.get<CountriesResponse>("countries");
        const arr: ApiCountry[] =
          resp?.data?.data?.countries || resp?.data?.countries || [];
        if (!mounted) return;
        const byCode = new Map<string, Country>();
        arr.forEach((c) => {
          if (!c) return;
          const code = String(
            c.code || c.alpha2 || c.alpha3 || ""
          ).toUpperCase();
          const name = c.name || c.country || c.label || code;
          if (code) byCode.set(code, { code, name });
        });
        const list = POPULAR_ORDER.map((code) => byCode.get(code)).filter(
          (x): x is Country => Boolean(x)
        );
        setCountries(list);
      } catch {
        setCountries([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialCountries.length]);

  return (
    <Box sx={sx.container}>
      <Box sx={sx.chipsWrap}>
        {countries.map((c) => {
          const code = String(c.code).toLowerCase();
          const href = `/country/${code}`;
          const flagSrc = `https://flagcdn.com/w20/${code}.png`;
          const flag2x = `https://flagcdn.com/w40/${code}.png 2x`;
          return (
            <NextLink
              key={c.code}
              href={href}
              style={{ textDecoration: "none" }}
            >
              <Box sx={sx.chip}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flagSrc} srcSet={flag2x} alt="" style={sx.flag} />
                <span>{c.name}</span>
              </Box>
            </NextLink>
          );
        })}
      </Box>
    </Box>
  );
}
