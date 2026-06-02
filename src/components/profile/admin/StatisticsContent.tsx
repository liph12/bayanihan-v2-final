"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  LinearProgress,
  useTheme,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import type { SelectChangeEvent } from "@mui/material/Select";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ReactCountryFlag from "react-country-flag";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import EventIcon from "@mui/icons-material/Event";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PublicIcon from "@mui/icons-material/Public";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import dayjs, { type Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isBetween from "dayjs/plugin/isBetween";
import AxiosInstance from "@/lib/AxiosInstance";
import { getCountryName } from "@/lib/countryCodes";
import {
  MetricCard,
  CustomTooltip,
  CustomXAxisTick,
  EventsTable,
  buildDatePresets,
  generateCountryPDF,
  generateFullReportPDF,
  type AdminEventRow,
} from "./StatisticsHelpers";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

interface EventsApiResponse {
  data?: { events?: AdminEventRow[] };
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}

type DateRange = [Dayjs, Dayjs];

export default function StatisticsContent() {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const presets = useMemo(() => buildDatePresets(), []);

  const [loading, setLoading] = useState(true);
  const [allEvents, setAllEvents] = useState<AdminEventRow[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>([
    dayjs().subtract(1, "month"),
    dayjs(),
  ]);

  // Events Done (server-paginated)
  const [eventsDone, setEventsDone] = useState<AdminEventRow[]>([]);
  const [eventsDoneLoading, setEventsDoneLoading] = useState(false);
  const [eventsDonePage, setEventsDonePage] = useState(1);
  const [eventsDoneMeta, setEventsDoneMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Initial events fetch
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await AxiosInstance.get<EventsApiResponse>("events");
        const fetched = res?.data?.data?.events ?? [];
        if (!cancelled) setAllEvents(fetched);
      } catch (e) {
        console.error("Error fetching events:", e);
        if (!cancelled) setAllEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Events Done — refetch when page changes
  useEffect(() => {
    let cancelled = false;
    const fetchEventsDone = async () => {
      setEventsDoneLoading(true);
      try {
        const res = await AxiosInstance.get<EventsApiResponse>("events", {
          params: { done: true, page: eventsDonePage, per_page: 10 },
        });
        const fetched = res?.data?.data?.events ?? [];
        const meta = res?.data?.meta ?? {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        };
        if (!cancelled) {
          setEventsDone(fetched);
          setEventsDoneMeta({
            current_page: meta.current_page ?? 1,
            last_page: meta.last_page ?? 1,
            per_page: meta.per_page ?? 10,
            total: meta.total ?? 0,
          });
        }
      } catch (e) {
        console.error("Error fetching events done:", e);
        if (!cancelled) setEventsDone([]);
      } finally {
        if (!cancelled) setEventsDoneLoading(false);
      }
    };
    fetchEventsDone();
    return () => {
      cancelled = true;
    };
  }, [eventsDonePage]);

  // Filtered events for the bar chart / tables / metrics
  const filteredEvents = useMemo(() => {
    if (filter === "all") return allEvents;
    const [start, end] = dateRange;
    if (!start || !end) return allEvents;
    return allEvents.filter((event) => {
      const publishDate = event.publishedDate
        ? dayjs(event.publishedDate)
        : event.eventDate
        ? dayjs(event.eventDate)
        : null;
      if (!publishDate) return false;
      return (
        publishDate.isSameOrAfter(start.startOf("day")) &&
        publishDate.isSameOrBefore(end.endOf("day"))
      );
    });
  }, [allEvents, filter, dateRange]);

  const formattedDateRange =
    dateRange && dateRange[0] && dateRange[1]
      ? `${dateRange[0].format("MMM DD, YYYY")} - ${dateRange[1].format(
          "MMM DD, YYYY"
        )}`
      : "";

  const now = dayjs();
  const totalEvents = allEvents.length;
  const upcomingEvents = allEvents.filter((e) =>
    e.eventDate ? dayjs(e.eventDate).isAfter(now) : false
  );
  const ongoingEvents = allEvents.filter((e) =>
    e.eventDate ? dayjs(e.eventDate).isSame(now, "day") : false
  );

  // Country distribution data
  const { countryData } = useMemo(() => {
    const countryMap = new Map<string, number>();
    filteredEvents.forEach((event) => {
      const code = event.countryCode;
      if (!code) return;
      const name = getCountryName(code) || code;
      const key = `${name}|${code}`;
      countryMap.set(key, (countryMap.get(key) || 0) + 1);
    });
    const sorted = Array.from(countryMap, ([key, count]) => {
      const [name, code] = key.split("|");
      return { name, code, count };
    }).sort((a, b) => b.count - a.count);
    return { countryData: sorted };
  }, [filteredEvents]);

  const maxEvents = Math.max(
    1,
    countryData.length ? Math.max(...countryData.map((c) => c.count)) : 1
  );

  const handleFilterChange = (e: SelectChangeEvent) => {
    const v = e.target.value;
    setFilter(v);
    if (v !== "custom" && v !== "all") {
      const preset = presets.find((p) => p.label === v);
      if (preset) setDateRange(preset.value);
    }
  };

  const handleDownloadCountryPdf = (code: string) => {
    const events = filteredEvents.filter((e) => e.countryCode === code);
    void generateCountryPDF(code, events, primaryColor);
  };

  const handleDownloadFullReport = () => {
    const byCountry: Record<string, AdminEventRow[]> = {};
    filteredEvents.forEach((e) => {
      if (!e.countryCode) return;
      if (!byCountry[e.countryCode]) byCountry[e.countryCode] = [];
      byCountry[e.countryCode].push(e);
    });
    void generateFullReportPDF(
      countryData.map((c) => ({ code: c.code, name: c.name })),
      byCountry,
      primaryColor
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Event Analytics Dashboard
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "end",
              flexWrap: "wrap",
            }}
          >
            {filter !== "all" && (
              <Box
                sx={{
                  backgroundColor:
                    theme.palette.mode === "light" ? "#f5f5f5" : "#424242",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  boxShadow: 1,
                  alignSelf: "center",
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  {formattedDateRange}
                </Typography>
              </Box>
            )}

            <FormControl size="small">
              <InputLabel id="filter-by-date">Filter by Date</InputLabel>
              <Select
                labelId="filter-by-date"
                value={filter}
                label="Filter by Date"
                onChange={handleFilterChange}
                sx={{ minWidth: 150 }}
                disabled={loading}
                MenuProps={{
                  disableScrollLock: true,
                  PaperProps: { sx: { maxHeight: 300 } },
                }}
              >
                <MenuItem value="all">All Time</MenuItem>
                {presets.map((preset) => (
                  <MenuItem key={preset.label} value={preset.label}>
                    {preset.label}
                  </MenuItem>
                ))}
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadFullReport}
              disabled={loading || filteredEvents.length === 0}
            >
              Download Full Report
            </Button>
          </Box>
        </Box>

        {filter === "custom" && (
          <Box sx={{ display: "flex", gap: 2, mb: 4, alignItems: "center" }}>
            <DatePicker
              label="From"
              value={dateRange[0]}
              onChange={(d) => {
                if (d) setDateRange([d, dateRange[1]]);
              }}
              disableFuture
              format="MMM DD, YYYY"
              slotProps={{ textField: { size: "small" } }}
            />
            {" - "}
            <DatePicker
              label="To"
              value={dateRange[1]}
              onChange={(d) => {
                if (d) setDateRange([dateRange[0], d]);
              }}
              disableFuture
              format="MMM DD, YYYY"
              slotProps={{ textField: { size: "small" } }}
            />
          </Box>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "50vh",
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Metric cards */}
            <Grid size={12}>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <MetricCard
                    title="Total Events"
                    value={totalEvents + eventsDoneMeta.total}
                    icon={<EventIcon />}
                    color={theme.palette.primary.main}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <MetricCard
                    title="Upcoming Events"
                    value={upcomingEvents.length}
                    icon={<CalendarMonthIcon />}
                    color={theme.palette.warning.main}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <MetricCard
                    title="Events Done"
                    value={eventsDoneMeta.total}
                    icon={<EventAvailableIcon />}
                    color={theme.palette.success.main}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <MetricCard
                    title="Top Country"
                    value={countryData[0]?.count ?? 0}
                    subtitle={countryData[0]?.name}
                    icon={<PublicIcon />}
                    color={theme.palette.success.main}
                    flagCode={countryData[0]?.code}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <MetricCard
                    title="Events Ongoing"
                    value={ongoingEvents.length}
                    icon={<AccessTimeIcon />}
                    color={theme.palette.primary.main}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Bar chart */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Event Distribution by Country
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={countryData}>
                    <XAxis dataKey="code" tick={<CustomXAxisTick />} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Country list with per-country PDF buttons */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Country Event Distribution
                </Typography>
                <Box
                  sx={{
                    height: "calc(100% - 40px)",
                    overflow: "auto",
                    pr: 2,
                  }}
                >
                  {countryData.length === 0 && (
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      No country data for the current filter.
                    </Typography>
                  )}
                  {countryData.map((country) => (
                    <Box key={country.code} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <ReactCountryFlag
                            countryCode={country.code}
                            svg
                            style={{
                              width: 24,
                              height: 24,
                              marginRight: 8,
                            }}
                          />
                          <Typography variant="body2">
                            {country.name}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{ mr: 1 }}
                          >
                            {country.count}
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              handleDownloadCountryPdf(country.code)
                            }
                          >
                            Download PDF
                          </Button>
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(country.count / maxEvents) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>

            {/* Events table */}
            <Grid size={12}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Events Table
                </Typography>
                <EventsTable rows={filteredEvents} />
              </Card>
            </Grid>

            {/* Events Done table (server-paginated) */}
            <Grid size={12}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Events Done Table
                </Typography>
                <EventsTable
                  rows={eventsDone}
                  loading={eventsDoneLoading}
                  serverPagination={{
                    page: Math.max(0, eventsDoneMeta.current_page - 1),
                    perPage: eventsDoneMeta.per_page || 10,
                    total: eventsDoneMeta.total,
                    onPageChange: (p) => setEventsDonePage(p + 1),
                  }}
                />
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </LocalizationProvider>
  );
}
