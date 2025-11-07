import { isoNow } from "../utils/time.js";
import { generateId } from "../utils/id.js";
import type {
  ReferenceType,
  RefEvent,
  CreateEvent,
  TagAddEvent,
  TagRemoveEvent,
  UpdateMetaEvent,
  RelateEvent,
  SnapshotEvent,
  Reference,
  ProjectionState
} from "./types.js";

function normTag(tag: string): string {
  return tag.trim().toLowerCase();
}

export function createReference(params: {
  title: string;
  authors?: string[];
  type?: ReferenceType;
  source?: string;
  initialTags?: string[];
}): { ref: Reference; event: CreateEvent } {
  const refId = generateId("REF");
  const now = isoNow();
  const ref: Reference = {
    id: refId,
    title: params.title,
    authors: params.authors ?? [],
    type: params.type ?? "other",
    source: params.source ?? "",
    tags: (params.initialTags ?? []).map(normTag),
    createdAt: now
  };
  const event: CreateEvent = {
    eventId: generateId("EVT"),
    refId,
    type: "Create",
    timestamp: now,
    payload: {
      title: ref.title,
      authors: ref.authors,
      type: ref.type,
      source: ref.source,
      tags: ref.tags.length ? ref.tags : undefined
    }
  };
  return { ref, event };
}

export function tagAdd(refId: string, tag: string): TagAddEvent {
  return {
    eventId: generateId("EVT"),
    refId,
    type: "TagAdd",
    timestamp: isoNow(),
    payload: { tag: normTag(tag) }
  };
}

export function tagRemove(refId: string, tag: string): TagRemoveEvent {
  return {
    eventId: generateId("EVT"),
    refId,
    type: "TagRemove",
    timestamp: isoNow(),
    payload: { tag: normTag(tag) }
  };
}

export function updateMeta(
  refId: string,
  patch: Partial<Pick<Reference, "title" | "authors" | "type" | "source">>
): UpdateMetaEvent {
  // Defensive: do not allow empty patch
  const hasKeys = Object.keys(patch).length > 0;
  if (!hasKeys) throw new Error("updateMeta requires at least one field");
  return {
    eventId: generateId("EVT"),
    refId,
    type: "UpdateMeta",
    timestamp: isoNow(),
    payload: { ...patch }
  };
}

export function relate(refId: string, targetId: string, relation: RelateEvent["payload"]["relation"]): RelateEvent {
  return {
    eventId: generateId("EVT"),
    refId,
    type: "Relate",
    timestamp: isoNow(),
    payload: { targetId, relation }
  };
}

export function snapshot(ref: Reference): SnapshotEvent {
  return {
    eventId: generateId("EVT"),
    refId: ref.id,
    type: "Snapshot",
    timestamp: isoNow(),
    payload: { snapshot: ref }
  };
}

// Projection: replay events to reconstruct current Reference state
export function project(events: RefEvent[]): ProjectionState {
  const state: ProjectionState = { ref: undefined, relations: [] };
  const sorted = [...events].sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0));
  for (const ev of sorted) {
    switch (ev.type) {
      case "Create": {
        const tags = ev.payload.tags?.map(normTag) ?? [];
        state.ref = {
          id: ev.refId,
          title: ev.payload.title,
          authors: ev.payload.authors,
          type: ev.payload.type,
          source: ev.payload.source,
          tags,
          createdAt: ev.timestamp
        };
        break;
      }
      case "Snapshot": {
        state.ref = { ...ev.payload.snapshot };
        break;
      }
      case "TagAdd": {
        if (!state.ref) break;
        const t = normTag(ev.payload.tag);
        if (!state.ref.tags.includes(t)) state.ref.tags.push(t);
        break;
      }
      case "TagRemove": {
        if (!state.ref) break;
        const t = normTag(ev.payload.tag);
        state.ref.tags = state.ref.tags.filter(x => x !== t);
        break;
      }
      case "UpdateMeta": {
        if (!state.ref) break;
        const { title, authors, type, source } = ev.payload;
        if (title !== undefined) state.ref.title = title;
        if (authors !== undefined) state.ref.authors = authors;
        if (type !== undefined) state.ref.type = type;
        if (source !== undefined) state.ref.source = source;
        break;
      }
      case "Relate": {
        state.relations.push({ targetId: ev.payload.targetId, relation: ev.payload.relation });
        break;
      }
    }
  }
  return state;
}
