"use client";

import { useMemo } from "react";

interface LatLng {
  lat: number;
  lon: number;
}

function parseLatLng(input: unknown): LatLng | null {
  if (input == null) return null;
  if (typeof input === "object") {
    const obj = input as { lat?: unknown; lng?: unknown; lon?: unknown };
    const lat = Number(obj.lat);
    const lon = Number(obj.lng ?? obj.lon);
    if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
  }
  const str = String(input).trim();
  if (!str) return null;
  if (str.startsWith("{")) {
    try {
      const obj = JSON.parse(str);
      const lat = Number(obj.lat);
      const lon = Number(obj.lng ?? obj.lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
    } catch {}
  }
  const parts = str.split(",");
  if (parts.length === 2) {
    const lat = Number(parts[0].trim());
    const lon = Number(parts[1].trim());
    if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
  }
  return null;
}

interface Props {
  geo?: unknown;
  address?: string;
  city?: string;
  country?: string;
  height?: number | string;
  zoom?: number;
}

export default function StaticMap({
  geo,
  address,
  city,
  country,
  height = 260,
  zoom = 15,
}: Props) {
  const pos = useMemo(() => parseLatLng(geo), [geo]);
  const addressLine = useMemo(
    () => [address, city, country].filter(Boolean).join(", "),
    [address, city, country]
  );

  const embedSrc = useMemo(() => {
    // Google Maps embed via `?output=embed` does NOT require an API key.
    // Prefer exact coordinates when available; otherwise fall back to address.
    if (pos) {
      return `https://maps.google.com/maps?q=${pos.lat},${pos.lon}&z=${zoom}&output=embed`;
    }
    if (addressLine) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(
        addressLine
      )}&z=${zoom}&output=embed`;
    }
    return "";
  }, [pos, addressLine, zoom]);

  const hasLocation = !!embedSrc;

  return (
    <div>
      {hasLocation ? (
        <iframe
          title="Location map"
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{
            width: "100%",
            height,
            border: 0,
            borderRadius: 8,
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8fafc",
            border: "1px dashed #cbd5e1",
            color: "#64748b",
            fontSize: 13,
            textAlign: "center",
            padding: 16,
          }}
        >
          No location available for this restaurant.
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 8,
          justifyContent: "flex-end",
        }}
      >
        <a
          href={
            pos
              ? `https://www.google.com/maps/dir/?api=1&destination=${pos.lat},${pos.lon}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  addressLine
                )}`
          }
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: "none",
            background: "#1976d2",
            color: "#fff",
            borderRadius: 16,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Directions
        </a>
        <a
          href={
            pos
              ? `https://www.openstreetmap.org/?mlat=${pos.lat}&mlon=${pos.lon}#map=${zoom}/${pos.lat}/${pos.lon}`
              : `https://www.openstreetmap.org/search?query=${encodeURIComponent(
                  addressLine
                )}`
          }
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: "none",
            background: "#455a64",
            color: "#fff",
            borderRadius: 16,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Open Map
        </a>
      </div>
    </div>
  );
}
