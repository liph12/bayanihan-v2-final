"use client";
import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ChangeEvent,
} from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Card,
  Slider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Skeleton,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";
import QRCode from "qrcode";
import AxiosInstance from "@/lib/AxiosInstance";
import { useAuthProvider } from "@/providers/AuthProvider";

const CARD_FRONT = "/business-card/business_card_front.jpg";
const CARD_BACK = "/business-card/business_card_back.jpg";
const CARD_BACK_LOGO = "/business-card/business_card_back_logo.jpg";

interface CardData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface EventRow {
  id: string | number;
  title?: string;
  image?: string;
  eventDate?: string;
  country?: string;
  slug?: string;
  subDomain?: { name?: string };
  user?: { name?: string };
}

interface EventsApiResponse {
  data?: {
    events?: EventRow[];
  };
  events?: EventRow[];
}

interface UserDataShape {
  name?: string;
  email?: string;
  details?: {
    phone?: string;
    address?: string;
  };
}

export default function BusinessCardContent() {
  const { userData } = useAuthProvider();
  const u = userData as UserDataShape | null | undefined;

  const canvasRefFront = useRef<HTMLCanvasElement | null>(null);
  const canvasRefBack = useRef<HTMLCanvasElement | null>(null);
  const qrImgRef = useRef<HTMLImageElement | null>(null);

  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);

  const [cardData, setCardData] = useState<CardData>({
    name: u?.name || "Organizer Name",
    phone: u?.details?.phone || "",
    email: u?.email || "",
    address: u?.details?.address || "",
  });

  const [nameFontSize, setNameFontSize] = useState(100);
  const [eventRows, setEventRows] = useState<EventRow[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // --- Input handlers ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "address" && value.length > 32) return;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== "string") return;
      const img = new window.Image();
      img.src = result;
      img.onload = () => setLogoImg(img);
    };
    reader.readAsDataURL(file);
  };

  // --- Canvas drawing helpers ---
  const drawCard = useCallback(
    (
      canvasRef: React.RefObject<HTMLCanvasElement | null>,
      imgSrc: string,
      callback?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new window.Image();
      img.src = imgSrc;
      img.onload = () => {
        const containerWidth =
          window.innerWidth <= 600 ? window.innerWidth * 0.9 : 500;
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        const multiplier = 3;

        canvas.width = containerWidth * multiplier;
        canvas.height = containerWidth * aspectRatio * multiplier;
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${containerWidth * aspectRatio}px`;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        callback?.(ctx, canvas.width, canvas.height);
      };
    },
    []
  );

  const drawCardFront = useCallback(async () => {
    if (typeof document !== "undefined" && document.fonts?.ready) {
      await document.fonts.ready;
    }
    drawCard(canvasRefFront, CARD_FRONT, (ctx, width, height) => {
      const textFontSize = Math.floor(width * 0.03);

      // Name
      ctx.font = `bold ${nameFontSize}px "Outfit", sans-serif`;
      ctx.fillStyle = "#0b2a4a";
      ctx.fillText(cardData.name.toUpperCase(), width * 0.095, height * 0.445);

      // Contact details
      ctx.font = `${textFontSize}px "Outfit", sans-serif`;
      ctx.fillText(cardData.phone, width * 0.202, height * 0.66);
      ctx.fillText(cardData.email, width * 0.202, height * 0.78);
      ctx.fillText(cardData.address, width * 0.202, height * 0.898);

      // QR code
      if (qrImgRef.current) {
        const qrSize = width * 0.22;
        ctx.drawImage(
          qrImgRef.current,
          width - qrSize - 120,
          height - qrSize - 80,
          qrSize,
          qrSize
        );
      }
    });
  }, [drawCard, cardData, nameFontSize]);

  const drawBackWithLogo = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (!logoImg) return;
      const maxLogoWidth = width * 0.35;
      const maxLogoHeight = height * 0.35;
      const aspectRatio = logoImg.naturalWidth / logoImg.naturalHeight;

      let drawWidth = maxLogoWidth;
      let drawHeight = drawWidth / aspectRatio;

      if (drawHeight > maxLogoHeight) {
        drawHeight = maxLogoHeight;
        drawWidth = drawHeight * aspectRatio;
      }

      const x = width * 0.59 + (maxLogoWidth - drawWidth) / 2;
      const y = height * 0.32 + (maxLogoHeight - drawHeight) / 2;
      ctx.drawImage(logoImg, x, y, drawWidth, drawHeight);
    },
    [logoImg]
  );

  // --- Effects ---
  // Redraw cards whenever inputs change
  useEffect(() => {
    drawCardFront();
    if (logoImg) {
      drawCard(canvasRefBack, CARD_BACK_LOGO, drawBackWithLogo);
    } else {
      drawCard(canvasRefBack, CARD_BACK);
    }
  }, [drawCardFront, drawCard, drawBackWithLogo, logoImg, qrCodeUrl]);

  // Generate QR for the selected event.
  // Note: the "clear" path is handled inside the Select/Deselect button
  // handlers (which call clearQr()), not here, so this effect never has
  // to call setState in the no-selection branch.
  useEffect(() => {
    if (!selectedEvent) return;
    const slugOrSub = selectedEvent.subDomain?.name || selectedEvent.slug;
    if (!slugOrSub) return;
    const eventUrl = `https://${slugOrSub}.bayanihan.com`;
    QRCode.toDataURL(eventUrl, { width: 400, margin: 1 })
      .then((url) => {
        const img = new window.Image();
        img.src = url;
        img.onload = () => {
          qrImgRef.current = img;
          setQrCodeUrl(url);
        };
      })
      .catch((err) => {
        console.error("QR code generation failed", err);
      });
  }, [selectedEvent]);

  const clearQr = () => {
    qrImgRef.current = null;
    setQrCodeUrl(null);
    setSelectedEvent(null);
  };

  // Fetch events owned by the current user
  useEffect(() => {
    let cancelled = false;
    const fetchEvents = async () => {
      if (!u?.name) {
        setLoadingEvents(false);
        return;
      }
      try {
        const res = await AxiosInstance.get<EventsApiResponse>("/events");
        const root = res.data;
        const arr: EventRow[] = Array.isArray(root?.data?.events)
          ? root.data!.events!
          : root?.events || [];
        const filtered = arr.filter((event) => event.user?.name === u.name);
        if (!cancelled) setEventRows(filtered);
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        if (!cancelled) setLoadingEvents(false);
      }
    };
    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, [u?.name]);

  const filteredEventRows = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return eventRows;
    return eventRows.filter((row) =>
      [row.title, row.country, row.eventDate].some((f) =>
        (f || "").toLowerCase().includes(q)
      )
    );
  }, [eventRows, searchText]);

  const pagedRows = useMemo(
    () =>
      filteredEventRows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [filteredEventRows, page, rowsPerPage]
  );

  const downloadCards = () => {
    const dl = (
      ref: React.RefObject<HTMLCanvasElement | null>,
      name: string
    ) => {
      const canvas = ref.current;
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = name;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    dl(canvasRefFront, "card_front.png");
    dl(canvasRefBack, "card_back.png");
  };

  const steps: Array<{ name: keyof CardData; label: string }> = [
    { name: "name", label: "Name" },
    { name: "phone", label: "Phone" },
    { name: "email", label: "Email" },
    { name: "address", label: "Address" },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, fontFamily: "'Outfit', sans-serif" }}>
      <Box sx={{ display: { xs: "block", lg: "flex" }, gap: 4 }}>
        {/* LEFT: CONTROLS */}
        <Box
          sx={{
            width: { xs: "100%", lg: "40%" },
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}
          >
            Business Card Designer
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Outfit', sans-serif",
              color: "#64748b",
              fontSize: 14,
              mt: -1,
            }}
          >
            Personalize your card and link it to one of your events.
          </Typography>

          {steps.map((step) => (
            <TextField
              key={step.name}
              fullWidth
              label={step.label}
              name={step.name}
              value={cardData[step.name]}
              onChange={handleInputChange}
              size="small"
              inputProps={
                step.name === "address" ? { maxLength: 32 } : undefined
              }
            />
          ))}

          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Name Size: {nameFontSize}px
            </Typography>
            <Slider
              min={40}
              max={150}
              value={nameFontSize}
              onChange={(_, v) => setNameFontSize(v as number)}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
            >
              Upload Logo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </Button>
            {logoImg && (
              <IconButton color="error" onClick={() => setLogoImg(null)}>
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<FlipCameraAndroidIcon />}
              onClick={() => setIsFlipped((v) => !v)}
            >
              Flip Card
            </Button>
            <Button
              variant="contained"
              color="success"
              fullWidth
              startIcon={<DownloadIcon />}
              onClick={downloadCards}
            >
              Download PNG
            </Button>
          </Box>

          {selectedEvent && (
            <Box
              sx={{
                p: 1.5,
                mt: 1,
                borderRadius: 2,
                bgcolor: "#f1f5f9",
                border: "1px solid #e2e8f0",
              }}
            >
              <Typography
                sx={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}
              >
                QR CODE LINKS TO
              </Typography>
              <Typography
                sx={{ fontWeight: 600, color: "#0f172a", fontSize: 14, mt: 0.5 }}
              >
                {selectedEvent.title}
              </Typography>
              <Button
                size="small"
                onClick={clearQr}
                sx={{ textTransform: "none", p: 0, mt: 0.5 }}
              >
                Clear link
              </Button>
            </Box>
          )}
        </Box>

        {/* RIGHT: PREVIEW */}
        <Box
          sx={{
            perspective: "1000px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            mt: { xs: 4, lg: 0 },
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", sm: 500 },
              height: 300,
              position: "relative",
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              transition: "transform 0.6s",
            }}
          >
            <canvas
              ref={canvasRefFront}
              style={{
                position: "absolute",
                backfaceVisibility: "hidden",
                width: "100%",
                borderRadius: 12,
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
            />
            <canvas
              ref={canvasRefBack}
              style={{
                position: "absolute",
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                width: "100%",
                borderRadius: 12,
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* EVENT PICKER TABLE */}
      <Card sx={{ mt: 8, p: 3, borderRadius: "16px" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}
            >
              Link an Event
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                color: "#64748b",
              }}
            >
              Pick one of your events — its QR code will appear on the card.
            </Typography>
          </Box>
          <TextField
            placeholder="Search by title, country, or date…"
            size="small"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(0);
            }}
            sx={{ width: { xs: "100%", sm: 320 } }}
          />
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>
                  Banner
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>
                  Event Title
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>
                  Date
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, color: "#64748b" }}
                >
                  Link QR
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingEvents ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    <TableCell>
                      <Skeleton variant="rounded" width={48} height={48} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width="80%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={120} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={80} sx={{ ml: "auto" }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : pagedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {eventRows.length === 0
                        ? "You don't have any events yet."
                        : "No events match your search."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((row) => {
                  const isSelected = selectedEvent?.id === row.id;
                  return (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        ...(isSelected
                          ? { bgcolor: "rgba(14,165,233,0.06)" }
                          : {}),
                      }}
                    >
                      <TableCell>
                        <Avatar
                          src={row.image}
                          variant="rounded"
                          sx={{ width: 48, height: 48 }}
                        >
                          {row.title?.[0]?.toUpperCase() || "?"}
                        </Avatar>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {row.title || "(Untitled)"}
                      </TableCell>
                      <TableCell sx={{ color: "#475569" }}>
                        {row.eventDate || "—"}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant={isSelected ? "contained" : "outlined"}
                          size="small"
                          onClick={() => {
                            if (isSelected) clearQr();
                            else setSelectedEvent(row);
                          }}
                          sx={{
                            textTransform: "none",
                            borderRadius: 999,
                          }}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {!loadingEvents && filteredEventRows.length > 0 && (
          <TablePagination
            component="div"
            count={filteredEventRows.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}
      </Card>
    </Box>
  );
}
