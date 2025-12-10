#!/usr/bin/env node
// cli/track-session.ts
// TypeScript CLI for Session Continuity Tracker (SCT)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

export type ExportFormat = "json" | "md" | "markdown" | "";

export interface Options {
  goal: string;
  tags: string;           // semicolon-separated
  duration: string;       // freeform (e.g., "30m", "1h")
  action: string;         // comma-separated
  decision: string;       // comma-separated
  next: string;           // comma-separated
  filter: string;
  search: string;
  out: string;            // output file for exports
  export: ExportFormat;
  detail: number;         // session number for detail view (0 = off)
  start: boolean;
  stop: boolean;
  summary: boolean;
  help: boolean;
  interactive: boolean;
}

export interface SessionEntry {
  number: number;
  date: string;
  goal: string;
  duration: string;
  actions: string[];
  decisions: string[];
  next: string[];
  tags: string;
}

export interface LogOptions {
  goal?: string;
  tags?: string;
  duration?: string;
  action?: string;
  decision?: string;
  next?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const sessionLogPath = path.join(projectRoot, "session-log.txt");
const stateFile = path.join(projectRoot, ".sct-session.json");

// ---------- Argument parsing ----------
export function parseArgs(args: string[]): Options {
  const parsed: Options = {
    action: "",
    duration: "",
    decision: "",
    detail: 0,
    export: "",
    filter: "",
    goal: "",
    help: false,
    interactive: false,
    next: "",
    out: "",
    search: "",
    start: false,
    stop: false,
    summary: false,
    tags: "",
  };

  if (args.length === 0) {
    parsed.interactive = true;
    return parsed;
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--action":
        parsed.action = args[++i] ?? "";
        break;
      case "--decision":
        parsed.decision = args[++i] ?? "";
        break;
      case "--detail":
        parsed.detail = Number.parseInt(args[++i] ?? "0", 10) || 0;
        break;
      case "--duration":
        parsed.duration = args[++i] ?? "";
        break;
      case "--export":
        parsed.export = ((args[++i] ?? "") as ExportFormat);
        break;
      case "--filter":
        parsed.filter = args[++i] ?? "";
        break;
      case "--goal":
        parsed.goal = args[++i] ?? "";
        break;
      case "--help":
        parsed.help = true;
        break;
      case "--next":
        parsed.next = args[++i] ?? "";
        break;
      case "--out":
        parsed.out = args[++i] ?? "";
        break;
      case "--search":
        parsed.search = args[++i] ?? "";
        break;
      case "--start":
        parsed.start = true;
        break;
      case "--stop":
        parsed.stop = true;
        break;
      case "--summary":
        parsed.summary = true;
        break;
      case "--tags":
        parsed.tags = args[++i] ?? "";
        break;
      default:
        // ignore unknown flags
        break;
    }
  }

  return parsed;
}

// ---------- File and formatting helpers ----------
export function ensureHeader(): void {
  if (!fs.existsSync(sessionLogPath)) {
    const header = `# Session Continuity Tracker Log
====================================================

`;
    fs.writeFileSync(sessionLogPath, header, { encoding: "utf-8" });
  }
}

