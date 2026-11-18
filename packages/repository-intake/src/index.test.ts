import { describe, expect, it } from 'vitest';
import { resolveRepositoryChild } from './index.js';

describe('repository path boundary', () => {
  it('allows a path below the root', () => {
    expect(resolveRepositoryChild('/repo', 'src/index.ts')).toBe('/repo/src/index.ts');
  });
  it('rejects traversal', () => {
    expect(() => resolveRepositoryChild('/repo', '../../etc/passwd')).toThrow('escapes');
  });
});
