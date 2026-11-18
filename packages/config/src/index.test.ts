import { describe, expect, it } from 'vitest';
import { loadConfig } from './index.js';

describe('loadConfig', () => {
  it('defaults to local-only and Jev disabled', () => {
    const config = loadConfig({});
    expect(config.defaultProviderMode).toBe('local-only');
    expect(config.jevEnabled).toBe(false);
  });
  it('fails closed when Jev is enabled without a key', () => {
    expect(() => loadConfig({ JEV_ENABLED: 'true', JEV_CONTRACT_VERIFIED: 'true' })).toThrow('JEV_API_KEY is required');
  });
});
