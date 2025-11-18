// trueData/utils/consentMiddlewareV2.ts
import readline from "node:readline";

export type Sensitivity = "low" | "medium" | "high";

export interface ConsentOptions {
  reason: string;
  sensitivity?: Sensitivity;
  retention?: string; // e.g., "transient", "session", "persistent"
}

function promptYesNo(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(`${question} (y/N): `, answer => {
      rl.close();
      const a = (answer || "").trim().toLowerCase();
      resolve(a === "y" || a === "yes");
    });
  });
}

export async function requestConsent(opts: ConsentOptions): Promise<{ granted: boolean; timestamp: string }> {
  const q = `Consent request: ${opts.reason}\nSensitivity: ${opts.sensitivity ?? "medium"}; Retention: ${opts.retention ?? "session"}\nDo you consent?`;
  const granted = await promptYesNo(q);
  return { granted, timestamp: new Date().toISOString() };
}

/**
 * Wrapper for actions that require consent.
 * Example: await withConsent({reason:"capture coordinates"}, async () => { ... })
 */
export async function withConsent<T>(opts: ConsentOptions, action: () => Promise<T>): Promise<T | null> {
  const { granted, timestamp } = await requestConsent(opts);
  if (!granted) {
    console.log(`Consent denied (${timestamp}) — skipping ${opts.reason}`);
    return null;
  }
  return action();
}
