// trueData/resolvers/geoTzResolver.ts
import { ITimezoneResolver } from "../interfaces/ITimezoneResolver";
import { resolveCoordinates } from "../utils/coordinateResolver";

export class GeoTzResolver implements ITimezoneResolver {
  async resolveFromCoordinates(lat: number, lon: number) {
    const r = await resolveCoordinates(lat, lon);
    return { tzName: r.tzName, resolved: r.resolved, raw: r.candidates };
  }
  resolveFromTzName(tzName: string) {
    return require("../utils/resolveTimeZone").resolveTimeZone(tzName);
  }
  version() {
    return "geo-tz-resolver@1.0.0";
  }
}
