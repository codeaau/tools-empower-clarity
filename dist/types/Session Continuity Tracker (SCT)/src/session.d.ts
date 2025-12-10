import type { TrackingToken } from "../types-sct.js";
export declare function getStateFile(projectRoot: string): string;
/**
 * Start an in-progress session and persist startTime + token.
 * Returns the new token.
 */
export declare function startSession(projectRoot: string): TrackingToken;
/**
 * Stop an active session. Returns token and duration string like "15m".
 * Throws if no active session exists.
 */
export declare function stopSession(projectRoot: string): {
    token: TrackingToken;
    duration: string;
};
export declare function hasActiveSession(projectRoot: string): boolean;
