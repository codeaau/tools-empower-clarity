import AjvModule from "ajv";
import { createHash } from "crypto";
import * as fs from "fs";
import * as path from "path";
// load the canonical schema once at startup
const schemaPath = path.resolve(__dirname, "../docs/schema.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
const Ajv = AjvModule.default ?? AjvModule;
const ajv = new Ajv({ allErrors: true, strict: true });
const validate = ajv.compile(schema);
/**
 * Compute SHA-256 hash of canonical sections.
 * Only intention, factual, resulting, meta are included (not edits).
 */
function computeIntegrityHash(session) {
    const canonical = {
        intention: session.intention,
        factual: session.factual,
        resulting: session.resulting,
        meta: session.meta,
    };
    const json = JSON.stringify(canonical);
    return createHash("sha256").update(json).digest("hex");
}
/**
 * Validate a session object agaionst schema and semantic rules.
 */
export function validateSession(session) {
    const valid = validate(session);
    if (!valid) {
        const errors = validate.errors?.map((e) => `schema${e.instancePath} ${e.message}`);
        return { valid: false, errors };
    }
    if (session.factual.ended_at && session.factual.started_at) {
        const start = new Date(session.factual.started_at).getTime();
        const end = new Date(session.factual.ended_at).getTime();
        if (end < start) {
            return {
                valid: false,
                errors: ["semantic: factual.ended_at must be >= factual.started_at"],
            };
        }
    }
    // Append-only edits check 
    // (basic enforcement: no overwrite detection here,
    // but ensures edits[] is an array of objects with required fields)
    for (const [i, edit] of session.edits.entries()) {
        if (!edit.who || !edit.when || !edit.why || !edit.intention || !edit.what) {
            return {
                valid: false,
                errors: [`edits[${i}] is missing required fields`],
            };
        }
    }
    // Compute integrity hash
    const integrity_hash = computeIntegrityHash(session);
    return { valid: true, integrity_hash };
}
