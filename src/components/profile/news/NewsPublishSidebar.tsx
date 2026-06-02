"use client";
import { useState, type ReactNode } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Typography,
  Box,
  Paper,
  Stack,
  styled,
  alpha,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LinkIcon from "@mui/icons-material/Link";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";

export interface NewsFields {
  title: string;
  category: string;
  country: string;
  visibility: "public" | "private";
  publication_date: Dayjs | null;
  image: File | null;
  tags: string;
  status: "draft" | "published";
}

interface NewsPublishSidebarProps {
  newsFields: NewsFields;
  setNewsFieldByProperty: <K extends keyof NewsFields>(
    key: K,
    value: NewsFields[K]
  ) => void;
  error?: ReactNode;
  clearForm: () => void;
}

const SidebarWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "24px",
  border: "1px solid #f1f5f9",
  boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
  background: "#ffffff",
  marginBottom: theme.spacing(3),
}));

const ActionButton = styled(Button)({
  borderRadius: "12px",
  textTransform: "none",
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 600,
  padding: "10px 16px",
  fontSize: "0.85rem",
  height: 45,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
});

function SidebarHeader({
  children,
  icon,
  color = "#0ea5e9",
}: {
  children: ReactNode;
  icon: ReactNode;
  color?: string;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{ mb: 3, pb: 2, borderBottom: "2px solid #f8fafc" }}
    >
      <Box
        sx={{
          p: 1,
          borderRadius: "10px",
          bgcolor: alpha(color, 0.1),
          color,
          display: "flex",
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          color: "#1e293b",
          fontSize: "1.1rem",
        }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewsPublishSidebar({
  newsFields,
  setNewsFieldByProperty,
  error,
  clearForm,
}: NewsPublishSidebarProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleMenuItemClick = (option: "public" | "private") => {
    setNewsFieldByProperty("visibility", option);
    handleMenuClose();
  };

  const getVisibilityIcon = () => {
    if (newsFields.visibility === "public") {
      return <VisibilityIcon sx={{ fontSize: 18, color: "#10b981" }} />;
    }
    if (newsFields.visibility === "private") {
      return <VisibilityOffIcon sx={{ fontSize: 18, color: "#f59e0b" }} />;
    }
    return null;
  };

  const visibilityLabel =
    newsFields.visibility === "private" ? "Private" : "Public";
  const isDraft = newsFields.status === "draft";

  const slug = newsFields.title ? slugify(newsFields.title) : "";
  const previewLink = slug ? `/news/${slug}` : "";

  return (
    <Box sx={{ position: "sticky", top: 20 }}>
      <SidebarWrapper>
        <SidebarHeader
          icon={<RocketLaunchIcon sx={{ fontSize: 20 }} />}
          color="#0ea5e9"
        >
          Publishing
        </SidebarHeader>

        <Grid container spacing={2}>
          <Grid size={6}>
            <ActionButton
              variant={isDraft ? "contained" : "outlined"}
              color="primary"
              fullWidth
              disableElevation
              onClick={() =>
                setNewsFieldByProperty(
                  "status",
                  isDraft ? "published" : "draft"
                )
              }
            >
              {isDraft ? "Saved" : "Save Draft"}
            </ActionButton>
          </Grid>

          <Grid size={6}>
            <ActionButton
              variant="outlined"
              fullWidth
              onClick={handleMenuOpen}
              disabled={isDraft}
              startIcon={getVisibilityIcon()}
              endIcon={
                <ArrowDropDownIcon sx={{ ml: -0.5, color: "#94a3b8" }} />
              }
              sx={{
                borderColor: "#e2e8f0",
                color: "#475569",
                px: 1,
                "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                "& .MuiButton-startIcon": { marginRight: "4px" },
              }}
            >
              {visibilityLabel}
            </ActionButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: "12px",
                    mt: 1,
                    minWidth: 140,
                    boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                    "& .MuiMenuItem-root": {
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "0.9rem",
                      gap: 1.5,
                      py: 1.2,
                    },
                  },
                },
              }}
            >
              <MenuItem onClick={() => handleMenuItemClick("public")}>
                <VisibilityIcon sx={{ fontSize: 18, color: "#10b981" }} /> Public
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick("private")}>
                <VisibilityOffIcon sx={{ fontSize: 18, color: "#f59e0b" }} />{" "}
                Private
              </MenuItem>
            </Menu>
          </Grid>

          <Grid size={12}>
            <Box sx={{ mt: 1 }}>
              <Typography
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  mb: 1,
                  ml: 0.5,
                }}
              >
                Publication Date
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={newsFields.publication_date}
                  onChange={(d) =>
                    setNewsFieldByProperty("publication_date", d)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          fontFamily: "'Outfit', sans-serif",
                          bgcolor: "#fcfdfe",
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
              {error}
            </Box>
          </Grid>

          <Grid size={12} sx={{ mt: 1 }}>
            <Button
              fullWidth
              startIcon={<DeleteOutlineIcon />}
              onClick={clearForm}
              sx={{
                color: "#94a3b8",
                fontFamily: "'Outfit', sans-serif",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.85rem",
                py: 1,
                borderRadius: "10px",
                "&:hover": {
                  color: "#475569",
                  bgcolor: alpha("#475569", 0.04),
                },
              }}
            >
              Discard Changes
            </Button>
          </Grid>
        </Grid>
      </SidebarWrapper>

      <SidebarWrapper>
        <SidebarHeader
          icon={<LinkIcon sx={{ fontSize: 20 }} />}
          color="#10b981"
        >
          News Link
        </SidebarHeader>
        <Typography
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            mb: 1,
            ml: 0.5,
          }}
        >
          Generated from title
        </Typography>
        <Box
          sx={{
            p: 1.5,
            borderRadius: "12px",
            bgcolor: "#fcfdfe",
            border: "1px dashed #cbd5e1",
            wordBreak: "break-all",
            minHeight: 48,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'JetBrains Mono', 'Outfit', monospace",
              fontSize: "0.85rem",
              color: previewLink ? "#0ea5e9" : "#94a3b8",
              fontStyle: previewLink ? "normal" : "italic",
            }}
          >
            {previewLink || "Enter a title to generate the news link..."}
          </Typography>
        </Box>
      </SidebarWrapper>
    </Box>
  );
}
