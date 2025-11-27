import { makeId } from "./makeId.js";
/** Builds a new session object with canonical IDs and timestamps */
export function buildSession(prefix, alias, intention, factual, resulting = {}) {
    const sessionId = makeId(prefix);
    const now = new Date().toISOString();
    return {
        intention,
        factual,
        resulting,
        meta: {
            session_id: sessionId,
            created_at: now,
            created_by: alias,
        },
        edits: [],
    };
}
