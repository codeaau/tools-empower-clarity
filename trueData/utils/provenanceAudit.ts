// trueData/utils/provenanceAudit.ts
import fs from "fs";
import path from "path";

export interface ProvenanceRecord {
  id: string; // unique record id
  eventId?: string;
  method: "entered" | "inferred" | "system-default";
  source: "coordinates" | "tzName" | "system" | string;
  rawResolverOutput?: any;
  userConfirmed?: boolean;
  note?: string;
  timestamp: string;
}

const AUDIT_DIR = path.resolve(process.cwd(), "provenance");
const AUDIT_FILE = path.join(AUDIT_DIR, "audit.log");

async function ensureAuditDir(): Promise<void> {
  await fs.promises.mkdir(AUDIT_DIR, { recursive: true });
}

export async function appendProvenance(record: ProvenanceRecord): Promise<void> {
  await ensureAuditDir();
  const line = JSON.stringify(record) + "\n";
  await fs.promises.appendFile(AUDIT_FILE, line, { encoding: "utf8" });
}
