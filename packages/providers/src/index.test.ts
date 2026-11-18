import { describe, expect, it } from 'vitest';
import { selectProvider } from './index.js';

describe('provider router', () => {
  it('never routes restricted data to Jev', () => {
    expect(selectProvider({ mode: 'hybrid', dataClassification: 'restricted', remoteAllowed: true, localProviderAvailable: false, jevEnabled: true, jevHealthy: true }).provider).toBe('rules');
  });
  it('uses local provider when Jev is unhealthy in hybrid mode', () => {
    expect(selectProvider({ mode: 'hybrid', dataClassification: 'internal', remoteAllowed: true, localProviderAvailable: true, jevEnabled: true, jevHealthy: false }).provider).toBe('local-model');
  });
  it('does not fall back to Jev in local-only mode', () => {
    const route = selectProvider({ mode: 'local-only', dataClassification: 'public', remoteAllowed: true, localProviderAvailable: false, jevEnabled: true, jevHealthy: true });
    expect(route.provider).toBe('rules');
  });
  it('does not silently switch to local mode when remote-only Jev is unavailable', () => {
    const route = selectProvider({ mode: 'remote-only', dataClassification: 'internal', remoteAllowed: true, localProviderAvailable: true, jevEnabled: false, jevHealthy: false });
    expect(route.provider).toBe('unavailable');
  });
});
