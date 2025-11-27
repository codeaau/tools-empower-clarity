// src/core/persistence.ts
import fs from 'fs/promises';
import path from 'path';
import { CONFIG } from './config';
import { generateId } from './ids';

export async function saveSession(session: Record<string, unknown>): Promise<string> {
  const dir = CONFIG.DATA_PATH;
  await fs.mkdir(dir, { recursive: true });
  const id = (session as any).id ?? generateId('session');
  const file = path.join(dir, `${id}.json`);
  await fs.writeFile(file, JSON.stringify(session, null, 2), 'utf-8');
  return id;
}

export async function loadSession(id: string): Promise<Record<string, unknown> | null> {
  const file = path.join(CONFIG.DATA_PATH, `${id}.json`);
  try {
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
