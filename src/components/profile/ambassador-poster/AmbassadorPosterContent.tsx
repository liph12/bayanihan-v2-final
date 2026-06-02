"use client";
import {
  useRef,
  useState,
  useEffect,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Slider,
  MenuItem,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Cropper, { type Area } from "react-easy-crop";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";

const POSTER_BG = "/ambassador-poster/ambassador_poster.jpg";

const COUNTRIES = [
  "USA",
  "UAE",
  "Japan",
  "Singapore",
  "Saudi Arabia",
  "Qatar",
  "South Korea",
  "Taiwan",
  "Macau",
  "Oman",
  "Kuwait",
  "Germany",
  "Italy",
  "Switzerland",
  "Spain",
  "Mexico",
  "Canada",
  "New Zealand",
  "United Kingdom",
  "Belgium",
  "Australia",
] as const;

const COUNTRY_FLAGS: Record<string, string> = {
  USA: "🇺🇸",
  UAE: "🇦🇪",
  Japan: "🇯🇵",
  Singapore: "🇸🇬",
  "Saudi Arabia": "🇸🇦",
  Qatar: "🇶🇦",
  "South Korea": "🇰🇷",
  Taiwan: "🇹🇼",
  Macau: "🇲🇴",
  Oman: "🇴🇲",
  Kuwait: "🇰🇼",
  Germany: "🇩🇪",
  Italy: "🇮🇹",
  Switzerland: "🇨🇭",
  Spain: "🇪🇸",
  Mexico: "🇲🇽",
  Canada: "🇨🇦",
  "New Zealand": "🇳🇿",
  "United Kingdom": "🇬🇧",
  Belgium: "🇧🇪",
  Australia: "🇦🇺",
};

const IMAGE_FRAME = { x: 100, y: 1395, size: 730, radius: 110 };
const INDENT_X = 120;
const FONT_MIN = 100;
const FONT_MAX = 260;
const LINE_HEIGHT_MIN = 150;
const LINE_HEIGHT_MAX = 350;

const FONT_OPTIONS = ["Outfit", "Poppins", "Arial", "Helvetica", "Impact"];

interface TextState {
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function getCroppedImg(
  src: string,
  cropPixels: Area
): Promise<HTMLImageElement> {
  const image = await createImage(src);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  );
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = canvas.toDataURL("image/png");
    img.onload = () => resolve(img);
  });
}

