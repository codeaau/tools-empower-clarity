import fs from "fs";
import path from "path";
import { CONFIG } from "./config";

export function logEvent(message: string): void {
  const logDir = CONFIG.LOG_PATH;
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

  const file = path.join(logDir, "events.log");
  const entry = `[${new Date().toISOString()}] ${message}\n`;

  fs.appendFileSync(file, entry, { encoding: "utf-8" });
}
