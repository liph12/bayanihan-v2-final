"use client";
import { useEffect, useState, useMemo, type ReactElement, cloneElement } from "react";
import {
  Box,
  Skeleton,
  Typography,
  Paper,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import TodayIcon from "@mui/icons-material/Today";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  YAxis,
  Tooltip,
  XAxis,
} from "recharts";
import dayjs from "dayjs";
import AxiosInstance from "@/lib/AxiosInstance";
import { useAuthProvider } from "@/providers/AuthProvider";

interface EventItem {
  eventDate?: string;
  publishedDate?: string;
  createdAt?: string;
}

interface WavePoint {
  name: string;
  fullMonth?: string;
  timeLabel?: string;
  value: number;
}

function AnimatedValue({ value }: { value: number | string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(String(value)) || 0;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    const totalDuration = 800;
    const stepTime = 20;
    const increment = Math.ceil(end / (totalDuration / stepTime));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  return <>{displayValue.toLocaleString()}</>;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: WavePoint;
  }>;
}

function CustomTooltip({ active, payload }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    const p = payload[0];
    return (
      <Box
        sx={{
          bgcolor: "#1e293b",
          color: "#fff",
          p: 1,
          px: 1.5,
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, display: "block", fontFamily: "'Outfit'" }}
        >
          {p.payload.timeLabel || p.payload.fullMonth || p.payload.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, fontFamily: "'Outfit'" }}
        >
          {Math.floor(p.value)} Events
        </Typography>
      </Box>
    );
  }
  return null;
}

