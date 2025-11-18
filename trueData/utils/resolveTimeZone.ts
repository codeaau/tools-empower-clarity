// trueData/utils/resolveTimeZone.ts
import * as ct from "countries-and-timezones";
import { countryToContinent } from "./countryToContinent";

export interface ResolvedLocation {
  tzName: string;
  abbreviation: string;
  continent: string;
  country: string;
  city: string;
  dateTime: string;
}

/**
 * Resolve IANA zone name to a narratable location snapshot.
 */
export function resolveTimeZone(tzName: string): ResolvedLocation {
  const tzInfo = ct.getTimezone(tzName);

  const countryCode =
    tzInfo && Array.isArray((tzInfo as any).countries) && (tzInfo as any).countries.length > 0
      ? (tzInfo as any).countries[0]
      : (tzInfo as any).country ?? undefined;

  const countryInfo = countryCode ? ct.getCountry(countryCode) : null;

  // Use canonical mapping if library doesn't provide continent
  const continent =
    countryCode && countryToContinent[countryCode]
      ? countryToContinent[countryCode]
      : // fallback to library continent if present (normalize)
      (countryInfo && typeof (countryInfo as any).continent === "string"
        ? String((countryInfo as any).continent).toUpperCase()
        : "Unknown");

  const country =
    countryInfo && typeof (countryInfo as any).name === "string"
      ? (countryInfo as any).name
      : countryCode ?? "Unknown";

  const parts = tzName.split("/");
  const city = parts[1] ?? "Unknown";

  // Abbreviation: prefer Intl short name; fallback to "UNK"
  let abbr = "UNK";
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: tzName, timeZoneName: "short" })
      .formatToParts(new Date());
    abbr = parts.find(p => p.type === "timeZoneName")?.value ?? "UNK";
  } catch {
    abbr = "UNK";
  }

  const dateTime = new Date().toLocaleString("en-US", { timeZone: tzName });

  return {
    tzName,
    abbreviation: abbr,
    continent,
    country,
    city,
    dateTime,
  };
}
