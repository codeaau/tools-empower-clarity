#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { 
  createReference, 
  appendEvent, 
  ensureInit, 
  listReferences, 
  projectReference } from "../barrel-refman.js";

function rootDir(): string {
  // default to current working dir
  return process.cwd();
}

async function cmdInit() {
  const p = await ensureInit(rootDir());
  console.log("Initialized:", p);
}

async function cmdAdd(args: string[]) {
  const titleIdx = args.indexOf("--title");
  const typeIdx = args.indexOf("--type");
  const authorsIdx = args.indexOf("--authors");
  const sourceIdx = args.indexOf("--source");
  const tagsIdx = args.indexOf("--tags");

  const title = titleIdx >= 0 ? args[titleIdx + 1] : undefined;
  if (!title) {
    console.error(`Missing '--title'`);
    process.exit(1);
  }
  const type = typeIdx >= 0 ? (args[typeIdx + 1] as any) : undefined;
  const authors = authorsIdx >= 0 ? args[authorsIdx + 1].split(",").map(s => s.trim()).filter(Boolean) : undefined;
  const source = sourceIdx >= 0 ? args[sourceIdx + 1] : undefined;
  const tags = tagsIdx >= 0 ? args[tagsIdx + 1].split(",").map(s => s.trim()).filter(Boolean) : undefined;

  const { ref, event } = createReference({ title, authors, type, source, initialTags: tags });
  await appendEvent(rootDir(), event);
  console.log(ref.id);
}

async function cmdList(args: string[]) {
  const refIdIdx = args.indexOf("--ref");
  if (refIdIdx >= 0) {
    const refId = args[refIdIdx + 1];
    const proj = await projectReference(rootDir(), refId);
    if (!proj.ref) {
      console.error("Reference not found or not created.");
      process.exit(1);
    }
    console.log(JSON.stringify(proj.ref, null, 2));
    return;
  }
  const refs = await listReferences(rootDir());
  for (const r of refs) {
    console.log(r.refId);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  switch (cmd) {
    case "init": return cmdInit();
    case "add": return cmdAdd(args.slice(1));
    case "list": return cmdList(args.slice(1));
    default:
      console.log("Usage: refman <init|add|list>");
      console.log(" add --title <str> [--type <type>] [--authors a,b] [--source <str>] [--tags t1,t2]");
      console.log(" list [--ref <id>]");
  }
}
main().catch(err => {
  console.error(err);
  process.exit(1);
});
