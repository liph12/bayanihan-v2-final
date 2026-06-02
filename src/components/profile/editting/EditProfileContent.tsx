"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Slider,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { motion } from "framer-motion";
import CameraAltRounded from "@mui/icons-material/CameraAltRounded";
import PhotoCameraRounded from "@mui/icons-material/PhotoCameraRounded";
import PhoneRounded from "@mui/icons-material/PhoneRounded";
import LocationOnRounded from "@mui/icons-material/LocationOnRounded";
import EmailRounded from "@mui/icons-material/EmailRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import PersonRounded from "@mui/icons-material/PersonRounded";
import EditNoteRounded from "@mui/icons-material/EditNoteRounded";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import WorkspacePremiumRounded from "@mui/icons-material/WorkspacePremiumRounded";
import SaveRounded from "@mui/icons-material/SaveRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import MaleRounded from "@mui/icons-material/MaleRounded";
import FemaleRounded from "@mui/icons-material/FemaleRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import ZoomInRounded from "@mui/icons-material/ZoomInRounded";
import ZoomOutRounded from "@mui/icons-material/ZoomOutRounded";
import FacebookRounded from "@mui/icons-material/FacebookRounded";
import Cropper, { type Area } from "react-easy-crop";
import { useAuthProvider } from "@/providers/AuthProvider";
import type { UserData } from "@/types";

const FONT = "'Outfit', sans-serif";
const GRADIENT = "linear-gradient(135deg, #1e3a8a 0%, #06b6d4 100%)";

interface Details {
  photo?: string;
  cover_photo?: string;
  gender?: string;
  phone?: string;
  sub_domain?: string;
  about?: string;
  facebook?: string;
  state?: string;
  country?: string;
}

interface UserShape {
  id?: number | string;
  name?: string;
  email?: string;
  role?: { name?: string } | null;
  details?: Details;
  photo?: string;
}

const INPUT_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    backgroundColor: "#fff",
    fontFamily: FONT,
    transition: "all .2s ease",
    "& fieldset": {
      border: "1.5px solid #e2e8f0",
      transition: "all .2s ease",
    },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": {
      borderColor: "#06b6d4",
      borderWidth: 2,
      boxShadow: "0 0 0 4px rgba(6,182,212,0.12)",
    },
    "&.Mui-disabled": {
      backgroundColor: "#f1f5f9",
      "& fieldset": { borderColor: "#e2e8f0" },
    },
  },
  "& .MuiInputBase-input": {
    fontFamily: FONT,
    fontWeight: 500,
    py: 1.5,
  },
  "& .MuiInputAdornment-root .MuiSvgIcon-root": { color: "#94a3b8" },
};

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <Typography
      sx={{
        fontFamily: FONT,
        fontSize: 11.5,
        fontWeight: 800,
        color: "#475569",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        mb: 0.85,
      }}
    >
      {children}
      {required && <Box component="span" sx={{ color: "#ef4444", ml: 0.5 }}>*</Box>}
    </Typography>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accent: string;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.75} sx={{ mb: 3 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2.5,
          display: "grid",
          placeItems: "center",
          color: "#fff",
          background: accent,
          boxShadow: `0 10px 22px ${accent
            .replace("linear-gradient(135deg, ", "")
            .split(" ")[0]
            .slice(0, 7)}40`,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: FONT,
            fontSize: { xs: 17, md: 19 },
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              fontFamily: FONT,
              fontSize: 12.5,
              fontWeight: 500,
              color: "#64748b",
              mt: 0.25,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function CompletionRing({ value }: { value: number }) {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <Box sx={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#completionGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset .4s ease" }}
        />
        <defs>
          <linearGradient id="completionGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 16,
          color: "#0f172a",
        }}
      >
        {value}%
      </Box>
    </Box>
  );
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.src = url;
  });
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<{ file: File; preview: string }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to encode crop"));
        return;
      }
      const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
      resolve({ file, preview: URL.createObjectURL(blob) });
    }, "image/jpeg");
  });
}

interface GenderTabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  accent: string;
}

