// Converts the API's human-readable dates into the ISO 8601 form
// schema.org requires. Google rejects an Event whose startDate reads
// "September 27, 2026", which silently disqualifies the page from event
// rich results — the whole point of the markup.

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

// The API returns dates as "September 27, 2026" or "Feb 25, 2026", and
// times as "03:00 PM". Parsing is strict so a format we don't recognise
// yields null (markup omitted) rather than a wrong date.
const DATE_FORMATS = ["MMMM D, YYYY", "MMM D, YYYY", "YYYY-MM-DD"];
const TIME_FORMATS = ["hh:mm A", "h:mm A", "HH:mm"];

// Returns "2026-09-27T15:00:00" when a time is supplied and parses,
// "2026-09-27" when only the date does, and null otherwise. No timezone
// suffix: schema.org reads a local datetime as local to the event, which
// is what the API gives us (it stores no offset).
export function toSchemaDate(
  date?: string | null,
  time?: string | null
): string | undefined {
  if (!date) return undefined;
  const day = dayjs(String(date), DATE_FORMATS, true);
  if (!day.isValid()) return undefined;
  if (time) {
    const t = dayjs(String(time), TIME_FORMATS, true);
    if (t.isValid()) {
      return day
        .hour(t.hour())
        .minute(t.minute())
        .second(0)
        .format("YYYY-MM-DDTHH:mm:ss");
    }
  }
  return day.format("YYYY-MM-DD");
}
