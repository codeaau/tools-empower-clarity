import { generateId } from "../core/ids";
import { test } from "./testRunner";
import { expect } from "./assert";

test("IDs are unique and prefixed", () => {
  const id1 = generateId("TEST");
  const id2 = generateId("TEST");
  console.log("Generated IDs:", id1, id2);

  expect(id1).not.toBe(id2);
  expect(id1.startsWith("TEST-")).toBeTruthy();
});
