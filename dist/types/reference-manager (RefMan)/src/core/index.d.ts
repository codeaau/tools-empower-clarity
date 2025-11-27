import type { ReferenceType, RefEvent, CreateEvent, TagAddEvent, TagRemoveEvent, UpdateMetaEvent, RelateEvent, SnapshotEvent, Reference, ProjectionState } from "./types.js";
export declare function createReference(params: {
    title: string;
    authors?: string[];
    type?: ReferenceType;
    source?: string;
    initialTags?: string[];
}): {
    ref: Reference;
    event: CreateEvent;
};
export declare function tagAdd(refId: string, tag: string): TagAddEvent;
export declare function tagRemove(refId: string, tag: string): TagRemoveEvent;
export declare function updateMeta(refId: string, patch: Partial<Pick<Reference, "title" | "authors" | "type" | "source">>): UpdateMetaEvent;
export declare function relate(refId: string, targetId: string, relation: RelateEvent["payload"]["relation"]): RelateEvent;
export declare function snapshot(ref: Reference): SnapshotEvent;
export declare function project(events: RefEvent[]): ProjectionState;
