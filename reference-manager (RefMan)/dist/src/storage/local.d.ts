import type { RefEvent } from "../core/types.js";
export declare function ensureInit(root: string): Promise<string>;
export declare function appendEvent(root: string, event: RefEvent): Promise<void>;
export declare function listEvents(root: string, refId?: string): Promise<RefEvent[]>;
export declare function projectReference(root: string, refId: string): Promise<import("../core/types.js").ProjectionState>;
export declare function listReferences(root: string): Promise<Array<{
    refId: string;
}>>;
//# sourceMappingURL=local.d.ts.map