export function getNextSessionNumber(): number {
  if (!fs.existsSync(sessionLogPath)) return 1;
  const content = fs.readFileSync(sessionLogPath, "utf-8");
  const matches = content.match(/Session #(\d+)/g) ?? [];
  return matches.length + 1;
}

export function listFromString(input?: string, sep = ","): string[] {
  if (!input) return [];
  return input
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatListForLog(items: string[]): string {
  return items.length ? items.map((i) => `- ${i}`).join("\n") : "-";
}

// ---------- Logging / append ----------
export function appendLog(opts: LogOptions): void {
  ensureHeader();
  const now = new Date();
  const timestamp = now.toISOString().replace("T", " ").split(".")[0];
  const sessionNumber = getNextSessionNumber();

  const actionsLines = formatListForLog(listFromString(opts.action));
  const decisionsLines = formatListForLog(listFromString(opts.decision));
  const nextLines = formatListForLog(listFromString(opts.next));

  const entryBlock = `
====================================================
Session #${sessionNumber}
Date: ${timestamp}
Duration: ${opts.duration ?? "?"}
Goal: ${opts.goal ?? ""}

Actions:
${actionsLines}

Decisions:
${decisionsLines}

Next Steps:
${nextLines}

Tags: ${opts.tags ?? ""}
====================================================

`;

  fs.appendFileSync(sessionLogPath, entryBlock, { encoding: "utf-8" });
  console.log(`Appended Session #${sessionNumber} to ${sessionLogPath}`);
}

// ---------- Parsing the log into structured sessions ----------
export function parseAllSessions(): SessionEntry[] {
  if (!fs.existsSync(sessionLogPath)) return [];
  const content = fs.readFileSync(sessionLogPath, "utf-8");
  const rawEntries = content
    .split("====================================================")
    .map((e) => e.trim())
    .filter((e) => e.includes("Date:"));

  return rawEntries.map((entry, idx) => {
    const numberMatch = entry.match(/Session #(\d+)/);
    const number = numberMatch ? Number(numberMatch[1]) : idx + 1;

    const actionsBlock =
      (entry.match(/Actions:\n([\s\S]*?)\n\nDecisions:/) ?? [])[1] ?? "";
    const decisionsBlock =
      (entry.match(/Decisions:\n([\s\S]*?)\n\nNext Steps:/) ?? [])[1] ?? "";
    const nextBlock =
      (entry.match(/Next Steps:\n([\s\S]*?)\n\nTags:/) ?? [])[1] ?? "";

    const linesToList = (block: string) =>
      block
        .trim()
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.replace(/^- /, ""))
        .filter((s) => s !== "-");

    return {
      number,
      date: (entry.match(/Date:\s(.+)/) ?? [])[1] ?? "",
      goal: (entry.match(/Goal:\s(.+)/) ?? [])[1] ?? "",
      duration: (entry.match(/Duration:\s(.+)/) ?? [])[1] ?? "",
      actions: linesToList(actionsBlock),
      decisions: linesToList(decisionsBlock),
      next: linesToList(nextBlock),
      tags: (entry.match(/Tags:\s(.+)/) ?? [])[1] ?? "",
    };
  });
}

// ---------- CLI actions ----------
export function showSummary(filterTag = ""): void {
  const sessions = parseAllSessions();
  if (sessions.length === 0) {
    console.log("No session-log.txt found yet.");
    return;
  }

  console.log("\n=== Session Summary ===");
  let count = 0;

  sessions.forEach((s, idx) => {
    if (!filterTag || s.tags.includes(filterTag)) {
      count++;
      console.log(
        `[${idx + 1}] Date: ${s.date}\n` +
          `     Goal: ${s.goal}\n` +
          ` Duration: ${s.duration}\n` +
          `     Tags: ${s.tags}\n---`
      );
    }
  });

  if (filterTag && count === 0) {
    console.log(`No sessions found with tag: ${filterTag}`);
  }
  console.log("========================\n");
}

export function exportSessions(format: ExportFormat, outFile = ""): void {
  const sessions = parseAllSessions();
  if (sessions.length === 0) {
    console.error("No session-log.txt found yet.");
    process.exit(1);
  }

  let output = "";
  if (format === "json") {
    output = JSON.stringify(sessions, null, 2);
  } else if (format === "md" || format === "markdown") {
    output = sessions
      .map(
        (s) =>
          `# Session #${s.number}\n` +
          `**Date:** ${s.date}\n\n` +
          `**Goal:** ${s.goal}\n\n` +
          `**Duration:** ${s.duration}\n\n` +
          `**Actions:**\n${
            s.actions.length ? s.actions.map((a) => `- ${a}`).join("\n") : "-"
          }\n\n` +
          `**Decisions:**\n${
            s.decisions.length ? s.decisions.map((d) => `- ${d}`).join("\n") : "-"
          }\n\n` +
          `**Next Steps:**\n${
            s.next.length ? s.next.map((n) => `- ${n}`).join("\n") : "-"
          }\n\n` +
          `**Tags:** ${s.tags}\n`
      )
      .join("\n---------------\n\n");
  } else {
    console.error("Unsupported export format. Use 'json' or 'md'.");
    process.exit(1);
  }

  if (outFile) {
    fs.writeFileSync(outFile, output, { encoding: "utf-8" });
    console.log(`Exported sessions to ${outFile}`);
  } else {
    console.log(output);
  }
}

function searchSessions(keyword: string): void {
  const sessions = parseAllSessions();
  if (sessions.length === 0) {
    console.log("No session-log.txt found yet.");
    return;
  }

  console.log(`\n=== Search Results for "${keyword}" ===`);
  let count = 0;

  sessions.forEach((s, idx) => {
    const haystack = [
      s.goal,
      ...s.actions,
      ...s.decisions,
      ...s.next,
      s.tags,
    ]
      .join(" ")
      .toLowerCase();

    if (haystack.includes(keyword.toLowerCase())) {
      count++;
      console.log(
        `[${idx + 1}] ${s.date} | Goal: ${s.goal} | Duration: ${s.duration} | Tags: ${s.tags}`
      );
    }
  });

  if (count === 0) {
    console.log("No matches found.");
  }
  console.log("========================\n");
}

export function showDetail(sessionNumber: number): void {
  const sessions = parseAllSessions();
  if (sessions.length === 0) {
    console.log("No session-log.txt found yet.");
    return;
  }

  if (sessionNumber < 1 || sessionNumber > sessions.length) {
    console.error(`Session #${sessionNumber} not found.`);
    return;
  }

  const s = sessions[sessionNumber - 1];

  const formatList = (items: string[]) =>
    items.length ? items.map((it) => `- ${it}`).join("\n") : "-";

  console.log(`\n=== Session #${sessionNumber} ===`);
  console.log(`Date: ${s.date}`);
  console.log(`Duration: ${s.duration}`);
  console.log(`Goal: ${s.goal}`);
  console.log(`Tags: ${s.tags}\n`);

  console.log("Actions:");
  console.log(formatList(s.actions));
  console.log("\nDecisions:");
  console.log(formatList(s.decisions));
  console.log("\nNext Steps:");
  console.log(formatList(s.next));
  console.log("=============================\n");
}

// ---------- Main ----------
const args = process.argv.slice(2);
const options = parseArgs(args);

// help
if (options.help) {
  console.log(`
====================================================
   Session Continuity Tracker (SCT) - CLI Tool
====================================================

Usage:
  sct [options]

Options:
  --goal "text"       Define the session's purpose
  --tags "a;b;c"      Add semicolon-separated tags
  --duration "Xm"     Record duration manually (e.g., 15m, 1h)
  --start             Begin a session (records timestamp)
  --stop              End a session (calculates elapsed time)
  --summary           Show a summary of all sessions
  --filter "tag"      Show only sessions with a specific tag
  --action "a,b,c"    Add actions for this entry (comma-separated)
  --decision "x,y"    Add decisions for this entry (comma-separated)
  --next "n,m"        Add next steps for this entry (comma-separated)
  --search "keyword"  Search sessions by keyword
  --detail N          Show detailed view for session number N
  --export [json|md]  Export sessions in JSON or Markdown
  --out "file"        Write export to file (instead of stdout)
  --help              Show this help message

Examples:
  sct --goal "Refactor CLI" --tags "cli;prototype" --duration "30m"
  sct --start
  sct --stop --goal "Finish CLI polish" --tags "cli"
  sct --summary
  sct --filter "cli"
  sct --search "Refactor"
  sct --detail 2
  sct --export json --out sessions.json
  sct --goal "Refactor CLI" --tags "cli" --duration "30m" --action "Split modules,Add tests" --decision "Adopt ESM" --next "Write docs"
`);
  process.exit(0);
}

// detail view
if (options.detail) {
  showDetail(options.detail);
  process.exit(0);
}

// export
if (options.export) {
  exportSessions(options.export, options.out);
  process.exit(0);
}

// start / stop
if (options.start) {
  const startData = { startTime: Date.now() };
  fs.writeFileSync(stateFile, JSON.stringify(startData), { encoding: "utf-8" });
  console.log("Session started at", new Date(startData.startTime).toLocaleString());
  process.exit(0);
}

if (options.stop) {
  if (!fs.existsSync(stateFile)) {
    console.error("No active session found. Run with --start first.");
    process.exit(1);
  }
  const { startTime } = JSON.parse(fs.readFileSync(stateFile, "utf-8")) as {
    startTime: number;
  };
  const endTime = Date.now();
  const durationMs = endTime - startTime;
  const minutes = Math.round(durationMs / 60000);
  const duration = `${minutes}m`;

  appendLog({
    goal: options.goal,
    tags: options.tags,
    duration,
  });

  fs.unlinkSync(stateFile);
  console.log("Session stopped. Duration:", duration);
  process.exit(0);
}

// summary / filter
if (options.summary || options.filter) {
  showSummary(options.filter);
  process.exit(0);
}

// search
if (options.search) {
  searchSessions(options.search);
  process.exit(0);
}

// interactive fallback
if (options.interactive) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q: string) => new Promise<string>((res) => rl.question(q, (ans) => res(ans)));

  (async () => {
    const goal = await ask("What's your goal for this session? ");
    const tags = await ask("Tags (semicolon-separated)? ");
    const duration = await ask("Duration (e.g., 30m)? ");
    const actions = await ask("Actions (comma-separated)? ");
    const decisions = await ask("Decisions (comma-separated)? ");
    const nextSteps = await ask("Next Steps (comma-separated)? ");

    appendLog({
      goal,
      tags,
      duration,
      action: actions,
      decision: decisions,
      next: nextSteps,
    });

    rl.close();
  })();
} else {
  // default non-interactive append (if no other command handled it)
  // Only append when meaningful data is supplied (goal or actions etc.)
  if (options.goal || options.action || options.decision || options.next || options.tags || options.duration) {
    appendLog({
      goal: options.goal,
      tags: options.tags,
      duration: options.duration,
      action: options.action,
      decision: options.decision,
      next: options.next,
    });
  } else {
    // if nothing provided, show help
    console.log("No actionable flags provided. Run with --help to see usage.");
  }
}
