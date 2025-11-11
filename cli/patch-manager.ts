#!/usr/bin/env ts-node

import { Command, OptionValues } from "commander";
import { createPatch } from "../src/patches/patch-utils";

const program = new Command();

program
  .name("sct")
  .description("SCT CLI for session and patch management")
  .version("0.1.0");

const patch = program
  .command("patch")
  .description("Manage patches in SCT/CLARITY");

patch
  .command("create <patchName>")
  .description("Create a new patch folder with metadata and docs")
  .option("--added <items>", "Files or features added")
  .option("--updated <items>", "Files or features updated")
  .option("--notes <text>", "Additional notes for this patch")
  .option("--author <name>", "Author of the patch")
  .option("--status <state>", "Patch status (draft, applied, etc.)")
  .action(async (patchName: string, options: OptionValues) => {
    try {
      await createPatch({
        patchName,
        added: options.added,
        updated: options.updated,
        notes: options.notes,
        author: options.author,
        status: options.status,
      });
      console.log(`Patch '${patchName}' created successfully.`);
    } catch (err) {
      console.error("Error creating patch:", err);
      process.exit(1);
    }
  });

program.parse(process.argv);
