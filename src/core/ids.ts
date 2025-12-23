import { randomUUID } from "node:crypto";

export function generateId(prefix: string = "CLARITY"): string {
  const timestamp = Date.now().toString(36);
  const unique = randomUUID().split("-")[0]; // short segment
  return `${prefix}-${timestamp}-${unique}`;
}
