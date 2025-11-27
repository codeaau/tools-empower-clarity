import fs from "fs";
import path from "path";
let passed = 0;
let failed = 0;
// Wrap console.log from testRunner
const origLog = console.log;
console.log = (msg, ...args) => {
    if (msg.startsWith("✅"))
        passed++;
    if (msg.startsWith("❌"))
        failed++;
    origLog(msg, ...args);
};
async function runAllTests() {
    const testDir = __dirname;
    const files = fs.readdirSync(testDir);
    for (const file of files) {
        if (file.endsWith(".test.ts") && !["index.ts", "testRunner.ts", "assert.ts"].includes(file)) {
            console.log(`\n▶ Running ${file}`);
            await import(path.join(testDir, file));
        }
    }
    origLog(`\nSummary: ${passed} passed, ${failed} failed`);
}
runAllTests();
