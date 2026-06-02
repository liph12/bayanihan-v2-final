"use client";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Container as MuiContainer,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import NextLink from "next/link";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const HERO_IMG = "/contact-us/contact_img.jpg";
const SIDE_IMG = "/contact-us/contact_side_img.jpg";
const RENT_PH_AD = "/contact-us/rentph.png";
const MERCH_1 = "/contact-us/merch1.jpg";
const MERCH_2 = "/contact-us/merch2.jpg";

const FAQS = [
  {
    q: "What is Bayanihan.com?",
    a: "Bayanihan.com is a platform dedicated to promoting Filipino events, festivals, and restaurants around the world, connecting Filipinos globally to celebrate and preserve Filipino culture.",
  },
  {
    q: "What kind of events can I find on Bayanihan.com?",
    a: "You can find a wide variety of Filipino events, from local fiestas to grand international festivals, as well as cultural events and Filipino community gatherings.",
  },
  {
    q: "How can I promote my event on Bayanihan.com?",
    a: "Organizers can promote their events for free on Bayanihan.com by submitting event details through the platform.",
  },
  {
    q: "Does Bayanihan.com feature Filipino-owned restaurants?",
    a: "Yes, Bayanihan.com also serves as a directory for Filipino-owned restaurants, helping people discover authentic Filipino cuisine wherever they are in the world.",
  },
  {
    q: "Why is food important on Bayanihan.com?",
    a: "Filipino food plays a vital role in our culture, as meals are moments of bonding and celebration. The platform highlights Filipino-owned restaurants, offering a taste of home to Filipinos abroad.",
  },
  {
    q: "Is Bayanihan.com available for free?",
    a: "Yes, Bayanihan.com is a free and accessible platform for both event organizers and users who want to explore Filipino events, festivals, and restaurants.",
  },
  {
    q: "Can I find international Filipino festivals on Bayanihan.com?",
    a: "Absolutely! Bayanihan.com features both local and international Filipino festivals, showcasing the richness of Filipino culture globally.",
  },
  {
    q: "What does 'bayanihan' mean in the context of your platform?",
    a: "Bayanihan refers to the traditional Filipino spirit of community and unity, which is central to our mission of connecting Filipinos worldwide and preserving our cultural heritage.",
  },
  {
    q: "How does Bayanihan.com help preserve Filipino culture?",
    a: "By promoting events, festivals, and Filipino-owned businesses, the platform ensures that the traditions, cuisine, and spirit of the Filipino community are celebrated and passed on to future generations.",
  },
  {
    q: "How can I stay updated on upcoming Filipino events and festivals?",
    a: "You can stay updated by regularly visiting Bayanihan.com, where you'll find a curated list of upcoming Filipino events and festivals worldwide.",
  },
];

interface ContactInfoCard {
  icon: string;
  title: string;
  body: string;
}

const INFO_CARDS: ContactInfoCard[] = [
  { icon: "📍", title: "Visit Location", body: "Cebu City, Philippines" },
  {
    icon: "📞",
    title: "Call Us On",
    body: "(032) 254-8900 / (310) 362-2338\n(+63) 977 815 0888",
  },
  { icon: "✉️", title: "Mail Address", body: "info@bayanihan.com" },
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const sectionPillSx = {
  display: "inline-block",
  background: "#174380",
  color: "#fff",
  fontFamily: "var(--font-outfit)",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 2.5,
  textTransform: "uppercase",
  px: 2.25,
  py: "6px",
  borderRadius: "50px",
  mb: 1.75,
};

const fancyInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    background: "#f7f8fc",
    fontFamily: "var(--font-outfit)",
    transition: "box-shadow 0.2s",
    "&:hover": { boxShadow: "0 0 0 3px rgba(23,67,128,0.08)" },
    "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(23,67,128,0.15)" },
  },
  "& .MuiInputLabel-root": { fontFamily: "var(--font-outfit)" },
};

