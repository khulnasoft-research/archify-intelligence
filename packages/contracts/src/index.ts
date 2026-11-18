import { z } from 'zod';

export const providerModeSchema = z.enum(['remote-only', 'local-only', 'hybrid', 'rules-only']);
export const dataClassificationSchema = z.enum(['public', 'internal', 'confidential', 'restricted']);
export const questionKindSchema = z.enum(['choice', 'score', 'noul']);
export const policyOutcomeSchema = z.enum(['pass', 'review_required', 'blocked', 'inconclusive']);
export const healthResponseSchema = z.object({
  status: z.literal('ok'), service: z.string(), version: z.string(), timestamp: z.string().datetime(),
});

export const decisionQuestionSchema = z.object({
  key: z.string().min(1).max(100),
  kind: questionKindSchema,
  instructions: z.string().min(1).max(4000),
  criteria: z.union([z.record(z.string(), z.string()), z.array(z.string())]).optional(),
});

export const decisionRequestSchema = z.object({
  requestId: z.string().min(1),
  state: z.record(z.string(), z.unknown()),
  questions: z.array(decisionQuestionSchema).min(1).max(32),
  policyVersion: z.string().min(1),
  dataClassification: dataClassificationSchema,
}).strict();

export const decisionAnswerSchema = z.object({
  key: z.string(),
  kind: questionKindSchema,
  value: z.union([z.string(), z.number()]),
  probabilities: z.record(z.string(), z.number().min(0).max(1)).optional(),
  confidence: z.number().min(0).max(1).nullable(),
  provider: z.enum(['jev', 'local-model', 'rules']),
  modelId: z.string(),
  rawAnswerHash: z.string(),
  calibrationStatus: z.enum(['provider-calibrated', 'calibrated', 'uncalibrated', 'not-applicable']),
});

export const decisionBatchSchema = z.object({
  requestId: z.string(),
  provider: z.enum(['jev', 'local-model', 'rules']),
  modelId: z.string(),
  answers: z.array(decisionAnswerSchema),
  latencyMs: z.number().nonnegative(),
  observedAt: z.string().datetime(),
  usage: z.object({ inputTokens: z.number().int().nonnegative().optional(), outputTokens: z.number().int().nonnegative().optional() }).optional(),
});

export const policyDecisionSchema = z.object({
  id: z.string(), runId: z.string(), outcome: policyOutcomeSchema,
  policyVersion: z.string(), ruleIds: z.array(z.string()),
  reasons: z.array(z.object({
    code: z.string(), severity: z.enum(['info', 'low', 'medium', 'high', 'critical']),
    message: z.string(), evidenceIds: z.array(z.string()), assessmentIds: z.array(z.string()),
  })),
  requiresHumanApproval: z.boolean(), decidedAt: z.string().datetime(),
});

export type ProviderMode = z.infer<typeof providerModeSchema>;
export type DataClassification = z.infer<typeof dataClassificationSchema>;
export type DecisionQuestion = z.infer<typeof decisionQuestionSchema>;
export type DecisionRequest = z.infer<typeof decisionRequestSchema>;
export type DecisionAnswer = z.infer<typeof decisionAnswerSchema>;
export type DecisionBatch = z.infer<typeof decisionBatchSchema>;
export type PolicyDecision = z.infer<typeof policyDecisionSchema>;
