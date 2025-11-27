export declare function saveSession(session: Record<string, unknown>): Promise<string>;
export declare function loadSession(id: string): Promise<Record<string, unknown> | null>;
