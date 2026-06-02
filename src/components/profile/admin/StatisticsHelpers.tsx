"use client";
import React, { type ReactElement } from "react";
import {
  Box,
  Card,
  Typography,
  useTheme,
  Paper,
  LinearProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import MUITooltip from "@mui/material/Tooltip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ReactCountryFlag from "react-country-flag";
import dayjs, { type Dayjs } from "dayjs";
import { getCountryName } from "@/lib/countryCodes";

// =============================================================================
// MetricCard
// =============================================================================
interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: ReactElement;
  color: string;
  flagCode?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  flagCode,
}: MetricCardProps) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        p: 2,
        height: "100%",
        background: `linear-gradient(135deg, ${color}20 0%, ${color}08 100%)`,
        borderLeft: `4px solid ${color}`,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ color: theme.palette.text.secondary }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 1,
              mt: 1,
              width: "100%",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "end",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: `${color}20`,
            }}
          >
            {flagCode ? (
              <ReactCountryFlag
                countryCode={flagCode}
                svg
                style={{
                  width: "1.9em",
                  height: "1.9em",
                  aspectRatio: "1 / 1",
                  borderRadius: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              React.cloneElement(icon, {
                sx: { color },
              } as { sx: { color: string } })
            )}
          </Box>
          {subtitle && (
            <Typography
              component="span"
              title={subtitle}
              sx={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                maxWidth: "8em",
                fontSize: "0.75rem",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  );
}

// =============================================================================
// Recharts custom Tooltip + X-axis tick (country flag + name)
// =============================================================================
interface RechartsTooltipPayload {
  active?: boolean;
  payload?: Array<{ payload: { code: string; name?: string }; value: number }>;
}

export function CustomTooltip({ active, payload }: RechartsTooltipPayload) {
  if (!active || !payload || payload.length === 0) return null;
  const countryCode = payload[0].payload.code;
  const countryName = getCountryName(countryCode);
  return (
    <Paper
      elevation={3}
      sx={{
        backgroundColor: "#fff",
        padding: "10px",
        border: "1px solid #ccc",
      }}
    >
      <Typography variant="body2" color="textPrimary">
        <ReactCountryFlag
          countryCode={countryCode}
          svg
          style={{ width: 24, height: 24, marginRight: 4 }}
        />{" "}
        {countryName}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {`Total Events: ${payload[0].value}`}
      </Typography>
    </Paper>
  );
}

interface XAxisTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
}

export function CustomXAxisTick({ x = 0, y = 0, payload }: XAxisTickProps) {
  const countryCode = payload?.value ?? "";
  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-20} y={0} width={50} height={40}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ borderRadius: 1, p: 1, bgcolor: "background.paper" }}
        >
          <ReactCountryFlag
            countryCode={countryCode}
            svg
            style={{
              width: 24,
              height: 24,
              marginRight: 4,
              padding: 1,
              display: "inline-block",
            }}
          />
          <Typography variant="caption">{countryCode}</Typography>
        </Box>
      </foreignObject>
    </g>
  );
}

// =============================================================================
// Date range presets
// =============================================================================
export interface DatePreset {
  label: string;
  value: [Dayjs, Dayjs];
}

export function buildDatePresets(): DatePreset[] {
  return [
    { label: "Today", value: [dayjs().startOf("day"), dayjs().endOf("day")] },
    {
      label: "This Week",
      value: [dayjs().startOf("week"), dayjs().endOf("week")],
    },
    {
      label: "Last Week",
      value: [
        dayjs().subtract(1, "week").startOf("week"),
        dayjs().subtract(1, "week").endOf("week"),
      ],
    },
    {
      label: "Last Month",
      value: [
        dayjs().subtract(1, "month").startOf("month"),
        dayjs().subtract(1, "month").endOf("month"),
      ],
    },
    { label: "Last 3 Months", value: [dayjs().subtract(3, "month"), dayjs()] },
    { label: "Last Year", value: [dayjs().subtract(1, "year"), dayjs()] },
  ];
}

// =============================================================================
// Events table (replacement for the Vite DataGrid + DataColumns)
// =============================================================================
export interface AdminEventRow {
  id?: string | number;
  _id?: string | number;
  title?: string;
  image?: string;
  location?: string;
  countryCode?: string;
  status?: string;
  eventDate?: string;
  publishedDate?: string;
  participantsCount?: number;
  viewers?: unknown[];
  subDomain?: { name?: string };
}

