"use client";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { OpenInBrowser } from "@mui/icons-material";
import type { ReactElement } from "react";
import type { BayanihanEvent } from "@/types";

dayjs.extend(customParseFormat);

export type EventStatus = "ended" | "ongoing" | "upcoming";

export interface CalendarEventResource extends BayanihanEvent {
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  organizer?: string;
  organizerEmail?: string;
  organizerMobile?: string;
  publishedDate?: string;
  logo?: string;
}

export interface CalendarEvent {
  id?: string | number;
  title?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  desc?: string;
  location?: string;
  status: EventStatus;
  eventUrl?: string;
  resource: CalendarEventResource;
}

export interface StatusInfo {
  label: string;
  icon: ReactElement;
  color: string;
}

export const statusColors: Record<EventStatus, string> = {
  ended: "#9e9e9e",
  ongoing: "#4caf50",
  upcoming: "#2196f3",
};

export const timeRangeFormat = ({ start, end }: { start: Date; end: Date }) =>
  `${dayjs(start).format("hh:mm A")} - ${dayjs(end).format("hh:mm A")}`;

export const dayFormat = (date: Date) =>
  dayjs(date).format("ddd, MMM DD");

export const calendarStyles = {
  ".rbc-calendar": {
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    borderRadius: "12px",
    padding: "16px",
    backgroundColor: "#fff",
  },
  ".rbc-toolbar": { marginBottom: "20px" },
  ".rbc-toolbar button": { borderRadius: "8px", fontWeight: 500 },
  ".rbc-btn-group button:focus": { outline: "none" },
  ".rbc-header": { padding: "10px 0", fontWeight: 600 },
  ".rbc-event": { borderRadius: "6px", padding: "4px 8px", border: "none" },
  ".rbc-today": { backgroundColor: "rgba(66, 133, 244, 0.06)" },
  ".rbc-off-range-bg": { backgroundColor: "#f9f9f9" },
  ".rbc-agenda-view": { margin: "10px 0" },
  ".rbc-agenda-table": {
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #e0e0e0",
  },
  ".rbc-agenda-table th": {
    backgroundColor: "#f5f5f5",
    padding: "10px",
    fontWeight: 600,
  },
  ".rbc-agenda-time-cell": { padding: "10px", whiteSpace: "nowrap" },
  ".rbc-agenda-date-cell": { padding: "10px", fontWeight: 500 },
  ".rbc-agenda-event-cell": {
    padding: "10px",
    backgroundColor: "transparent !important",
  },
  ".rbc-show-more": {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    color: "#333",
    fontWeight: 500,
    borderRadius: "4px",
    padding: "2px 8px",
  },
};

export function EventComponent({ event }: { event: CalendarEvent }) {
  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2">{event.title}</Typography>
          {event.location && (
            <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
              <LocationOnIcon
                fontSize="inherit"
                sx={{ verticalAlign: "text-top", mr: 0.5 }}
              />
              {event.location}
            </Typography>
          )}
          <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
            <AccessTimeIcon
              fontSize="inherit"
              sx={{ verticalAlign: "text-top", mr: 0.5 }}
            />
            {dayjs(event.start).format("hh:mm A")} -{" "}
            {dayjs(event.end).format("hh:mm A")}
          </Typography>
        </Box>
      }
      arrow
    >
      <Box
        className="event-item"
        sx={{
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          cursor: "pointer",
        }}
      >
        <Typography
          variant="subtitle2"
          noWrap
          fontSize="0.85rem"
          fontWeight={600}
        >
          {event.title}
        </Typography>
        {event.location && (
          <Typography
            variant="caption"
            noWrap
            fontSize="0.60rem"
            sx={{ display: "flex", alignItems: "center", gap: "2px" }}
          >
            <LocationOnIcon fontSize="inherit" />
            {event.location}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}

export function EmptyCalendar() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="500px"
      gap={2}
      sx={{ backgroundColor: "#fff" }}
    >
      <CalendarTodayIcon color="disabled" sx={{ fontSize: 60 }} />
      <Typography variant="h6" color="text.secondary">
        No events found
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Your calendar is empty for this period
      </Typography>
    </Box>
  );
}

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  getStatusInfo: (status: EventStatus) => StatusInfo;
}

export function EventDialog({
  open,
  onClose,
  event,
  getStatusInfo,
}: EventDialogProps) {
  if (!event) return null;
  const statusColor = statusColors[event.status] || statusColors.upcoming;
  const statusInfo = getStatusInfo(event.status);
  const subdomainName = event.resource?.subDomain?.name;
  const organizer =
    typeof event.resource?.organizer === "string"
      ? event.resource.organizer
      : "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: { borderRadius: "12px", overflow: "hidden" },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: statusColor,
          color: "#fff",
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6">{event.title}</Typography>
          {subdomainName && (
            <Box sx={{ display: "flex", gap: 2, alignItems: "end" }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<OpenInBrowser />}
                component="a"
                href={`https://${subdomainName}.bayanihan.com`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textTransform: "none", mt: 1 }}
              >
                Open Event Link
              </Button>
            </Box>
          )}
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#fff" }} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {event.resource.logo && event.resource.image && (
          <Box
            sx={{
              width: "100%",
              height: 200,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.resource.image}
              alt={event.title || "Event"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: "brightness(0.7)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                padding: "4px 12px",
                borderTopLeftRadius: "8px",
                backgroundColor: statusColor,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {statusInfo.icon}
              <Typography variant="caption" fontWeight="bold">
                {statusInfo.label}
              </Typography>
            </Box>
          </Box>
        )}

        <Box p={3}>
          {event.desc && (
            <Box mb={3}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <InfoOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Details
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  whiteSpace: "pre-line",
                  maxHeight: "200px",
                  overflowY: "auto",
                  px: 1,
                }}
              >
                {event.desc}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Box mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTimeIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                Date & Time
              </Typography>
            </Box>
            <Box pl={4} mt={1}>
              <Typography variant="body2" color="text.secondary">
                {dayjs(event.start).format("dddd, MMMM DD, YYYY")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dayjs(event.start).format("hh:mm A")} -{" "}
                {dayjs(event.end).format("hh:mm A")}
              </Typography>
            </Box>
          </Box>

          {event.location && (
            <Box mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOnIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Location
                </Typography>
              </Box>
              <Box pl={4} mt={1}>
                <Typography variant="body2" color="text.secondary">
                  {event.location}
                </Typography>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Box mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                Organizer
              </Typography>
            </Box>
            <Box pl={4} mt={1}>
              {organizer && (
                <Typography variant="body2" color="text.secondary">
                  {organizer}
                </Typography>
              )}
              {event.resource.organizerEmail && (
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {event.resource.organizerEmail}
                  </Typography>
                </Box>
              )}
              {event.resource.organizerMobile &&
                event.resource.organizerMobile !== "-" && (
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {event.resource.organizerMobile}
                    </Typography>
                  </Box>
                )}
            </Box>
          </Box>

          {event.resource.publishedDate && (
            <Box mb={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarTodayIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Published
                </Typography>
              </Box>
              <Box pl={4} mt={1}>
                <Typography variant="body2" color="text.secondary">
                  {event.resource.publishedDate}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "center" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
          sx={{ borderRadius: "8px", textTransform: "none", px: 4 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
