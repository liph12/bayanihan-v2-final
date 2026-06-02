"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Container,
  useTheme,
  alpha,
  Alert,
  Snackbar,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import AxiosInstance from "@/lib/AxiosInstance";
import {
  DeleteConfirmationDialog,
  EventCard,
  EventSkeletonCard,
  type ValidationEvent,
} from "./EventValidationComponents";

interface EventsApiResponse {
  data?: { events?: ValidationEvent[] };
}

export default function EventValidationContent() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<ValidationEvent[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    eventId: number | string | null;
    eventTitle: string;
  }>({
    open: false,
    eventId: null,
    eventTitle: "",
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error"
  >("success");

  useEffect(() => {
    let cancelled = false;
    const fetchEvents = async () => {
      try {
        const res = await AxiosInstance.get<EventsApiResponse>("events");
        const list = res?.data?.data?.events ?? [];
        if (!cancelled) setEvents(list);
      } catch (e) {
        console.error("Error fetching events:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpenDeleteDialog = useCallback(
    (eventId: number | string, eventTitle: string) => {
      setDeleteDialog({
        open: true,
        eventId,
        eventTitle: eventTitle || "this event",
      });
    },
    []
  );

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const handleDeleteEvent = useCallback(
    async (eventId: number | string): Promise<boolean> => {
      try {
        // Auth header attached automatically by AxiosInstance interceptor;
        // no need to read localStorage manually.
        await AxiosInstance.put(
          `profile/events/${eventId}`,
          { status: "Inactive" },
          { headers: { "Content-Type": "application/json" } }
        );
        setEvents((prev) => prev.filter((event) => event.id !== eventId));
        setSnackbarSeverity("success");
        setSnackbarMessage("Event successfully updated!");
        setSnackbarOpen(true);
        return true;
      } catch (error) {
        console.error("Error deleting event:", error);
        setSnackbarSeverity("error");
        setSnackbarMessage("Failed to update event. Please try again.");
        setSnackbarOpen(true);
        return false;
      }
    },
    []
  );

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        eventId={deleteDialog.eventId}
        eventTitle={deleteDialog.eventTitle}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteEvent}
      />

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(145deg, ${alpha(
            theme.palette.primary.light,
            0.2
          )}, ${alpha(theme.palette.primary.dark, 0.05)})`,
          backdropFilter: "blur(10px)",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          align="center"
          sx={{
            fontWeight: 800,
            letterSpacing: -0.5,
            color: theme.palette.text.primary,
            position: "relative",
            display: "inline-block",
            left: "50%",
            transform: "translateX(-50%)",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -8,
              left: "25%",
              width: "50%",
              height: 4,
              borderRadius: 2,
              backgroundColor: theme.palette.primary.main,
            },
          }}
        >
          Event Validation
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {loading ? (
          Array.from(new Array(6)).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`skeleton-${index}`}>
              <EventSkeletonCard />
            </Grid>
          ))
        ) : events.length > 0 ? (
          events.map((event, index) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={event.id ?? `event-${index}`}
            >
              <EventCard
                event={event}
                onRequestDelete={handleOpenDeleteDialog}
              />
            </Grid>
          ))
        ) : (
          <Grid size={12}>
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: 3,
                border: `1px dashed ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.background.default, 0.6),
              }}
            >
              <Box
                component="img"
                src="/no-events.jpg"
                alt="No events"
                sx={{ mb: 3, opacity: 0.6, maxWidth: 200 }}
              />
              <Typography variant="h6" gutterBottom>
                No events found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create new events to see them listed here
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
