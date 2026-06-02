"use client";
import { type ReactElement } from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Avatar,
  Tooltip,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LanguageIcon from "@mui/icons-material/Language";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import TransgenderIcon from "@mui/icons-material/Transgender";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import VerifiedIcon from "@mui/icons-material/Verified";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ReactCountryFlag from "react-country-flag";
import Link from "next/link";

interface HeroUser {
  name?: string;
  email?: string;
  email_verified_at?: string | null;
  role?: { name?: string } | null;
  details?: {
    about?: string;
    phone?: string;
    gender?: string;
    photo?: string;
    sub_domain?: string | null;
    country_details?: { code?: string };
    countryCode?: string;
  };
}

function genderIcon(g?: string): ReactElement {
  const v = String(g || "").toLowerCase();
  if (v === "male" || v === "m") return <MaleIcon fontSize="small" />;
  if (v === "female" || v === "f") return <FemaleIcon fontSize="small" />;
  return <TransgenderIcon fontSize="small" />;
}

export default function ProfileHero({
  user,
  showInfoRight = true,
}: {
  user: HeroUser;
  showInfoRight?: boolean;
}) {
  const name = user?.name || "—";
  const about = user?.details?.about || "";
  const email = user?.email || "—";
  const phone = user?.details?.phone || "";
  const gender = user?.details?.gender || "";
  const photo = user?.details?.photo || "";

  const code =
    user?.details?.country_details?.code || user?.details?.countryCode || "";

  const subDomain = user?.details?.sub_domain || null;
  const website = subDomain ? `https://${subDomain}.bayanihan.com` : "";

  const isVerified = Boolean(user?.email_verified_at);

  const rawRole = user?.role?.name || "";
  const role = rawRole === "VENDOR" ? "ORGANIZER" : rawRole;

  const SubDomainDisplay = () => {
    if (!subDomain) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.8 }}>
            <LanguageIcon fontSize="small" />
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.6,
                border: "1px dashed rgba(255,255,255,0.35)",
                borderRadius: "20px",
                px: 1.2,
                py: 0.4,
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "outfit, sans-serif",
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: 0.4,
                  fontStyle: "italic",
                }}
              >
                No sub-domain yet
              </Typography>
            </Box>
            <Tooltip
              title="Create your own sub-domain to establish a unique online presence."
              arrow
            >
              <HelpOutlineIcon
                fontSize="small"
                sx={{ opacity: 0.55, cursor: "pointer", fontSize: 15 }}
              />
            </Tooltip>
          </Box>

          <Box
            component={Link}
            href="/profile/editting"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.7,
              alignSelf: "flex-start",
              borderRadius: "20px",
              px: 1.6,
              py: 0.55,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow:
                "0 0 10px rgba(99,102,241,0.55), 0 0 20px rgba(99,102,241,0.25)",
              textDecoration: "none",
              transition: "box-shadow 0.25s ease, transform 0.2s ease",
              "&:hover": {
                boxShadow:
                  "0 0 16px rgba(99,102,241,0.85), 0 0 32px rgba(99,102,241,0.4)",
                transform: "translateY(-1px)",
              },
            }}
          >
            <LanguageIcon sx={{ fontSize: 15, color: "#fff" }} />
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "outfit, sans-serif",
                color: "#fff",
                letterSpacing: 0.4,
                whiteSpace: "nowrap",
              }}
            >
              Create Sub-domain
            </Typography>
          </Box>
        </Box>
      );
    }

    return (
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
        <LanguageIcon fontSize="small" />
        <Typography
          component="a"
          href={website}
          target="_blank"
          rel="noreferrer"
          sx={{
            fontSize: { xs: 16, sm: 18 },
            fontFamily: "outfit, sans-serif",
            textTransform: "lowercase",
            color: "#fff",
            textDecoration: "underline",
          }}
        >
          {website}
        </Typography>
      </Box>
    );
  };

  const EmailVerificationDisplay = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
        <MailOutlineIcon fontSize="small" />
        <Typography
          sx={{
            fontSize: { xs: 16, sm: 18 },
            fontFamily: "outfit, sans-serif",
          }}
          noWrap
        >
          {email}
        </Typography>
      </Box>

      {isVerified ? (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.6,
            alignSelf: "flex-start",
            bgcolor: "rgba(34,197,94,0.18)",
            border: "1px solid rgba(34,197,94,0.55)",
            borderRadius: "20px",
            px: 1.2,
            py: 0.4,
          }}
        >
          <VerifiedIcon sx={{ fontSize: 14, color: "#4ade80" }} />
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "outfit, sans-serif",
              color: "#4ade80",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Verified
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.6,
              bgcolor: "rgba(251,191,36,0.18)",
              border: "1px solid rgba(251,191,36,0.6)",
              borderRadius: "20px",
              px: 1.2,
              py: 0.4,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: "#fbbf24",
              }}
            />
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "outfit, sans-serif",
                color: "#fbbf24",
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              Pending Verification
            </Typography>
          </Box>

          <Box
            component={Link}
            href="/auth/verification"
            target="_blank"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.7,
              borderRadius: "20px",
              px: 1.6,
              py: 0.55,
              background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
              boxShadow: "0 0 10px rgba(245,158,11,0.55)",
              textDecoration: "none",
              transition: "box-shadow 0.25s ease, transform 0.2s ease",
              "&:hover": {
                boxShadow: "0 0 16px rgba(245,158,11,0.8)",
                transform: "translateY(-1px)",
              },
            }}
          >
            <HowToRegIcon sx={{ fontSize: 15, color: "#fff" }} />
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "outfit, sans-serif",
                color: "#fff",
                letterSpacing: 0.4,
                whiteSpace: "nowrap",
              }}
            >
              Verify Now
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 4,
        overflow: "hidden",
        color: "#fff",
        mb: 2.5,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/profile/profilebanner.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.3)",
        }}
      />

      <Box
        sx={{
          position: "relative",
          p: { xs: 2, sm: 3 },
          minHeight: { xs: 225, sm: 225, md: 225 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "center", md: "center" },
          justifyContent: "space-between",
          gap: 2,
          textAlign: { xs: "center", md: "left" },
        }}
      >
        {/* LEFT */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: { xs: "column", md: "row" },
            gap: 2.5,
            minWidth: 0,
            flex: 1,
          }}
        >
          <Box sx={{ position: "relative", display: "inline-block" }}>
            <Avatar
              src={photo || undefined}
              alt={name}
              sx={{
                width: { xs: 100, md: 135 },
                height: { xs: 100, md: 135 },
                border: "3px solid #fff",
              }}
            />
            {code && (
              <Box
                sx={{
                  alignItems: "center",
                  display: "inline-flex",
                  position: "absolute",
                  left: "50%",
                  bottom: "-30px",
                  transform: "translateX(-50%)",
                }}
              >
                <ReactCountryFlag
                  countryCode={code}
                  svg
                  style={{ width: 28, height: 22 }}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: "outfit, sans-serif",
                fontWeight: 700,
                fontSize: { xs: 24, sm: 36, md: 62 },
                lineHeight: 1.1,
                letterSpacing: 0.2,
                color: "#fff",
                wordBreak: "break-word",
                pt: { xs: 3, md: 0 },
              }}
            >
              {name}
            </Typography>

            {about && (
              <Typography
                sx={{
                  opacity: 0.95,
                  mt: 0.5,
                  fontSize: 17,
                  fontFamily: "Poppins, sans-serif",
                  width: { xs: "100%", md: "70%" },
                }}
              >
                {about}
              </Typography>
            )}

            <Stack
              direction="row"
              spacing={1}
              sx={{
                display: { xs: "block", md: "flex" },
                mt: 1,
                alignItems: "center",
                justifyContent: { xs: "center", md: "flex-start" },
                flexWrap: "wrap",
              }}
            >
              {role && (
                <Chip
                  label={role}
                  size="small"
                  sx={{
                    bgcolor: "rgba(0,0,0,0.35)",
                    p: 1,
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "outfit, sans-serif",
                  }}
                />
              )}

              {isVerified && (
                <Chip
                  icon={<VerifiedIcon sx={{ color: "#fff!important" }} />}
                  label="Account Verified"
                  size="small"
                  sx={{
                    bgcolor: "rgba(33,150,243,0.45)",
                    p: 1,
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "outfit, sans-serif",
                  }}
                />
              )}
            </Stack>
          </Box>
        </Box>

        {/* RIGHT INFO PANEL */}
        {showInfoRight && (
          <Stack
            spacing={1.5}
            sx={{
              ml: 2,
              alignItems: "flex-start",
              display: { xs: "block", md: "flex" },
              bgcolor: { xs: "transparent", md: "rgba(0,0,0,0.35)" },
              p: 2.5,
              borderRadius: 2,
              backdropFilter: { xs: "none", md: "blur(4px)" },
              maxWidth: 450,
            }}
          >
            <EmailVerificationDisplay />
            <SubDomainDisplay />

            {gender && (
              <Box
                sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
              >
                {genderIcon(gender)}
                <Typography
                  sx={{ fontSize: 18, fontFamily: "outfit, sans-serif" }}
                >
                  {gender}
                </Typography>
              </Box>
            )}

            {phone && (
              <Box
                sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
              >
                <PhoneIphoneIcon fontSize="small" />
                <Typography
                  sx={{ fontSize: 18, fontFamily: "outfit, sans-serif" }}
                >
                  {phone}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
