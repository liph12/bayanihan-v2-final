"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  IconButton,
  Button,
  Collapse,
  Avatar,
  Divider,
  Stack,
  ButtonGroup,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import OpenInNew from "@mui/icons-material/OpenInNew";
import Edit from "@mui/icons-material/Edit";
import Link from "next/link";
import dayjs from "dayjs";
import { getCountryFlag, type OrganizerStats } from "./OrganizerStatisticsHelpers";

interface Props {
  organizerStats: OrganizerStats;
  onClearFilters: () => void;
}

export default function OrganizerStatisticsDisplay({
  organizerStats,
  onClearFilters,
}: Props) {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [expandedOrganizer, setExpandedOrganizer] = useState<string | null>(null);

  const toggleCountryExpansion = (countryCode: string) => {
    setExpandedCountry((prev) => (prev === countryCode ? null : countryCode));
    setExpandedOrganizer(null);
  };

  const toggleOrganizerExpansion = (organizerKey: string) => {
    setExpandedOrganizer((prev) =>
      prev === organizerKey ? null : organizerKey
    );
  };

  if (Object.keys(organizerStats).length === 0) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          textAlign: "center",
          py: 6,
        }}
      >
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            No organizers found with the current filters
          </Typography>
          <Button variant="outlined" onClick={onClearFilters} sx={{ mt: 2 }}>
            Clear Filters
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      {Object.entries(organizerStats).map(([countryCode, countryData]) => (
        <Card
          key={countryCode}
          sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                p: 1,
                borderRadius: 2,
                "&:hover": { backgroundColor: "#f8fafc" },
              }}
              onClick={() => toggleCountryExpansion(countryCode)}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h2" sx={{ fontSize: "2rem" }}>
                  {getCountryFlag(countryCode)}
                </Typography>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, color: "#1e293b" }}
                  >
                    {countryData.countryName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {countryData.totalOrganizers} organizers •{" "}
                    {countryData.totalEvents} events
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={`${countryData.totalOrganizers} Organizers`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={`${countryData.totalEvents} Events`}
                  color="secondary"
                  variant="outlined"
                  size="small"
                />
                <IconButton size="small">
                  {expandedCountry === countryCode ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </IconButton>
              </Box>
            </Box>

            <Collapse in={expandedCountry === countryCode}>
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 3 }} />
                <Stack spacing={2}>
                  {Object.entries(countryData.organizers).map(
                    ([organizerKey, organizer]) => (
                      <Card
                        key={organizerKey}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              toggleOrganizerExpansion(organizerKey)
                            }
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar
                                src={organizer.photo}
                                sx={{ width: 48, height: 48 }}
                              >
                                {organizer.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="h6"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {organizer.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {organizer.email}
                                </Typography>
                              </Box>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Chip
                                label={organizer.totalEvents}
                                color="default"
                                size="small"
                              />
                              <Chip
                                label={`${organizer.upcomingEvents} Upcoming`}
                                color="info"
                                size="small"
                              />
                              <IconButton size="small">
                                {expandedOrganizer === organizerKey ? (
                                  <ExpandLessIcon />
                                ) : (
                                  <ExpandMoreIcon />
                                )}
                              </IconButton>
                            </Box>
                          </Box>

                          <Collapse in={expandedOrganizer === organizerKey}>
                            <Box sx={{ mt: 2 }}>
                              <TableContainer
                                component={Paper}
                                variant="outlined"
                                sx={{ borderRadius: 2 }}
                              >
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell sx={{ fontWeight: 600 }}>
                                        Event Title
                                      </TableCell>
                                      <TableCell sx={{ fontWeight: 600 }}>
                                        Date
                                      </TableCell>
                                      <TableCell sx={{ fontWeight: 600 }}>
                                        Status
                                      </TableCell>
                                      <TableCell
                                        sx={{ fontWeight: 600 }}
                                        align="center"
                                      >
                                        Participants
                                      </TableCell>
                                      <TableCell
                                        sx={{ fontWeight: 600 }}
                                        align="center"
                                      >
                                        Action
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {organizer.events.map((event) => (
                                      <TableRow key={String(event.id)} hover>
                                        <TableCell>
                                          <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 500 }}
                                          >
                                            {event.title}
                                          </Typography>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                          >
                                            {event.location}
                                          </Typography>
                                        </TableCell>
                                        <TableCell sx={{ width: 150 }}>
                                          <Typography variant="body2">
                                            {event.eventDate
                                              ? dayjs(event.eventDate).format(
                                                  "MMM DD, YYYY"
                                                )
                                              : "—"}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Box
                                            sx={{ display: "flex", gap: 0.5 }}
                                          >
                                            {event.isPast && (
                                              <Chip
                                                label="Past"
                                                color="warning"
                                                size="small"
                                              />
                                            )}
                                          </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 500 }}
                                          >
                                            {event.participantsCount}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <ButtonGroup>
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              startIcon={<OpenInNew />}
                                              component="a"
                                              href={`https://${event.subDomain?.name}.bayanihan.com`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              View
                                            </Button>
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              startIcon={<Edit />}
                                              component={Link}
                                              href={`/events/editting/${event.id ?? ""}`}
                                              target="_blank"
                                            >
                                              Edit
                                            </Button>
                                          </ButtonGroup>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          </Collapse>
                        </CardContent>
                      </Card>
                    )
                  )}
                </Stack>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
