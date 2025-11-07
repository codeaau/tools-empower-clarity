// src/tests/validateSession.test.ts

/**
import { test, run, assert, assertEqual } from "./testRunner";
import { buildSession, Intention, Resulting, Factual } from "../core/buildSession";
import { validateSession } from "../core/validateSession";

// ——— Factories: keep them tiny and canonical ———

function createDefaultIntention(des?: string, dm?: number): Intention {
  let result: Intention;
  if (des && dm) result = { description: des, duration_minutes: dm };
  else if (des && !dm) result = { description: des, duration_minutes: 0 }; // create an automatic new Date() with stop-watch behavior, awaiting an end time.
  else if (!des && dm) result = { description: "Non-Commit Session", duration_minutes: dm };
  else if (!des && !dm) result = { description: "Non-Commit Session", duration_minutes: 0 }; // create an automatic new Date() with stop-watch behavior, awaiting an end time.
  else {
    console.log(`Invalid execution. Parameters: [${des}, ${dm}]`); 
    result = { description: 'Invalid Session', duration_minutes: -1 } as Intention;
    throw new Error({ message: "Unreachable code in createDefaultIntention" } as any);
  }
  return result;
};

let defaultFactual: Factual = {
    started_at: "2025-01-01T00:00:00Z",
    ended_at: "2025-01-01T01:00:00Z",
}

let defaultResulting: Resulting = {
    outcome: "new folder (./src/tests), new files (./src/tests/testRunner.ts, validateSession.test.ts)",
    notes: "my anonymous assistant prefers to return values through functions, whereas I prefer const/let"
};

// ——— Tests ———

// 1) Valid session should pass schema + semantic checks
test("valid session passes validation", () => {
  const session = buildSession(
    "clarity",
    "azim",
    defaultIntention,
    defaultFactual,
    defaultResulting
  );
  const result = validateSession(session);
  assert(result.valid, "Expected session to be valid");
});

// 2) Semantic check: ended_at before started_at should fail (if enforced in your validator)
test("semantic: ended_at before started_at fails", () => {
  const session = buildSession(
    "clarity",
    "azim",
    defaultIntention,
    defaultFactual,
    defaultResulting
  );
  const result = validateSession(session);
  assert(!result.valid, "Expected session to be invalid");
  assert(
    result.errors?.some(e => e.toLowerCase().includes("semantic")),
    "Expected a semantic error in errors"
  );
});

// 3) Integrity hash is stable for identical canonical sections
test("integrity hash stable for identical sessions", () => {
  const s1 = buildSession("clarity", "azim", defaultIntention, defaultFactual, defaultResulting);
  const s2 = buildSession("clarity", "azim", defaultIntention, defaultFactual, defaultResulting);

  const r1 = validateSession(s1);
  const r2 = validateSession(s2);

  assert(r1.valid && r2.valid, "Sessions should be valid before comparing hashes");
  assertEqual(r1.integrity_hash, r2.integrity_hash, "Hashes should match for identical canonical sections");
});

// 4) Meta.created_at should be UTC (basic format check)
test("meta.created_at is UTC ISO-8601", () => {
  const session = buildSession("clarity", "azim", defaultIntention, defaultFactual, defaultResulting);
  const iso = session.meta.created_at;

  assert(typeof iso === "string", "created_at must be a string");
  assert(iso.endsWith("Z"), "created_at must be UTC (ends with 'Z')");
  assert(!Number.isNaN(Date.parse(iso)), "created_at must be parseable ISO date");
});

// Run when executed directly
if (require.main === module) {
  run();
}

 */