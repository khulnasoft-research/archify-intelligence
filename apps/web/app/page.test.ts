import { describe, expect, it } from 'vitest';

describe('web scaffold', () => {
  it('identifies the product', () => {
    expect('Archify Intelligence').toContain('Archify');
  });
});
