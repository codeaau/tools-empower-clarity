# Session Continuity Tracker (SCT)

## Overview
The Session Continuity Tracker (SCT) is a lightweight, text-first tool designed to help developers capture progress, decisions, and next steps across coding sessions. It is part of the broader **tools-empower-clarity** initiative, which focuses on building modular, ethical, and service-oriented utilities that prioritize clarity and ownership.

This project is intentionally minimal, avoiding unnecessary dependencies or ceremony. It is designed to be reproducible, portable, and easy to extend.

---

## Goals
- Provide a simple CLI for logging session details into plain-text files.
- Support continuity across projects by recording goals, actions, decisions, and next steps.
- Reinforce a workflow philosophy of **clarity over complexity**.

---

## Current Features
- Append session entries to `session-log.txt`.
- Accept optional flags:
  - `--goal "text"` → define the session’s purpose.
  - `--tags "a;b;c"` → add semicolon-separated tags.
  - `--duration "Xm"` → record duration manually.
  - `--help` → display usage instructions.
- Log entries are timestamped and structured for easy review.

---

## Example Usage
```bash
node cli/track-session.js --goal "Harden CLI" --tags "cli;prototype" --duration "45m"
