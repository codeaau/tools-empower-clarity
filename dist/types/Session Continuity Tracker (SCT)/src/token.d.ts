import type { TrackingToken } from "../types-sct.js";
/**
 * Create a lightweight tracking token.
 * Format: `${type}-${timestamp36}-${uuidShort}`
 */
export declare function createToken(type?: string): TrackingToken;
