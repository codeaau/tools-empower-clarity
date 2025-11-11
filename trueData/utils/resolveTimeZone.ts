// aau/utils/resolveTimeZone.ts
import * as ct from "countries-and-timezones";

const continentMap: Record<string, string> = {
  AF: "Africa",
  AN: "Antarctica",
  AS: "Asia",
  EU: "Europe",
  NA: "North America",
  SA: "South America",
  OC: "Oceania",
};

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
 * Defensive about typings and runtime shape of countries-and-timezones.
 */
export function resolveTimeZone(tzName: string): ResolvedLocation {
  const tzInfo = ct.getTimezone(tzName);

  // Prefer array of country codes if present, else fall back to single code
  const countryCode =
    tzInfo && Array.isArray((tzInfo as any).countries) && (tzInfo as any).countries.length > 0
      ? (tzInfo as any).countries[0]
      : (tzInfo as any).country ?? undefined;

  const countryInfo = countryCode ? ct.getCountry(countryCode) : null;

  const continentCode =
    countryInfo && typeof (countryInfo as any).continent === "string"
      ? (countryInfo as any).continent
      : "UNK";

  const continent = continentMap[continentCode] ?? "Unknown";
  const country =
    countryInfo && typeof (countryInfo as any).name === "string"
      ? (countryInfo as any).name
      : "Unknown";

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
