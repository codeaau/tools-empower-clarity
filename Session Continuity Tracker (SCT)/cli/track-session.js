#!/usr/bin/env node
// track-session.js

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
  const parsed = { goal: '', tags: '', duration: '', help: false, interactive: false, start: false, stop: false };
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
      default: break;
    }
  }
  return parsed;
}

// --- Logging function ---
function appendLog({ goal, tags, duration }) {
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').split('.')[0];

  const entryBlock = `
====================================================
Session Log Entry
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
  console.log('Appended session entry to ', sessionLogPath);
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
  --goal "text"       Define the session's purpose
  --tags "a;b;c"      Add semicolon-separated tags
  --duration "Xm"     Record duration manually (e.g., 15m)
  --start             Begin a session (records timestamp)
  --stop              End a session (calculates elapsed time)
  --help              Show this help message

Examples:
  node cli/track-session.js --goal "Refactor CLI" --tags "cli;prototype" --duration "30m"
  node cli/track-session.js --start
  node cli/track-session.js --stop --goal "Finish CLI polish" --tags "cli"
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

// --- Interactive fallback ---
if (options.interactive) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question("What's your goal for this session? ", (goal) => {
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
