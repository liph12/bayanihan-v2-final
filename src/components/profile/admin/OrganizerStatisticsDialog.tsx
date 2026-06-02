"use client";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import type { SelectChangeEvent } from "@mui/material/Select";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNew from "@mui/icons-material/OpenInNew";
import dayjs from "dayjs";
import {
  getCountryFlag,
  getCountryName,
  type DialogType,
  type DialogOrganizer,
  type DialogParticipantEvent,
  type DialogCountry,
} from "./OrganizerStatisticsHelpers";

interface Props {
  dialogOpen: boolean;
  dialogType: DialogType;
  organizerCountryFilter: string;
  setOrganizerCountryFilter: (v: string) => void;
  handleCloseDialog: () => void;
  organizerMinEvents: number;
  setOrganizerMinEvents: (v: number) => void;
  dialogData: DialogOrganizer[] | DialogParticipantEvent[] | DialogCountry[];
  organizerSortBy: string;
  setOrganizerSortBy: (v: string) => void;
  countrySearchFilter: string;
  setCountrySearchFilter: (v: string) => void;
  filteredDialogData:
    | DialogOrganizer[]
    | DialogParticipantEvent[]
    | DialogCountry[];
  toggleOrganizerDialogExpansion: (key: string) => void;
  expandedOrganizerDialog: Record<string, boolean>;
  toggleCountryEventsExpansion: (key: string) => void;
  expandedCountryEvents: Record<string, boolean>;
}

