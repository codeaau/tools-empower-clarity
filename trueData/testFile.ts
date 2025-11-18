// trueData/testFile.ts
import { withConsent } from "./utils/consentMiddleware";
import { promptString } from "./utils/prompt";
import { Data } from "./core/sampleEntries";
import { exportEventJson, exportEventMd } from "./utils/exporters";

async function main() {
  // Ask consent for coordinates (sensitive)
  const consentCoords = await withConsent({ reason: "capturing coordinates to resolve timezone" }, async () => true);

  let event: Data | null = null;

  if (consentCoords) {
    // Ask user to enter coordinates (latitude, longitude)
    const latStr = await promptString("Enter latitude (e.g., 40.7128)");
    const lonStr = await promptString("Enter longitude (e.g., -74.0060)");
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      console.log("Invalid coordinates entered. Falling back to timezone prompt.");
    } else {
      // Use async factory for coordinates
      event = await Data.createWithCoordinates("event", [lat, lon], true);
    }
  }

  if (!event) {
    // Ask user for timezone string as voluntary fallback
    const consentTz = await withConsent({ reason: "entering timezone string manually" }, async () => true);
    if (consentTz) {
      const tzName = await promptString("Enter your timezone (e.g., America/New_York)");
      if (tzName) {
        event = new Data("event", { tzName, provenance: { confirmedByUser: true } as any });
      }
    }
  }

  // Final fallback: system-default
  if (!event) {
    event = new Data("event");
  }

  console.log(event.get());

  const outDir = "./logs";
  const jsonPath = exportEventJson(outDir, event);
  const mdPath = exportEventMd(outDir, event);

  console.log(`Wrote:\n- ${jsonPath}\n- ${mdPath}`);
}

main().catch(err => {
  console.error("Run failed:", err);
  process.exit(1);
});
