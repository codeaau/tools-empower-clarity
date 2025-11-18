// trueData/utils/countryToContinent.ts
// Canonical country -> continent mapping (sample). Extend or replace with a full ISO dataset as needed.
export const countryToContinent: Record<string, string> = {
  US: "North America",
  CA: "North America",
  MX: "North America",
  BR: "South America",
  AR: "South America",
  GB: "Europe",
  FR: "Europe",
  DE: "Europe",
  CN: "Asia",
  JP: "Asia",
  IN: "Asia",
  AU: "Oceania",
  NZ: "Oceania",
  ZA: "Africa",
  EG: "Africa",
  // Add more entries or load a full JSON file at runtime if you prefer.
};
