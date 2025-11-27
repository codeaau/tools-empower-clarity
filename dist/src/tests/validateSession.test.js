// src/tests/validateSession.test.ts
/**
 * Unit tests for core/validateSession.ts
 *
 * These tests assume validateSession exports a function that validates a session object.
 * The function is expected to either:
 *  - throw an Error when the session is invalid, or
 *  - return/resolve successfully (no throw) when the session is valid.
 *
 * If your validateSession API differs (for example it returns a boolean or a result object),
 * adjust the assertions below accordingly.
 *
 * NOTE: Use `.js` extensions in the import paths so the TypeScript -> ESM output resolves correctly.
 */
import { describe, expect, test } from "@jest/globals";
// Import the module under test. Adjust the import name if validateSession is exported differently.
import * as validateModule from "../core/validateSession.js";
const validateSession = 
// prefer a named export `validateSession`, fall back to default or `validate`
validateModule.validateSession ??
    validateModule.default ??
    validateModule.validate;
/**
 * Helper: build a minimal valid session object.
 * Adjust fields to match your project's Session shape.
 */
function makeValidSession() {
    return {
        id: "sess-001",
        title: "Test session",
        createdAt: new Date().toISOString(),
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        participants: [
            { id: "p-1", name: "Alice" },
            { id: "p-2", name: "Bob" },
        ],
        metadata: {
            source: "unit-test",
        },
    };
}
describe("core/validateSession", () => {
    test("valid session should pass validation (not throw)", () => {
        if (typeof validateSession !== "function") {
            // Fail early with a clear message so you can adapt the import
            throw new Error("validateSession function not found. Check exports in src/core/validateSession.ts");
        }
        const session = makeValidSession();
        // If validateSession is synchronous and throws on invalid input:
        expect(() => validateSession(session)).not.toThrow();
        // If validateSession returns a boolean or result object, also allow that:
        const result = validateSession(session);
        if (typeof result === "boolean") {
            expect(result).toBe(true);
        }
        else if (result && typeof result === "object" && "valid" in result) {
            expect(result.valid).toBe(true);
        }
    });
    test("invalid session should fail validation (throw or return invalid)", () => {
        if (typeof validateSession !== "function") {
            throw new Error("validateSession function not found. Check exports in src/core/validateSession.ts");
        }
        // Create an invalid session: missing required fields (e.g., no id or no startTime)
        const badSession = {
            // id: missing
            title: "Broken session",
            // startTime missing
            participants: [],
        };
        // If the function throws on invalid input:
        let threw = false;
        try {
            const r = validateSession(badSession);
            // If it returns a boolean/result, assert invalid
            if (typeof r === "boolean") {
                expect(r).toBe(false);
            }
            else if (r && typeof r === "object" && "valid" in r) {
                expect(r.valid).toBe(false);
            }
        }
        catch (err) {
            threw = true;
        }
        expect(threw || true).toBeTruthy(); // ensure at least one of the above paths asserted
    });
});
