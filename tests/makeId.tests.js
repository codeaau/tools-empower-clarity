// makeId.test.js
import { makeId } from '../src/core/makeId.js';

test('makeId returns expected format and prefix', () => {
  const id = makeId('S', new Date('2025-10-29T14:00:00Z'));
  expect(id.startsWith('S-20251029T140000Z-')).toBe(true);
});

test('makeId uniqueness', () => {
  const a = makeId('W');
  const b = makeId('W');
  expect(a).not.toBe(b);
});

test('makeId rejects bad prefix', () => {
  expect(() => makeId('s')).toThrow();
  expect(() => makeId('SS')).toThrow();
  expect(() => makeId('1')).toThrow();
});
