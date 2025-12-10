import { describe, it, expect } from "vitest";
import { makeId } from '../core/makeId.js'; // adjust path
describe("Create an identity number", () => {
    it("generates a string of correct length", () => {
        const id = makeId();
        expect(id).toHaveLength(55);
    });
});