function GenderTab({ active, onClick, icon, label, accent }: GenderTabProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        flex: 1,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.75,
        py: 1.4,
        borderRadius: "12px",
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 14,
        color: active ? "#fff" : "#64748b",
        background: active ? accent : "transparent",
        boxShadow: active ? `0 8px 18px ${accent.includes("3a8a") ? "rgba(30,58,138,0.28)" : "rgba(244,63,94,0.25)"}` : "none",
        transition: "all .2s ease",
        userSelect: "none",
        "&:hover": {
          background: active ? accent : "rgba(15,23,42,0.04)",
        },
        "& svg": { fontSize: 18, color: active ? "#fff" : "#94a3b8" },
      }}
    >
      {icon}
      {label}
    </Box>
  );
}

export default function EditProfileContent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { userData, authToken, patchUser } = useAuthProvider();
  const u = (userData ?? {}) as UserShape;

  const [cropOpen, setCropOpen] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState<Area | null>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    u?.details?.cover_photo ?? null
  );

  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error" | "info";
  }>({ open: false, msg: "", sev: "success" });

  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);

  const initial = useMemo(
    () => ({
      name: u?.name || "",
      gender: u?.details?.gender || "",
      phone: u?.details?.phone || "",
      sub_domain: u?.details?.sub_domain || "",
      about: u?.details?.about || "",
      facebook: u?.details?.facebook || "",
    }),
    [u]
  );

  const [form, setForm] = useState({
    imageData: null as File | null,
    image: null as string | null,
    name: initial.name,
    gender: initial.gender,
    phone: initial.phone,
    sub_domain: initial.sub_domain,
    old_sub_domain: initial.sub_domain,
    about: initial.about,
    facebook: initial.facebook,
  });

  const completion = useMemo(() => {
    const checks = [
      !!form.name,
      !!form.phone,
      !!form.sub_domain,
      !!form.gender,
      !!form.about,
      !!(form.image || u?.details?.photo || u?.photo),
      !!coverPreview,
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [form, u, coverPreview]);

  const showToast = (msg: string, sev: "success" | "error" | "info") =>
    setToast({ open: true, msg, sev });

  const markDirty = () => {
    if (!dirty) setDirty(true);
  };

  const handleField = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    markDirty();
  };

  const handlePickImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropImage(String(ev.target?.result || ""));
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handlePickCover = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(String(ev.target?.result || ""));
    reader.readAsDataURL(file);
    markDirty();
  };

  const applyCrop = async () => {
    if (!cropImage || !croppedPixels) {
      setCropOpen(false);
      return;
    }
    try {
      const out = await getCroppedImg(cropImage, croppedPixels);
      setForm((p) => ({ ...p, imageData: out.file, image: out.preview }));
      markDirty();
      setCropOpen(false);
    } catch (e) {
      console.error(e);
      showToast("Could not crop image.", "error");
    }
  };

  const resetForm = () => {
    setForm((p) => ({
      ...p,
      imageData: null,
      image: null,
      name: initial.name,
      gender: initial.gender,
      phone: initial.phone,
      sub_domain: initial.sub_domain,
      old_sub_domain: initial.sub_domain,
      about: initial.about,
      facebook: initial.facebook,
    }));
    setCoverFile(null);
    setCoverPreview(u?.details?.cover_photo ?? null);
    setDirty(false);
  };

  const updateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      showToast("Name and phone are required.", "error");
      return;
    }
    if (!authToken) {
      showToast("You are not signed in.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("phone", form.phone);
      fd.append("gender", form.gender);
      fd.append("sub_domain", form.sub_domain);
      fd.append("old_sub_domain", form.old_sub_domain);
      fd.append("about", form.about || "");
      fd.append("facebook", form.facebook || "");
      fd.append("save_sub_domain_types", "true");
      if (u?.id != null) fd.append("user_id", String(u.id));
      if (u?.role?.name) fd.append("role", u.role.name);
      if (form.imageData) fd.append("image", form.imageData);
      if (coverFile) fd.append("cover_photo", coverFile);

      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: fd,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(
          (json && (json.message as string)) || `Update failed (${res.status})`,
          "error"
        );
        return;
      }

      const updated = Array.isArray(json) ? json[0] : json?.data || json;
      const next = (updated && typeof updated === "object"
        ? (updated as UserShape)
        : {}) as UserShape;

      // Use patchUser so we never replace the user record wholesale —
      // the backend may omit role / email / id, and a wholesale replace
      // would blank the top nav + sidebar role-gated menu. patchUser
      // merges over the existing user without dropping fields.
      const detailsPatch: Record<string, unknown> = {
        phone: form.phone,
        gender: form.gender,
        sub_domain: form.sub_domain,
        about: form.about,
        facebook: form.facebook,
      };
      if (typeof next?.details?.photo === "string" && next.details.photo) {
        detailsPatch.photo = next.details.photo;
      }
      if (
        typeof next?.details?.cover_photo === "string" &&
        next.details.cover_photo
      ) {
        detailsPatch.cover_photo = next.details.cover_photo;
      }

      patchUser({
        name: form.name,
        details: detailsPatch,
      });

      setForm((p) => ({
        ...p,
        old_sub_domain: form.sub_domain || p.sub_domain,
      }));
      setDirty(false);
      showToast("Profile updated successfully.", "success");
    } catch (err) {
      console.error("[edit-profile] update failed", err);
      showToast("Network error while updating profile.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const avatarSrc = form.image || u?.details?.photo || u?.photo || undefined;
  const subDomainHost = `${form.sub_domain || "username"}.bayanihan.com`;
  const locationLine = [u?.details?.state, u?.details?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100%",
        background:
          "radial-gradient(1200px 600px at -10% -20%, rgba(6,182,212,0.08), transparent), radial-gradient(900px 500px at 110% 10%, rgba(124,58,237,0.07), transparent), #f8fafc",
        pb: { xs: 14, md: 12 },
      }}
    >
      {/* CROP DIALOG */}
      <Dialog
        open={cropOpen}
        onClose={() => setCropOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 5,
              overflow: "hidden",
              fontFamily: FONT,
              border: "1px solid #eef2f6",
              boxShadow: "0 30px 80px rgba(15,23,42,0.32)",
            },
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            px: 3,
            py: 2.25,
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #06b6d4 100%)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 110% -10%, rgba(245,158,11,0.25) 0%, transparent 55%)",
              pointerEvents: "none",
            }}
          />
          <Box sx={{ position: "relative" }}>
            <Typography
              sx={{
                fontFamily: FONT,
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                opacity: 0.85,
              }}
            >
              Profile photo
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT,
                fontSize: 19,
                fontWeight: 800,
                letterSpacing: "-0.01em",
                mt: 0.25,
              }}
            >
              Adjust your crop
            </Typography>
          </Box>
          <IconButton
            onClick={() => setCropOpen(false)}
            sx={{
              position: "relative",
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.14)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
            }}
            size="small"
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent
          sx={{ position: "relative", height: 380, p: 0, bgcolor: "#0f172a" }}
        >
          {cropImage && (
            <Cropper
              image={cropImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_a, pixels) => setCroppedPixels(pixels)}
            />
          )}
        </DialogContent>
        <Box sx={{ px: 3, pt: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <ZoomOutRounded sx={{ color: "#94a3b8", fontSize: 18 }} />
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.05}
              onChange={(_e, v) => setZoom(v as number)}
              sx={{
                color: "#06b6d4",
                "& .MuiSlider-rail": { opacity: 0.35 },
                "& .MuiSlider-thumb": {
                  bgcolor: "#fff",
                  border: "2px solid #06b6d4",
                  width: 18,
                  height: 18,
                  "&:hover, &.Mui-active": {
                    boxShadow: "0 0 0 6px rgba(6,182,212,0.2)",
                  },
                },
              }}
            />
            <ZoomInRounded sx={{ color: "#94a3b8", fontSize: 18 }} />
          </Stack>
        </Box>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setCropOpen(false)}
            sx={{
              fontFamily: FONT,
              textTransform: "none",
              fontWeight: 700,
              color: "#64748b",
              borderRadius: 999,
              px: 2.5,
              "&:hover": { bgcolor: "rgba(15,23,42,0.04)" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={applyCrop}
            variant="contained"
            startIcon={<CheckRounded />}
            sx={{
              fontFamily: FONT,
              textTransform: "none",
              fontWeight: 800,
              borderRadius: 999,
              px: 3,
              background: GRADIENT,
              boxShadow: "0 10px 24px rgba(30,58,138,0.32)",
              transition: "all .2s ease",
              "&:hover": {
                background: GRADIENT,
                transform: "translateY(-1px)",
                boxShadow: "0 14px 30px rgba(30,58,138,0.42)",
              },
            }}
          >
            Apply crop
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={toast.sev}
          variant="filled"
          sx={{ fontFamily: FONT, fontWeight: 600 }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          px: { xs: 1.5, md: 3 },
          pt: { xs: 1, md: 2 },
        }}
      >
        {/* PAGE HEADER */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3, px: { xs: 1, md: 0 } }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: FONT,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#06b6d4",
              }}
            >
              Account · Settings
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT,
                fontSize: { xs: 26, md: 32 },
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                mt: 0.5,
              }}
            >
              Edit your profile
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 500,
                color: "#64748b",
                mt: 0.5,
              }}
            >
              Keep your public presence up to date.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              px: 2,
              py: 1.25,
              borderRadius: 3,
              bgcolor: "#fff",
              border: "1px solid #eef2f6",
              boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
            }}
          >
            <CompletionRing value={completion} />
            <Box>
              <Typography
                sx={{
                  fontFamily: FONT,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#94a3b8",
                }}
              >
                Profile completion
              </Typography>
              <Typography
                sx={{
                  fontFamily: FONT,
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {completion === 100 ? "All set" : "Keep going"}
              </Typography>
            </Box>
          </Stack>
        </Stack>

        <Box component="form" onSubmit={updateProfile}>
          {/* HERO */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              position: "relative",
              borderRadius: { xs: 4, md: 6 },
              overflow: "hidden",
              mb: { xs: 9, md: 10 },
              border: "1px solid #eef2f6",
              boxShadow: "0 18px 50px rgba(15,23,42,0.08)",
              fontFamily: FONT,
              bgcolor: "#fff",
            }}
          >
            <Box
              sx={{
                position: "relative",
                height: { xs: 200, md: 300 },
                background: coverPreview
                  ? `url(${coverPreview}) center/cover no-repeat`
                  : "linear-gradient(120deg, #0f172a 0%, #1e3a8a 45%, #06b6d4 100%)",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.45) 100%)",
                }}
              />
              <Button
                component="label"
                startIcon={<PhotoCameraRounded />}
                sx={{
                  position: "absolute",
                  bottom: 20,
                  right: 20,
                  bgcolor: "rgba(255,255,255,0.95)",
                  color: "#0f172a",
                  textTransform: "none",
                  fontWeight: 700,
                  fontFamily: FONT,
                  borderRadius: 999,
                  px: 2.25,
                  py: 0.9,
                  fontSize: 13,
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 8px 22px rgba(15,23,42,0.18)",
                  "&:hover": { bgcolor: "#fff" },
                }}
              >
                Change cover
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handlePickCover}
                />
              </Button>

              {/* AVATAR */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: -64,
                  left: { xs: "50%", md: 56 },
                  transform: { xs: "translateX(-50%)", md: "none" },
                }}
              >
                <Box
                  sx={{
                    p: "4px",
                    borderRadius: "50%",
                    background: GRADIENT,
                    boxShadow: "0 18px 36px rgba(15,23,42,0.22)",
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      width: 152,
                      height: 152,
                      borderRadius: "50%",
                      border: "6px solid #fff",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Avatar
                      src={avatarSrc}
                      sx={{
                        width: "100%",
                        height: "100%",
                        fontFamily: FONT,
                        fontWeight: 800,
                        fontSize: 36,
                        bgcolor: "#f1f5f9",
                        color: "#1e3a8a",
                      }}
                    >
                      {(form.name || u?.name || "U").charAt(0).toUpperCase()}
                    </Avatar>
                  </Box>
                  <IconButton
                    component="label"
                    sx={{
                      position: "absolute",
                      bottom: 2,
                      right: 2,
                      background: GRADIENT,
                      color: "#fff",
                      border: "3px solid #fff",
                      boxShadow: "0 8px 18px rgba(30,58,138,0.36)",
                      "&:hover": {
                        background: GRADIENT,
                        transform: "scale(1.06)",
                      },
                    }}
                    size="small"
                  >
                    <CameraAltRounded fontSize="small" />
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={handlePickImage}
                    />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                pt: { xs: 10, md: 3 },
                pb: { xs: 3, md: 3.5 },
                pl: { md: "240px" },
                pr: { xs: 2.5, md: 3 },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "center", md: "flex-start" }}
                justifyContent="space-between"
                spacing={1.5}
              >
                <Box>
                  <Typography
                    sx={{
                      fontFamily: FONT,
                      fontWeight: 900,
                      fontSize: { xs: 22, md: 28 },
                      lineHeight: 1.15,
                      letterSpacing: "-0.01em",
                      background: GRADIENT,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {form.name || u?.name || "Your name"}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    justifyContent={{ xs: "center", md: "flex-start" }}
                    sx={{ mt: 1 }}
                  >
                    {u?.role?.name && (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1.25,
                          py: 0.45,
                          borderRadius: 999,
                          bgcolor: "rgba(6,182,212,0.1)",
                          color: "#0891b2",
                          fontFamily: FONT,
                          fontSize: 11.5,
                          fontWeight: 800,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        <WorkspacePremiumRounded sx={{ fontSize: 14 }} />
                        {u.role.name}
                      </Box>
                    )}
                    {u?.email && (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1.25,
                          py: 0.45,
                          borderRadius: 999,
                          bgcolor: "rgba(34,197,94,0.1)",
                          color: "#16a34a",
                          fontFamily: FONT,
                          fontSize: 11.5,
                          fontWeight: 700,
                        }}
                      >
                        <VerifiedRounded sx={{ fontSize: 14 }} />
                        Verified email
                      </Box>
                    )}
                    {locationLine && (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1.25,
                          py: 0.45,
                          borderRadius: 999,
                          bgcolor: "rgba(244,63,94,0.08)",
                          color: "#e11d48",
                          fontFamily: FONT,
                          fontSize: 11.5,
                          fontWeight: 700,
                        }}
                      >
                        <LocationOnRounded sx={{ fontSize: 14 }} />
                        {locationLine}
                      </Box>
                    )}
                  </Stack>
                </Box>
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    alignItems: "center",
                    gap: 0.85,
                    px: 1.75,
                    py: 0.85,
                    borderRadius: 999,
                    bgcolor: "rgba(15,23,42,0.04)",
                    border: "1px solid #eef2f6",
                    color: "#475569",
                    fontFamily: FONT,
                    fontSize: 12.5,
                    fontWeight: 700,
                  }}
                >
                  <LinkRounded sx={{ fontSize: 16, color: "#06b6d4" }} />
                  {subDomainHost}
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* MAIN GRID */}
          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            {/* LEFT — Basic + Public */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={{ xs: 2.5, md: 3 }}>
                {/* Basic info */}
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    bgcolor: "#fff",
                    border: "1px solid #eef2f6",
                    boxShadow: "0 6px 22px rgba(15,23,42,0.04)",
                    fontFamily: FONT,
                    transition:
                      "transform .3s ease, box-shadow .3s ease, border-color .3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: "#e2e8f0",
                      boxShadow: "0 16px 38px rgba(15,23,42,0.08)",
                    },
                  }}
                >
                  <SectionTitle
                    icon={<PersonRounded />}
                    title="Basic information"
                    subtitle="The essentials that appear across Bayanihan."
                    accent="linear-gradient(135deg, #1e3a8a 0%, #06b6d4 100%)"
                  />
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <FieldLabel required>Full name</FieldLabel>
                      <TextField
                        fullWidth
                        name="name"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={handleField}
                        sx={INPUT_SX}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FieldLabel required>Phone</FieldLabel>
                      <TextField
                        fullWidth
                        name="phone"
                        placeholder="+63…"
                        value={form.phone}
                        onChange={handleField}
                        sx={INPUT_SX}
                        InputProps={{
                          startAdornment: (
                            <PhoneRounded sx={{ mr: 1, fontSize: 20 }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid size={12}>
                      <FieldLabel>Gender</FieldLabel>
                      <Box
                        sx={{
                          display: "flex",
                          p: 0.5,
                          borderRadius: "14px",
                          bgcolor: "#f1f5f9",
                          gap: 0.5,
                        }}
                      >
                        <GenderTab
                          active={form.gender === "male"}
                          onClick={() => {
                            setForm((p) => ({ ...p, gender: "male" }));
                            markDirty();
                          }}
                          icon={<MaleRounded />}
                          label="Male"
                          accent="linear-gradient(135deg, #1e3a8a 0%, #06b6d4 100%)"
                        />
                        <GenderTab
                          active={form.gender === "female"}
                          onClick={() => {
                            setForm((p) => ({ ...p, gender: "female" }));
                            markDirty();
                          }}
                          icon={<FemaleRounded />}
                          label="Female"
                          accent="linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)"
                        />
                        <GenderTab
                          active={!form.gender}
                          onClick={() => {
                            setForm((p) => ({ ...p, gender: "" }));
                            markDirty();
                          }}
                          icon={<RemoveRoundedIcon />}
                          label="Prefer not to say"
                          accent="linear-gradient(135deg, #475569 0%, #94a3b8 100%)"
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Public details */}
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.16,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    bgcolor: "#fff",
                    border: "1px solid #eef2f6",
                    boxShadow: "0 6px 22px rgba(15,23,42,0.04)",
                    fontFamily: FONT,
                    transition:
                      "transform .3s ease, box-shadow .3s ease, border-color .3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: "#e2e8f0",
                      boxShadow: "0 16px 38px rgba(15,23,42,0.08)",
                    },
                  }}
                >
                  <SectionTitle
                    icon={<LinkRounded />}
                    title="Public details"
                    subtitle="How people find and contact you."
                    accent="linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)"
                  />
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel>Personal sub-domain</FieldLabel>
                      <TextField
                        fullWidth
                        name="sub_domain"
                        placeholder="username"
                        value={form.sub_domain}
                        onChange={handleField}
                        sx={INPUT_SX}
                        InputProps={{
                          startAdornment: (
                            <LinkRounded sx={{ mr: 1, fontSize: 20 }} />
                          ),
                        }}
                      />
                      <Typography
                        sx={{
                          fontFamily: FONT,
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#06b6d4",
                          mt: 0.85,
                          ml: 0.5,
                        }}
                      >
                        {subDomainHost}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel>Account email</FieldLabel>
                      <TextField
                        fullWidth
                        disabled
                        value={u?.email || ""}
                        sx={INPUT_SX}
                        InputProps={{
                          startAdornment: (
                            <EmailRounded sx={{ mr: 1, fontSize: 20 }} />
                          ),
                          endAdornment: (
                            <CheckCircleRounded
                              sx={{ color: "#16a34a", fontSize: 20 }}
                            />
                          ),
                        }}
                      />
                      <Typography
                        sx={{
                          fontFamily: FONT,
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#94a3b8",
                          mt: 0.85,
                          ml: 0.5,
                        }}
                      >
                        Email cannot be changed.
                      </Typography>
                    </Grid>
                    <Grid size={12}>
                      <FieldLabel>Facebook</FieldLabel>
                      <TextField
                        fullWidth
                        name="facebook"
                        placeholder="https://facebook.com/your.handle"
                        value={form.facebook}
                        onChange={handleField}
                        sx={INPUT_SX}
                        InputProps={{
                          startAdornment: (
                            <FacebookRounded
                              sx={{ mr: 1, fontSize: 20, color: "#1877f2" }}
                            />
                          ),
                        }}
                      />
                      <Typography
                        sx={{
                          fontFamily: FONT,
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#94a3b8",
                          mt: 0.85,
                          ml: 0.5,
                        }}
                      >
                        Optional — shown on your public profile.
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* About */}
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.24,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    bgcolor: "#fff",
                    border: "1px solid #eef2f6",
                    boxShadow: "0 6px 22px rgba(15,23,42,0.04)",
                    fontFamily: FONT,
                    transition:
                      "transform .3s ease, box-shadow .3s ease, border-color .3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: "#e2e8f0",
                      boxShadow: "0 16px 38px rgba(15,23,42,0.08)",
                    },
                  }}
                >
                  <SectionTitle
                    icon={<EditNoteRounded />}
                    title="About you"
                    subtitle="A short bio shown on your public profile."
                    accent="linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"
                  />
                  <FieldLabel>Bio</FieldLabel>
                  <TextField
                    fullWidth
                    multiline
                    minRows={5}
                    name="about"
                    placeholder="Share a few words about yourself, your community, or what brings you here…"
                    value={form.about}
                    onChange={handleField}
                    sx={INPUT_SX}
                  />
                  <Typography
                    sx={{
                      fontFamily: FONT,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#94a3b8",
                      textAlign: "right",
                      mt: 0.85,
                    }}
                  >
                    {form.about.length} characters
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* RIGHT — Live preview */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                sx={{
                  position: { lg: "sticky" },
                  top: { lg: 24 },
                  p: { xs: 3, md: 3.5 },
                  borderRadius: 4,
                  bgcolor: "#fff",
                  border: "1px solid #eef2f6",
                  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
                  fontFamily: FONT,
                  overflow: "hidden",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FONT,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#94a3b8",
                    mb: 1.5,
                  }}
                >
                  Live preview
                </Typography>

                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 3,
                    overflow: "hidden",
                    border: "1px solid #eef2f6",
                  }}
                >
                  <Box
                    sx={{
                      height: 110,
                      background: coverPreview
                        ? `url(${coverPreview}) center/cover no-repeat`
                        : "linear-gradient(120deg, #0f172a 0%, #1e3a8a 45%, #06b6d4 100%)",
                    }}
                  />
                  <Box sx={{ px: 2.5, pb: 2.5, mt: "-44px" }}>
                    <Box
                      sx={{
                        width: 84,
                        height: 84,
                        borderRadius: "50%",
                        p: "3px",
                        background: GRADIENT,
                        mx: "auto",
                      }}
                    >
                      <Avatar
                        src={avatarSrc}
                        sx={{
                          width: "100%",
                          height: "100%",
                          border: "4px solid #fff",
                          fontFamily: FONT,
                          fontWeight: 800,
                          fontSize: 22,
                          bgcolor: "#f1f5f9",
                          color: "#1e3a8a",
                        }}
                      >
                        {(form.name || u?.name || "U").charAt(0).toUpperCase()}
                      </Avatar>
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: FONT,
                        textAlign: "center",
                        fontWeight: 800,
                        fontSize: 18,
                        color: "#0f172a",
                        mt: 1.25,
                      }}
                    >
                      {form.name || "Your name"}
                    </Typography>
                    {u?.role?.name && (
                      <Typography
                        sx={{
                          fontFamily: FONT,
                          textAlign: "center",
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#06b6d4",
                          mt: 0.25,
                        }}
                      >
                        {u.role.name}
                      </Typography>
                    )}
                    {form.about && (
                      <Typography
                        sx={{
                          fontFamily: FONT,
                          textAlign: "center",
                          fontSize: 13,
                          color: "#475569",
                          mt: 1.25,
                          lineHeight: 1.55,
                        }}
                      >
                        {form.about.length > 140
                          ? form.about.slice(0, 137) + "…"
                          : form.about}
                      </Typography>
                    )}

                    <Stack
                      spacing={1}
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: "1px dashed #e2e8f0",
                      }}
                    >
                      {form.phone && (
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <PhoneRounded
                            sx={{ fontSize: 16, color: "#06b6d4" }}
                          />
                          <Typography
                            sx={{
                              fontFamily: FONT,
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#0f172a",
                            }}
                          >
                            {form.phone}
                          </Typography>
                        </Stack>
                      )}
                      {locationLine && (
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <LocationOnRounded
                            sx={{ fontSize: 16, color: "#e11d48" }}
                          />
                          <Typography
                            sx={{
                              fontFamily: FONT,
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#0f172a",
                            }}
                          >
                            {locationLine}
                          </Typography>
                        </Stack>
                      )}
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LinkRounded sx={{ fontSize: 16, color: "#7c3aed" }} />
                        <Typography
                          sx={{
                            fontFamily: FONT,
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0f172a",
                          }}
                        >
                          {subDomainHost}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Box>

                <Typography
                  sx={{
                    fontFamily: FONT,
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "#94a3b8",
                    textAlign: "center",
                    mt: 2,
                  }}
                >
                  This is roughly how your profile appears to others.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* STICKY SAVE BAR */}
      <Box
        sx={{
          position: "fixed",
          left: { xs: 8, md: "calc(16.6667% + 16px)" },
          right: { xs: 8, md: 16 },
          bottom: { xs: 12, md: 16 },
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          px: { xs: 1.75, md: 2.5 },
          py: { xs: 1.25, md: 1.5 },
          borderRadius: 999,
          bgcolor: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(18px) saturate(180%)",
          WebkitBackdropFilter: "blur(18px) saturate(180%)",
          border: "1px solid rgba(15,23,42,0.06)",
          boxShadow: "0 18px 50px rgba(15,23,42,0.12)",
          pointerEvents: "auto",
        }}
      >
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: dirty ? "#f59e0b" : "#22c55e",
              boxShadow: dirty
                ? "0 0 0 4px rgba(245,158,11,0.18)"
                : "0 0 0 4px rgba(34,197,94,0.18)",
              flexShrink: 0,
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {dirty ? "Unsaved changes" : "All changes saved"}
            </Typography>
            <Typography
              sx={{
                display: { xs: "none", sm: "block" },
                fontFamily: FONT,
                fontSize: 11.5,
                fontWeight: 500,
                color: "#64748b",
                lineHeight: 1.2,
              }}
            >
              {dirty
                ? "Don't forget to save before leaving."
                : "Everything is up to date."}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          {dirty && (
            <Button
              onClick={resetForm}
              sx={{
                fontFamily: FONT,
                textTransform: "none",
                fontWeight: 700,
                color: "#475569",
                borderRadius: 999,
                px: { xs: 1.75, md: 2.25 },
                py: 0.85,
                fontSize: 13,
                display: { xs: isMobile ? "none" : "inline-flex", sm: "inline-flex" },
                "&:hover": { bgcolor: "rgba(15,23,42,0.04)" },
              }}
            >
              Discard
            </Button>
          )}
          <Button
            onClick={updateProfile}
            disabled={submitting || !dirty}
            startIcon={<SaveRounded />}
            sx={{
              fontFamily: FONT,
              textTransform: "none",
              fontWeight: 800,
              fontSize: 14,
              color: "#fff",
              px: { xs: 2.25, md: 3 },
              py: 1.1,
              borderRadius: 999,
              background: GRADIENT,
              boxShadow: "0 12px 28px rgba(30,58,138,0.34)",
              transition: "all .2s ease",
              "&:hover": {
                background: GRADIENT,
                transform:
                  submitting || !dirty ? "none" : "translateY(-1px)",
                boxShadow: "0 16px 36px rgba(30,58,138,0.45)",
              },
              "&.Mui-disabled": {
                background: GRADIENT,
                color: "#fff",
                opacity: 0.55,
              },
            }}
          >
            {submitting ? "Saving…" : "Save changes"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
