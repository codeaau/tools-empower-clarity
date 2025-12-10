import fs from 'node:fs';
import path from 'node:path';
export function ensureDirSync(dirPath) {
    if (!fs.existsSync(dirPath))
        fs.mkdirSync(dirPath, { recursive: true });
}
export function artifactPaths({ baseDir, kind, id, ext = 'json', }) {
    const humanDir = path.join(baseDir, 'human', kind);
    const jsonDir = path.join(baseDir, 'json', kind);
    ensureDirSync(humanDir);
    ensureDirSync(jsonDir);
    const humanPath = path.join(humanDir, `${id}.md`);
    const jsonPath = path.join(jsonDir, `${id}.${ext}`);
    return { humanPath, jsonPath };
}
