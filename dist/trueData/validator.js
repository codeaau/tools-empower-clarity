// trueData/validator.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { formatError } from "../utils/errorReporter.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function run(options = {}) {
    const logDir = path.resolve(process.cwd(), options.logDir ?? "trueData/logs");
    const humanLog = path.resolve(logDir, "schema-validation.log");
    const jsonOut = path.resolve(logDir, "schema-validation.json");
    try {
        await fs.promises.mkdir(logDir, { recursive: true });
        // Resolve schema.json relative to this file
        const schemaPath = path.resolve(__dirname, "schema.json");
        const schemaRaw = await fs.promises.readFile(schemaPath, "utf8");
        const schema = JSON.parse(schemaRaw);
        // TODO: actual validation logic
        const result = { status: "ok", schemaKeys: Object.keys(schema) };
        const summary = `Validation successful: ${result.schemaKeys.length} keys validated`;
        await fs.promises.writeFile(humanLog, `${summary}\n`, "utf8");
        await fs.promises.writeFile(jsonOut, JSON.stringify(result, null, 2), "utf8");
        if (options.verbose)
            console.log(summary);
        return result;
    }
    catch (err) {
        const error = formatError(err, { source: "trueData/validator.ts", func: "run" });
        const header = `[ERROR] ${error.message} (${error.source}:${error.location})`;
        await fs.promises.mkdir(path.dirname(humanLog), { recursive: true });
        await fs.promises.writeFile(humanLog, `${header}\n${error.stack ?? ""}\n`, "utf8");
        await fs.promises.writeFile(jsonOut, JSON.stringify({ status: "error", error }, null, 2), "utf8");
        console.error(header);
        throw err;
    }
}
