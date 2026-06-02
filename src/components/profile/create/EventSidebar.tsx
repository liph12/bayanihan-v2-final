"use client";
import { useState, type MouseEvent } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Typography,
  Box,
  styled,
  Paper,
  Stack,
  alpha,
  type ButtonProps,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import type { ReactNode, ReactElement } from "react";

export interface EventFields {
  status: string;
  published_date: Dayjs | null;
  event_date: Dayjs | null;
  [key: string]: unknown;
}

const SidebarWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "24px",
  border: "1px solid #f1f5f9",
  boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
  background: "#ffffff",
}));

const ActionButton = styled(Button)<ButtonProps>(() => ({
  borderRadius: "12px",
  textTransform: "none",
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 600,
  padding: "10px 16px",
  fontSize: "0.85rem",
  height: "45px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
}));

function SidebarHeader({
  children,
  icon,
  color = "#6366f1",
}: {
  children: ReactNode;
  icon: ReactElement;
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

interface Props {
  eventFields: EventFields;
  setEventFieldByProperty: (key: string, value: unknown) => void;
  clearForm: () => void;
}

export default function EventSidebar({
  eventFields,
  setEventFieldByProperty,
  clearForm,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleMenuItemClick = (option: string) => {
    setEventFieldByProperty("status", option);
    handleMenuClose();
  };

  const getStatusIcon = (): ReactElement | undefined => {
    if (eventFields.status === "Public")
      return <VisibilityIcon sx={{ fontSize: 18, color: "#10b981" }} />;
    if (eventFields.status === "Private")
      return <VisibilityOffIcon sx={{ fontSize: 18, color: "#f59e0b" }} />;
    return undefined;
  };

  return (
    <Box sx={{ position: "sticky", top: "20px" }}>
      <SidebarWrapper>
        <SidebarHeader
          icon={<RocketLaunchIcon sx={{ fontSize: 20 }} />}
          color="#6366f1"
        >
          Publishing
        </SidebarHeader>

        <Grid container spacing={2}>
          <Grid size={6}>
            <ActionButton
              variant={
                eventFields.status === "Draft" ? "contained" : "outlined"
              }
              color="primary"
              fullWidth
              disableElevation
              onClick={() =>
                setEventFieldByProperty(
                  "status",
                  eventFields.status === "Draft" ? "Public" : "Draft"
                )
              }
            >
              {eventFields.status === "Draft" ? "Saved" : "Save Draft"}
            </ActionButton>
          </Grid>

          <Grid size={6}>
            <ActionButton
              variant="outlined"
              fullWidth
              onClick={handleMenuOpen}
              disabled={eventFields.status === "Draft"}
              startIcon={getStatusIcon()}
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
              {eventFields.status}
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
                    minWidth: "140px",
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
              <MenuItem onClick={() => handleMenuItemClick("Public")}>
                <VisibilityIcon sx={{ fontSize: 18, color: "#10b981" }} /> Public
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick("Private")}>
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
                Schedule Release
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={eventFields.published_date as Dayjs | null}
                  onChange={(dateValue: Dayjs | null) =>
                    setEventFieldByProperty("published_date", dateValue)
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
                  color: "#ef4444",
                  bgcolor: alpha("#ef4444", 0.04),
                },
              }}
            >
              Discard Changes
            </Button>
          </Grid>
        </Grid>
      </SidebarWrapper>
    </Box>
  );
}

// Re-export Dayjs convenience
export { dayjs };
