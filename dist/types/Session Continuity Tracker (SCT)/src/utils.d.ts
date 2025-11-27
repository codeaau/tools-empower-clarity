export declare const SESSION_LOG = "session-log.txt";
/**
 * Ensure the human-readable header exists in session-log.txt.
 * Works idempotently.
 */
export declare function ensureHeader(projectRoot: string): void;
/**
 * Return the next session number by counting 'Session #' occurrences
 * in the human readable log file.
 */
export declare function getNextSessionNumber(projectRoot: string): number;
/**
 * Append a human-readable session block to session-log.txt.
 * This mirrors the previous appendLog behavior, but is a reusable function.
 */
export declare function appendHumanSessionBlock(projectRoot: string, block: string): void;
export declare function listFromString(input?: string, sep?: string): string[];
