// trueData/core/sampleEntries.ts
import { v4 as uuidv4 } from "uuid";
import { resolveTimeZone, ResolvedLocation } from "../utils/resolveTimeZone";
import { resolveFromCoordinates } from "../utils/resolveFromCoordinates";
import { appendProvenance } from "../utils/provenanceAudit";

export type entry = "data" | "event" | "command" | "input" | "session";

export type ProvenanceMethod = "entered" | "inferred" | "system-default";

export interface Provenance {
  method: ProvenanceMethod;
  source: string; // e.g., "coordinates", "tzName", "system"
  confirmedByUser?: boolean;
  timestamp: string;
  rawResolverOutput?: any;
}

export class Data {
  public type: entry;
  public creation: string;
  public id: string;
  public location: ResolvedLocation;
  public provenance: Provenance;

  constructor(
    type: entry,
    opts: { tzName?: string; coordinates?: [number, number]; provenance?: Partial<Provenance> } = {}
  ) {
    this.type = type;
    this.creation = new Date().toISOString();
    const safeCreation = this.creation.replace(/[:.]/g, "-");
    this.id = `${this.type[0].toUpperCase()}-${safeCreation}-${uuidv4()}`;

    // Default provenance object
    const baseProv: Provenance = {
      method: "system-default",
      source: "system",
      confirmedByUser: false,
      timestamp: new Date().toISOString(),
    };

    if (opts.coordinates) {
      // Coordinates path (entered by user or provided)
      // Note: resolveFromCoordinates is async; but constructor must be sync.
      // To keep API simple, we resolve synchronously by calling a helper below.
      throw new Error(
        "Use Data.createWithCoordinates(...) for coordinate-based creation (async)."
      );
    } else {
      const tz = opts.tzName ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
      this.location = resolveTimeZone(tz);
      this.provenance = {
        ...baseProv,
        method: opts.tzName ? "entered" : "system-default",
        source: opts.tzName ? "tzName" : "system",
        confirmedByUser: !!opts.provenance?.confirmedByUser,
        timestamp: new Date().toISOString(),
      };
      // Log provenance
      appendProvenance({
        id: uuidv4(),
        eventId: this.id,
        method: this.provenance.method,
        source: this.provenance.source,
        rawResolverOutput: { tzName: tz },
        userConfirmed: this.provenance.confirmedByUser,
        timestamp: this.provenance.timestamp,
      }).catch(() => {});
    }
  }

  static async createWithCoordinates(
    type: entry,
    coords: [number, number],
    confirmedByUser = true
  ): Promise<Data> {
    const d = Object.create(Data.prototype) as Data;
    d.type = type;
    d.creation = new Date().toISOString();
    const safeCreation = d.creation.replace(/[:.]/g, "-");
    d.id = `${d.type[0].toUpperCase()}-${safeCreation}-${uuidv4()}`;

    const resolved = await resolveFromCoordinates(coords);
    d.location = resolved.location;
    d.provenance = {
      method: "entered",
      source: "coordinates",
      confirmedByUser,
      timestamp: new Date().toISOString(),
      rawResolverOutput: resolved.raw,
    };

    // Log provenance with eventId
    await appendProvenance({
      id: uuidv4(),
      eventId: d.id,
      method: d.provenance.method,
      source: d.provenance.source,
      rawResolverOutput: d.provenance.rawResolverOutput,
      userConfirmed: d.provenance.confirmedByUser,
      timestamp: d.provenance.timestamp,
    });

    return d;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      creation: this.creation,
      location: this.location,
      provenance: this.provenance,
    };
  }

  get(): string {
    return `Type: ${this.type}, Creation: ${this.creation}, ID: ${this.id}, Location: ${JSON.stringify(
      this.location
    )}, Provenance: ${JSON.stringify(this.provenance)}`;
  }
}
