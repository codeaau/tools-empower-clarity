// validator.ts
import Ajv from "ajv";
import fs from "fs";

const ajv = new Ajv({ allErrors: true });
const schema = JSON.parse(fs.readFileSync("./schema.json", "utf8"));
const validate = ajv.compile(schema);

const file = process.argv[2] ?? "./sample-event.json";
const data = JSON.parse(fs.readFileSync(file, "utf8"));

const valid = validate(data);
if (!valid) {
  console.error("Validation failed");
  console.error(validate.errors);
  process.exit(1);
} else {
  console.log("Validation passed");
  process.exit(0);
}
