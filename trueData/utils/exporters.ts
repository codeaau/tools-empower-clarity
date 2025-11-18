// trueData/utils/exporters.ts
import fs from "fs";
import path from "path";
import { Data } from "../core/sampleEntries";

export function exportEventJson(outDir: string, event: Data): string {
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${event.id}.json`);
  fs.writeFileSync(file, JSON.stringify(event.toJSON(), null, 2), "utf8");
  return file;
}

export function exportEventMd(outDir: string, event: Data): string {
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${event.id}.md`);
  const md = [
    `# Event ${event.id}`,
    `**Type:** ${event.type}`,
    `**Creation:** ${event.creation}`,
    `**Provenance:** ${event.provenance.method}; source: ${event.provenance.source}; confirmed: ${event.provenance.confirmedByUser}`,
    `**Location:** ${event.location.continent} → ${event.location.country} → ${event.location.city} → ${event.location.tzName} (${event.location.abbreviation})`,
    `**Local date/time:** ${event.location.dateTime}`,
    "",
  ].join("\n");
  fs.writeFileSync(file, md, "utf8");
  return file;
}