function statusOf(eventDate?: string): {
  label: string;
  color: "info" | "warning" | "success";
  icon: ReactElement;
} {
  if (!eventDate) {
    return {
      label: "Unknown",
      color: "info",
      icon: <AccessTimeIcon color="info" />,
    };
  }
  const d = dayjs(eventDate);
  const now = dayjs();
  if (d.isSame(now, "day")) {
    return {
      label: "Event Happening Now",
      color: "info",
      icon: <AccessTimeIcon color="info" />,
    };
  }
  if (d.isAfter(now)) {
    return {
      label: "Event Pending",
      color: "warning",
      icon: <PendingIcon color="warning" />,
    };
  }
  return {
    label: "Event Completed",
    color: "success",
    icon: <CheckCircleIcon color="success" />,
  };
}

interface EventsTableProps {
  rows: AdminEventRow[];
  loading?: boolean;
  /** When set, pagination is server-side and these props drive the pager. */
  serverPagination?: {
    page: number; // 0-indexed
    perPage: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export function EventsTable({
  rows,
  loading,
  serverPagination,
}: EventsTableProps) {
  const [clientPage, setClientPage] = React.useState(0);
  const [clientPerPage, setClientPerPage] = React.useState(20);

  const usingServer = !!serverPagination;
  const page = usingServer ? serverPagination!.page : clientPage;
  const perPage = usingServer ? serverPagination!.perPage : clientPerPage;
  const total = usingServer ? serverPagination!.total : rows.length;

  const pageRows = usingServer
    ? rows
    : rows.slice(page * perPage, page * perPage + perPage);

  return (
    <Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Event Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Country & Location</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Views
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Published Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Event Date</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 180 }}>
                Popularity
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">
                    No events to display.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row, i) => {
                const id = row.id ?? row._id ?? i;
                const s = statusOf(row.eventDate);
                const countryName = getCountryName(row.countryCode ?? "");
                const subdomain = row.subDomain?.name;
                const titleHref = subdomain
                  ? `https://${subdomain}.bayanihan.com`
                  : undefined;
                const viewsCount = Array.isArray(row.viewers)
                  ? row.viewers.length
                  : 0;
                const popularity = Math.min(
                  100,
                  Math.max(0, Number(row.participantsCount ?? 0))
                );
                return (
                  <TableRow key={String(id)} hover>
                    <TableCell sx={{ width: 60 }}>{String(id)}</TableCell>
                    <TableCell sx={{ minWidth: 280 }}>
                      <MUITooltip
                        title={row.title || "Untitled"}
                        placement="top-start"
                      >
                        <Box
                          component={titleHref ? "a" : "div"}
                          href={titleHref}
                          target={titleHref ? "_blank" : undefined}
                          rel={titleHref ? "noopener noreferrer" : undefined}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            textDecoration: "none",
                            color: "inherit",
                            ...(titleHref
                              ? { "&:hover": { textDecoration: "underline" } }
                              : {}),
                            textUnderlineOffset: "3px",
                          }}
                        >
                          {row.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={row.image}
                              alt={row.title || "Event"}
                              style={{
                                width: 48,
                                height: 48,
                                marginRight: 8,
                                aspectRatio: "1 / 1",
                                objectFit: "cover",
                              }}
                            />
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {row.title || "Untitled"}
                          </Typography>
                        </Box>
                      </MUITooltip>
                    </TableCell>
                    <TableCell>
                      <MUITooltip
                        title={row.location || "Unknown"}
                        placement="top-start"
                      >
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            fontWeight: 400,
                          }}
                        >
                          {row.countryCode && (
                            <ReactCountryFlag
                              countryCode={row.countryCode}
                              svg
                              style={{
                                width: 24,
                                height: 24,
                                marginRight: 8,
                              }}
                            />
                          )}
                          <Typography variant="body2">
                            {countryName || "Unknown"}
                          </Typography>
                        </Box>
                      </MUITooltip>
                    </TableCell>
                    <TableCell>
                      <MUITooltip title={s.label} placement="top-start">
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          {s.icon}
                        </Box>
                      </MUITooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{viewsCount}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {row.publishedDate || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {row.eventDate || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 180 }}>
                      <LinearProgress
                        variant="determinate"
                        value={popularity}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && total > 0 && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) =>
            usingServer ? serverPagination!.onPageChange(p) : setClientPage(p)
          }
          rowsPerPage={perPage}
          onRowsPerPageChange={
            usingServer
              ? undefined
              : (e) => {
                  setClientPerPage(parseInt(e.target.value, 10));
                  setClientPage(0);
                }
          }
          rowsPerPageOptions={
            usingServer ? [perPage] : [5, 10, 20, 50, 100]
          }
        />
      )}
    </Box>
  );
}

