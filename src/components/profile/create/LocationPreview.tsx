"use client";
import { useMemo, useState } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";

interface Coords {
  lat: number;
  lng: number;
}

interface LocationPreviewProps {
  /** JSON string like '{"lat":..,"lng":..}' OR "lat,lng" OR null. */
  value: string;
  country?: string;
  city?: string;
  address?: string;
  onChange: (next: {
    lat: number;
    lon: number;
    address?: string;
    city?: string;
    country?: string;
  }) => void;
  height?: number;
}

function parseLatLng(input: string | null | undefined): Coords | null {
  if (!input) return null;
  const str = String(input).trim();
  if (!str) return null;
  if (str.startsWith("{")) {
    try {
      const obj = JSON.parse(str);
      const lat = Number(obj.lat);
      const lng = Number(obj.lng ?? obj.lon);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    } catch {}
  }
  const parts = str.split(",");
  if (parts.length === 2) {
    const lat = Number(parts[0].trim());
    const lng = Number(parts[1].trim());
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  return null;
}

export default function LocationPreview({
  value,
  country,
  city,
  address,
  onChange,
  height = 280,
}: LocationPreviewProps) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coords = useMemo(() => parseLatLng(value), [value]);

  const queryParts = [address, city, country].filter(Boolean).join(", ");
  const mapSrc = useMemo(() => {
    if (coords) {
      return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`;
    }
    if (queryParts) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(
        queryParts
      )}&z=14&output=embed`;
    }
    return `https://maps.google.com/maps?q=Philippines&z=5&output=embed`;
  }, [coords, queryParts]);

  const openInMaps = () => {
    const url = coords
      ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          queryParts || "Philippines"
        )}`;
    if (typeof window !== "undefined") window.open(url, "_blank", "noopener");
  };

  const useCurrent = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not available in this browser.");
      return;
    }
    setError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        setError(err.message || "Unable to get your location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
    );
  };

  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height,
          borderRadius: "14px",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          background: "#f1f5f9",
        }}
      >
        <iframe
          title="Location preview"
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0, display: "block" }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        {coords && (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.25,
              py: 0.5,
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(15,23,42,0.08)",
              boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
              fontFamily: "'Outfit', sans-serif",
              fontSize: 11.5,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            <PlaceRoundedIcon sx={{ fontSize: 13, color: "#ef4444" }} />
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          mt: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#64748b",
            fontFamily: "'Outfit', sans-serif",
            fontSize: 12,
          }}
        >
          {error
            ? error
            : coords
            ? "Tip: Fine-tune coordinates by clicking 'Use current location'."
            : "Enter address/city/country and the preview will update."}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            onClick={openInMaps}
            startIcon={<OpenInNewRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{
              textTransform: "none",
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#64748b",
              borderRadius: 10,
              "&:hover": { bgcolor: "#f1f5f9", color: "#334155" },
            }}
          >
            Open
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={useCurrent}
            disabled={locating}
            startIcon={
              locating ? (
                <CircularProgress size={12} sx={{ color: "#fff" }} />
              ) : (
                <MyLocationRoundedIcon sx={{ fontSize: 14 }} />
              )
            }
            sx={{
              textTransform: "none",
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.78rem",
              fontWeight: 700,
              borderRadius: 10,
              bgcolor: "#6366f1",
              boxShadow: "0 4px 12px rgba(99,102,241,0.25)",
              "&:hover": { bgcolor: "#4f46e5" },
            }}
          >
            Use my location
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
