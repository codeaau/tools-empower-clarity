// trueData/utils/coordinateResolver.ts
import { LRUCache } from "lru-cache";
import { find as geoTzFind } from "geo-tz";
import tzlookup from "tz-lookup"; // optional fallback
import { resolveTimeZone } from "./resolveTimeZone";

const cache = new LRUCache<string, any>({ max: 5000, ttl: 1000 * 60 * 60 * 24 }); // 1 day

export async function resolveCoordinates(lat: number, lon: number) {
  const key = `${lat.toFixed(6)},${lon.toFixed(6)}`;
  if (cache.has(key)) return cache.get(key);

  let candidates: string[] = [];
  try {
    candidates = geoTzFind(lat, lon);
  } catch {
    try {
      const tz = tzlookup(lat, lon);
      candidates = [tz];
    } catch {
      candidates = [];
    }
  }

  const tzName = candidates[0] ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Etc/UTC";
  const resolved = resolveTimeZone(tzName);

  const result = { tzName, candidates, resolved, confidence: candidates.length ? 0.95 : 0.5 };
  cache.set(key, result);
  return result;
}
