import { describe, it, expect } from "vitest";
import { 
  createReference, 
  tagAdd, 
  tagRemove, 
  updateMeta, 
  relate, 
  project } from "../barrel-refman.js";

describe("core constructors", () => {
  it("creates reference and event", () => {
    const { ref, event } = createReference({ title: "Test" });
    expect(ref.id.startsWith("REF-")).toBe(true);
    expect(event.type).toBe("Create");
    expect(event.refId).toBe(ref.id);
  });

  it("tag add/remove normalizes", () => {
    const add = tagAdd("REF-x", " Data ");
    const remove = tagRemove("REF-x", "data");
    expect(add.payload.tag).toBe("data");
    expect(remove.payload.tag).toBe("data");
  });

  it("updateMeta requires patch", () => {
    expect(() => updateMeta("REF-x", {})).toThrow();
    const ev = updateMeta("REF-x", { title: "New" });
    expect(ev.payload.title).toBe("New");
  });

  it("project applies events", () => {
    const { ref, event: createEv } = createReference({ title: "A", initialTags: ["x"] });
    const evs = [createEv, tagAdd(ref.id, "y"), tagRemove(ref.id, "x"), updateMeta(ref.id, { source: "S" })];
    const proj = project(evs);
    expect(proj.ref?.title).toBe("A");
    expect(proj.ref?.tags.sort()).toEqual(["y"]);
    expect(proj.ref?.source).toBe("S");
  });

  it("relate records relations", () => {
    const { ref, event: createEv } = createReference({ title: "A" });
    const evs = [createEv, relate(ref.id, "REF-target", "cites")];
    const proj = project(evs);
    expect(proj.relations.length).toBe(1);
    expect(proj.relations[0].relation).toBe("cites");
  });
});
