"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Chip,
  Stack,
  Divider,
  type SxProps,
  type Theme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import ReactCountryFlag from "react-country-flag";
import { countryCodes } from "@/lib/countryCodes";
import type { ConsulateDirectory, ConsulateOffice } from "@/types";

const FONT = "'Outfit', sans-serif";
const CYAN = "#0ea5e9";
const TEAL = "#06b6d4";

function nameToCode(name: string): string {
  if (!name) return "";
  const lower = name.trim().toLowerCase();
  const exact = countryCodes.find((c) => c.name.toLowerCase() === lower);
  if (exact) return exact.code.toUpperCase();
  const partial = countryCodes.find(
    (c) =>
      lower.includes(c.name.toLowerCase()) ||
      c.name.toLowerCase().includes(lower)
  );
  return partial ? partial.code.toUpperCase() : "";
}

function Container({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      sx={[
        {
          width: "100%",
          maxWidth: 1100,
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
          mx: "auto",
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  );
}

interface CountryGroup {
  country: string;
  code: string;
  offices: ConsulateOffice[];
}

function ensureProtocol(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function ContactRow({
  icon,
  label,
  href,
}: {
  icon: ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Box
      component="a"
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        color: "#475569",
        textDecoration: "none",
        fontFamily: FONT,
        fontSize: 14,
        wordBreak: "break-word",
        "& svg": { fontSize: 18, color: CYAN, flexShrink: 0 },
        "&:hover": { color: CYAN, textDecoration: "underline" },
      }}
    >
      {icon}
      <span>{label}</span>
    </Box>
  );
}

function InfoRow({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        color: "#475569",
        fontFamily: FONT,
        fontSize: 14,
        "& svg": { fontSize: 18, color: CYAN, flexShrink: 0, mt: "1px" },
      }}
    >
      {icon}
      <span>{text}</span>
    </Box>
  );
}

