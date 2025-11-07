export type ReferenceType =
"url"  | "book" | "article" | "web" | "report" | "paper" | "dataset" | "other";

export interface Reference {
  id: string;
  title: string;
  authors: string[];
  type: ReferenceType;
  source: string;
  tags: string[];
  createdAt: string; // ISO
}

export type EventKind =
  | "Create"
  | "TagAdd"
  | "TagRemove"
  | "UpdateMeta"
  | "Relate"
  | "Snapshot";

export interface BaseEvent {
  eventId: string;
  refId: string;
  type: EventKind;
  timestamp: string; // ISO
}

export interface CreateEvent extends BaseEvent {
  type: "Create";
  payload: {
    title: string;
    authors: string[];
    type: ReferenceType;
    source: string;
    tags?: string[];
  };
}

export interface TagAddEvent extends BaseEvent {
  type: "TagAdd";
  payload: { tag: string };
}

export interface TagRemoveEvent extends BaseEvent {
  type: "TagRemove";
  payload: { tag: string };
}

export interface UpdateMetaEvent extends BaseEvent {
  type: "UpdateMeta";
  payload: Partial<Pick<Reference, "title" | "authors" | "type" | "source">>;
}

export interface RelateEvent extends BaseEvent {
  type: "Relate";
  payload: { targetId: string; relation: "cites" | "extends" | "duplicates" | "references" | "related" };
}

export interface SnapshotEvent extends BaseEvent {
  type: "Snapshot";
  payload: { snapshot: Reference };
}

export type RefEvent =
  | CreateEvent
  | TagAddEvent
  | TagRemoveEvent
  | UpdateMetaEvent
  | RelateEvent
  | SnapshotEvent;

export interface ProjectionState {
  ref?: Reference;
  relations: Array<{ targetId: string; relation: RelateEvent["payload"]["relation"] }>;
}