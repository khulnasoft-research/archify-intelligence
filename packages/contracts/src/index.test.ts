import { describe, expect, it } from 'vitest';
import { decisionRequestSchema, decisionAnswerSchema } from './index.js';

describe('decision contracts', () => {
  it('accepts a valid Noul request', () => {
    const result = decisionRequestSchema.safeParse({ requestId: 'req_1', state: { change: 'auth' }, policyVersion: '1.0.0', dataClassification: 'internal', questions: [{ key: 'auth', kind: 'noul', instructions: 'Does this change auth?' }] });
    expect(result.success).toBe(true);
  });
  it('allows null confidence for Noul answers', () => {
    const result = decisionAnswerSchema.safeParse({ key: 'auth', kind: 'noul', value: 0.8, confidence: null, provider: 'jev', modelId: 'jev-test', rawAnswerHash: 'sha256:test', calibrationStatus: 'provider-calibrated' });
    expect(result.success).toBe(true);
  });
});
