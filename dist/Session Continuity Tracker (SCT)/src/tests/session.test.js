import { describe, it, expect } from 'vitest';
import { listFromString } from '../utils.js';
describe('utils.listFromString', () => {
    it('parses comma-separated lists', () => {
        expect(listFromString('a,b, c')).toEqual(['a', 'b', 'c']);
    });
    it('returns empty array for empty input', () => {
        expect(listFromString('')).toEqual([]);
    });
});
