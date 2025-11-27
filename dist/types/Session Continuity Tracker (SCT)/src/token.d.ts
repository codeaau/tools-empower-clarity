export interface TrackingToken {
    id: string;
    type: string;
    createdAt: string;
}
/**
 * Create a lightweight tracking token.
 * Format: `${type}-${timestamp36}-${uuidShort}`
 */
export declare function createToken(type?: string): TrackingToken;
