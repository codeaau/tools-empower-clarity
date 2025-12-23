// trueData/utils/provenanceAudit.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatError } from "../../utils/errorReporter.js";

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep existing append-only audit (repo-relative, not CWD)
const AUDIT_DIR = path.resolve(__dirname, "../../provenance");
const AUDIT_FILE = path.join(AUDIT_DIR, "audit.log");

async function ensureAuditDir(): Promise<void> {
  await fs.promises.mkdir(AUDIT_DIR, { recursive: true });
}

export async function appendProvenance(record: ProvenanceRecord): Promise<void> {
  await ensureAuditDir();
  const line = JSON.stringify(record) + "\n";
  await fs.promises.appendFile(AUDIT_FILE, line, { encoding: "utf8" });
}

// New: CLI-oriented run() that produces deterministic artifacts under trueData/logs/
type RunOptions = {
  logDir?: string;   // default: "trueData/logs"
  root?: string;     // default: "."
  verbose?: boolean;
  json?: boolean;
};

export async function run(options: RunOptions = {}) {
  const logDir = path.resolve(process.cwd(), options.logDir ?? "trueData/logs");
  const humanLog = path.resolve(logDir, "provenance-audit.log");
  const jsonOut = path.resolve(logDir, "provenance-report.json");

  try {
    await fs.promises.mkdir(logDir, { recursive: true });

    // Aggregate a simple report from the append-only audit file (if present)
    let count = 0;
    let sampleSources = new Set<string>();
    try {
      const content = await fs.promises.readFile(AUDIT_FILE, "utf8");
      const lines = content.trim().length ? content.trim().split("\n") : [];
      for (const line of lines) {
        const rec = JSON.parse(line) as ProvenanceRecord;
        count += 1;
        if (rec.source) sampleSources.add(rec.source);
      }
    } catch {
      // No audit file yet; proceed with an empty summary
    }

    const report = {
      status: "ok",
      recordsCount: count,
      sources: Array.from(sampleSources),
      auditFile: path.relative(process.cwd(), AUDIT_FILE),
      summary: count > 0 ? `Found ${count} provenance records` : "No provenance records found",
    };

    const humanSummary = `Provenance audit: ${report.summary}`;
    await fs.promises.writeFile(humanLog, `${humanSummary}\n`, "utf8");
    await fs.promises.writeFile(jsonOut, JSON.stringify(report, null, 2), "utf8");

    if (options.verbose) {
      console.log(humanSummary);
    }
    return report;
  } catch (err: any) {
    const error = formatError(err, { source: "trueData/utils/provenanceAudit.ts", func: "run" });
    const header = `[ERROR] ${error.message} (${error.source}:${error.location})`;

    try {
      await fs.promises.mkdir(path.dirname(humanLog), { recursive: true });
      await fs.promises.writeFile(humanLog, `${header}\n${error.stack ?? ""}\n`, "utf8");
      await fs.promises.writeFile(jsonOut, JSON.stringify({ status: "error", error }, null, 2), "utf8");
    } catch {
      // If even logging fails, at least emit to stderr
    }
    console.error(header);
    throw err;
  }
}
