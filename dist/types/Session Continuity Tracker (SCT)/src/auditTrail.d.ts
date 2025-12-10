import type { TrackingToken } from "../types-sct.js";
/**
 * Append a single-line structured audit entry (JSON-ish) plus human readable
 * line for quick inspection. This keeps both machine- and human-friendly traces.
 */
export declare function recordAction(projectRoot: string, token: TrackingToken, action: string, meta?: Record<string, unknown>): void;
