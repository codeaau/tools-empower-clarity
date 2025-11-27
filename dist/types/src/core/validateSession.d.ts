import { Session } from "./buildSession.js";
export interface ValidationResult {
    valid: boolean;
    errors?: string[];
    integrity_hash?: string;
}
/**
 * Validate a session object agaionst schema and semantic rules.
 */
export declare function validateSession(session: Session): ValidationResult;
