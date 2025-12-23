// src/token.ts
import { randomUUID } from "node:crypto";
import type { TrackingToken } from "../types-sct.js";

/**
 * Create a lightweight tracking token.
 * Format: `${type}-${timestamp36}-${uuidShort}`
 */
export function createToken(type = "GENERIC"): TrackingToken {
  const timestamp = Date.now().toString(36);
  const uuidShort = randomUUID().split("-")[0];
  return {
    id: `${type}-${timestamp}-${uuidShort}`,
    type,
    createdAt: new Date().toISOString(),
  } as TrackingToken;
}