export default function ProfileStatsBar({
  direction = "row",
}: {
  direction?: "row" | "column";
}) {
  const { userData } = useAuthProvider();
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.down("sm"));

  const [userEvents, setUserEvents] = useState<EventItem[]>([]);
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = (userData as { id?: string | number } | null)?.id;

  useEffect(() => {
    let mounted = true;
    const INTERVAL_MS = 30 * 1000;

    const fetchAllEvents = async () => {
      try {
        const response = await AxiosInstance.get("events");
        const d = response?.data as
          | {
              data?: { events?: EventItem[] };
              events?: EventItem[];
            }
          | EventItem[]
          | undefined;
        const fetched: EventItem[] = Array.isArray(d)
          ? d
          : (d?.data?.events ?? d?.events ?? []);
        if (mounted) setAllEvents(Array.isArray(fetched) ? fetched : []);
      } catch {
        if (mounted) setAllEvents([]);
      }
    };

    fetchAllEvents();
    const interval = setInterval(fetchAllEvents, INTERVAL_MS);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    const INTERVAL_MS = 30 * 1000;
    setLoading(true);

    const fetchUserEvents = async () => {
      try {
        const response = await AxiosInstance.get(`user-events/${userId}`);
        const arr =
          (response?.data as { data?: { events?: EventItem[] } })?.data
            ?.events || [];
        if (mounted) {
          setUserEvents(arr);
          setTimeout(() => setLoading(false), 800);
        }
      } catch {
        if (mounted) {
          setUserEvents([]);
          setLoading(false);
        }
      }
    };

    fetchUserEvents();
    const interval = setInterval(fetchUserEvents, INTERVAL_MS);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [userId]);

  const stats = useMemo(() => {
    const now = dayjs();

    const monthlyWave: WavePoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = now.subtract(i, "month");
      const count = userEvents.filter(
        (e) => e?.eventDate && dayjs(e.eventDate).isSame(monthDate, "month")
      ).length;
      monthlyWave.push({
        name: monthDate.format("MMM"),
        fullMonth: monthDate.format("MMMM YYYY"),
        value: count,
      });
    }

    const upcomingWave: WavePoint[] = [];
    for (let i = 0; i < 6; i++) {
      const monthDate = now.add(i, "month");
      const count = userEvents.filter(
        (e) => e?.eventDate && dayjs(e.eventDate).isSame(monthDate, "month")
      ).length;
      upcomingWave.push({
        name: monthDate.format("MMM"),
        fullMonth: monthDate.format("MMMM YYYY"),
        value: count,
      });
    }

    const todayStr = now.format("MMM D, YYYY");

    const todayWave: WavePoint[] = [];
    for (let i = 9; i <= 18; i++) {
      const hourMark = now.startOf("day").add(i, "hour");
      const count = allEvents.filter((e) => {
        if (!e?.publishedDate || !e?.createdAt) return false;
        const fullDatetime = dayjs(`${e.publishedDate} ${e.createdAt}`);
        return fullDatetime.isValid() && fullDatetime.isSame(hourMark, "hour");
      }).length;
      todayWave.push({
        name: hourMark.format("ha"),
        timeLabel: hourMark.format("h:mm A"),
        value: count,
      });
    }

    const createdToday = allEvents.filter((e) => {
      if (!e?.publishedDate) return false;
      const pd = dayjs(e.publishedDate);
      return pd.isValid() && pd.format("MMM D, YYYY") === todayStr;
    }).length;

    const currentMonthCount = monthlyWave[5].value;
    const lastMonthCount = monthlyWave[4].value;
    const growthPercent =
      lastMonthCount === 0
        ? currentMonthCount > 0
          ? 100
          : 0
        : ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;

    return {
      upcoming: userEvents.filter(
        (e) => e?.eventDate && dayjs(e.eventDate).isAfter(now)
      ).length,
      totalCreated: userEvents.length,
      createdToday,
      monthlyWave,
      upcomingWave,
      todayWave,
      growthPercent: growthPercent.toFixed(1),
      currentDate: now.format("MMMM D, YYYY"),
    };
  }, [userEvents, allEvents]);

  const renderCard = (
    title: string,
    value: number,
    waveData: WavePoint[],
    color: string,
    icon: ReactElement<{ sx?: object }>,
    showGrowth = false,
    chartHeight = 60,
    isBar = false
  ) => {
    if (loading) {
      return (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "grey.100",
            background: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Skeleton
            variant="circular"
            animation="wave"
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 40,
              height: 40,
            }}
          />
          <Skeleton
            variant="text"
            animation="wave"
            width="50%"
            height={24}
            sx={{ mb: 1 }}
          />
          <Skeleton
            variant="rounded"
            animation="wave"
            height={70}
            sx={{ borderRadius: 2 }}
          />
        </Paper>
      );
    }

    const isPositive = parseFloat(stats.growthPercent) > 0;
    const isNeutral = parseFloat(stats.growthPercent) === 0;
    const allSame = waveData.every((d) => d.value === waveData[0].value);
    const yDomain: [number | string, number | string] = allSame
      ? [0, waveData[0].value + 2]
      : ["auto", "auto"];

    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 2, lg: 2.5 },
          borderRadius: 5,
          border: "1px solid",
          borderColor: "grey.100",
          background: "#fff",
          boxShadow: "0 8px 30px rgba(0,0,0,0.02)",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s ease",
          height: "100%",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.05)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color,
            bgcolor: `${color}10`,
            borderRadius: "12px",
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {cloneElement(icon, { sx: { fontSize: 22 } })}
        </Box>

        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: "#64748b",
            fontFamily: "'Outfit'",
            mb: 0.5,
            fontSize: "0.85rem",
            maxWidth: "75%",
          }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            mt: 1,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontFamily: "'Outfit'",
                color: "#1e293b",
                fontSize: { xs: "2rem", md: "1.75rem", lg: "2.2rem" },
                lineHeight: 1,
              }}
            >
              <AnimatedValue value={value} />
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 1.5 }}
            >
              {showGrowth && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 0.8,
                    py: 0.3,
                    borderRadius: 1,
                    bgcolor: isNeutral
                      ? "#f1f5f9"
                      : isPositive
                        ? "#eefcf3"
                        : "#fef2f2",
                    color: isNeutral
                      ? "#64748b"
                      : isPositive
                        ? "#34d399"
                        : "#ef4444",
                  }}
                >
                  {isNeutral ? (
                    <HorizontalRuleIcon sx={{ fontSize: 12 }} />
                  ) : isPositive ? (
                    <TrendingUpIcon sx={{ fontSize: 12 }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 12 }} />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      ml: 0.3,
                      fontFamily: "'Outfit'",
                      fontSize: "0.7rem",
                    }}
                  >
                    {Math.abs(parseFloat(stats.growthPercent))}%
                  </Typography>
                </Box>
              )}
              <Typography
                variant="caption"
                sx={{
                  color: "#94a3b8",
                  fontWeight: 600,
                  fontFamily: "'Outfit'",
                  fontSize: "0.75rem",
                }}
              >
                {showGrowth ? "vs last month" : ""}
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ width: "100%", height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              {isBar ? (
                <BarChart
                  data={waveData}
                  margin={{ left: 0, right: 0, top: 5, bottom: 0 }}
                  barCategoryGap="20%"
                >
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                    interval={0}
                  />
                  <YAxis hide domain={yDomain} />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: `${color}10` }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={16}>
                    {waveData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.value > 0 ? color : `${color}30`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <LineChart
                  data={waveData}
                  margin={{ left: 8, right: 8, top: 5, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                    interval={0}
                  />
                  <YAxis hide domain={yDomain} />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: "#f1f5f9", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: color }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={2} direction={direction}>
        <Grid
          size={{
            xs: 12,
            sm: direction === "row" ? 6 : 12,
            md: direction === "row" ? 4 : 12,
          }}
        >
          {renderCard(
            "Your Created Events",
            stats.totalCreated,
            stats.monthlyWave,
            "#34d399",
            <CalendarMonthIcon />,
            true
          )}
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: direction === "row" ? 6 : 12,
            md: direction === "row" ? 4 : 12,
          }}
        >
          {renderCard(
            "Your Upcoming Events",
            stats.upcoming,
            stats.upcomingWave,
            "#0ea5e9",
            <EventAvailableIcon />,
            false
          )}
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: direction === "row" ? 6 : 12,
            md: direction === "row" ? 4 : 12,
          }}
        >
          {renderCard(
            `Total Created Events – ${stats.currentDate}`,
            stats.createdToday,
            stats.todayWave,
            "#f59e0b",
            <TodayIcon />,
            false,
            80,
            true
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
