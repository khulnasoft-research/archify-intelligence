import { describe, expect, it } from 'vitest';
import { PinnedArchifyCliAdapter } from './index.js';

describe('Archify adapter guard', () => {
  it('rejects unpinned upstream versions', () => {
    expect(() => new PinnedArchifyCliAdapter({ repoPath: './vendor/archify', expectedCommit: 'main' })).toThrow('full 40-character commit SHA');
  });
});
