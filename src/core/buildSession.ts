import { makeId } from "./makeId.js";

export interface Intention {
    description: string;
    duration_minutes?: number;
}

export interface Factual {
    started_at: string;     // UTC ISO string, new Date()?
    ended_at?: string;      // UTC ISO string, new Date()?
}

export interface Resulting {
    outcome?: string;       // files/folders created and/or affected, semi-colon delimited
    notes?: string;
}

export interface Meta {
    session_id: string;
    created_at: string;
    created_by: string;     // alias   
}

export interface Edit {
    who: string;
    when: string;
    why: string;
    intention: string;
    what: Record<string, unknown>;
}

export interface Session {
    intention: Intention;
    factual: Factual;
    resulting: Resulting;
    meta: Meta;
    edits: Edit[];
}

/** Builds a new session object with canonical IDs and timestamps */
export function buildSession(
    prefix: string,
    alias: string,
    intention: Intention,
    factual: Factual,
    resulting: Resulting = {}): Session {
        const sessionId = makeId(prefix);
        const now = new Date().toISOString();
        return  {
            intention,
            factual,
            resulting,
            meta:  {
                session_id: sessionId,
                created_at: now,
                created_by: alias,
            },
            edits: [],
        };
}