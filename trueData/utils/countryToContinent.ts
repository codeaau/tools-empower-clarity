// trueData/utils/countryToContinent.ts
// Country -> continent mapping loaded from generated JSON dataset
import data from "../data/countryToContinent.json" assert { type: "json" };

export const countryToContinent: Record<string, string> = data;
