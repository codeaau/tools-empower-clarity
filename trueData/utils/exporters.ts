import fs from "fs";
import path from "path";
import { Data } from "../core/sampleEntries";


export function exportEventJson(outDir: string, event: Data): string {
  const file = path.join(outDir, `${event.id}.json`);
  const payload = event.toJSON();
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(payload, null, 2), "utf8");
  return file;
}

export function exportEventMd(outDir: string, event: Data): string {
  const file = path.join(outDir, `${event.id}.md`);
  const lines = [
    `# Event ${event.id}`,
    "",
    `**Type:** ${event.type}`,
    `**Created:** ${event.creation}`,
    `**Time zone:** ${event.location.tzName} (${event.location.abbreviation})`,
    `**Continent:** ${event.location.continent}`,
    `**Country:** ${event.location.country}`,
    `**City:** ${event.location.city}`,
    `**Local date-time:** ${event.location.dateTime}`,
    "",
  ];
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  return file;
}
