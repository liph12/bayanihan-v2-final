"use client";
import { useMemo, useState } from "react";
import { Box, Typography, Paper, useMediaQuery, Chip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import ScheduleIcon from "@mui/icons-material/Schedule";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { eventUrl } from "@/lib/eventUrl";
import {
  calendarStyles,
  EmptyCalendar,
  EventComponent,
  EventDialog,
  statusColors,
  type CalendarEvent,
  type CalendarEventResource,
  type EventStatus,
  type StatusInfo,
} from "./calendar-helpers";

dayjs.extend(customParseFormat);
const localizer = dayjsLocalizer(dayjs);

interface GlobalCalendarContentProps {
  initialEvents: CalendarEventResource[];
}

export default function GlobalCalendarContent({
  initialEvents,
}: GlobalCalendarContentProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState(false);

  const events: CalendarEvent[] = useMemo(() => {
    const now = dayjs();
    return initialEvents.map((event) => {
      const { eventDate, startTime, endTime } = event;
      const startDateTime = startTime
        ? dayjs(
            `${eventDate} ${startTime}`,
            "MMMM DD, YYYY hh:mm A"
          ).toDate()
        : dayjs(eventDate, "MMMM DD, YYYY").toDate();
      const endDateTime = endTime
        ? dayjs(
            `${eventDate} ${endTime}`,
            "MMMM DD, YYYY hh:mm A"
          ).toDate()
        : dayjs(startDateTime).add(1, "hour").toDate();

      let status: EventStatus = "upcoming";
      if (dayjs(endDateTime).isBefore(now)) {
        status = "ended";
      } else if (
        dayjs(startDateTime).isBefore(now) &&
        dayjs(endDateTime).isAfter(now)
      ) {
        status = "ongoing";
      }

      return {
        id: event.id,
        title: event.title,
        start: startDateTime,
        end: endDateTime,
        allDay: !startTime || !endTime,
        desc: event.description,
        location: event.location,
        status,
        // Same-origin path (/<slug>) served by the [slug] route — not a
        // <slug>.bayanihan.com subdomain, which doesn't resolve.
        eventUrl: eventUrl(event) || undefined,
        resource: event,
      };
    });
  }, [initialEvents]);

  const getStatusInfo = (status: EventStatus): StatusInfo => {
    switch (status) {
      case "ended":
        return {
          label: "Ended",
          icon: <CheckCircleIcon fontSize="small" />,
          color: statusColors.ended,
        };
      case "ongoing":
        return {
          label: "Ongoing",
          icon: <PendingIcon fontSize="small" />,
          color: statusColors.ongoing,
        };
      case "upcoming":
      default:
        return {
          label: "Upcoming",
          icon: <ScheduleIcon fontSize="small" />,
          color: statusColors.upcoming,
        };
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setOpenDialog(true);
  };

  const AgendaEvent = ({ event }: { event: CalendarEvent }) => {
    const statusInfo = getStatusInfo(event.status);
    return (
      <Box
        onClick={() => handleEventClick(event)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          borderLeft: `4px solid ${statusInfo.color}`,
          pl: 1,
        }}
      >
        <Typography variant="body2" fontWeight={500}>
          {event.title}
        </Typography>
        <Chip
          icon={statusInfo.icon}
          label={statusInfo.label}
          size="small"
          sx={{
            height: 24,
            ml: "auto",
            backgroundColor: "rgba(0,0,0,0.05)",
          }}
        />
      </Box>
    );
  };

  // react-big-calendar's agenda.date/time component types are strict;
  // the formats prop below covers the same intent without custom components.
  const components = {
    event: EventComponent,
    agenda: { event: AgendaEvent },
  };

  return (
    <Box
      component="section"
      sx={{ width: { xs: "98%", lg: "96%" }, maxWidth: 1600, mx: "auto", py: 3 }}
    >
      <Typography
        component="h1"
        sx={{
          fontFamily: "var(--font-urbanist)",
          fontWeight: 800,
          fontSize: { xs: 26, md: 36 },
          mb: 2,
        }}
      >
        Global Calendar — Filipino Events Worldwide
      </Typography>

      <Paper elevation={0} sx={{ borderRadius: "12px", overflow: "hidden" }}>
        {events.length === 0 ? (
          <EmptyCalendar />
        ) : (
          <Box sx={calendarStyles}>
            <Box
              sx={{
                display: "flex",
                gap: 3,
                justifyContent: "flex-end",
                mb: 2,
                flexWrap: "wrap",
                mt: 2,
              }}
            >
              {(Object.entries(statusColors) as [EventStatus, string][]).map(
                ([status, color]) => (
                  <Box
                    key={status}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: color,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {status}
                    </Typography>
                  </Box>
                )
              )}
            </Box>

            <Calendar<CalendarEvent>
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: isMobile ? 950 : 850 }}
              components={components}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor:
                    statusColors[event.status] || statusColors.upcoming,
                },
              })}
              dayPropGetter={(date) => ({
                style: {
                  backgroundColor: dayjs(date).isSame(dayjs(), "day")
                    ? "rgba(66, 133, 244, 0.1)"
                    : undefined,
                },
              })}
              onSelectEvent={handleEventClick}
              popup
              formats={{
                agendaDateFormat: "ddd MMM DD",
                agendaTimeFormat: "hh:mm A",
              }}
              popupOffset={{ x: 0, y: 10 }}
              length={30}
              drilldownView="day"
            />
          </Box>
        )}

        <EventDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          event={selectedEvent}
          getStatusInfo={getStatusInfo}
        />
      </Paper>

      {/* Bot-readable plain-text event list — react-big-calendar renders an
          interactive grid that doesn't expose all event titles in the DOM up
          front. We surface the same events as a hidden semantic list so search
          engines can still index them. */}
      {events.length > 0 && (
        <Box component="ul" sx={{ position: "absolute", left: -10000, top: "auto", width: 1, height: 1, overflow: "hidden" }}>
          {events.map((ev) => (
            <Box component="li" key={String(ev.id)}>
              {ev.title} — {dayjs(ev.start).format("MMMM DD, YYYY")}
              {ev.location ? ` — ${ev.location}` : ""}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
