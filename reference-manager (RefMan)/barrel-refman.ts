// core
export { 
    createReference,
    tagAdd,
    tagRemove, 
    updateMeta,
    relate,
    snapshot,
    project } from "./src/core/index.js";

export type { 
    ReferenceType,
    Reference,
    RefEvent,
    CreateEvent,
    TagAddEvent,
    TagRemoveEvent,
    UpdateMetaEvent,
    RelateEvent,
    SnapshotEvent,
    ProjectionState } from "./src/core/types.js";

// storage
export { 
    ensureInit, 
    appendEvent, 
    listEvents, 
    projectReference, 
    listReferences } from "./src/storage/local.js";

// utils
export { fromFsStat } from "./src/utils/fsStats-shim.js";
export { generateId } from "./src/utils/id.js";
export { isoNow } from "./src/utils/time.js";
export { StatsShim } from "./src/utils/fsStats-shim.js";