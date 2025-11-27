import fs from "fs";
import path from "path";
import * as ct from "countries-and-timezones";

interface PatchOptions {
  patchName: string;
  added?: string;
  updated?: string;
  notes?: string;
  author?: string;
  status?: string;
}

interface TimestampInfo {
  formatted: string;
  tzAbbr: string;
  tzName: string;
  continent: string;
  country: string;
  city: string;
}

// Map continent codes to readable names
const continentMap: Record<string, string> = {
  AF: "Africa",
  AN: "Antarctica",
  AS: "Asia",
  EU: "Europe",
  NA: "North America",
  SA: "South America",
  OC: "Oceania",
};

/**
 * Generate a local time-zone timestamp string with abbreviation, IANA name, continent, country, and city.
 */
function generateTimestamp(): TimestampInfo {
  const now = new Date();

  const localTime = now.toLocaleString();

  const tzAbbr = Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
    .format(now)
    .split(" ")
    .pop() ?? "Unknown";

  const tzName = Intl.DateTimeFormat("en-US", { timeZoneName: "long" })
    .resolvedOptions()
    .timeZone;

  const parts = tzName.split("/");
  const city = parts[1] ?? "Unknown";

  // Lookup timezone and country info
  const tzInfo = ct.getTimezone(tzName);

  // Prefer the first country code from `countries` array if present
  const countryCode =
    tzInfo && Array.isArray((tzInfo as any).countries) && (tzInfo as any).countries.length > 0
      ? (tzInfo as any).countries[0]
      : (tzInfo as any).country ?? undefined;

  const countryInfo = countryCode ? ct.getCountry(countryCode) : null;

  // Safely read continent code and map to readable name
  const continentCode =
    countryInfo && typeof (countryInfo as any).continent === "string"
      ? (countryInfo as any).continent
      : "UNK";

  const continent = continentMap[continentCode] ?? "Unknown";

  // Safely read country name
  const country =
    countryInfo && typeof (countryInfo as any).name === "string"
      ? (countryInfo as any).name
      : "Unknown";

  return {
    formatted: `${localTime} ${tzAbbr}`,
    tzAbbr,
    tzName,
    continent,
    country,
    city,
  };
}

function ensurePatchFolder(patchName: string): string {
  const patchRoot = path.join(process.cwd(), "patches", patchName);
  if (!fs.existsSync(patchRoot)) {
    fs.mkdirSync(patchRoot, { recursive: true });
  }
  return patchRoot;
}

function writeTxtLedger(patchRoot: string, opts: PatchOptions, ts: TimestampInfo): void {
  const txtPath = path.join(patchRoot, `${opts.patchName}.txt`);
  const entry = `[${ts.formatted}] Patch created by ${opts.author ?? "unknown"}\n` +
                `Status: ${opts.status ?? "draft"}\n` +
                `Added: ${opts.added ?? "-"}\n` +
                `Updated: ${opts.updated ?? "-"}\n` +
                `Notes: ${opts.notes ?? "-"}\n` +
                `Time Zone: ${ts.tzAbbr} (${ts.tzName}, Continent: ${ts.continent}, Country: ${ts.country}, City: ${ts.city})\n\n`;

  fs.appendFileSync(txtPath, entry, { encoding: "utf8" });
}

function writeMdNarrative(patchRoot: string, opts: PatchOptions, ts: TimestampInfo): void {
  const mdPath = path.join(patchRoot, `${opts.patchName}.md`);
  if (fs.existsSync(mdPath)) return; // immutable

  const content = `# Patch: ${opts.patchName}\n\n` +
                  `**Author:** ${opts.author ?? "unknown"}\n` +
                  `**Status:** ${opts.status ?? "draft"}\n` +
                  `**Timestamp:** ${ts.formatted}\n` +
                  `**Time Zone:** ${ts.tzAbbr} (${ts.tzName}, Continent: ${ts.continent}, Country: ${ts.country}, City: ${ts.city})\n\n` +
                  `## Added\n${opts.added ?? "-"}\n\n` +
                  `## Updated\n${opts.updated ?? "-"}\n\n` +
                  `## Notes\n${opts.notes ?? "-"}\n`;

  fs.writeFileSync(mdPath, content, { encoding: "utf8" });
}

function writeJsonMetadata(patchRoot: string, opts: PatchOptions, ts: TimestampInfo): void {
  const jsonPath = path.join(patchRoot, `${opts.patchName}.json`);
  const metadata = {
    patchName: opts.patchName,
    author: opts.author ?? null,
    status: opts.status ?? "draft",
    added: opts.added ?? null,
    updated: opts.updated ?? null,
    notes: opts.notes ?? null,
    timestamp: ts.formatted,
    timeZone: {
      abbreviation: ts.tzAbbr,
      name: ts.tzName,
      continent: ts.continent,
      country: ts.country,
      city: ts.city,
    },
  };
  fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2), { encoding: "utf8" });
}

export async function createPatch(opts: PatchOptions): Promise<void> {
  const ts = generateTimestamp();
  const patchRoot = ensurePatchFolder(opts.patchName);

  writeTxtLedger(patchRoot, opts, ts);
  writeMdNarrative(patchRoot, opts, ts);
  writeJsonMetadata(patchRoot, opts, ts);
}
