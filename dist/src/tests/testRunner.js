// src/tests/testRunner.ts
const tests = [];
export function test(name, fn) {
    tests.push({ name, fn });
}
export async function run() {
    let passed = 0;
    for (const { name, fn } of tests) {
        try {
            await fn();
            console.log(`✅ ${name}`);
            passed++;
        }
        catch (err) {
            console.error(`❌ ${name}`);
            console.error(err instanceof Error ? err.message : err);
        }
    }
    console.log(`\n${passed}/${tests.length} tests passed`);
}
export function assert(condition, message = "Assertion failed") {
    if (!condition)
        throw new Error(message);
}
export function assertEqual(a, b, message) {
    if (a !== b)
        throw new Error(message ?? `Expected ${a} === ${b}`);
}
export async function assertThrows(fn, message) {
    let threw = false;
    try {
        await fn();
    }
    catch {
        threw = true;
    }
    if (!threw)
        throw new Error(message ?? "Expected function to throw");
}
