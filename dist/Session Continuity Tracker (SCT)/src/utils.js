// src/utils.ts
import fs from "fs";
import path from "path";
export const SESSION_LOG = "session-log.txt";
/**
 * Ensure the human-readable header exists in session-log.txt.
 * Works idempotently.
 */
export function ensureHeader(projectRoot) {
    const sessionLogPath = path.join(projectRoot, SESSION_LOG);
    if (!fs.existsSync(sessionLogPath)) {
        const header = `# Session Continuity Tracker Log
====================================================

`;
        fs.writeFileSync(sessionLogPath, header, { encoding: "utf-8" });
    }
}
/**
 * Return the next session number by counting 'Session #' occurrences
 * in the human readable log file.
 */
export function getNextSessionNumber(projectRoot) {
    const sessionLogPath = path.join(projectRoot, SESSION_LOG);
    if (!fs.existsSync(sessionLogPath))
        return 1;
    const content = fs.readFileSync(sessionLogPath, "utf-8");
    const matches = content.match(/Session #(\d+)/g) ?? [];
    return matches.length + 1;
}
/**
 * Append a human-readable session block to session-log.txt.
 * This mirrors the previous appendLog behavior, but is a reusable function.
 */
export function appendHumanSessionBlock(projectRoot, block) {
    ensureHeader(projectRoot);
    const sessionLogPath = path.join(projectRoot, SESSION_LOG);
    fs.appendFileSync(sessionLogPath, block, { encoding: "utf-8" });
}
export function listFromString(input, sep = ",") {
    if (!input)
        return [];
    return input
        .split(sep)
        .map((s) => s.trim())
        .filter(Boolean);
}
