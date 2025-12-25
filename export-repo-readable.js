#!/usr/bin/env node
/**
 * export-repo-readable.js
 *
 * Produces a single text snapshot that mirrors repo structure and file contents.
 * Usage examples:
 *   node export-repo-readable.js --out repo_snapshot.txt --contents
 *   node export-repo-readable.js --out repo_snapshot.txt --contents --max-bytes 200,000
 */

import fs, { createReadStream, createWriteStream } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { createHash } from 'node:crypto';
const {promises: fsp} = fs;
import { execSync } from 'node:child_process';

const ARGV = process.argv.slice(2);
const getArg = (name, def) => {
  const i = ARGV.indexOf(name);
  if (i === -1) return def;
  return ARGV[i + 1] && !ARGV[i + 1].startsWith('--') ? ARGV[i + 1] : true;
};

const OUT_FILE = getArg('--out', 'repo_snapshot.txt');
const INCLUDE_CONTENTS = !!getArg('--contents', false);
const MAX_BYTES = Number(getArg('--max-bytes', 500_000));
const PREVIEW_CHUNK = Number(getArg('--preview-chunk', 64 * 1024));
const EXCLUDE_LIST = (getArg('--exclude', 'node_modules,.git,dist,build').toString()).split(',');
const SHOW_HIDDEN = !!getArg('--show-hidden', false);
const ROOT = process.cwd();

function extToLang(ext) {
  const map = {
    '.js': 'javascript', '.ts': 'typescript', '.json': 'json', '.md': 'markdown',
    '.py': 'python', '.sh': 'bash', '.yml': 'yaml', '.yaml': 'yaml',
    '.html': 'html', '.css': 'css', '.java': 'java', '.rs': 'rust'
  };
  return map[ext.toLowerCase()] || '';
}

async function tryGitInfo() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {cwd: ROOT, stdio: ['pipe','pipe','ignore']}).toString().trim();
    const commit = execSync('git rev-parse --short HEAD', {cwd: ROOT, stdio: ['pipe','pipe','ignore']}).toString().trim();
    return {branch, commit};
  } catch (e) {
    return null;
  }
}

async function isBinary(filePath) {
  const fd = await fsp.open(filePath, 'r');
  try {
    const buf = Buffer.alloc(8000);
    const {bytesRead} = await fd.read(buf, 0, buf.length, 0);
    for (let i = 0; i < bytesRead; i++) {
      if (buf[i] === 0) return true;
    }
    return false;
  } finally {
    await fd.close();
  }
}

function sha256Stream(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const rs = createReadStream(filePath);
    rs.on('data', d => hash.update(d));
    rs.on('end', () => resolve(hash.digest('hex')));
    rs.on('error', reject);
  });
}

async function readChunk(filePath, start, length) {
  const fd = await fsp.open(filePath, 'r');
  try {
    const buf = Buffer.alloc(length);
    const {bytesRead} = await fd.read(buf, 0, length, start);
    return buf.slice(0, bytesRead).toString('utf8');
  } finally {
    await fd.close();
  }
}

async function writeManifest(out) {
  const now = new Date().toISOString();
  const git = await tryGitInfo();
  out.write(`REPO SNAPSHOT\nGenerated: ${now}\nRoot: ${ROOT}\n`);
  if (git) out.write(`Git branch: ${git.branch}\nGit commit: ${git.commit}\n`);
  out.write('---\n\n');
}

async function walk(dir, out, depth = 0) {
  const entries = await fsp.readdir(dir, {withFileTypes: true});
  entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  for (const e of entries) {
    if (!SHOW_HIDDEN && e.name.startsWith('.')) continue;
    if (EXCLUDE_LIST.includes(e.name)) continue;
    const full = join(dir, e.name);
    const rel = relative(ROOT, full) || '.';
    if (e.isDirectory()) {
      out.write(`${'  '.repeat(depth)}DIR: ${rel}\n`);
      await walk(full, out, depth + 1);
    } else if (e.isFile()) {
      const stat = await fsp.stat(full);
      const size = stat.size;
      const mtime = stat.mtime.toISOString();
      out.write(`${'  '.repeat(depth)}- FILE: ${rel}\n`);
      out.write(`${'  '.repeat(depth)}  Size: ${size} bytes\n`);
      out.write(`${'  '.repeat(depth)}  Modified: ${mtime}\n`);
      try {
        const hash = await sha256Stream(full);
        out.write(`${'  '.repeat(depth)}  SHA256: ${hash}\n`);
      } catch (err) {
        out.write(`${'  '.repeat(depth)}  SHA256: [error computing]\n`);
      }

      if (INCLUDE_CONTENTS) {
        let binary = false;
        try {
          binary = await isBinary(full);
        } catch (err) {
          binary = true;
        }
        if (binary) {
          out.write(`${'  '.repeat(depth)}  Content: [BINARY - skipped]\n\n`);
          continue;
        }

        if (size <= MAX_BYTES) {
          const ext = extname(e.name);
          const lang = extToLang(ext);
          out.write(`${'  '.repeat(depth)}  Content start\n`);
          if (lang) out.write(`\`\`\`${lang}\n`);
          const txt = await fsp.readFile(full, 'utf8');
          out.write(txt.replace(/\r\n/g, '\n'));
          if (lang) out.write('\n```\n');
          out.write(`${'  '.repeat(depth)}  Content end\n\n`);
        } else {
          out.write(`${'  '.repeat(depth)}  Content preview start\n`);
          const head = await readChunk(full, 0, PREVIEW_CHUNK);
          const tailStart = Math.max(0, size - PREVIEW_CHUNK);
          const tail = await readChunk(full, tailStart, PREVIEW_CHUNK);
          const ext = extname(e.name);
          const lang = extToLang(ext);
          if (lang) out.write(`\`\`\`${lang}\n`);
          out.write(head.replace(/\r\n/g, '\n'));
          out.write(`\n... [skipped ${size - (head.length + tail.length)} bytes] ...\n`);
          out.write(tail.replace(/\r\n/g, '\n'));
          if (lang) out.write('\n```\n');
          out.write(`${'  '.repeat(depth)}  Content preview end\n\n`);
        }
      } else {
        out.write('\n');
      }
    }
  }
}

const TARGET_DIR = getArg('--dir', null);

(async function main() {
  const outStream = createWriteStream(OUT_FILE, {flags: 'w'});
  try {
    await writeManifest(outStream);
    await walk(TARGET_DIR ? TARGET_DIR : ROOT, outStream, 0);
    outStream.end();
    console.log(`Snapshot written to ${OUT_FILE}`);
  } catch (err) {
    outStream.end();
    console.error('Error creating snapshot', err);
    process.exit(1);
  }
})();
