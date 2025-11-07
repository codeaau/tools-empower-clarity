import fs from "fs";
import { saveData } from "../core/persistence";
import { CONFIG } from "../core/config";
import { test } from "./testRunner";
import { expect } from "./assert";

test("Data is saved immutably", () => {
  const id = saveData({ foo: "bar" }, "TEST");
  const filePath = `${CONFIG.DATA_PATH}${id}.json`;

  expect(fs.existsSync(filePath)).toBe(true);

  const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  expect(content.foo).toBe("bar");
});
