// trueData/interfaces/ITimezoneResolver.ts
import { ResolvedLocation } from "../utils/resolveTimeZone";

export interface ITimezoneResolver {
  resolveFromCoordinates(lat: number, lon: number): Promise<{ tzName: string; resolved: ResolvedLocation; raw?: any }>;
  resolveFromTzName(tzName: string): ResolvedLocation;
  version(): string;
}
