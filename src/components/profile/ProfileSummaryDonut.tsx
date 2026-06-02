"use client";
import { useEffect, useState } from "react";
import {
  Card,
  Box,
  Typography,
  Stack,
  Skeleton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import AxiosInstance from "@/lib/AxiosInstance";

interface EventItem {
  id?: string | number;
  eventDate?: string;
}

export default function ProfileSummaryDonut() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [doneTotal, setDoneTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    let mounted = true;
    const INTERVAL_MS = 30 * 1000;

    const fetchEvents = async () => {
      try {
        const resp = await AxiosInstance.get("events");
        const d = resp?.data as
          | { data?: { events?: EventItem[] }; events?: EventItem[] }
          | undefined;
        const arr: EventItem[] = Array.isArray(d?.data?.events)
          ? d!.data!.events!
          : d?.events || [];

        const doneResp = await AxiosInstance.get("events", {
          params: { done: true, page: 1, per_page: 1 },
        });
        const meta = (doneResp?.data as { meta?: { total?: number } })?.meta;

        if (mounted) {
          setEvents(arr);
          setDoneTotal(Number(meta?.total || 0));
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

  const total = events.length + doneTotal;
  const data = [
    { name: "Completed", value: doneTotal, color: "#0ea5e9" },
    { name: "Upcoming", value: events.length, color: "#333" },
  ];

  if (loading) {
    return (
      <Skeleton
        variant="rounded"
        width="100%"
        height={isMobile ? 450 : 565}
        sx={{ borderRadius: "24px" }}
      />
    );
  }

  return (
    <Card
      sx={{
        px: { xs: 3, md: 4 },
        py: { xs: 3, md: 1.5 },
        borderRadius: "24px",
        bgcolor: "#ffffff",
        boxShadow: "0 20px 50px rgba(0,0,0,0.04)",
        border: "1px solid #f1f5f9",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Outfit'",
            fontWeight: 800,
            color: "#1e293b",
            letterSpacing: "-0.5px",
          }}
        >
          Event Status
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Outfit'",
            fontSize: "0.85rem",
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          Overview of completion progress
        </Typography>
      </Box>

      <Box sx={{ position: "relative", width: "100%", height: 300, my: 2 }}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Outfit'",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Total
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Outfit'",
              fontSize: { xs: "2rem", md: "2.4rem" },
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1,
            }}
          >
            {total}
          </Typography>
        </Box>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius="75%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={total > 0 ? 8 : 0}
              stroke="none"
              animationDuration={1200}
            >
              {data.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={entry.color}
                  style={{
                    filter:
                      entry.name === "Completed"
                        ? "drop-shadow(0px 4px 10px rgba(14, 165, 233, 0.3))"
                        : "none",
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                fontFamily: "'Outfit'",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Stack spacing={2} sx={{ mt: "auto" }}>
        {data.map((item) => {
          const percentage =
            total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
          return (
            <Stack
              key={item.name}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                bgcolor: "#f8fafc",
                p: 2,
                borderRadius: "16px",
                border: "1px solid #f1f5f9",
                transition: "0.2s",
                "&:hover": { bgcolor: "#f1f5f9" },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "4px",
                    bgcolor: item.color,
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "'Outfit'",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#334155",
                  }}
                >
                  {item.name}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  sx={{
                    fontFamily: "'Outfit'",
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    color: item.name === "Completed" ? "#0ea5e9" : "#64748b",
                  }}
                >
                  {percentage}%
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Outfit'",
                    fontSize: "0.95rem",
                    fontWeight: 900,
                    color: "#1e293b",
                    minWidth: "30px",
                    textAlign: "right",
                  }}
                >
                  {item.value}
                </Typography>
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Card>
  );
}
