// src/session.ts
import fs from "fs";
import path from "path";
import { createToken, TrackingToken } from "./token.js";

const stateFileName = ".sct-session.json";

export interface SessionState {
  token: TrackingToken;
  startTime: number;
}

export function getStateFile(projectRoot: string): string {
  return path.join(projectRoot, stateFileName);
}

/**
 * Start an in-progress session and persist startTime + token.
 * Returns the new token.
 */
export function startSession(projectRoot: string): TrackingToken {
  const token = createToken("SESSION");
  const state: SessionState = { token, startTime: Date.now() };
  fs.writeFileSync(getStateFile(projectRoot), JSON.stringify(state), { encoding: "utf-8" });
  return token;
}

/**
 * Stop an active session. Returns token and duration string like "15m".
 * Throws if no active session exists.
 */
export function stopSession(projectRoot: string): { token: TrackingToken; duration: string } {
  const file = getStateFile(projectRoot);
  if (!fs.existsSync(file)) throw new Error("No active session found.");
  const raw = fs.readFileSync(file, "utf-8");
  const parsed = JSON.parse(raw) as SessionState;
  const now = Date.now();
  const minutes = Math.round((now - parsed.startTime) / 60000);
  fs.unlinkSync(file);
  return { token: parsed.token, duration: `${minutes}m` };
}

export function hasActiveSession(projectRoot: string): boolean {
  return fs.existsSync(getStateFile(projectRoot));
}
