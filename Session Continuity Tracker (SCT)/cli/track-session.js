#!/usr/bin/env node
// track-session.js
// Minimal Node.js CLI to append a session entry to session-log.txt

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname in ESM (since __dirname is not defined by default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Helper: parse arguments ---
function parseArgs(args) {
  const parsed = { goal: '', tags: '', duration: '', help: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--help':
        parsed.help = true;
        break;
      case '--goal':
        parsed.goal = args[i + 1] || '';
        i++;
        break;
      case '--tags':
        parsed.tags = args[i + 1] || '';
        i++;
        break;
      case '--duration':
        parsed.duration = args[i + 1] || '';
        i++;
        break;
      default:
        // ignore unknown args for now
        break;
    }
  }
  return parsed;
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
  --duration "Xm"     Record duration manually (e.g., 15m, 1h)
  --help              Show this help message

Example:
  node cli/track-session.js --goal "Refactor CLI" --tags "cli;prototype" --duration "30m"

Description:
  SCT helps you capture session continuity by logging goals,
  actions, decisions, and next steps into a plain-text file.
  Minimal, portable, and clarity-first by design.
`);
  process.exit(0);
}

const now = new Date();
const timestamp = now.toISOString().replace('T', ' ').split('.')[0];

// Assume this script lives in cli/, so project root is one level up
const projectRoot = path.resolve(__dirname, '..');
const sessionLogPath = path.join(projectRoot, 'session-log.txt');

const entryBlock = `
====================================================
Session Log Entry
Date: ${timestamp}
Duration: ${options.duration || '?'}
Goal: ${options.goal || ''}

Actions:
- 

Decisions:
- 

Next Steps:
- 

Tags: ${options.tags || ''}
====================================================

`;

fs.appendFile(sessionLogPath, entryBlock, (err) => {
  if (err) {
    console.error('Failed to append to session-log.txt:', err.message);
    process.exit(1);
  }
  console.log('Appended session entry to', sessionLogPath);
});
