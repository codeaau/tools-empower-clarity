// ./tests/helpers/schema-path.ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function resolveSchema(...segments: string[]) {
  // Always resolve from repo root for determinism
  return path.resolve(__dirname, '../../', ...segments);
}
