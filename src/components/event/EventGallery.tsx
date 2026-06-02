"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("event-gallery-styles")) return;
  const style = document.createElement("style");
  style.id = "event-gallery-styles";
  style.textContent = `
    @keyframes slideInRight { 0%{opacity:0;transform:translateX(48px) scale(0.97);} 40%{opacity:1;} 100%{opacity:1;transform:translateX(0) scale(1);} }
    @keyframes slideInLeft { 0%{opacity:0;transform:translateX(-48px) scale(0.97);} 40%{opacity:1;} 100%{opacity:1;transform:translateX(0) scale(1);} }
    @keyframes fadeScaleIn { from{opacity:0;transform:scale(0.94);} to{opacity:1;transform:scale(1);} }
    .eg-main-image { transition: transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.3s ease; }
    .eg-main-image:hover { transform: scale(1.015); }
    .eg-preview-thumb { transition: transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.35s ease, box-shadow 0.35s ease; filter: brightness(0.82) saturate(0.9); }
    .eg-preview-thumb:hover { transform: scale(1.04); filter: brightness(1) saturate(1.1); box-shadow: 0 8px 28px rgba(0,0,0,0.22); }
    .eg-nav-btn { transition: background-color 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease !important; }
    .eg-nav-btn:hover { transform: translateY(-50%) scale(1.12) !important; box-shadow: 0 4px 18px rgba(0,0,0,0.35) !important; }
    .eg-dialog-image { animation: fadeScaleIn 0.6s cubic-bezier(0.16,1,0.3,1) both; }
    .eg-dialog-nav { transition: background-color 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1) !important; }
    .eg-dialog-nav:hover { transform: translateY(-50%) scale(1.1) !important; }
  `;
  document.head.appendChild(style);
}

export default function EventGallery({ images = [] }: { images?: string[] }) {
  useEffect(() => {
    injectStyles();
  }, []);

  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [slideDir, setSlideDir] = useState(1);

  const handleOpen = (index: number) => {
    setCurrentImage(index);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleNext = () =>
    setCurrentImage((prev) => (prev + 1) % images.length);
  const handlePrev = () =>
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  const len = images.length || 1;
  const nextIndex = (currentImage + 1) % len;
  const nextIndex2 = (currentImage + 2) % len;

  useEffect(() => {
    setFadeIn(false);
    const t = setTimeout(() => setFadeIn(true), 20);
    return () => clearTimeout(t);
  }, [currentImage]);

  const changeIndex = (idx: number) => {
    if (!images || !images.length) return;
    const target = ((idx % len) + len) % len;
    if (target === currentImage) return;
    const delta = (target - currentImage + len) % len;
    setSlideDir(delta === 1 ? 1 : -1);
    setCurrentImage(target);
  };

  const animationName = slideDir === 1 ? "slideInRight" : "slideInLeft";

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          borderRadius: 3,
          overflow: "hidden",
          height: { xs: 260, sm: 380, md: 460 },
          boxShadow: "0 12px 48px rgba(0,0,0,0.14)",
        }}
      >
        {/* Main */}
        <Box
          sx={{
            flex: images.length > 1 ? "0 0 68%" : "1",
            position: "relative",
            overflow: "hidden",
            borderRadius: 3,
            cursor: "pointer",
            bgcolor: "#111",
          }}
          onClick={() => handleOpen(currentImage)}
        >
          {images.length > 0 ? (
            <Box
              component="img"
              key={currentImage}
              src={images[currentImage]}
              className="eg-main-image"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                animation: fadeIn
                  ? `${animationName} 0.98s cubic-bezier(0.16, 1, 0.3, 1) both`
                  : "none",
              }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#f0f0f0",
              }}
            >
              <Typography color="text.secondary" fontSize={14}>
                No photos available.
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.38))",
              pointerEvents: "none",
              borderRadius: 3,
            }}
          />

          {images.length > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 14,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "6px",
                alignItems: "center",
              }}
            >
              {images.map((_, i) => (
                <Box
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    changeIndex(i);
                  }}
                  sx={{
                    width: i === currentImage ? 22 : 7,
                    height: 7,
                    borderRadius: 99,
                    bgcolor:
                      i === currentImage
                        ? "#fff"
                        : "rgba(255,255,255,0.5)",
                    opacity: i === currentImage ? 1 : 0.7,
                    cursor: "pointer",
                    transition: "width 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                />
              ))}
            </Box>
          )}

          {images.length > 1 && (
            <>
              <IconButton
                className="eg-nav-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  changeIndex(currentImage - 1);
                }}
                sx={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#fff",
                  backgroundColor: "rgba(0,0,0,0.42)",
                  backdropFilter: "blur(6px)",
                  width: 36,
                  height: 36,
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.68)" },
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>

              <IconButton
                className="eg-nav-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  changeIndex(currentImage + 1);
                }}
                sx={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#fff",
                  backgroundColor: "rgba(0,0,0,0.42)",
                  backdropFilter: "blur(6px)",
                  width: 36,
                  height: 36,
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.68)" },
                }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>

        {/* Right previews */}
        {images.length > 1 && (
          <Box
            sx={{
              flex: "0 0 calc(32% - 12px)",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                flex: 1,
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "#111",
                cursor: "pointer",
                position: "relative",
              }}
              onClick={() => changeIndex(nextIndex)}
            >
              <Box
                component="img"
                src={images[nextIndex]}
                className="eg-preview-thumb"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>

            {images.length > 2 && (
              <Box
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "#111",
                  cursor: "pointer",
                  position: "relative",
                }}
                onClick={() => changeIndex(nextIndex2)}
              >
                <Box
                  component="img"
                  src={images[nextIndex2]}
                  className="eg-preview-thumb"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                {images.length > 3 && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(0,0,0,0.52)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(2px)",
                      transition: "background-color 0.25s ease",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.38)" },
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: { xs: 13, sm: 16 },
                        letterSpacing: "0.02em",
                        textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                      }}
                    >
                      +{images.length - 3} more
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Lightbox */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              bgcolor: "transparent",
              boxShadow: "none",
              overflow: "visible",
            },
          },
        }}
        sx={{
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(5,5,10,0.88)",
            backdropFilter: "blur(10px)",
          },
          "& .MuiDialog-container": { alignItems: "center" },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            overflow: "visible",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{
              position: "fixed",
              top: 18,
              right: 18,
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.18)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.22)",
                transform: "scale(1.1)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box
            component="img"
            key={currentImage}
            src={images[currentImage]}
            className="eg-dialog-image"
            sx={{
              maxHeight: "85vh",
              maxWidth: "88vw",
              objectFit: "contain",
              borderRadius: 2,
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            }}
          />

          {images.length > 1 && (
            <>
              <IconButton
                className="eg-dialog-nav"
                onClick={handlePrev}
                sx={{
                  position: "fixed",
                  left: { xs: 8, sm: 24 },
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>

              <IconButton
                className="eg-dialog-nav"
                onClick={handleNext}
                sx={{
                  position: "fixed",
                  right: { xs: 8, sm: 24 },
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </>
          )}

          <Box
            sx={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(255,255,255,0.75)",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.08em",
              bgcolor: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(8px)",
              px: 2,
              py: 0.6,
              borderRadius: 99,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {currentImage + 1} / {images.length}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
