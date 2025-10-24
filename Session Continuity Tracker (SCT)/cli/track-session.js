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
  const parsed = {
    action: '',
    duration: '',
    decision: '',
    edit: 0,
    filter: '',
    goal: '',
    help: false,
    interactive: false,
    next: '',
    start: false,
    stop: false,
    summary: false,
    tags: ''
  };
  if (args.length === 0) {
    parsed.interactive = true;
    return parsed;
  }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--action': parsed.action = args[i + 1] || ''; i++; break;
      case '--decision': parsed.decision = args[i + 1] || ''; i++; break;
      case '--duration': parsed.duration = args[i + 1] || ''; i++; break;
      case '--filter': parsed.filter = args[i + 1] || ''; i++; break;
      case '--goal': parsed.goal = args[i + 1] || ''; i++; break;
      case '--help': parsed.help = true; break;
      case '--next': parsed.next = args[i + 1] || ''; i++; break;
      case '--start': parsed.start = true; break;
      case '--stop': parsed.stop = true; break;
      case '--summary': parsed.summary = true; break;
      case '--tags': parsed.tags = args[i + 1] || ''; i++; break;
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
function appendLog({ goal, tags, duration, action, decision, next }) {
  ensureHeader();
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').split('.')[0];
  const sessionNumber = getNextSessionNumber();

  const actionsLines = action && action.trim()
    ? action.split(',').map(s => s.trim()).filter(Boolean).map(s => `- ${s}`).join('\n')
    : '-';
  const decisionsLines = decision && decision.trim()
    ? decision.split(',').map(s => s.trim()).filter(Boolean).map(s => `- ${s}`).join('\n')
    : '-';
  const nextLines = next && next.trim()
    ? next.split(',').map(s => s.trim()).filter(Boolean).map(s => `- ${s}`).join('\n')
    : '-';

  const entryBlock = `
====================================================
Session #${sessionNumber}
Date: ${timestamp}
Duration: ${duration || '?'}
Goal: ${goal || ''}

Actions:
${actionsLines}

Decisions:
${decisionsLines}

Next Steps:
${nextLines}

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
  if (filterTag && count === 0) {
    console.log(`No sessions found with tag: ${filterTag}`);
  }
  console.log("========================\n");
}

// --- Edit function (overwrite style) ---
function editSession(sessionNumber) {
  if (!fs.existsSync(sessionLogPath)) {
    console.error("No session-log.txt found yet.");
    process.exit(1);
  }

  const content = fs.readFileSync(sessionLogPath, 'utf-8');
  const sessions = content.split("====================================================")
    .map(e => e.trim())
    .filter(e => e.includes("Session #"));

  if (sessionNumber < 1 || sessionNumber > sessions.length) {
    console.error(`Session #${sessionNumber} not found.`);
    process.exit(1);
  }

  const targetIndex = sessionNumber - 1;
  const targetSession = sessions[targetIndex];

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  rl.question("Actions (comma-separated)? ", (actions) => {
    rl.question("Decisions (comma-separated)? ", (decisions) => {
      rl.question("Next Steps (comma-separated)? ", (nextSteps) => {
        const actionsList = actions.trim() ? actions.split(',').map(s => s.trim()).join('\n- ') : '';
        const decisionsList = decisions.trim() ? decisions.split(',').map(s => s.trim()).join('\n- ') : '';
        const nextList = nextSteps.trim() ? nextSteps.split(',').map(s => s.trim()).join('\n- ') : '';

        let updatedSession = targetSession
          .replace(/Actions:[\s\S]*?Decisions:/, `Actions:\n${actionsList ? '- ' + actionsList : '-'}\n\nDecisions:`)
          .replace(/Decisions:[\s\S]*?Next Steps:/, `Decisions:\n${decisionsList ? '- ' + decisionsList : '-'}\n\nNext Steps:`)
          .replace(/Next Steps:[\s\S]*?Tags:/, `Next Steps:\n${nextList ? '- ' + nextList : '-'}\n\nTags:`);

        sessions[targetIndex] = updatedSession;
        const rebuilt = "# Session Continuity Tracker Log\n====================================================\n\n" +
          sessions.map(s => "====================================================\n" + s + "\n").join("\n");

        fs.writeFileSync(sessionLogPath, rebuilt);
        console.log(`Session #${sessionNumber} updated successfully.`);
        rl.close();
      });
    });
  });
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
  --start             Begin a session (records timestamp)
  --stop              End a session (calculates elapsed time)
  --summary           Show a summary of all sessions
  --filter "tag"      Show only sessions with a specific tag
  --action "a,b,c"    Add actions for this entry (comma-separated)
  --decision "x,y"    Add decisions for this entry (comma-separated)
  --next "n,m"        Add next steps for this entry (comma-separated)
  --help              Show this help message

Examples:
  node cli/track-session.js --goal "Refactor CLI" --tags "cli;prototype" --duration "30m"
  node cli/track-session.js --start
  node cli/track-session.js --stop --goal "Finish CLI polish" --tags "cli"
  node cli/track-session.js --summary
  node cli/track-session.js --filter "cli"
  node cli/track-session.js --edit 2
  node cli/track-session.js --goal "Refactor CLI" --tags "cli" --duration "30m" --action "Split modules,Add tests" --decision "Adopt ESM" --next "Write docs"
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

if (options.summary || options.filter) {
  showSummary(options.filter);
  process.exit(0);
}

// --- Interactive fallback ---
if (options.interactive) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question("What's your goal for this session? ", (goal) => {
    rl.question("Tags (semicolon-separated)? ", (tags) => {
      rl.question("Duration (e.g., 30m)? ", (duration) => {
        rl.question("Actions (comma-separated)? ", (actions) => {
          rl.question("Decisions (comma-separated)? ", (decisions) => {
            rl.question("Next Steps (comma-separated)? ", (nextSteps) => {
              appendLog({
                goal,
                tags,
                duration,
                action: actions,
                decision: decisions,
                next: nextSteps
              });
              rl.close();
            });
          });
        });
      });
    });
  });
} else {
  appendLog(options);
}
