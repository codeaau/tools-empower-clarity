// trueData/utils/signature.ts
import crypto from "node:crypto";

export function signRecord(secret: string, payload: object): string {
  const h = crypto.createHmac("sha256", secret);
  h.update(JSON.stringify(payload));
  return h.digest("hex");
}
