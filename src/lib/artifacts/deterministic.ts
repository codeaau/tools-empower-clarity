// ./src/lib/artifacts/deterministic.ts
import fs from 'node:fs';
import path from 'node:path';

type ArtifactOpts = {
  baseDir: string;            // e.g., "./artifacts"
  namespace: string;          // e.g., "refman"
  kind: string;               // e.g., "index"
  clock?: string;             // ISO or YYYYMMDD-HHMMSS; allow override for tests
  id?: string;                // e.g., hash or slug
  ext?: 'json' | 'ndjson' | 'txt' | 'md';
};

export function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

export function deterministicPaths(opts: ArtifactOpts) {
  const clock = opts.clock ?? new Date().toISOString();
  const dir = path.resolve(opts.baseDir, opts.namespace, clock.slice(0, 10));
  ensureDir(dir);
  const name = [opts.kind, opts.id].filter(Boolean).join('.');
  const ext = opts.ext ?? 'json';
  const file = path.join(dir, `${name}.${ext}`);
  const meta = path.join(dir, `${name}.meta.json`);
  return { dir, file, meta, clock };
}

export function writeJson(file: string, data: unknown) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
