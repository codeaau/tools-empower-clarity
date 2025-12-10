// ./tests/shims/node-env.ts
// Remove or neutralize browser globals that creep in via deps
// and define minimal replacements where needed.
(globalThis as any).window = undefined;
(globalThis as any).document = undefined;
(globalThis as any).navigator = { userAgent: 'node' };

// If code branches on "isBrowser", force false:
process.env.CLARITY_IS_BROWSER = 'false';

// Freeze to catch accidental mutation in tests
Object.freeze(globalThis);
