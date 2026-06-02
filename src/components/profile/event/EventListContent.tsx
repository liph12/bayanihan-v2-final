"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  InputBase,
  IconButton,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Typography,
  Chip,
  Tooltip,
  Avatar,
  Stack,
  Skeleton,
  Button,
  TablePagination,
} from "@mui/material";
import Link from "next/link";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import VisibilityTwoToneIcon from "@mui/icons-material/VisibilityTwoTone";
import EventIcon from "@mui/icons-material/Event";
import PeopleAltTwoToneIcon from "@mui/icons-material/PeopleAltTwoTone";
import AxiosInstance from "@/lib/AxiosInstance";

interface ProfileEvent {
  id?: string | number;
  slug?: string;
  title?: string;
  eventDate?: string;
  participantsCount?: number;
  image?: string;
  subDomain?: { name?: string };
}

interface EventsApiResponse {
  data?: {
    events?: ProfileEvent[];
  };
  events?: ProfileEvent[];
}

function formatEventDate(d?: string): string {
  if (!d) return "TBA";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function EventListContent() {
  const [events, setEvents] = useState<ProfileEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    let cancelled = false;
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await AxiosInstance.get<EventsApiResponse>("profile/events");
        const list = resp?.data?.data?.events ?? resp?.data?.events ?? [];
        if (!cancelled) setEvents(list);
      } catch (e) {
        if (!cancelled) {
          console.error("Error fetching events", e);
          const msg = e instanceof Error ? e.message : "Failed to load events.";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return events;
    return events.filter((ev) =>
      (ev.title || "").toLowerCase().includes(q)
    );
  }, [events, searchQuery]);

  const pagedEvents = useMemo(
    () =>
      filteredEvents.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [filteredEvents, page, rowsPerPage]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, fontFamily: "'Outfit', sans-serif" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "#1B254B",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Your Events
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            {loading
              ? "Loading events…"
              : error
              ? "Unable to load events."
              : `${filteredEvents.length} of ${events.length} ${
                  events.length === 1 ? "event" : "events"
                }`}
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/profile/create-event"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            px: 3,
            py: 1.25,
            bgcolor: "#4318FF",
            "&:hover": { bgcolor: "#3014D6" },
          }}
        >
          Create Event
        </Button>
      </Stack>

      {/* SEARCH */}
      <Paper
        elevation={0}
        sx={{
          p: "4px 12px",
          display: "flex",
          alignItems: "center",
          borderRadius: "12px",
          backgroundColor: "#F4F7FE",
          border: "1px solid #E0E5F2",
          mb: 3,
          transition: "0.3s",
          "&:focus-within": {
            borderColor: "#4318FF",
            backgroundColor: "#fff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          },
        }}
      >
        <SearchIcon sx={{ color: "#A3AED0", mr: 1 }} />
        <InputBase
          sx={{ ml: 1, flex: 1, fontWeight: 500, fontSize: "0.9rem" }}
          placeholder="Search for event title…"
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
          value={searchQuery}
        />
        {loading && <CircularProgress size={18} sx={{ mr: 1 }} />}
        {searchQuery && (
          <IconButton
            size="small"
            onClick={() => setSearchQuery("")}
            color="error"
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Paper>

      {error ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: "15px",
            border: "1px solid #fee2e2",
            bgcolor: "#fef2f2",
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "#991b1b", fontWeight: 700 }}>
            Failed to load events
          </Typography>
          <Typography sx={{ color: "#7f1d1d", fontSize: 14, mt: 0.5 }}>
            {error}
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "15px",
              border: "1px solid #E0E5F2",
              overflow: "hidden",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      bgcolor: "#F8FAFF",
                      fontWeight: 700,
                      color: "#A3AED0",
                    }}
                  >
                    Event Title
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "#F8FAFF",
                      fontWeight: 700,
                      color: "#A3AED0",
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "#F8FAFF",
                      fontWeight: 700,
                      color: "#A3AED0",
                    }}
                  >
                    Participants
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      bgcolor: "#F8FAFF",
                      fontWeight: 700,
                      color: "#A3AED0",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Skeleton variant="rounded" width={40} height={40} />
                          <Skeleton width={220} />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Skeleton width={100} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={60} />
                      </TableCell>
                      <TableCell align="center">
                        <Skeleton width={80} sx={{ mx: "auto" }} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : pagedEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                      <Typography color="textSecondary" variant="body1">
                        {events.length === 0
                          ? "You haven't created any events yet."
                          : "No events match your search."}
                      </Typography>
                      {events.length === 0 && (
                        <Button
                          component={Link}
                          href="/profile/create-event"
                          variant="contained"
                          startIcon={<AddIcon />}
                          sx={{
                            mt: 2,
                            textTransform: "none",
                            borderRadius: 2,
                            bgcolor: "#4318FF",
                            "&:hover": { bgcolor: "#3014D6" },
                          }}
                        >
                          Create your first event
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedEvents.map((event) => {
                    const viewSlug =
                      event.subDomain?.name || event.slug || "";
                    return (
                      <TableRow
                        key={event.id ?? viewSlug}
                        sx={{
                          "&:hover": { bgcolor: "#F4F7FE80" },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Avatar
                              variant="rounded"
                              src={event.image}
                              sx={{
                                bgcolor: "#E9EDF7",
                                color: "#4318FF",
                                width: 40,
                                height: 40,
                                fontSize: "1rem",
                              }}
                            >
                              <EventIcon fontSize="small" />
                            </Avatar>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#1B254B" }}
                            >
                              {event.title || "(Untitled)"}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ fontWeight: 500 }}
                          >
                            {formatEventDate(event.eventDate)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            icon={
                              <PeopleAltTwoToneIcon
                                style={{ fontSize: 16 }}
                              />
                            }
                            label={event.participantsCount ?? 0}
                            size="small"
                            sx={{
                              bgcolor: "#E2E8F0",
                              fontWeight: 700,
                              color: "#2D3748",
                              borderRadius: "6px",
                            }}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                          >
                            <Tooltip title="Edit Event">
                              <span>
                                <IconButton
                                  size="small"
                                  component={Link}
                                  href={`/events/editting/${event.id ?? ""}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  disabled={!event.id}
                                  sx={{
                                    color: "#4318FF",
                                    bgcolor: "#F4F7FE",
                                    "&:hover": { bgcolor: "#E9EDF7" },
                                  }}
                                >
                                  <EditTwoToneIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title="View Live">
                              <span>
                                <IconButton
                                  size="small"
                                  component={Link}
                                  href={`/${viewSlug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  disabled={!viewSlug}
                                  sx={{
                                    color: "#05CD99",
                                    bgcolor: "#E6FAF5",
                                    "&:hover": { bgcolor: "#D1F7ED" },
                                  }}
                                >
                                  <VisibilityTwoToneIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {!loading && filteredEvents.length > 0 && (
            <TablePagination
              component="div"
              count={filteredEvents.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{ mt: 1 }}
            />
          )}
        </>
      )}
    </Box>
  );
}
