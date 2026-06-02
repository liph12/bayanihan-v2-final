"use client";
import { Box, Typography, Chip, Divider } from "@mui/material";
import Link from "next/link";
import { slugifyTitle } from "@/lib/newsHelpers";
import type { NewsArticle } from "@/types";

function shortenText(text: string | string[] | undefined, size = 25): string {
  if (!text) return "";
  const flat = Array.isArray(text) ? text.join(" ") : text;
  return flat.length > size ? `${flat.slice(0, size)}...` : flat;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function CardNews({
  slug,
  title,
  summary,
  date,
  image_url,
  category,
  country,
  views_count,
}: NewsArticle) {
  const viewSlug = slug || slugifyTitle(title || "");
  return (
    <Box
      component={Link}
      href={`/news/${viewSlug}`}
      sx={{
        display: { xs: "block", md: "flex" },
        gap: 3,
        my: { xs: 2, md: 3 },
        textDecoration: "none",
      }}
    >
      <Box sx={{ mb: { xs: 1.25, md: 0 }, flexShrink: 0 }}>
        {image_url && (
          <Box
            component="img"
            src={image_url}
            alt={title || "News"}
            sx={{
              width: { xs: "100%", md: 300 },
              height: { xs: 180, md: 150 },
              objectFit: "cover",
              borderRadius: 2,
              display: "block",
            }}
          />
        )}
      </Box>
      <Box>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontFamily: "var(--font-urbanist)",
            fontWeight: 700,
            color: "#000",
            fontSize: { xs: 16, md: 18 },
            lineHeight: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            ":hover": { color: "info.main" },
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-outfit)",
            color: "text.secondary",
            fontSize: { xs: 14, md: 16 },
            mt: 0.25,
            display: "-webkit-box",
            WebkitLineClamp: { xs: 3, md: 2 },
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            ":hover": { color: "info.main" },
          }}
        >
          {shortenText(summary, 240)}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            rowGap: 0.5,
            columnGap: 1,
            mt: 1.25,
            alignItems: "center",
          }}
        >
          {category && (
            <Chip
              label={category}
              color="info"
              variant="outlined"
              size="small"
            />
          )}
          <Divider
            orientation="vertical"
            sx={{ height: 18, display: { xs: "none", md: "block" } }}
          />
          <Typography
            variant="body2"
            color="GrayText"
            component="div"
            sx={{
              fontFamily: "var(--font-outfit)",
              fontSize: { xs: 12, md: 14 },
            }}
          >
            {formatDate(date)}
          </Typography>
          {country && (
            <>
              <Divider
                orientation="vertical"
                sx={{ height: 18, display: { xs: "none", md: "block" } }}
              />
              <Typography
                variant="body2"
                color="GrayText"
                component="div"
                sx={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: { xs: 12, md: 14 },
                }}
              >
                {country}
              </Typography>
            </>
          )}
          {typeof views_count === "number" && (
            <>
              <Divider
                orientation="vertical"
                sx={{ height: 18, display: { xs: "none", md: "block" } }}
              />
              <Typography
                variant="body2"
                color="GrayText"
                component="div"
                sx={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: { xs: 12, md: 14 },
                }}
              >
                <b>{views_count}</b> Views
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