export default function OrganizerStatisticsDialog({
  dialogOpen,
  dialogType,
  organizerCountryFilter,
  setOrganizerCountryFilter,
  handleCloseDialog,
  organizerMinEvents,
  setOrganizerMinEvents,
  dialogData,
  organizerSortBy,
  setOrganizerSortBy,
  countrySearchFilter,
  setCountrySearchFilter,
  filteredDialogData,
  toggleOrganizerDialogExpansion,
  expandedOrganizerDialog,
  toggleCountryEventsExpansion,
  expandedCountryEvents,
}: Props) {
  return (
    <Dialog
      open={dialogOpen}
      onClose={handleCloseDialog}
      maxWidth="lg"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {dialogType === "organizers" && "All Organizers"}
          {dialogType === "participants" && "Events with Participants"}
          {dialogType === "countries" && "Countries Overview"}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {dialogType === "organizers" && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Country</InputLabel>
                <Select
                  value={organizerCountryFilter}
                  label="Filter by Country"
                  onChange={(e: SelectChangeEvent) =>
                    setOrganizerCountryFilter(e.target.value)
                  }
                >
                  <MenuItem value="">All Countries</MenuItem>
                  {Array.from(
                    new Set(
                      (dialogData as DialogOrganizer[]).map(
                        (org) => org.countryCode
                      )
                    )
                  ).map((countryCode) => (
                    <MenuItem key={countryCode} value={countryCode}>
                      {getCountryFlag(countryCode)} {getCountryName(countryCode)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Min Events</InputLabel>
                <Select
                  value={String(organizerMinEvents)}
                  label="Min Events"
                  onChange={(e: SelectChangeEvent) =>
                    setOrganizerMinEvents(Number(e.target.value))
                  }
                >
                  <MenuItem value="0">Any</MenuItem>
                  <MenuItem value="1">1+</MenuItem>
                  <MenuItem value="5">5+</MenuItem>
                  <MenuItem value="10">10+</MenuItem>
                  <MenuItem value="20">20+</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={organizerSortBy}
                  label="Sort By"
                  onChange={(e: SelectChangeEvent) =>
                    setOrganizerSortBy(e.target.value)
                  }
                >
                  <MenuItem value="totalEvents">Total Events</MenuItem>
                  <MenuItem value="publicEvents">Public Events</MenuItem>
                  <MenuItem value="totalParticipants">
                    Total Participants
                  </MenuItem>
                  <MenuItem value="name">Name (A-Z)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        {dialogType === "countries" && (
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Search Countries</InputLabel>
              <Select
                value={countrySearchFilter}
                label="Search Countries"
                onChange={(e: SelectChangeEvent) =>
                  setCountrySearchFilter(e.target.value)
                }
              >
                <MenuItem value="">All Countries</MenuItem>
                {(dialogData as DialogCountry[]).map((country) => (
                  <MenuItem
                    key={country.countryCode}
                    value={country.countryCode}
                  >
                    {getCountryFlag(country.countryCode)} {country.countryName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <List>
          {dialogType === "organizers" &&
            (filteredDialogData as DialogOrganizer[]).map((organizer) => {
              const key = `${organizer.name}-${organizer.email}`;
              return (
                <Box key={key}>
                  <ListItem
                    divider
                    sx={{ cursor: "pointer", py: 2 }}
                    onClick={() => toggleOrganizerDialogExpansion(key)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={organizer.photo}
                        sx={{ width: 48, height: 48 }}
                      >
                        {organizer.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600 }}
                          >
                            {organizer.name}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {organizer.email}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 0.5,
                          }}
                        >
                          <Chip
                            label={`${organizer.totalEvents} Events`}
                            color="primary"
                            size="small"
                          />
                          <Chip
                            label={`${organizer.totalParticipants} Participants`}
                            color="info"
                            size="small"
                          />
                        </Box>
                        <IconButton size="small">
                          {expandedOrganizerDialog[key] ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>

                  <Collapse in={expandedOrganizerDialog[key]}>
                    <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        Countries where {organizer.name} has organized events:
                      </Typography>
                      {organizer.countriesData.map((countryData) => {
                        const innerKey = `${key}-${countryData.countryCode}`;
                        return (
                          <Box key={countryData.countryCode} sx={{ mb: 1 }}>
                            <ListItem
                              sx={{
                                cursor: "pointer",
                                borderRadius: 1,
                                "&:hover": { backgroundColor: "#f5f5f5" },
                                pl: 0,
                              }}
                              onClick={() =>
                                toggleCountryEventsExpansion(innerKey)
                              }
                            >
                              <ListItemText
                                primary={
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body1"
                                      sx={{ fontSize: "1.2rem" }}
                                    >
                                      {getCountryFlag(countryData.countryCode)}
                                    </Typography>
                                    <Typography
                                      variant="body1"
                                      sx={{ fontWeight: 500 }}
                                    >
                                      {countryData.countryName}
                                    </Typography>
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Chip
                                    label={`${countryData.events.length} Events`}
                                    size="small"
                                  />
                                  <IconButton size="small">
                                    {expandedCountryEvents[innerKey] ? (
                                      <ExpandLessIcon />
                                    ) : (
                                      <ExpandMoreIcon />
                                    )}
                                  </IconButton>
                                </Box>
                              </ListItemSecondaryAction>
                            </ListItem>

                            <Collapse in={expandedCountryEvents[innerKey]}>
                              <Box sx={{ pl: 3, mt: 1 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ mb: 1, display: "block" }}
                                >
                                  Events in {countryData.countryName}:
                                </Typography>
                                {countryData.events.map((event) => (
                                  <Card
                                    key={String(event.id)}
                                    variant="outlined"
                                    sx={{ mb: 1, borderRadius: 1 }}
                                  >
                                    <CardContent
                                      sx={{
                                        p: 2,
                                        "&:last-child": { pb: 2 },
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 500, mb: 0.5 }}
                                      >
                                        {event.title}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ display: "block", mb: 0.5 }}
                                      >
                                        {event.location}
                                      </Typography>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          gap: 0.5,
                                          alignItems: "center",
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        <Chip
                                          label={
                                            event.eventDate
                                              ? dayjs(event.eventDate).format(
                                                  "MMM DD, YYYY"
                                                )
                                              : "—"
                                          }
                                          size="small"
                                          variant="outlined"
                                        />
                                        <Chip
                                          label={`${event.participantsCount} participants`}
                                          size="small"
                                          color="info"
                                        />
                                        {event.isPast && (
                                          <Chip
                                            label="Past"
                                            color="warning"
                                            size="small"
                                          />
                                        )}
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          startIcon={<OpenInNew />}
                                          component="a"
                                          href={`https://${event.subDomain?.name}.bayanihan.com`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          sx={{ textTransform: "none" }}
                                        >
                                          Open Event Link
                                        </Button>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                ))}
                              </Box>
                            </Collapse>
                          </Box>
                        );
                      })}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}

          {dialogType !== "organizers" &&
            (filteredDialogData as Array<
              DialogParticipantEvent | DialogCountry
            >).map((item, index) => {
              const isParticipant = dialogType === "participants";
              const isCountry = dialogType === "countries";
              const participant = item as DialogParticipantEvent;
              const country = item as DialogCountry;
              return (
                <ListItem key={index} divider>
                  <ListItemAvatar>
                    <Avatar
                      src={isParticipant ? participant.image : undefined}
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: isCountry ? "transparent" : undefined,
                        fontSize: isCountry ? "2rem" : undefined,
                      }}
                    >
                      {isCountry ? getCountryFlag(country.countryCode) : undefined}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {isParticipant
                          ? participant.title
                          : country.countryName}
                      </Typography>
                    }
                    secondary={
                      <Box component="span">
                        {isParticipant && (
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              Organized by: {participant.organizerName}
                            </Typography>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              {participant.location} •{" "}
                              {participant.eventDate
                                ? dayjs(participant.eventDate).format(
                                    "MMM DD, YYYY"
                                  )
                                : "—"}
                            </Typography>
                          </>
                        )}
                        {isCountry && (
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            Country Code: {country.countryCode}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 0.5,
                      }}
                    >
                      {isParticipant && (
                        <>
                          <Chip
                            label={`${participant.participantsCount} Participants`}
                            color="primary"
                            size="small"
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            component="a"
                            href={participant.eventLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<OpenInNew />}
                          >
                            Open Link
                          </Button>
                        </>
                      )}
                      {isCountry && (
                        <>
                          <Chip
                            label={`${country.totalEvents} Events`}
                            color="primary"
                            size="small"
                          />
                          <Chip
                            label={`${country.totalOrganizers} Organizers`}
                            color="secondary"
                            size="small"
                          />
                        </>
                      )}
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCloseDialog} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
