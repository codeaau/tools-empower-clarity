// src/auditTrail.ts
import fs from "node:fs";
import path from "node:path";
import type { TrackingToken } from "../types-sct.js";

const defaultLogFile = "session-log.txt";

/**
 * Append a single-line structured audit entry (JSON-ish) plus human readable
 * line for quick inspection. This keeps both machine- and human-friendly traces.
 */
export function recordAction(
  projectRoot: string,
  token: TrackingToken,
  action: string,
  meta: Record<string, unknown> = {}
): void {
  const logPath = path.join(projectRoot, defaultLogFile);
  const ts = new Date().toISOString();
  const short = `[${ts}] ${token.id} | ${token.type} | ${action} | ${JSON.stringify(meta)}`;
  // also append a human readable block if the file looks like the session-log format
  fs.appendFileSync(logPath, short + "\n", { encoding: "utf-8" });
}