function OfficeCard({ office }: { office: ConsulateOffice }) {
  const website = office.website?.trim();
  const facebook = office.facebook_link?.trim();
  const email = office.email?.trim();
  const phone = office.contact_number?.trim();
  const address = office.address?.trim();
  const photos = Array.isArray(office.photos)
    ? office.photos.filter(Boolean)
    : [];

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        border: "1px solid #e2e8f0",
        bgcolor: "#fff",
        transition: "box-shadow .2s ease, border-color .2s ease",
        "&:hover": {
          borderColor: "rgba(14,165,233,0.4)",
          boxShadow: "0 8px 24px rgba(14,165,233,0.08)",
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
        <Avatar
          src={office.office_logo || undefined}
          alt={office.office_name}
          variant="rounded"
          sx={{
            width: 46,
            height: 46,
            bgcolor: "rgba(14,165,233,0.1)",
            color: CYAN,
            border: "1px solid #e2e8f0",
            flexShrink: 0,
          }}
        >
          <AccountBalanceRoundedIcon />
        </Avatar>
        <Typography
          sx={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: { xs: 16, sm: 17 },
            color: "#0f172a",
            lineHeight: 1.25,
          }}
        >
          {office.office_name || "Consulate Office"}
        </Typography>
      </Stack>

      <Stack spacing={1}>
        {address && <InfoRow icon={<LocationOnRoundedIcon />} text={address} />}
        {website && (
          <ContactRow
            icon={<LanguageRoundedIcon />}
            label={website.replace(/^https?:\/\//i, "")}
            href={ensureProtocol(website)}
          />
        )}
        {facebook && (
          <ContactRow
            icon={<FacebookRoundedIcon />}
            label="Facebook Page"
            href={ensureProtocol(facebook)}
          />
        )}
        {email && (
          <ContactRow
            icon={<EmailRoundedIcon />}
            label={email}
            href={`mailto:${email}`}
          />
        )}
        {phone && (
          <ContactRow
            icon={<PhoneRoundedIcon />}
            label={phone}
            href={`tel:${phone.replace(/\s+/g, "")}`}
          />
        )}
      </Stack>

      {photos.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 1.75,
            overflowX: "auto",
            pb: 0.5,
            "&::-webkit-scrollbar": { height: 6 },
            "&::-webkit-scrollbar-thumb": {
              background: "#e2e8f0",
              borderRadius: 8,
            },
          }}
        >
          {photos.map((src, i) => (
            <Box
              key={`${src}-${i}`}
              component="a"
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                flex: "0 0 auto",
                width: 84,
                height: 64,
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                display: "block",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${office.office_name || "Office"} photo ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default function ConsulateDirectoryContent({
  initial,
}: {
  initial: ConsulateDirectory;
}) {
  const [search, setSearch] = useState("");
  const items = useMemo(() => initial.items ?? [], [initial.items]);

  const groups = useMemo<CountryGroup[]>(() => {
    const map = new Map<string, ConsulateOffice[]>();
    for (const office of items) {
      const country = (office.country || "Other").trim() || "Other";
      const arr = map.get(country) ?? [];
      arr.push(office);
      map.set(country, arr);
    }
    return Array.from(map.entries())
      .map(([country, offices]) => ({
        country,
        code: nameToCode(country),
        offices: [...offices].sort((a, b) =>
          (a.office_name || "").localeCompare(b.office_name || "")
        ),
      }))
      .sort((a, b) => a.country.localeCompare(b.country));
  }, [items]);

  const filteredGroups = useMemo<CountryGroup[]>(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => {
        const countryMatches = g.country.toLowerCase().includes(q);
        if (countryMatches) return g;
        const offices = g.offices.filter(
          (o) =>
            (o.office_name || "").toLowerCase().includes(q) ||
            (o.email || "").toLowerCase().includes(q)
        );
        return offices.length ? { ...g, offices } : null;
      })
      .filter((g): g is CountryGroup => g !== null);
  }, [groups, search]);

  const totalOffices = items.length;
  const hasData = totalOffices > 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: { xs: 8, md: 12 } }}>
      {/* Hero */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${CYAN} 0%, ${TEAL} 100%)`,
          color: "#fff",
          pt: { xs: 6, md: 9 },
          pb: { xs: 7, md: 10 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <AccountBalanceRoundedIcon sx={{ fontSize: { xs: 30, md: 38 } }} />
            <Typography
              component="h1"
              sx={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: { xs: "1.9rem", md: "2.6rem" },
                lineHeight: 1.1,
              }}
            >
              Consulate Directory
            </Typography>
          </Stack>
          <Typography
            sx={{
              fontFamily: FONT,
              fontSize: { xs: "1rem", md: "1.15rem" },
              maxWidth: 680,
              opacity: 0.95,
              lineHeight: 1.6,
            }}
          >
            Philippine consulates and embassies around the world. Find official
            offices by country, along with their websites, Facebook pages,
            emails, and contact numbers.
          </Typography>
        </Container>
      </Box>

      {/* Body */}
      <Container sx={{ mt: { xs: -4, md: -5 }, position: "relative" }}>
        {/* Search + count card */}
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 40px rgba(15,23,42,0.06)",
            p: { xs: 2, sm: 2.5 },
            mb: 3,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <TextField
              size="small"
              placeholder="Search by country, office, or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              sx={{
                maxWidth: { sm: 420 },
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f8fafc",
                  borderRadius: 2,
                  fontFamily: FONT,
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            {hasData && (
              <Typography
                sx={{
                  fontFamily: FONT,
                  color: "#64748b",
                  fontSize: 14,
                  whiteSpace: "nowrap",
                }}
              >
                {totalOffices} office{totalOffices === 1 ? "" : "s"} ·{" "}
                {groups.length} countr{groups.length === 1 ? "y" : "ies"}
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Empty / error state */}
        {!hasData ? (
          <Box
            sx={{
              textAlign: "center",
              py: { xs: 8, md: 12 },
              px: 2,
            }}
          >
            <PublicRoundedIcon sx={{ fontSize: 56, color: "#cbd5e1", mb: 2 }} />
            <Typography
              sx={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 18,
                color: "#475569",
                mb: 1,
              }}
            >
              No consulate offices listed yet
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT,
                color: "#94a3b8",
                fontSize: 14,
                maxWidth: 420,
                mx: "auto",
              }}
            >
              {initial.error ||
                "The consulate directory is being updated. Please check back soon."}
            </Typography>
          </Box>
        ) : filteredGroups.length === 0 ? (
          <Box sx={{ textAlign: "center", py: { xs: 6, md: 10 } }}>
            <Typography
              sx={{ fontFamily: FONT, color: "#64748b", fontSize: 15 }}
            >
              No offices match “{search}”.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {filteredGroups.map((group) => (
              <Accordion
                key={group.country}
                defaultExpanded={filteredGroups.length <= 3 || !!search.trim()}
                disableGutters
                elevation={0}
                sx={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px !important",
                  bgcolor: "#fff",
                  overflow: "hidden",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreRoundedIcon sx={{ color: "#64748b" }} />
                  }
                  sx={{
                    px: { xs: 2, sm: 2.5 },
                    py: 0.5,
                    "& .MuiAccordionSummary-content": {
                      alignItems: "center",
                      gap: 1.5,
                      my: 1.5,
                    },
                  }}
                >
                  {group.code ? (
                    <ReactCountryFlag
                      countryCode={group.code}
                      svg
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 4,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <PublicRoundedIcon sx={{ color: "#94a3b8", fontSize: 24 }} />
                  )}
                  <Typography
                    sx={{
                      fontFamily: FONT,
                      fontWeight: 700,
                      fontSize: { xs: 16, sm: 18 },
                      color: "#0f172a",
                      flex: 1,
                    }}
                  >
                    {group.country}
                  </Typography>
                  <Chip
                    label={`${group.offices.length} office${
                      group.offices.length === 1 ? "" : "s"
                    }`}
                    size="small"
                    sx={{
                      fontFamily: FONT,
                      fontWeight: 600,
                      color: TEAL,
                      bgcolor: "rgba(6,182,212,0.08)",
                      border: "1px solid rgba(6,182,212,0.25)",
                    }}
                  />
                </AccordionSummary>
                <Divider />
                <AccordionDetails sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.5,
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(2, 1fr)",
                      },
                    }}
                  >
                    {group.offices.map((office, i) => (
                      <OfficeCard
                        key={String(office.id ?? `${group.country}-${i}`)}
                        office={office}
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
