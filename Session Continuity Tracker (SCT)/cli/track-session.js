#!/usr/bin/env node
// track-session.js
// Adds --filter flag to show sessions by tag

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const sessionLogPath = path.join(projectRoot, 'session-log.txt');
const stateFile = path.join(projectRoot, '.sct-session.json');

// --- Helper: parse arguments ---
function parseArgs(args) {
  const parsed = { goal: '', tags: '', duration: '', help: false, interactive: false, start: false, stop: false, summary: false, filter: '' };
  if (args.length === 0) {
    parsed.interactive = true;
    return parsed;
  }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--help': parsed.help = true; break;
      case '--goal': parsed.goal = args[i + 1] || ''; i++; break;
      case '--tags': parsed.tags = args[i + 1] || ''; i++; break;
      case '--duration': parsed.duration = args[i + 1] || ''; i++; break;
      case '--start': parsed.start = true; break;
      case '--stop': parsed.stop = true; break;
      case '--summary': parsed.summary = true; break;
      case '--filter': parsed.filter = args[i + 1] || ''; i++; break;
      default: break;
    }
  }
  return parsed;
}

// --- Ensure header exists ---
function ensureHeader() {
  if (!fs.existsSync(sessionLogPath)) {
    const header = `# Session Continuity Tracker Log
====================================================

`;
    fs.writeFileSync(sessionLogPath, header);
  }
}

// --- Get next session number ---
function getNextSessionNumber() {
  if (!fs.existsSync(sessionLogPath)) return 1;
  const content = fs.readFileSync(sessionLogPath, 'utf-8');
  const matches = content.match(/Session #(\d+)/g) || [];
  return matches.length + 1;
}

// --- Logging function ---
function appendLog({ goal, tags, duration }) {
  ensureHeader();
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').split('.')[0];
  const sessionNumber = getNextSessionNumber();

  const entryBlock = `
====================================================
Session #${sessionNumber}
Date: ${timestamp}
Duration: ${duration || '?'}
Goal: ${goal || ''}

Actions:
- 

Decisions:
- 

Next Steps:
- 

Tags: ${tags || ''}
====================================================

`;

  fs.appendFileSync(sessionLogPath, entryBlock);
  console.log(`Appended Session #${sessionNumber} to`, sessionLogPath);
}

// --- Summary function ---
function showSummary(filterTag = '') {
  if (!fs.existsSync(sessionLogPath)) {
    console.log("No session-log.txt found yet.");
    return;
  }
  const content = fs.readFileSync(sessionLogPath, 'utf-8');
  const entries = content.split("====================================================")
    .map(e => e.trim())
    .filter(e => e.includes("Date:"));

  console.log("\n=== Session Summary ===");
  let count = 0;
  entries.forEach((entry, idx) => {
    const date = (entry.match(/Date:\s(.+)/) || [])[1] || "?";
    const goal = (entry.match(/Goal:\s(.+)/) || [])[1] || "";
    const duration = (entry.match(/Duration:\s(.+)/) || [])[1] || "?";
    const tags = (entry.match(/Tags:\s(.+)/) || [])[1] || "";

    if (!filterTag || tags.includes(filterTag)) {
      count++;
      console.log(`[${idx + 1}] ${date} | Goal: ${goal} | Duration: ${duration} | Tags: ${tags}`);
    }
  });
  if (count === 0) {
    console.log(`No sessions found with tag: ${filterTag}`);
  }
  console.log("========================\n");
}

// --- Main ---
const args = process.argv.slice(2);
const options = parseArgs(args);

if (options.help) {
  console.log(`
====================================================
   Session Continuity Tracker (SCT) - CLI Tool
====================================================

Usage:
  node cli/track-session.js [options]

Options:
  --goal "text"       Define the session’s purpose
  --tags "a;b;c"      Add semicolon-separated tags
  --duration "Xm"     Record duration manually (e.g., 15m, 1h)
  --start             Begin a session (records timestamp)
  --stop              End a session (calculates elapsed time)
  --summary           Show a summary of all sessions
  --filter "tag"      Show only sessions with a specific tag
  --help              Show this help message
`);
  process.exit(0);
}

// --- Start/Stop logic ---
if (options.start) {
  const startData = { startTime: Date.now() };
  fs.writeFileSync(stateFile, JSON.stringify(startData));
  console.log("Session started at", new Date(startData.startTime).toLocaleString());
  process.exit(0);
}

if (options.stop) {
  if (!fs.existsSync(stateFile)) {
    console.error("No active session found. Run with --start first.");
    process.exit(1);
  }
  const { startTime } = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
  const endTime = Date.now();
  const durationMs = endTime - startTime;
  const minutes = Math.round(durationMs / 60000);
  const duration = `${minutes}m`;

  appendLog({ goal: options.goal, tags: options.tags, duration });
  fs.unlinkSync(stateFile);
  console.log("Session stopped. Duration:", duration);
  process.exit(0);
}

// --- Summary / Filter logic ---
if (options.summary || options.filter) {
  showSummary(options.filter);
  process.exit(0);
}

// --- Interactive fallback ---
if (options.interactive) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question("What’s your goal for this session? ", (goal) => {
    rl.question("Tags (semicolon-separated)? ", (tags) => {
      rl.question("Duration (e.g., 30m)? ", (duration) => {
        appendLog({ goal, tags, duration });
        rl.close();
      });
    });
  });
} else {
  appendLog(options);
}
