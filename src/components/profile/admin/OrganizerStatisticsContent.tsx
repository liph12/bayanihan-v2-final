"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import type { SelectChangeEvent } from "@mui/material/Select";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ClearIcon from "@mui/icons-material/Clear";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import PublicIcon from "@mui/icons-material/Public";
import ViewIcon from "@mui/icons-material/Visibility";
import dayjs, { type Dayjs } from "dayjs";
import AxiosInstance from "@/lib/AxiosInstance";
import {
  filterEventsByDateRange,
  processOrganizerStats,
  getCountryName,
  getCountryFlag,
  type OrgStatsEvent,
  type DialogType,
  type DialogOrganizer,
  type DialogParticipantEvent,
  type DialogCountry,
  type TotalStats,
  type CountryRollup,
} from "./OrganizerStatisticsHelpers";
import OrganizerStatisticsDisplay from "./OrganizerStatisticsDisplay";
import OrganizerStatisticsDialog from "./OrganizerStatisticsDialog";

interface EventsApiResponse {
  data?: { events?: OrgStatsEvent[] };
}

// =============================================================================
// Inline subcomponent: Summary cards
// =============================================================================
function SummaryCards({
  totalStats,
  onCardClick,
}: {
  totalStats: TotalStats;
  onCardClick: (type: Exclude<DialogType, "">) => void;
}) {
  const cards: Array<{
    title: string;
    value: number;
    icon: ReactNode;
    gradient: string;
    clickType: Exclude<DialogType, ""> | null;
  }> = [
    {
      title: "Countries",
      value: totalStats.totalCountries,
      icon: <PublicIcon sx={{ fontSize: 48, opacity: 0.8 }} />,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      clickType: "countries",
    },
    {
      title: "Organizers",
      value: totalStats.totalOrganizers,
      icon: <PersonIcon sx={{ fontSize: 48, opacity: 0.8 }} />,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      clickType: "organizers",
    },
    {
      title: "Events",
      value: totalStats.totalEvents,
      icon: <EventIcon sx={{ fontSize: 48, opacity: 0.8 }} />,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      clickType: null,
    },
    {
      title: "Participants",
      value: totalStats.totalParticipants,
      icon: <ViewIcon sx={{ fontSize: 48, opacity: 0.8 }} />,
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      clickType: "participants",
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {cards.map((card, index) => {
        const isClickable = card.clickType !== null;
        return (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Box
              onClick={
                isClickable
                  ? () => onCardClick(card.clickType!)
                  : undefined
              }
              sx={{ cursor: isClickable ? "pointer" : "default" }}
            >
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  background: card.gradient,
                }}
              >
                <CardContent sx={{ color: "white" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, mb: 1 }}
                      >
                        {card.value}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {card.title}
                      </Typography>
                    </Box>
                    {card.icon}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}

// =============================================================================
// Inline subcomponent: Filter controls
// =============================================================================
interface StatisticsFiltersProps {
  dateRange: string;
  setDateRange: (v: string) => void;
  customStartDate: Dayjs | null;
  setCustomStartDate: (v: Dayjs | null) => void;
  customEndDate: Dayjs | null;
  setCustomEndDate: (v: Dayjs | null) => void;
  countryFilter: string;
  setCountryFilter: (v: string) => void;
  availableCountries: string[];
  onClearFilters: () => void;
}

function StatisticsFilters({
  dateRange,
  setDateRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  countryFilter,
  setCountryFilter,
  availableCountries,
  onClearFilters,
}: StatisticsFiltersProps) {
  const hasActiveFilters = dateRange !== "all" || countryFilter !== "all";

  const dateDisplay = useMemo(() => {
    let start: Dayjs | null = null;
    let end: Dayjs | null = null;
    const now = dayjs();
    switch (dateRange) {
      case "today":
        start = now;
        end = now;
        break;
      case "yesterday":
        start = now.subtract(1, "day");
        end = start;
        break;
      case "7days":
        start = now.day(0);
        end = now.day(6);
        break;
      case "1week":
        start = now.subtract(1, "week").day(0);
        end = now.subtract(1, "week").day(6);
        break;
      case "1month":
        start = now.subtract(1, "month").startOf("month");
        end = now.subtract(1, "month").endOf("month");
        break;
      case "3months":
        start = now.subtract(3, "month");
        end = now;
        break;
      case "1year":
        start = now.subtract(1, "year");
        end = now;
        break;
      case "custom":
        start = customStartDate;
        end = customEndDate;
        break;
      default:
        return null;
    }
    if (!start || !end) return null;
    const fmt = (d: Dayjs) => dayjs(d).format("MMM D, YYYY");
    return `(${fmt(start)} - ${fmt(end)})`;
  }, [dateRange, customStartDate, customEndDate]);

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              label="Date Range"
              onChange={(e: SelectChangeEvent) => setDateRange(e.target.value)}
              MenuProps={{ disableScrollLock: true }}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="yesterday">Yesterday</MenuItem>
              <MenuItem value="7days">This Week</MenuItem>
              <MenuItem value="1week">Last Week</MenuItem>
              <MenuItem value="1month">Last Month</MenuItem>
              <MenuItem value="3months">Last 3 Months</MenuItem>
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="1year">Last Year</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {dateRange === "custom" && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <DatePicker
                label="Start Date"
                value={customStartDate}
                onChange={(d) => setCustomStartDate(d)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <DatePicker
                label="End Date"
                value={customEndDate}
                onChange={(d) => setCustomEndDate(d)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </Grid>
          </LocalizationProvider>
        )}

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Country</InputLabel>
            <Select
              value={countryFilter}
              label="Country"
              onChange={(e: SelectChangeEvent) =>
                setCountryFilter(e.target.value)
              }
              MenuProps={{ disableScrollLock: true }}
            >
              <MenuItem value="all">All Countries</MenuItem>
              {availableCountries.map((country) => (
                <MenuItem key={country} value={country}>
                  {getCountryFlag(country)} {getCountryName(country)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 1 }}>
          {hasActiveFilters && (
            <Button
              variant="contained"
              onClick={onClearFilters}
              startIcon={<ClearIcon />}
              fullWidth
              color="error"
            >
              Clear
            </Button>
          )}
        </Grid>
      </Grid>

      {dateDisplay && (
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              bgcolor: "#f1f1f1",
              p: 1,
              borderRadius: 2,
              fontWeight: 500,
              color: "black",
              mt: 3,
              width: 210,
              textAlign: "center",
            }}
          >
            {dateDisplay}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// =============================================================================
// Main content component
// =============================================================================
export default function OrganizerStatisticsContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allEvents, setAllEvents] = useState<OrgStatsEvent[]>([]);

  // Filter states
  const [dateRange, setDateRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState<Dayjs | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Dayjs | null>(null);
  const [countryFilter, setCountryFilter] = useState("all");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>("");
  const [dialogData, setDialogData] = useState<
    DialogOrganizer[] | DialogParticipantEvent[] | DialogCountry[]
  >([]);
  const [expandedOrganizerDialog, setExpandedOrganizerDialog] = useState<
    Record<string, boolean>
  >({});
  const [expandedCountryEvents, setExpandedCountryEvents] = useState<
    Record<string, boolean>
  >({});

  const [organizerCountryFilter, setOrganizerCountryFilter] = useState("");
  const [organizerMinEvents, setOrganizerMinEvents] = useState(0);
  const [organizerSortBy, setOrganizerSortBy] = useState("totalEvents");
  const [countrySearchFilter, setCountrySearchFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchEventData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await AxiosInstance.get<EventsApiResponse>("events");
        const events = res?.data?.data?.events ?? [];
        if (!cancelled) setAllEvents(events);
      } catch (e) {
        console.error("Error fetching events:", e);
        if (!cancelled) setError("Failed to fetch event data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchEventData();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    let filtered = filterEventsByDateRange(
      allEvents,
      dateRange,
      customStartDate,
      customEndDate
    );
    if (countryFilter !== "all") {
      filtered = filtered.filter((e) => e.countryCode === countryFilter);
    }
    return filtered;
  }, [allEvents, dateRange, customStartDate, customEndDate, countryFilter]);

  const organizerStats = useMemo(
    () => processOrganizerStats(filteredEvents),
    [filteredEvents]
  );

  const totalStats: TotalStats = useMemo(() => {
    const organizerSet = new Set<string>();
    filteredEvents.forEach((event) => {
      const key = `${event.user?.name || event.organizer}-${
        event.user?.email || event.organizerEmail
      }`;
      organizerSet.add(key);
    });
    return {
      totalOrganizers: organizerSet.size,
      totalEvents: filteredEvents.length,
      totalCountries: Object.keys(organizerStats).length,
      totalParticipants: filteredEvents.reduce(
        (sum, event) => sum + (event.participantsCount || 0),
        0
      ),
    };
  }, [filteredEvents, organizerStats]);

  const availableCountries = useMemo(() => {
    return Array.from(
      new Set(allEvents.map((e) => e.countryCode).filter(Boolean))
    ) as string[];
  }, [allEvents]);

  const clearFilters = () => {
    setDateRange("all");
    setCustomStartDate(null);
    setCustomEndDate(null);
    setCountryFilter("all");
  };

  const handleCardClick = (type: Exclude<DialogType, "">) => {
    if (type === "organizers") {
      const allOrganizers: DialogOrganizer[] = [];
      Object.entries(organizerStats).forEach(([countryCode, countryData]) => {
        Object.values(countryData.organizers).forEach((organizer) => {
          const existingIdx = allOrganizers.findIndex(
            (o) => o.name === organizer.name && o.email === organizer.email
          );
          const newCountry: CountryRollup = {
            countryCode,
            countryName: countryData.countryName,
            events: organizer.events,
          };
          if (existingIdx >= 0) {
            const existing = allOrganizers[existingIdx];
            existing.countriesData.push(newCountry);
            existing.totalEvents += organizer.totalEvents;
            existing.publicEvents += organizer.publicEvents;
            existing.totalParticipants += organizer.totalParticipants;
          } else {
            allOrganizers.push({
              ...organizer,
              countryCode,
              countriesData: [newCountry],
            });
          }
        });
      });
      allOrganizers.sort((a, b) => b.totalEvents - a.totalEvents);
      setDialogData(allOrganizers);
    } else if (type === "participants") {
      const participants: DialogParticipantEvent[] = filteredEvents
        .filter((event) => (event.participantsCount || 0) > 0)
        .sort(
          (a, b) =>
            (b.participantsCount || 0) - (a.participantsCount || 0)
        )
        .map((event) => ({
          ...event,
          organizerName: event.user?.name || event.organizer || "Unknown",
          countryName: getCountryName(event.countryCode),
          eventLink: `https://${event.subDomain?.name}.bayanihan.com`,
        }));
      setDialogData(participants);
    } else if (type === "countries") {
      const countries: DialogCountry[] = Object.entries(organizerStats)
        .map(([countryCode, countryData]) => ({
          countryCode,
          countryName: countryData.countryName,
          totalEvents: countryData.totalEvents,
          totalOrganizers: countryData.totalOrganizers,
        }))
        .sort((a, b) => b.totalEvents - a.totalEvents);
      setDialogData(countries);
    }
    setDialogType(type);
    setDialogOpen(true);
  };

  const toggleOrganizerDialogExpansion = (key: string) => {
    setExpandedOrganizerDialog((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCountryEventsExpansion = (key: string) => {
    setExpandedCountryEvents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogType("");
    setDialogData([]);
    setExpandedOrganizerDialog({});
    setExpandedCountryEvents({});
    setOrganizerCountryFilter("");
    setOrganizerMinEvents(0);
    setOrganizerSortBy("totalEvents");
    setCountrySearchFilter("");
  };

  const filteredDialogData = useMemo(() => {
    if (dialogType === "organizers") {
      let filtered = [...(dialogData as DialogOrganizer[])];
      if (organizerCountryFilter) {
        filtered = filtered.filter(
          (org) => org.countryCode === organizerCountryFilter
        );
      }
      if (organizerMinEvents > 0) {
        filtered = filtered.filter(
          (org) => org.totalEvents >= organizerMinEvents
        );
      }
      filtered.sort((a, b) => {
        switch (organizerSortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "publicEvents":
            return b.publicEvents - a.publicEvents;
          case "totalParticipants":
            return b.totalParticipants - a.totalParticipants;
          default:
            return b.totalEvents - a.totalEvents;
        }
      });
      return filtered;
    }
    if (dialogType === "countries" && countrySearchFilter) {
      return (dialogData as DialogCountry[]).filter(
        (country) => country.countryCode === countrySearchFilter
      );
    }
    return dialogData;
  }, [
    dialogType,
    dialogData,
    organizerCountryFilter,
    organizerMinEvents,
    organizerSortBy,
    countrySearchFilter,
  ]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 3, color: "text.secondary" }}>
          Loading organizer statistics...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Alert severity="error" sx={{ m: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3, minHeight: "100vh" }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 300, color: "#1e293b", mb: 1 }}
          >
            Organizer Statistics
          </Typography>
        </Box>

        <SummaryCards totalStats={totalStats} onCardClick={handleCardClick} />

        <StatisticsFilters
          dateRange={dateRange}
          setDateRange={setDateRange}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          countryFilter={countryFilter}
          setCountryFilter={setCountryFilter}
          availableCountries={availableCountries}
          onClearFilters={clearFilters}
        />

        <OrganizerStatisticsDisplay
          organizerStats={organizerStats}
          onClearFilters={clearFilters}
        />

        <OrganizerStatisticsDialog
          dialogOpen={dialogOpen}
          dialogType={dialogType}
          organizerCountryFilter={organizerCountryFilter}
          setOrganizerCountryFilter={setOrganizerCountryFilter}
          handleCloseDialog={handleCloseDialog}
          organizerMinEvents={organizerMinEvents}
          setOrganizerMinEvents={setOrganizerMinEvents}
          dialogData={dialogData}
          organizerSortBy={organizerSortBy}
          setOrganizerSortBy={setOrganizerSortBy}
          countrySearchFilter={countrySearchFilter}
          setCountrySearchFilter={setCountrySearchFilter}
          filteredDialogData={filteredDialogData}
          toggleOrganizerDialogExpansion={toggleOrganizerDialogExpansion}
          expandedOrganizerDialog={expandedOrganizerDialog}
          toggleCountryEventsExpansion={toggleCountryEventsExpansion}
          expandedCountryEvents={expandedCountryEvents}
        />
      </Box>
    </LocalizationProvider>
  );
}
