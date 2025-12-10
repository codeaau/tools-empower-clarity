// ./src/lib/artifacts/deterministic.ts
import fs from 'node:fs';
import path from 'node:path';
export function ensureDir(p) {
    fs.mkdirSync(p, { recursive: true });
}
export function deterministicPaths(opts) {
    const clock = opts.clock ?? new Date().toISOString();
    const dir = path.resolve(opts.baseDir, opts.namespace, clock.slice(0, 10));
    ensureDir(dir);
    const name = [opts.kind, opts.id].filter(Boolean).join('.');
    const ext = opts.ext ?? 'json';
    const file = path.join(dir, `${name}.${ext}`);
    const meta = path.join(dir, `${name}.meta.json`);
    return { dir, file, meta, clock };
}
export function writeJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
