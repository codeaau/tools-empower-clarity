import { describe, it, expect } from 'vitest';
import { saveSession, loadSession } from '../core/persistence';
import fs from 'fs/promises';
import path from 'path';
import { CONFIG } from '../core/config';

describe('persistence', () => {
  it('saves and loads a session', async () => {
    const session = { id: 'abc123', value: 'x' };
    const id = await saveSession(session);
    const loaded = await loadSession(id);
    expect(loaded).toEqual(session);
    await fs.rm(path.join(CONFIG.DATA_PATH, `${id}.json`));
  });
});
