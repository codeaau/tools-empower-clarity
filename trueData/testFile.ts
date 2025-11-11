// testFile.ts
import { Data } from "./core/sampleEntries";
import { exportEventJson, exportEventMd } from "./utils/exporters";

const event = new Data("event", "America/New_York");
console.log(event.get());

const outDir = "./logs";
const jsonPath = exportEventJson(outDir, event);
const mdPath = exportEventMd(outDir, event);

console.log(`Wrote:\n- ${jsonPath}\n- ${mdPath}`);