export default function ContactContent() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const onChange = (field: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setForm((s) => ({ ...s, [field]: e.target.value }));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: wire to backend contact endpoint (POST /contact or similar).
    console.log("contact submit", form);
  };

  return (
    <>
      {/* HERO */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 340, lg: 420 },
          backgroundImage: `url(${HERO_IMG})`,
          backgroundSize: "cover",
          backgroundPositionX: { xs: "-100px", lg: "0px" },
          display: "flex",
          alignItems: "center",
          color: "#fff",
          overflow: "hidden",
          "&:after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "rgba(18,45,90,0.78)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -80,
            left: "30%",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            width: 1200,
            maxWidth: "100%",
            mx: "auto",
            px: 2,
            position: "relative",
            zIndex: 2,
          }}
        >
          <Box>
            <Box component="span" sx={sectionPillSx}>
              Get In Touch
            </Box>
          </Box>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-urbanist)",
              fontWeight: 700,
              fontSize: { xs: 38, lg: 62 },
              lineHeight: 1.1,
              letterSpacing: "-1px",
            }}
          >
            Contact Us
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-outfit)",
              fontSize: { xs: 15, lg: 18 },
              opacity: 0.8,
              mt: 1.5,
              maxWidth: 440,
            }}
          >
            We&apos;d love to hear from you. Our team is always here to help.
          </Typography>
        </Box>
      </Box>

      {/* Philippine flag color bar */}
      <Box sx={{ display: "flex", height: 5 }}>
        <Box sx={{ flex: 1, background: "#174380" }} />
        <Box sx={{ flex: 1, background: "#d32c33" }} />
        <Box sx={{ flex: 1, background: "#f5c518" }} />
      </Box>

      <Box sx={{ background: "#f4f6fb", pb: 8 }}>
        <MuiContainer maxWidth="lg" sx={{ pt: 6 }}>
          {/* CONTACT FORM + IMAGE */}
          <Grid container spacing={5} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                component="form"
                onSubmit={onSubmit}
                sx={{
                  background: "#fff",
                  borderRadius: "20px",
                  boxShadow: "0 8px 40px rgba(23,67,128,0.09)",
                  p: { xs: 3, md: 5 },
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "#174380",
                  },
                }}
              >
                <Box component="span" sx={sectionPillSx}>
                  Send a Message
                </Box>
                <Typography
                  component="h2"
                  sx={{
                    fontFamily: "var(--font-urbanist)",
                    fontWeight: 700,
                    fontSize: { xs: 26, lg: 34 },
                    color: "#174380",
                    mb: 1,
                    lineHeight: 1.2,
                  }}
                >
                  Reach Us for Any Inquiries
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-outfit)",
                    fontSize: 16,
                    color: "#5a6a85",
                    mb: 3,
                    lineHeight: 1.7,
                  }}
                >
                  We&apos;re here to support you! Whether you have questions
                  about promoting Filipino events or need help with our
                  restaurant directory, feel free to contact us. We&apos;re
                  happy to assist and will respond promptly.
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      variant="outlined"
                      value={form.name}
                      onChange={onChange("name")}
                      sx={fancyInputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Your Email"
                      variant="outlined"
                      type="email"
                      value={form.email}
                      onChange={onChange("email")}
                      sx={fancyInputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Your Phone"
                      variant="outlined"
                      value={form.phone}
                      onChange={onChange("phone")}
                      sx={fancyInputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Your Message"
                      multiline
                      rows={4}
                      variant="outlined"
                      value={form.message}
                      onChange={onChange("message")}
                      sx={fancyInputSx}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    mt: 3,
                    background: "#174380",
                    borderRadius: "30px",
                    px: 5.25,
                    py: 1.75,
                    fontFamily: "var(--font-urbanist)",
                    fontWeight: 600,
                    fontSize: 20,
                    letterSpacing: "0.5px",
                    textTransform: "none",
                    boxShadow: "0 4px 16px rgba(23,67,128,0.28)",
                    "&:hover": {
                      background: "#1a4f9a",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(23,67,128,0.35)",
                    },
                  }}
                >
                  Submit Message
                </Button>
              </Box>
            </Grid>

            <Grid
              size={{ xs: 12, md: 5 }}
              sx={{ display: { xs: "none", md: "block" } }}
            >
              <Box sx={{ position: "relative", pt: 2.5, pb: 2.5 }}>
                <Box
                  sx={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    width: 280,
                    height: 480,
                    background: "#174380",
                    borderRadius: "24px",
                    transform: "rotate(4deg)",
                    zIndex: 0,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -20,
                    left: -10,
                    width: 200,
                    height: 320,
                    background: "#d32c33",
                    borderRadius: "24px",
                    transform: "rotate(-5deg)",
                    zIndex: 0,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: -20,
                    zIndex: 10,
                    background: "#f5c518",
                    color: "#174380",
                    borderRadius: "12px",
                    px: 2,
                    py: 1,
                    fontFamily: "var(--font-urbanist)",
                    fontWeight: 700,
                    fontSize: 13,
                    boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                    animation: "floatBadge 3.5s ease-in-out infinite",
                    "@keyframes floatBadge": {
                      "0%, 100%": {
                        transform: "translateY(0px) rotate(-3deg)",
                      },
                      "50%": { transform: "translateY(-10px) rotate(-3deg)" },
                    },
                  }}
                >
                  🇵🇭 Filipino Community
                </Box>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={SIDE_IMG}
                  alt="Filipino Homes Agent"
                  style={{
                    position: "relative",
                    zIndex: 2,
                    width: "100%",
                    maxWidth: 380,
                    display: "block",
                    margin: "0 auto",
                    borderRadius: 20,
                    boxShadow: "0 20px 50px rgba(23,67,128,0.22)",
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </MuiContainer>
      </Box>

      {/* INFO STRIP */}
      <Box
        sx={{
          background: "#102d5a",
          color: "#fff",
          py: { xs: 6, lg: 10 },
          position: "relative",
        }}
      >
        <MuiContainer sx={{ position: "relative", zIndex: 2 }}>
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Box component="span" sx={sectionPillSx}>
              Where to Find Us
            </Box>
            <Typography
              component="h2"
              sx={{
                fontFamily: "var(--font-urbanist)",
                fontWeight: 700,
                fontSize: { xs: 28, lg: 38 },
                mt: 1,
              }}
            >
              Connect With Our Team
            </Typography>
          </Box>

          <Grid container spacing={3} justifyContent="center">
            {INFO_CARDS.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.title}>
                <Card
                  sx={{
                    borderRadius: "18px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    backdropFilter: "blur(10px)",
                    transition: "transform 0.25s, background 0.25s",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.14)",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      background: "rgba(255,255,255,0.13)",
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: "2rem !important" }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        color: "#2b2d31",
                        background: "#c7f2f8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                        fontSize: 34,
                      }}
                    >
                      <span>{item.icon}</span>
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "var(--font-urbanist)",
                        fontWeight: 700,
                        fontSize: 22,
                        color: "#fff",
                        mb: 1,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "var(--font-outfit)",
                        color: "rgba(255,255,255,0.80)",
                        fontSize: 15,
                        whiteSpace: "pre-line",
                        lineHeight: 1.7,
                      }}
                    >
                      {item.body}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </MuiContainer>
      </Box>

      <Box sx={{ background: "#f4f6fb" }}>
        <MuiContainer maxWidth="lg" sx={{ py: 6 }}>
          {/* AD BANNER */}
          <Box
            sx={{
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 6px 28px rgba(23,67,128,0.10)",
              mx: "auto",
              maxWidth: 900,
              mb: 8,
              transition: "transform 0.25s, box-shadow 0.25s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 14px 40px rgba(23,67,128,0.15)",
              },
            }}
          >
            <NextLink href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                style={{ width: "100%", display: "block" }}
                src={RENT_PH_AD}
                alt="Rent PH Ads"
              />
            </NextLink>
          </Box>

          {/* MERCH */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Box component="span" sx={sectionPillSx}>
              Exclusive Collection
            </Box>
            <Typography
              component="h2"
              sx={{
                fontFamily: "var(--font-urbanist)",
                fontWeight: 700,
                fontSize: { xs: 32, lg: 46 },
                color: "#174380",
                mt: 1.5,
                letterSpacing: "-1px",
              }}
            >
              Bayanihan Merch
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 2,
                mb: 2,
                gap: "3px",
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 4,
                  background: "#174380",
                  borderRadius: 4,
                }}
              />
              <Box
                sx={{
                  width: 18,
                  height: 4,
                  background: "#d32c33",
                  borderRadius: 4,
                }}
              />
            </Box>
            <Typography
              sx={{
                fontFamily: "var(--font-outfit)",
                fontSize: 17,
                color: "#5a6a85",
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.8,
              }}
            >
              Celebrate Filipino pride wherever you are with our exclusive
              Bayanihan merchandise! From apparel to accessories, show your
              support for Filipino events and culture with unique designs
              inspired by our community. Shop now and wear your heritage with
              pride!
            </Typography>
          </Box>

          <Grid container spacing={3} justifyContent="center" alignItems="stretch">
            {[
              { src: MERCH_1, alt: "Bayanihan Merch tumbler" },
              { src: MERCH_2, alt: "Bayanihan Merch shirt" },
            ].map((m, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 5 }} key={i}>
                <Box
                  sx={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 6px 28px rgba(23,67,128,0.11)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    position: "relative",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-8px) scale(1.02)",
                      boxShadow: "0 14px 44px rgba(23,67,128,0.20)",
                    },
                    "&:hover::after": { opacity: 1 },
                    "&::after": {
                      content: '"SHOP NOW"',
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "rgba(23,67,128,0.84)",
                      color: "#fff",
                      fontFamily: "var(--font-urbanist)",
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: 2,
                      py: 2.25,
                      textAlign: "center",
                      opacity: 0,
                      transition: "opacity 0.3s",
                    },
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.src}
                    alt={m.alt}
                    style={{ width: "100%", display: "block", height: "auto" }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* FAQ */}
          <Box sx={{ mt: 10 }}>
            <Box sx={{ mb: 4 }}>
              <Box component="span" sx={sectionPillSx}>
                Support
              </Box>
              <Typography
                component="h2"
                sx={{
                  fontFamily: "var(--font-urbanist)",
                  fontWeight: 700,
                  fontSize: { xs: 28, lg: 38 },
                  color: "#174380",
                  mt: 1.5,
                  letterSpacing: "-0.5px",
                }}
              >
                Frequently Asked Questions
              </Typography>
              <Box sx={{ display: "flex", mt: 2, gap: "3px" }}>
                <Box
                  sx={{
                    width: 36,
                    height: 4,
                    background: "#174380",
                    borderRadius: 4,
                  }}
                />
                <Box
                  sx={{
                    width: 18,
                    height: 4,
                    background: "#d32c33",
                    borderRadius: 4,
                  }}
                />
              </Box>
            </Box>

            {FAQS.map((item, idx) => (
              <Accordion
                key={idx}
                disableGutters
                sx={{
                  borderRadius: "12px !important",
                  border: "1px solid #e4e9f2",
                  boxShadow: "none !important",
                  mb: 1.25,
                  overflow: "hidden",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 16px rgba(23,67,128,0.09) !important",
                  },
                  "&.Mui-expanded": {
                    boxShadow: "0 6px 24px rgba(23,67,128,0.12) !important",
                    borderColor: "#174380",
                  },
                  "&::before": { display: "none !important" },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: "#174380",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      <ExpandMoreIcon sx={{ fontSize: 18 }} />
                    </Box>
                  }
                  sx={{
                    px: 3,
                    py: 1.5,
                    "& .MuiAccordionSummary-content": { my: 1 },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "var(--font-urbanist)",
                      fontWeight: 600,
                      fontSize: { xs: 15, lg: 17 },
                      color: "#1a2a4a",
                      pr: 2,
                    }}
                  >
                    {item.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    px: 3,
                    pb: 2.5,
                    borderTop: "1px solid #e4e9f2",
                    background: "#fafbff",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "var(--font-outfit)",
                      fontSize: 15,
                      color: "#5a6a85",
                      lineHeight: 1.8,
                      pt: 1,
                    }}
                  >
                    {item.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </MuiContainer>
      </Box>
    </>
  );
}
