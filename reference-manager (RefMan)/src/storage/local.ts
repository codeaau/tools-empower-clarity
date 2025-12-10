import { promises as fs } from "node:fs";
import { join } from "node:path";
import type { RefEvent } from "../core/types.js";
import { project } from "../core/index.js";

const FILE_NAME = "refs.jsonl";

export async function ensureInit(root: string): Promise<string> {
  const p = join(root, FILE_NAME);
  try {
    await fs.access(p);
  } catch {
    await fs.writeFile(p, "", "utf8");
  }
  return p;
}

export async function appendEvent(root: string, event: RefEvent): Promise<void> {
  const p = await ensureInit(root);
  const line = JSON.stringify(event) + "\n";
  await fs.writeFile(p, line, { flag: "a", encoding: "utf8" });
}

export async function listEvents(root: string, refId?: string): Promise<RefEvent[]> {
  const p = join(root, FILE_NAME);
  try {
    const data = await fs.readFile(p, "utf8");
    const lines = data.split("\n").filter(Boolean);
    const all = lines.map(l => JSON.parse(l) as RefEvent);
    return refId ? all.filter(ev => ev.refId === refId) : all;
  } catch (err: any) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

export async function projectReference(root: string, refId: string) {
  const events = await listEvents(root, refId);
  return project(events);
}

export async function listReferences(root: string): Promise<Array<{ refId: string }>> {
  const events = await listEvents(root);
  const refIds = new Set(events.map(e => e.refId));
  return Array.from(refIds).map(id => ({ refId: id }));
}
