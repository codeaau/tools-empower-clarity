// scripts/generate-country-to-continent.ts
// Use global fetch (Node 18+) instead of node-fetch to avoid external dependency and missing types
const fetch = (globalThis as any).fetch;
import { parse } from "csv-parse/sync";
import fs from "node:fs";
const RAW_CSV_URL = "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv";

async function main() {
  const res = await fetch(RAW_CSV_URL);
  const csv = await res.text();
  const rows = parse(csv, { columns: true }) as Array<Record<string, string>>;
  const map: Record<string, string> = {};
  for (const r of rows) {
    const alpha2 = (r["alpha-2"] || r["alpha2"] || r["alpha_2"] || "").trim();
    const region = (r["region"] || r["Region"] || r["continent"] || "").trim();
    if (alpha2 && region) map[alpha2] = region;
  }
  fs.mkdirSync("trueData/data", { recursive: true });
  fs.writeFileSync("trueData/data/countryToContinent.json", JSON.stringify(map, null, 2), "utf8");
  console.log("Wrote trueData/data/countryToContinent.json");
}
main().catch(e => { console.error(e); process.exit(1); });