import fs from "fs";
import path from "path";
import { CONFIG } from "./config";
import { generateId } from "./ids";

export function saveData(data: object, label: string = "entry"): string {
  const dir = CONFIG.DATA_PATH;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const id = generateId(label);
  const file = path.join(dir, `${id}.json`);

  fs.writeFileSync(file, JSON.stringify(data, null, 2), { encoding: "utf-8" });
  return id;
}
