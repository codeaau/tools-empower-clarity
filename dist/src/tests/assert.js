export function expect(received) {
    return {
        toBe(expected) {
            if (received !== expected) {
                throw new Error(`Expected ${received} to be ${expected}`);
            }
        },
        not: {
            toBe(expected) {
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
        toEqual(expected) {
            const r = JSON.stringify(received);
            const e = JSON.stringify(expected);
            if (r !== e) {
                throw new Error(`Expected ${r} to equal ${e}`);
            }
        }
    };
}
