import { describe, it, expect, beforeEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createReference } from "../src/core/index.js";
import { appendEvent, listEvents, projectReference, ensureInit } from "../src/storage/local.js";

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "refman-"));
  await ensureInit(root);
});

describe("storage append-only", () => {
  it("appends and lists events", async () => {
    const { event } = createReference({ title: "Store" });
    await appendEvent(root, event);
    const events = await listEvents(root);
    expect(events.length).toBe(1);
  });

  it("projects reference via replay", async () => {
    const { ref, event } = createReference({ title: "Proj" });
    await appendEvent(root, event);
    const proj = await projectReference(root, ref.id);
    expect(proj.ref?.title).toBe("Proj");
  });
});
