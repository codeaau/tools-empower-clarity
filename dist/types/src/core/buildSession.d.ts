export interface Intention {
    description: string;
    duration_minutes?: number;
}
export interface Factual {
    started_at: string;
    ended_at?: string;
}
export interface Resulting {
    outcome?: string;
    notes?: string;
}
export interface Meta {
    session_id: string;
    created_at: string;
    created_by: string;
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
export declare function buildSession(prefix: string, alias: string, intention: Intention, factual: Factual, resulting?: Resulting): Session;
