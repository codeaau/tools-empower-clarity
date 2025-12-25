#!/usr/bin/env ts-node

import { Command } from "commander";
import type { OptionValues } from "commander";
import { createPatch } from "../src/patches/patch-utils.js";
import { run as validate } from "../trueData/validator.js";
import { run as audit } from "../trueData/utils/provenanceAudit.js";

const program = new Command();

program
  .name("sct")
  .description("SCT CLI for session and patch management")
  .version("0.1.0")
  .option("--verbose", "Enable verbose output globally");

// --- PATCH COMMAND ---
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

// --- VALIDATE COMMAND ---
program
  .command("validate")
  .description("Run schema validation for trueData")
  .option("--json", "Output JSON")
  .option("--log-dir <dir>", "Log directory", "trueData/logs")
  .option("--root <path>", "Repo root", ".")
  .action(async (options: OptionValues) => {
    const globalOpts = program.opts();
    try {
      await validate({
        verbose: globalOpts.verbose,
        json: options.json,
        logDir: options.logDir,
        root: options.root,
      });
      console.log("Validation completed.");
    } catch (err) {
      console.error("Validation failed:", err);
      process.exit(1);
    }
  });

program
  .command("audit")
  .description("Run provenance audit for trueData")
  .option("--json", "Output JSON")
  .option("--log-dir <dir>", "Log directory", "trueData/logs")
  .option("--root <path>", "Repo root", ".")
  .action(async (options: OptionValues) => {
    const globalOpts = program.opts();
    try {
      await audit({
        verbose: globalOpts.verbose,
        json: options.json,
        logDir: options.logDir,
        root: options.root,
      });
      console.log("Audit completed.");
    } catch (err) {
      console.error("Audit failed:", err);
      process.exit(1);
    }
  });

program.parse(process.argv);
