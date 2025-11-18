// trueData/utils/resolveFromCoordinates.ts
import { find } from "geo-tz";
import { resolveTimeZone, ResolvedLocation } from "./resolveTimeZone";
import { appendProvenance } from "./provenanceAudit";
import { v4 as uuidv4 } from "uuid";

export interface CoordinateResolverResult {
  location: ResolvedLocation;
  raw: { tzCandidates: string[]; lat: number; lon: number };
}

/**
 * Resolve coordinates -> IANA timezone -> ResolvedLocation.
 * Logs raw resolver output to provenance audit store.
 */
export async function resolveFromCoordinates(coords: [number, number]): Promise<CoordinateResolverResult> {
  const [lat, lon] = coords;
  let tzCandidates: string[] = [];
  let tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || "Etc/UTC";

  try {
    tzCandidates = find(lat, lon); // geo-tz returns an array
    if (Array.isArray(tzCandidates) && tzCandidates.length > 0) {
      tzName = tzCandidates[0];
    }
  } catch (err) {
    // If geo-tz fails, keep system timezone as fallback
    tzCandidates = [];
  }

  const location = resolveTimeZone(tzName);

  // Append provenance audit record for this resolution
  const record = {
    id: uuidv4(),
    method: "inferred" as const,
    source: "coordinates",
    rawResolverOutput: { tzCandidates, lat, lon },
    userConfirmed: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await appendProvenance(record);
  } catch {
    // Non-fatal: audit failure should not break resolution
  }

  return { location, raw: { tzCandidates, lat, lon } };
}
