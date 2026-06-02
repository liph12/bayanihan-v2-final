"use client";
import { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import {
  Container,
  Typography,
  Box,
  Button,
  Modal,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Chip,
  Collapse,
  CircularProgress,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useRouter } from "next/navigation";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ShareIcon from "@mui/icons-material/Share";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import AxiosInstance from "@/lib/AxiosInstance";
import EventGallery from "./EventGallery";
import EventRegistrationForm from "./EventRegistrationForm";

export interface FetchedEvent {
  id?: string | number;
  title?: string;
  organizer?: string;
  user?: { name?: string };
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  publishedDate?: string;
  image?: string;
  logo?: string;
  description?: string;
  gallery?: string[];
}

interface DisplayEvent {
  id?: string | number;
  title: string;
  organizer?: string;
  publishedby?: string;
  eventdate?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  publisheddate?: string;
  image: string;
  description: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop";

function getOrCreateCookieId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "uniqueId";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id =
      "user_" +
      Date.now() +
      "_" +
      Math.random().toString(36).substring(2, 11);
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

function mapFetched(fetched: FetchedEvent): {
  display: DisplayEvent;
  gallery: string[];
} {
  const galleryList: string[] = [];
  if (fetched.gallery && fetched.gallery.length > 0) {
    galleryList.push(...fetched.gallery);
    if (fetched.image) galleryList.push(fetched.image);
    if (fetched.logo) galleryList.push(fetched.logo);
  }
  return {
    display: {
      id: fetched.id,
      title: fetched.title || "Untitled Event",
      organizer: fetched.organizer,
      publishedby: fetched.user?.name,
      eventdate: fetched.eventDate,
      start_time: fetched.startTime,
      end_time: fetched.endTime,
      location: fetched.location,
      publisheddate: fetched.publishedDate,
      image: fetched.image || FALLBACK_IMAGE,
      description: fetched.description || "No description available.",
    },
    gallery: galleryList,
  };
}

export default function EventDetailClient({
  realSlug,
  initialEvent,
}: {
  realSlug: string;
  initialEvent?: FetchedEvent | null;
}) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();

  const initial = initialEvent ? mapFetched(initialEvent) : null;
  const [event, setEvent] = useState<DisplayEvent | null>(
    initial?.display ?? null
  );
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  const [loading, setLoading] = useState(!initial);
  const [descExpanded, setDescExpanded] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const qrWrapperRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadQR = () => {
    const svg = qrWrapperRef.current?.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const base64 = btoa(unescape(encodeURIComponent(xml)));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 512;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const link = document.createElement("a");
      link.download = `${realSlug}-qr-code.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src = "data:image/svg+xml;base64," + base64;
  };

  useEffect(() => {
    // If we already have SSR data, skip the initial fetch — but still hit the
    // endpoint to register the real client cookieId as a visitor.
    let mounted = true;
    const fetchEvent = async () => {
      try {
        const cookieId = getOrCreateCookieId();
        const response = await AxiosInstance.get(
          `view-event/${cookieId}/${realSlug}`
        );
        const fetched = (response?.data as { data?: FetchedEvent })?.data;
        if (!fetched || !mounted) return;

        const { display, gallery: gList } = mapFetched(fetched);
        setEvent(display);
        setGallery(gList);
      } catch (err) {
        console.error("[EventDetailClient] fetch error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchEvent();
    return () => {
      mounted = false;
    };
  }, [realSlug]);

  if (loading || !event) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const eventUrl =
    typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      <Modal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        aria-labelledby="share-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 350,
            bgcolor: "#fff",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Typography
            id="share-modal-title"
            variant="h5"
            fontWeight="bold"
            gutterBottom
          >
            Share This Event
          </Typography>
          <Typography sx={{ mb: 3 }}>
            Spread the word on your favorite platform:
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
            <Tooltip title="Share on Facebook">
              <IconButton
                component="a"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  eventUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "#3b5998",
                  "&:hover": { backgroundColor: "#f0f2ff" },
                }}
              >
                <FacebookIcon fontSize="large" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Share on Twitter">
              <IconButton
                component="a"
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  eventUrl
                )}&text=${encodeURIComponent(event.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "#1DA1F2",
                  "&:hover": { backgroundColor: "#e8f5fe" },
                }}
              >
                <TwitterIcon fontSize="large" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Share on Instagram">
              <IconButton
                component="a"
                href={`https://www.instagram.com/sharing/share-offsite/?url=${encodeURIComponent(
                  eventUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  background:
                    "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                  width: 40,
                  height: 40,
                  margin: "11px",
                  color: "#fff",
                  borderRadius: 2,
                  "&:hover": { opacity: 0.9 },
                }}
              >
                <InstagramIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </Box>

          <Button
            onClick={() => setShareModalOpen(false)}
            variant="outlined"
            size="small"
            sx={{ mt: 4 }}
          >
            Close
          </Button>
        </Box>
      </Modal>

      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: "55vw", sm: "50vw", md: "42vw", lg: "38vw" },
          minHeight: { xs: 260, sm: 320, md: 380, lg: 460 },
          maxHeight: 600,
          overflow: "hidden",
          backgroundColor: "#e0e0e0",
        }}
      >
        <IconButton
          aria-label="Go back"
          onClick={() => router.push("/browse-events")}
          size="large"
          sx={{
            position: "absolute",
            top: { xs: 10, md: 16 },
            left: { xs: 10, md: 16 },
            color: "#f6f2f2",
            bgcolor: "rgba(0,0,0,0.38)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
            zIndex: 3,
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.image}
          alt={event.title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.0) 45%)",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            bottom: { xs: 40, md: 20 },
            left: { xs: "50%", md: 84 },
            transform: { xs: "translateX(-50%)", md: "none" },
            zIndex: 2,
          }}
        >
          <Button
            onClick={() => setShareModalOpen(true)}
            startIcon={<ShareIcon />}
            variant="contained"
            size="medium"
            sx={{
              background:
                "linear-gradient(90deg, #1446A0 0%, #2B7BFF 50%, #00D4FF 100%)",
              backdropFilter: "blur(8px)",
              borderRadius: { xs: "8px", md: "10px" },
              textTransform: "none",
              fontWeight: 700,
              fontSize: { xs: "14px", md: "18px" },
              px: { xs: 1.9, md: 2.6 },
              py: { xs: 0.8, md: 1.05 },
              boxShadow: "0 8px 22px rgba(0,0,0,0.25)",
              "&:hover": { transform: "translateY(-2px)" },
            }}
          >
            Share via Social Media
          </Button>
        </Box>
      </Box>

      <Container maxWidth={false} sx={{ mb: 8, px: { xs: 2, md: 4 } }}>
        <Box sx={{ width: "100%", maxWidth: 1800, mx: "auto" }}>
          <Paper
            elevation={2}
            sx={{
              borderRadius: 4,
              mt: { xs: -3, md: -5 },
              position: "relative",
              zIndex: 1,
              p: { xs: 2.5, md: 4 },
            }}
          >
            <Grid container spacing={3} alignItems="flex-start">
              <Grid size={{ xs: 12, md: 9 }}>
                <Chip
                  label="Event"
                  sx={{
                    bgcolor: "warning.light",
                    color: "#4a3d00",
                    fontWeight: 700,
                    mb: 1,
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, lineHeight: 1.2 }}
                >
                  {event.title}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    mt: 1.5,
                    color: "text.secondary",
                  }}
                >
                  {event.location && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                      }}
                    >
                      <PlaceIcon fontSize="small" />
                      <Typography>{event.location}</Typography>
                    </Box>
                  )}
                  {event.eventdate && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                      }}
                    >
                      <CalendarMonthIcon fontSize="small" />
                      <Typography>
                        {new Date(event.eventdate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                  {event.start_time && event.end_time && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                      }}
                    >
                      <AccessTimeIcon fontSize="small" />
                      <Typography>
                        {event.start_time} - {event.end_time}
                      </Typography>
                    </Box>
                  )}
                </Box>
                {event.organizer && (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1.5,
                      fontStyle: "italic",
                      color: "text.secondary",
                    }}
                  >
                    Organized by: {event.organizer}
                  </Typography>
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ textAlign: { xs: "center", md: "right" } }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mb: 1,
                      color: "text.secondary",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Scan to Share
                  </Typography>
                  <Box
                    ref={qrWrapperRef}
                    sx={{
                      display: "inline-block",
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      boxShadow: 1,
                    }}
                  >
                    <QRCode value={eventUrl} size={140} />
                  </Box>
                  <Box sx={{ mt: 1.5 }}>
                    <Button
                      onClick={handleDownloadQR}
                      variant="outlined"
                      size="small"
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                      }}
                    >
                      Download QR
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: { xs: 2, md: 3 } }} />

            <Typography
              variant="h5"
              sx={{ fontSize: 30, fontWeight: 700, mb: 2 }}
            >
              About Event
            </Typography>
            <Collapse
              in={isXs ? descExpanded : true}
              collapsedSize={isXs ? 220 : 320}
            >
              <Box
                component="div"
                sx={{
                  fontSize: 23,
                  textAlign: "justify",
                  textAlignLast: "start",
                  wordBreak: "break-word",
                  hyphens: "auto",
                  "& p, & li": {
                    textAlign: "justify",
                    textAlignLast: "start",
                  },
                }}
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </Collapse>
            {isXs && (
              <Button
                onClick={() => setDescExpanded((v) => !v)}
                size="small"
                sx={{ mt: 1, textTransform: "none" }}
              >
                {descExpanded ? "Show less" : "Read more"}
              </Button>
            )}
            {event.publishedby && event.publisheddate && (
              <Typography
                variant="caption"
                sx={{ mt: 2, display: "block", color: "text.secondary" }}
              >
                Published by: {event.publishedby} on{" "}
                {new Date(event.publisheddate).toLocaleDateString()}
              </Typography>
            )}

            <Divider sx={{ my: { xs: 2, md: 3 } }} />

            {event.organizer && (
              <>
                <Typography
                  variant="h5"
                  sx={{ fontSize: 30, fontWeight: 700, mb: 1 }}
                >
                  Organizer
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontSize: 19, color: "text.secondary" }}
                >
                  {event.organizer}
                </Typography>
                <Divider sx={{ my: { xs: 2, md: 3 } }} />
              </>
            )}

            <Typography
              variant="h6"
              sx={{ fontSize: 30, fontWeight: 700, mb: 1 }}
            >
              Event Photos ({gallery.length})
            </Typography>
            {gallery.length === 0 ? (
              <Typography
                component="div"
                variant="h6"
                color="gray"
                sx={{ textAlign: "center", py: 3 }}
              >
                No photos available.
              </Typography>
            ) : (
              <EventGallery images={gallery} />
            )}

            <Divider sx={{ my: { xs: 3, md: 4 } }} />

            {/* ── Event Details + Registration ── */}
            <Grid container spacing={3}>
              {/* Event Details Card */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "#e2e8f0",
                    background:
                      "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                    boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
                    },
                  }}
                >
                  {/* Gradient header */}
                  <Box
                    sx={{
                      position: "relative",
                      background:
                        "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
                      color: "#fff",
                      py: 2.5,
                      px: 3,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: -40,
                        right: -40,
                        width: 140,
                        height: 140,
                        borderRadius: "50%",
                        bgcolor: "rgba(59,130,246,0.18)",
                      }}
                    />
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: "rgba(255,255,255,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <EventAvailableRoundedIcon
                          sx={{ fontSize: 22, color: "#fff" }}
                        />
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.65)",
                            lineHeight: 1,
                          }}
                        >
                          Quick Info
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            color: "#fff",
                            lineHeight: 1.2,
                            mt: 0.2,
                          }}
                        >
                          Event Details
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack spacing={1.8}>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            mb: 0.4,
                          }}
                        >
                          Title
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                          {event.title}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        {event.eventdate && (
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: "#fff",
                              border: "1px solid #e2e8f0",
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                color: "#64748b",
                                textTransform: "uppercase",
                              }}
                            >
                              Date
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.8,
                                mt: 0.4,
                              }}
                            >
                              <CalendarMonthIcon
                                sx={{ fontSize: 16, color: "#3b82f6" }}
                              />
                              <Typography
                                sx={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: "#0f172a",
                                }}
                              >
                                {new Date(
                                  event.eventdate
                                ).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {event.start_time && event.end_time && (
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: "#fff",
                              border: "1px solid #e2e8f0",
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                color: "#64748b",
                                textTransform: "uppercase",
                              }}
                            >
                              Time
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.8,
                                mt: 0.4,
                              }}
                            >
                              <AccessTimeIcon
                                sx={{ fontSize: 16, color: "#10b981" }}
                              />
                              <Typography
                                sx={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: "#0f172a",
                                }}
                              >
                                {event.start_time} – {event.end_time}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>

                      {event.location && (
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              color: "#64748b",
                              textTransform: "uppercase",
                            }}
                          >
                            Location
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 0.8,
                              mt: 0.4,
                            }}
                          >
                            <PlaceIcon
                              sx={{ fontSize: 16, color: "#ef4444", mt: 0.3 }}
                            />
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#0f172a",
                              }}
                            >
                              {event.location}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Small QR + share-via-scan */}
                      <Box
                        sx={{
                          mt: 1,
                          p: 2,
                          borderRadius: 3,
                          background:
                            "linear-gradient(135deg, #eef2ff 0%, #dbeafe 100%)",
                          border: "1px solid #c7d2fe",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            flexShrink: 0,
                            width: 84,
                            height: 84,
                            borderRadius: 2,
                            bgcolor: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            p: 1,
                            boxShadow: "0 4px 14px rgba(67,56,202,0.15)",
                          }}
                        >
                          <QRCode value={eventUrl} size={68} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.6}
                            sx={{ mb: 0.3 }}
                          >
                            <QrCodeScannerRoundedIcon
                              sx={{ fontSize: 16, color: "#4338ca" }}
                            />
                            <Typography
                              sx={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                color: "#4338ca",
                                textTransform: "uppercase",
                              }}
                            >
                              Share via QR
                            </Typography>
                          </Stack>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "#475569",
                              lineHeight: 1.45,
                            }}
                          >
                            Scan to open this event on a phone.
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                </Paper>
              </Grid>

              {/* Event Registration Card */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "#e2e8f0",
                    background:
                      "linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)",
                    boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 18px 40px rgba(43,123,255,0.12)",
                    },
                  }}
                >
                  {/* Gradient header */}
                  <Box
                    sx={{
                      position: "relative",
                      background:
                        "linear-gradient(135deg, #1446A0 0%, #2B7BFF 60%, #00D4FF 100%)",
                      color: "#fff",
                      py: 2.5,
                      px: 3,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: -50,
                        right: -50,
                        width: 160,
                        height: 160,
                        borderRadius: "50%",
                        bgcolor: "rgba(255,255,255,0.12)",
                      }}
                    />
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: "rgba(255,255,255,0.18)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <HowToRegRoundedIcon
                          sx={{ fontSize: 22, color: "#fff" }}
                        />
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.75)",
                            lineHeight: 1,
                          }}
                        >
                          Reserve Now
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            color: "#fff",
                            lineHeight: 1.2,
                            mt: 0.2,
                          }}
                        >
                          Event Registration
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                    <EventRegistrationForm eventId={event.id} />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>
    </>
  );
}
