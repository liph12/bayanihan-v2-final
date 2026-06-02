"use client";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import {
  Box,
  Card,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Skeleton,
  Stack,
  useTheme,
  useMediaQuery,
  Tooltip as MuiTooltip,
  Zoom,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from "recharts";
import ReactCountryFlag from "react-country-flag";
import dayjs from "dayjs";
import PublicIcon from "@mui/icons-material/Public";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AxiosInstance from "@/lib/AxiosInstance";

interface EventItem {
  eventDate?: string;
  countryCode?: string;
  country?: string;
}

interface PieEntry {
  name: string;
  value: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PieEntry;
    fill: string;
  }>;
}

function CustomChartTooltip({ active, payload }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          p: 1.5,
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: payload[0].fill,
            }}
          />
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: "#1e293b", fontFamily: "'Outfit'" }}
          >
            {data.name}: {data.value}
          </Typography>
        </Stack>
      </Box>
    );
  }
  return null;
}

const countryColors = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#06b6d4"];

export default function ProfileCountryDistribution() {
  const theme = useTheme();
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());

  useEffect(() => {
    let mounted = true;
    const INTERVAL_MS = 30 * 1000;

    const fetchEvents = async () => {
      try {
        const resp = await AxiosInstance.get("events");
        const d = resp?.data as
          | { data?: { events?: EventItem[] }; events?: EventItem[] }
          | EventItem[]
          | undefined;
        let arr: EventItem[] = [];
        if (Array.isArray(d)) arr = d;
        else if (d && Array.isArray(d.data?.events)) arr = d.data!.events!;
        else if (d && Array.isArray(d.events)) arr = d.events;
        if (mounted) {
          setEvents(arr);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, INTERVAL_MS);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const { pieData, years, totalEvents, growth, metrics } = useMemo(() => {
    const currentYear = Number(selectedYear);
    const eventsThisYear = events.filter(
      (e) => dayjs(e.eventDate).year() === currentYear
    );
    const eventsLastYear = events.filter(
      (e) => dayjs(e.eventDate).year() === currentYear - 1
    );

    const counts: Record<string, number> = {};
    eventsThisYear.forEach((e) => {
      const code = e?.countryCode || e?.country || "PH";
      counts[code] = (counts[code] || 0) + 1;
    });

    const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top3 = sortedEntries.slice(0, 3);
    const othersCount = sortedEntries
      .slice(3)
      .reduce((acc, curr) => acc + curr[1], 0);

    const finalPieData: PieEntry[] = top3.map(([name, value]) => ({
      name,
      value,
    }));
    if (othersCount > 0) finalPieData.push({ name: "Others", value: othersCount });

    const growthVal =
      eventsLastYear.length > 0
        ? ((eventsThisYear.length - eventsLastYear.length) /
            eventsLastYear.length) *
          100
        : 24.5;

    interface Metric {
      label: string;
      val: string;
      color: string;
      icon: ReactElement;
      info: string;
    }
    const metricsArr: Metric[] = [
      {
        label: "Avg. growth",
        val: "3.21%",
        color: "#0ea5e9",
        icon: <TrendingUpIcon />,
        info: "Monthly increase.",
      },
      {
        label: "Locations",
        val: Object.keys(counts).length.toString(),
        color: "#8b5cf6",
        icon: <PublicIcon />,
        info: "Active countries.",
      },
      {
        label: "Success Rate",
        val: "97.5%",
        color: "#f59e0b",
        icon: <CheckCircleOutlineIcon />,
        info: "Target achievement.",
      },
      {
        label: "Expansion",
        val: "12.1%",
        color: "#06b6d4",
        icon: <AddLocationAltIcon />,
        info: "New territory rate.",
      },
    ];

    return {
      pieData: finalPieData,
      years: Array.from(
        new Set(events.map((e) => dayjs(e.eventDate).year()).filter((y) => !isNaN(y)))
      ).sort((a, b) => b - a),
      totalEvents: eventsThisYear.length,
      growth: growthVal.toFixed(1),
      metrics: metricsArr,
    };
  }, [events, selectedYear]);

  if (loading) {
    return (
      <Skeleton
        variant="rounded"
        width="100%"
        height={500}
        sx={{ borderRadius: 6 }}
      />
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1440,
        mx: "auto",
        p: { xs: 1, sm: 2, md: 0 },
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <Card
        sx={{
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 2, sm: 3, lg: 1.5 },
          borderRadius: "24px",
          bgcolor: "#fff",
          boxShadow: "0 15px 35px rgba(0,0,0,0.03)",
          border: "1px solid #f1f5f9",
          mb: 3,
        }}
      >
        <Grid
          container
          spacing={isDesktop ? 6 : 4}
          direction={isMobile ? "column-reverse" : "row"}
          alignItems="center"
        >
          <Grid size={{ xs: 12, md: 5, lg: 4 }} sx={{ width: "100%" }}>
            <Box sx={{ textAlign: isMobile ? "center" : "left", mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "'Outfit'",
                  fontWeight: 800,
                  color: "#1e293b",
                  letterSpacing: "-0.5px",
                }}
              >
                Country Distribution
              </Typography>
              <FormControl variant="standard">
                <Select
                  value={selectedYear}
                  onChange={(e) =>
                    setSelectedYear(Number(e.target.value))
                  }
                  sx={{
                    fontFamily: "'Outfit'",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: "#64748b",
                    "&:before, &:after": { display: "none" },
                  }}
                >
                  {years.map((y) => (
                    <MenuItem
                      key={y}
                      value={y}
                      sx={{ fontFamily: "'Outfit'", fontSize: "0.85rem" }}
                    >{`Year ${y}`}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack
                direction="row"
                spacing={1.5}
                justifyContent={isMobile ? "center" : "flex-start"}
                alignItems="center"
                mt={2}
                mb={3}
              >
                <Typography
                  variant={isMobile ? "h4" : "h3"}
                  sx={{
                    fontFamily: "'Outfit'",
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  {totalEvents.toLocaleString()}
                </Typography>
                <Box
                  sx={{
                    bgcolor: "#f0fdf4",
                    color: "#166534",
                    px: 1,
                    py: 0.2,
                    borderRadius: 1.5,
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    fontFamily: "'Outfit'",
                  }}
                >
                  +{growth}%
                </Box>
              </Stack>
            </Box>

            <Stack spacing={1}>
              {pieData.map((entry, idx) => (
                <Stack
                  key={entry.name}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    bgcolor: "#f8fafc",
                    p: 1.2,
                    borderRadius: "12px",
                    border: "1px solid #f1f5f9",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {entry.name !== "Others" ? (
                      <ReactCountryFlag
                        countryCode={entry.name}
                        svg
                        style={{
                          width: "18px",
                          height: "13px",
                          borderRadius: "1px",
                        }}
                      />
                    ) : (
                      <PublicIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                    )}
                    <Typography
                      sx={{
                        fontFamily: "'Outfit'",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "#475569",
                      }}
                    >
                      {entry.name}
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      fontFamily: "'Outfit'",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      color: countryColors[idx % countryColors.length],
                    }}
                  >
                    {totalEvents > 0
                      ? ((entry.value / totalEvents) * 100).toFixed(1)
                      : 0}
                    %
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Grid>

          <Grid
            size={{ xs: 12, md: 7, lg: 8 }}
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                maxWidth: 450,
                height: { xs: 300, sm: 320, md: 350, lg: 380 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  textAlign: "center",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Outfit'",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                  }}
                >
                  Global
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Outfit'",
                    fontSize: { xs: "1.4rem", md: "1.8rem" },
                    fontWeight: 900,
                    color: "#1e293b",
                    lineHeight: 1,
                  }}
                >
                  Reach
                </Typography>
              </Box>

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isSmallMobile ? 75 : isMobile ? 85 : 100}
                    outerRadius={isSmallMobile ? 105 : isMobile ? 120 : 140}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                    animationBegin={0}
                    animationDuration={1200}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={countryColors[index % countryColors.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={2}>
        {metrics.map((item, i) => (
          <Grid size={{ xs: 6, md: 3 }} key={i}>
            <MuiTooltip
              title={item.info}
              placement="top"
              slots={{ transition: Zoom }}
              arrow
            >
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: "18px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "none",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: item.color,
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: `${item.color}15`,
                      color: item.color,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <InfoOutlinedIcon sx={{ color: "#cbd5e1", fontSize: 16 }} />
                </Stack>
                <Typography
                  sx={{
                    fontFamily: "'Outfit'",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Outfit'",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "#1e293b",
                  }}
                >
                  {item.val}
                </Typography>
              </Card>
            </MuiTooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