export default function AmbassadorPosterContent() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedCountry, setSelectedCountry] = useState<string>("UAE");
  const [profileImg, setProfileImg] = useState<HTMLImageElement | null>(null);
  const [indentThirdWord, setIndentThirdWord] = useState(false);
  const [indentFourthWord, setIndentFourthWord] = useState(false);
  const [draggingText, setDraggingText] = useState(false);
  const [lineHeight, setLineHeight] = useState(220);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [ambassadorName, setAmbassadorName] = useState("");
  const [textState, setTextState] = useState<TextState>({
    x: 1100,
    y: 1500,
    fontSize: 200,
    fontFamily: "Outfit",
    color: "#262ECE",
  });

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageSrc(URL.createObjectURL(file));
    setCropModalOpen(true);
  };

  const applyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    const croppedImg = await getCroppedImg(imageSrc, croppedAreaPixels);
    setProfileImg(croppedImg);
    setCropModalOpen(false);
  };

  // Draw the poster whenever inputs change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bg = new window.Image();
    bg.crossOrigin = "anonymous";
    bg.src = POSTER_BG;

    bg.onload = () => {
      canvas.width = bg.naturalWidth;
      canvas.height = bg.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bg, 0, 0);

      // Country banner
      const titleText = `AMBASSADOR FOR ${selectedCountry.toUpperCase()}`;
      ctx.font = `bold 90px "Outfit", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const textWidth = ctx.measureText(titleText).width;
      const centerX = canvas.width / 1.6;
      const centerY = 1660;

      ctx.fillStyle = "#D32F2F";
      ctx.fillRect(
        centerX - (textWidth + 160) / 2,
        centerY - 60,
        textWidth + 160,
        120
      );
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(titleText, centerX, centerY);

      // Profile photo
      if (profileImg) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(
          IMAGE_FRAME.x,
          IMAGE_FRAME.y,
          IMAGE_FRAME.size,
          IMAGE_FRAME.size,
          IMAGE_FRAME.radius
        );
        ctx.clip();
        ctx.drawImage(
          profileImg,
          IMAGE_FRAME.x,
          IMAGE_FRAME.y,
          IMAGE_FRAME.size,
          IMAGE_FRAME.size
        );
        ctx.restore();
      }

      // Ambassador name
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.font = `bold ${textState.fontSize}px ${textState.fontFamily}`;
      ctx.fillStyle = textState.color;

      const words = ambassadorName.toUpperCase().trim().split(" ");
      if (indentThirdWord && words.length >= 3) {
        ctx.fillText(words.slice(0, 2).join(" "), textState.x, textState.y);
        ctx.fillText(
          words.slice(2).join(" "),
          textState.x + INDENT_X,
          textState.y + lineHeight
        );
      } else if (indentFourthWord && words.length >= 4) {
        ctx.fillText(words.slice(0, 3).join(" "), textState.x, textState.y);
        ctx.fillText(
          words.slice(3).join(" "),
          textState.x + INDENT_X,
          textState.y + lineHeight
        );
      } else {
        ctx.fillText(
          ambassadorName.toUpperCase(),
          textState.x,
          textState.y
        );
      }
    };
  }, [
    profileImg,
    ambassadorName,
    textState,
    indentThirdWord,
    indentFourthWord,
    selectedCountry,
    lineHeight,
  ]);

  const downloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const slug =
      ambassadorName.toLowerCase().trim().replace(/\s+/g, "-") || "ambassador";
    const link = document.createElement("a");
    link.download = `${slug}-poster.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Drag-to-position the ambassador name
  const handleCanvasMouseDown = (_e: ReactMouseEvent<HTMLCanvasElement>) => {
    setDraggingText(true);
  };
  const handleCanvasMouseMove = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (!draggingText) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    setTextState((prev) => ({
      ...prev,
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }));
  };
  const handleCanvasMouseUp = () => setDraggingText(false);

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        pb: { xs: 15, md: 4 },
        bgcolor: "#F4F7FE",
        minHeight: "100vh",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <Grid container spacing={4}>
        {/* LEFT: CONTROLS */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "20px",
              border: "1px solid #f1f5f9",
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, mb: 3 }}
            >
              Poster Designer
            </Typography>

            <Typography variant="subtitle2" color="textSecondary" mb={1}>
              Select Country
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1,
                mb: 3,
              }}
            >
              {COUNTRIES.map((c) => (
                <Button
                  key={c}
                  variant={selectedCountry === c ? "contained" : "outlined"}
                  onClick={() => setSelectedCountry(c)}
                  sx={{
                    py: 1,
                    fontSize: 12,
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  {COUNTRY_FLAGS[c]} {c}
                </Button>
              ))}
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              <TextField
                label="Ambassador Name"
                name="ambassadorName"
                fullWidth
                value={ambassadorName}
                onChange={(e) => setAmbassadorName(e.target.value)}
                variant="filled"
              />

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  fullWidth
                  variant={indentThirdWord ? "contained" : "outlined"}
                  size="small"
                  onClick={() => {
                    setIndentThirdWord(!indentThirdWord);
                    setIndentFourthWord(false);
                  }}
                >
                  3rd Word Break
                </Button>
                <Button
                  fullWidth
                  variant={indentFourthWord ? "contained" : "outlined"}
                  size="small"
                  onClick={() => {
                    setIndentFourthWord(!indentFourthWord);
                    setIndentThirdWord(false);
                  }}
                >
                  4th Word Break
                </Button>
              </Box>

              {(indentThirdWord || indentFourthWord) && (
                <Box>
                  <Typography variant="caption">
                    Line Height: {lineHeight}px
                  </Typography>
                  <Slider
                    value={lineHeight}
                    min={LINE_HEIGHT_MIN}
                    max={LINE_HEIGHT_MAX}
                    onChange={(_, v) => setLineHeight(v as number)}
                  />
                </Box>
              )}

              <Box>
                <Typography variant="caption">
                  Font Size: {textState.fontSize}px
                </Typography>
                <Slider
                  value={textState.fontSize}
                  min={FONT_MIN}
                  max={FONT_MAX}
                  onChange={(_, v) =>
                    setTextState((p) => ({ ...p, fontSize: v as number }))
                  }
                />
              </Box>

              <TextField
                select
                label="Font Style"
                fullWidth
                value={textState.fontFamily}
                onChange={(e) =>
                  setTextState((p) => ({ ...p, fontFamily: e.target.value }))
                }
              >
                {FONT_OPTIONS.map((f) => (
                  <MenuItem key={f} value={f}>
                    {f}
                  </MenuItem>
                ))}
              </TextField>

              <Box>
                <Typography variant="caption">Text Color</Typography>
                <input
                  type="color"
                  value={textState.color}
                  onChange={(e) =>
                    setTextState((p) => ({ ...p, color: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    height: 40,
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                />
              </Box>

              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                Upload Photo
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>

              <Button
                variant="contained"
                color="success"
                startIcon={<DownloadIcon />}
                fullWidth
                onClick={downloadPoster}
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                Download PNG
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT: PREVIEW */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "20px",
              display: "flex",
              justifyContent: "center",
              bgcolor: "#fff",
              position: "sticky",
              top: 100,
              border: "1px solid #f1f5f9",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: 12,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                cursor: draggingText ? "grabbing" : "grab",
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* CROP MODAL */}
      {cropModalOpen && imageSrc && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ position: "relative", flex: 1 }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, p) => setCroppedAreaPixels(p)}
            />
          </Box>
          <Paper sx={{ p: 4, borderRadius: "20px 20px 0 0" }}>
            <Typography mb={1}>Adjust Zoom</Typography>
            <Slider
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(_, z) => setZoom(z as number)}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setCropModalOpen(false)}
                sx={{ py: 2, borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={applyCrop}
                sx={{ py: 2, borderRadius: 2 }}
              >
                Apply Profile Photo
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
