export function expect<T>(received: T) {
  return {
    toBe(expected: T) {
      if (received !== expected) {
        throw new Error(`Expected ${received} to be ${expected}`);
      }
    },
    not: {
      toBe(expected: T) {
        if (received === expected) {
          throw new Error(`Expected ${received} not to be ${expected}`);
        }
      }
    },
    toBeTruthy() {
      if (!received) {
        throw new Error(`Expected ${received} to be truthy`);
      }
    },
    toBeFalsy() {
      if (received) {
        throw new Error(`Expected ${received} to be falsy`);
      }
    },
    toEqual(expected: any) {
      const r = JSON.stringify(received);
      const e = JSON.stringify(expected);
      if (r !== e) {
        throw new Error(`Expected ${r} to equal ${e}`);
      }
    }
  };
}
