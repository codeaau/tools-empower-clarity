// src/tests/testRunner.ts

type TestFn = () => void | Promise<void>;

interface TestCase {
  name: string;
  fn: TestFn;
}

const tests: TestCase[] = [];

export function test(name: string, fn: TestFn) {
  tests.push({ name, fn });
}

export async function run() {
  let passed = 0;
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ ${name}`);
      console.error(err instanceof Error ? err.message : err);
    }
  }
  console.log(`\n${passed}/${tests.length} tests passed`);
}

export function assert(condition: unknown, message = "Assertion failed") {
  if (!condition) throw new Error(message);
}

export function assertEqual<T>(a: T, b: T, message?: string) {
  if (a !== b) throw new Error(message ?? `Expected ${a} === ${b}`);
}

export async function assertThrows(fn: TestFn, message?: string) {
  let threw = false;
  try {
    await fn();
  } catch {
    threw = true;
  }
  if (!threw) throw new Error(message ?? "Expected function to throw");
}
