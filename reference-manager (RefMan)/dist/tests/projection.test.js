import { describe, it, expect } from "vitest";
import { createReference, tagAdd, tagRemove, updateMeta, snapshot, project } from "../src/core/index.js";
describe("projection invariants", () => {
    it("snapshot resets baseline", () => {
        // create an initial reference and its creation event
        const { ref, event: createEv } = createReference({
            title: "A",
            initialTags: ["t1"]
        });
        // build a snapshot reference with updated fields
        const snapRef = {
            ...ref,
            title: "B",
            tags: ["t2"],
            authors: [],
            type: "other", // must be a valid ReferenceType literal
            source: "",
            createdAt: ref.createdAt
        };
        // sequence of events: creation, snapshot, tag add/remove, metadata update
        const evs = [
            createEv,
            snapshot(snapRef),
            tagAdd(ref.id, "t3"),
            tagRemove(ref.id, "t2"),
            updateMeta(ref.id, { source: "S" })
        ];
        // project the events into a final reference state
        const proj = project(evs);
        // assertions
        expect(proj.ref?.title).toBe("B");
        expect(proj.ref?.tags.sort()).toEqual(["t3"]);
        expect(proj.ref?.source).toBe("S");
    });
});