// =============================================================================
// PDF report generators
// Loaded via dynamic import inside the handlers so jspdf isn't pulled into
// the initial bundle.
// =============================================================================
interface PdfEvent {
  title?: string;
  eventDate?: string;
  location?: string;
}

async function loadPdf() {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  return { jsPDF, autoTable };
}

export async function generateCountryPDF(
  countryCode: string,
  events: PdfEvent[],
  primaryColor: string
) {
  try {
    const { jsPDF, autoTable } = await loadPdf();
    const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
    const countryName = getCountryName(countryCode) || countryCode;
    doc.setFontSize(18);
    doc.setTextColor("#06266b");
    doc.text("Bayanihan.com", 40, 30);
    doc.setFontSize(16);
    doc.setTextColor("#000");
    doc.text(`Event Report - ${countryName}`, 40, 60);
    doc.setFontSize(12);
    doc.text(`Generated on: ${dayjs().format("MMM DD, YYYY HH:mm")}`, 40, 80);
    doc.text(`Total Events: ${events.length}`, 40, 100);

    const tableData = events.map((event, index) => [
      index + 1,
      event.title || "N/A",
      event.eventDate ? dayjs(event.eventDate).format("MMM DD, YYYY") : "N/A",
      event.location || "N/A",
    ]);

    autoTable(doc, {
      head: [["#", "Event Title", "Event Date", "Location"]],
      body: tableData,
      startY: 130,
      styles: { fontSize: 10, cellWidth: "wrap" },
      headStyles: { fillColor: primaryColor },
      columnStyles: {
        1: { cellWidth: 250 },
        2: { cellWidth: 100 },
        3: { cellWidth: 400 },
      },
      margin: { left: 40, right: 40 },
    });

    doc.save(`Event_Report_${countryName}.pdf`);
  } catch (err) {
    console.error("Error generating PDF:", err);
  }
}

export async function generateFullReportPDF(
  countryData: Array<{ code: string; name: string }>,
  eventsByCountry: Record<string, PdfEvent[]>,
  primaryColor: string
) {
  try {
    const { jsPDF, autoTable } = await loadPdf();
    const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
    doc.setFontSize(18);
    doc.setTextColor("#06266b");
    doc.text("Bayanihan.com", 40, 30);
    doc.setFontSize(16);
    doc.setTextColor("#000");
    doc.text("Full Event Report", 40, 60);
    doc.setFontSize(12);
    doc.text(`Generated on: ${dayjs().format("MMM DD, YYYY HH:mm")}`, 40, 80);

    let startY = 120;
    countryData.forEach((country, index) => {
      const list = eventsByCountry[country.code] ?? [];
      if (!list.length) return;
      doc.setFontSize(14);
      doc.text(
        `${index + 1}. ${country.name} (Total Events: ${list.length})`,
        40,
        startY
      );
      startY += 20;
      const tableData = list.map((event, i) => [
        i + 1,
        event.title || "N/A",
        event.eventDate ? dayjs(event.eventDate).format("MMM DD, YYYY") : "N/A",
        event.location || "N/A",
      ]);
      autoTable(doc, {
        head: [["#", "Event Title", "Event Date", "Location"]],
        body: tableData,
        startY,
        styles: { fontSize: 10, cellWidth: "wrap" },
        headStyles: { fillColor: primaryColor },
        columnStyles: {
          1: { cellWidth: 250 },
          2: { cellWidth: 100 },
          3: { cellWidth: 400 },
        },
        margin: { left: 40, right: 40 },
      });
      const last = (doc as unknown as { lastAutoTable?: { finalY?: number } })
        .lastAutoTable;
      startY = last?.finalY ? last.finalY + 20 : startY + 20;
      if (startY > 500 && index !== countryData.length - 1) {
        doc.addPage();
        startY = 40;
      }
    });

    doc.save("Full_Event_Report.pdf");
  } catch (err) {
    console.error("Error generating full PDF:", err);
  }
}
