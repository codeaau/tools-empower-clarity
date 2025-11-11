import { v4 as uuidv4 } from "uuid";
import { resolveTimeZone, ResolvedLocation } from "../utils/resolveTimeZone";

export type entry = "data" | "event" | "command" | "input" | "session";

export class Data {
  public type: entry;
  public creation: string;
  public id: string;
  public location: ResolvedLocation;

  constructor(type: entry, tzName: string = "America/New_York") {
    this.type = type;
    this.creation = new Date().toISOString();
    const safeCreation = this.creation.replace(/[:.]/g, "-"); // safer for filenames
    this.id = `${this.type[0].toUpperCase()}-${safeCreation}-${uuidv4()}`;
    this.location = resolveTimeZone(tzName);
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      creation: this.creation,
      location: this.location,
    };
  }

  get(): string {
    return `Type: ${this.type}, Creation: ${this.creation}, ID: ${this.id}, Location: ${JSON.stringify(
      this.location
    )}`;
  }
}
