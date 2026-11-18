import { describe, expect, it } from 'vitest';
import { stableId } from './index.js';

describe('stableId', () => {
  it('is deterministic for the same namespace and value', () => {
    expect(stableId('node', 'Auth Service')).toBe(stableId('node', 'Auth Service'));
  });
  it('normalizes case and whitespace', () => {
    expect(stableId('node', ' Auth Service ')).toBe(stableId('node', 'auth service'));
  });
});
