"use client";
import type { ReactElement } from "react";
import ReactCountryFlag from "react-country-flag";
import dayjs, { type Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { getCountryName as libGetCountryName } from "@/lib/countryCodes";

dayjs.extend(isBetween);

// =============================================================================
// Types
// =============================================================================
export interface OrgStatsEvent {
  id?: string | number;
  title?: string;
  eventDate?: string;
  publishedDate?: string;
  status?: string;
  isPast?: boolean;
  participantsCount?: number;
  location?: string;
  countryCode?: string;
  organizer?: string;
  organizerEmail?: string;
  image?: string;
  subDomain?: { name?: string };
  user?: {
    name?: string;
    email?: string;
    details?: { photo?: string };
  };
}

export interface OrganizerEventEntry {
  id?: string | number;
  title?: string;
  eventDate?: string;
  status?: string;
  isPast?: boolean;
  participantsCount: number;
  location?: string;
  subDomain?: { name?: string };
}

export interface OrganizerEntry {
  name: string;
  email: string;
  photo?: string;
  events: OrganizerEventEntry[];
  totalEvents: number;
  publicEvents: number;
  pastEvents: number;
  upcomingEvents: number;
  totalParticipants: number;
}

export interface CountryEntry {
  countryName: string;
  organizers: Record<string, OrganizerEntry>;
  totalEvents: number;
  totalOrganizers: number;
}

export type OrganizerStats = Record<string, CountryEntry>;

export interface TotalStats {
  totalOrganizers: number;
  totalEvents: number;
  totalCountries: number;
  totalParticipants: number;
}

export type DialogType = "" | "organizers" | "participants" | "countries";

export interface CountryRollup {
  countryCode: string;
  countryName: string;
  events: OrganizerEventEntry[];
}

export interface DialogOrganizer extends OrganizerEntry {
  countryCode: string;
  countriesData: CountryRollup[];
}

export interface DialogParticipantEvent extends OrgStatsEvent {
  organizerName: string;
  countryName: string;
  eventLink: string;
}

export interface DialogCountry {
  countryCode: string;
  countryName: string;
  totalEvents: number;
  totalOrganizers: number;
}

// =============================================================================
// Country helpers
// =============================================================================
export function getCountryName(code?: string): string {
  if (!code) return "Unknown";
  return libGetCountryName(code) || code;
}

export function getCountryFlag(code: string): ReactElement {
  return (
    <ReactCountryFlag
      countryCode={code}
      svg
      style={{ width: 30, height: 30, marginRight: 4 }}
    />
  );
}

// =============================================================================
// Date range filter
// =============================================================================
export function filterEventsByDateRange(
  events: OrgStatsEvent[],
  dateRange: string,
  customStartDate: Dayjs | null,
  customEndDate: Dayjs | null
): OrgStatsEvent[] {
  if (dateRange === "all") return events;

  const now = dayjs();
  let startDate: Dayjs | undefined;
  let endDate: Dayjs | undefined;

  switch (dateRange) {
    case "today":
      startDate = now.startOf("day");
      endDate = now.endOf("day");
      break;
    case "yesterday":
      startDate = now.subtract(1, "day").startOf("day");
      endDate = now.subtract(1, "day").endOf("day");
      break;
    case "7days":
      startDate = now.day(0).startOf("day");
      endDate = now.day(6).endOf("day");
      break;
    case "1week":
      startDate = now.subtract(1, "week").day(0).startOf("day");
      endDate = now.subtract(1, "week").day(6).endOf("day");
      break;
    case "1month":
      startDate = now.subtract(1, "month").startOf("month");
      endDate = now.subtract(1, "month").endOf("month");
      break;
    case "3months":
      startDate = now.subtract(3, "month").startOf("day");
      endDate = now.endOf("day");
      break;
    case "6months":
      startDate = now.subtract(6, "month").startOf("day");
      endDate = now.endOf("day");
      break;
    case "1year":
      startDate = now.subtract(1, "year").startOf("day");
      endDate = now.endOf("day");
      break;
    case "custom":
      if (customStartDate && customEndDate) {
        startDate = dayjs(customStartDate).startOf("day");
        endDate = dayjs(customEndDate).endOf("day");
      }
      break;
    default:
      return events;
  }

  if (!startDate || !endDate) return events;

  return events.filter((evt) => {
    const pubDate = dayjs(evt.publishedDate, ["MMM D, YYYY", "YYYY-MM-DD"]);
    return pubDate.isBetween(startDate!, endDate!, null, "[]");
  });
}

// =============================================================================
// Aggregate events into per-country / per-organizer rollups
// =============================================================================
export function processOrganizerStats(
  events: OrgStatsEvent[]
): OrganizerStats {
  const stats: OrganizerStats = {};

  events.forEach((event) => {
    const country = event.countryCode || "Unknown";
    const organizerName =
      event.user?.name || event.organizer || "Unknown Organizer";
    const organizerEmail = event.user?.email || event.organizerEmail || "";
    const organizerKey = `${organizerName}-${organizerEmail}`;

    if (!stats[country]) {
      stats[country] = {
        countryName: getCountryName(country),
        organizers: {},
        totalEvents: 0,
        totalOrganizers: 0,
      };
    }

    if (!stats[country].organizers[organizerKey]) {
      stats[country].organizers[organizerKey] = {
        name: organizerName,
        email: organizerEmail,
        photo: event.user?.details?.photo,
        events: [],
        totalEvents: 0,
        publicEvents: 0,
        pastEvents: 0,
        upcomingEvents: 0,
        totalParticipants: 0,
      };
    }

    stats[country].organizers[organizerKey].events.push({
      id: event.id,
      title: event.title,
      eventDate: event.eventDate,
      status: event.status,
      isPast: event.isPast,
      participantsCount: event.participantsCount || 0,
      location: event.location,
      subDomain: event.subDomain,
    });

    const org = stats[country].organizers[organizerKey];
    org.totalEvents += 1;
    org.totalParticipants += event.participantsCount || 0;
    if (event.status === "Public") org.publicEvents += 1;
    if (event.isPast) org.pastEvents += 1;
    else org.upcomingEvents += 1;

    stats[country].totalEvents += 1;
  });

  Object.values(stats).forEach((c) => {
    c.totalOrganizers = Object.keys(c.organizers).length;
  });

  return stats;
}
