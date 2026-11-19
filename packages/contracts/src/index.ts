import { z } from "zod";

export const providerModeSchema = z.enum([
  "remote-only",
  "local-only",
  "hybrid",
  "rules-only",
]);
export const dataClassificationSchema = z.enum([
  "public",
  "internal",
  "confidential",
  "restricted",
]);
export const questionKindSchema = z.enum(["choice", "score", "noul"]);
export const policyOutcomeSchema = z.enum([
  "pass",
  "review_required",
  "blocked",
  "inconclusive",
]);
export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  version: z.string(),
  timestamp: z.string().datetime(),
});

export const decisionQuestionSchema = z.object({
  key: z.string().min(1).max(100),
  kind: questionKindSchema,
  instructions: z.string().min(1).max(4000),
  criteria: z
    .union([z.record(z.string(), z.string()), z.array(z.string())])
    .optional(),
});

export const decisionRequestSchema = z
  .object({
    requestId: z.string().min(1),
    state: z.record(z.string(), z.unknown()),
    questions: z.array(decisionQuestionSchema).min(1).max(32),
    policyVersion: z.string().min(1),
    dataClassification: dataClassificationSchema,
  })
  .strict();

export const decisionAnswerSchema = z.object({
  key: z.string(),
  kind: questionKindSchema,
  value: z.union([z.string(), z.number()]),
  probabilities: z.record(z.string(), z.number().min(0).max(1)).optional(),
  confidence: z.number().min(0).max(1).nullable(),
  provider: z.enum(["jev", "local-model", "rules"]),
  modelId: z.string(),
  rawAnswerHash: z.string(),
  calibrationStatus: z.enum([
    "provider-calibrated",
    "calibrated",
    "uncalibrated",
    "not-applicable",
  ]),
});

export const decisionBatchSchema = z.object({
  requestId: z.string(),
  provider: z.enum(["jev", "local-model", "rules"]),
  modelId: z.string(),
  answers: z.array(decisionAnswerSchema),
  latencyMs: z.number().nonnegative(),
  observedAt: z.string().datetime(),
  usage: z
    .object({
      inputTokens: z.number().int().nonnegative().optional(),
      outputTokens: z.number().int().nonnegative().optional(),
    })
    .optional(),
});

export const policyDecisionSchema = z.object({
  id: z.string(),
  runId: z.string(),
  outcome: policyOutcomeSchema,
  policyVersion: z.string(),
  ruleIds: z.array(z.string()),
  reasons: z.array(
    z.object({
      code: z.string(),
      severity: z.enum(["info", "low", "medium", "high", "critical"]),
      message: z.string(),
      evidenceIds: z.array(z.string()),
      assessmentIds: z.array(z.string()),
    }),
  ),
  requiresHumanApproval: z.boolean(),
  decidedAt: z.string().datetime(),
});

export type ProviderMode = z.infer<typeof providerModeSchema>;
export type DataClassification = z.infer<typeof dataClassificationSchema>;
export type DecisionQuestion = z.infer<typeof decisionQuestionSchema>;
export type DecisionRequest = z.infer<typeof decisionRequestSchema>;
export type DecisionAnswer = z.infer<typeof decisionAnswerSchema>;
export type DecisionBatch = z.infer<typeof decisionBatchSchema>;
export type PolicyDecision = z.infer<typeof policyDecisionSchema>;

export const ARCHIFY_DIAGRAM_TYPES = [
  "architecture",
  "workflow",
  "sequence",
  "dataflow",
  "lifecycle",
  "erd",
  "class",
  "tree",
  "timeline",
  "waterfall",
] as const;

export const archifyDiagramTypeSchema = z.enum(ARCHIFY_DIAGRAM_TYPES);
export const analysisLevelSchema = z.enum(["L0", "L1", "L2", "L3", "L4"]);
export const runStatusSchema = z.enum([
  "queued",
  "running",
  "completed",
  "failed",
  "cancelled",
]);
export const calibrationStatusSchema = z.enum([
  "provider-calibrated",
  "calibrated",
  "uncalibrated",
  "not-applicable",
]);

export const startRunRequestSchema = z
  .object({
    repositoryId: z.string().min(1),
    headCommit: z
      .string()
      .regex(
        /^[0-9a-f]{40}$/i,
        "headCommit must be a full 40-character Git SHA",
      ),
    baseCommit: z
      .string()
      .regex(/^[0-9a-f]{40}$/i)
      .optional(),
    analysisLevel: analysisLevelSchema.default("L1"),
    providerMode: providerModeSchema.optional(),
    dataClassification: dataClassificationSchema.default("internal"),
    diagramTypes: z
      .array(archifyDiagramTypeSchema)
      .min(1)
      .max(10)
      .default(["architecture"]),
    includeSourceEvidence: z.boolean().default(true),
    redactionProfile: z.string().min(1).default("strict-default"),
    policyVersion: z.string().min(1),
  })
  .strict();

export const runSummarySchema = z
  .object({
    id: z.string().min(1),
    projectId: z.string().min(1),
    repositoryId: z.string().min(1),
    status: runStatusSchema,
    providerMode: providerModeSchema,
    analysisLevel: analysisLevelSchema,
    headCommit: z.string(),
    baseCommit: z.string().nullable(),
    createdAt: z.string().datetime(),
    startedAt: z.string().datetime().nullable(),
    finishedAt: z.string().datetime().nullable(),
    failureCode: z.string().nullable(),
  })
  .strict();

export const intelligenceSidecarSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    snapshotId: z.string().min(1),
    providerContext: z
      .object({
        mode: providerModeSchema,
        provider: z.enum(["jev", "local-model", "rules"]),
        modelId: z.string().min(1),
        calibrationStatus: calibrationStatusSchema,
        policyVersion: z.string().min(1),
      })
      .strict(),
    nodeAssessments: z.array(
      z
        .object({
          nodeId: z.string().min(1),
          riskBand: z.enum(["unknown", "low", "medium", "high", "critical"]),
          assessmentIds: z.array(z.string()).default([]),
          evidenceIds: z.array(z.string()).default([]),
        })
        .strict(),
    ),
    edgeAssessments: z.array(
      z
        .object({
          edgeId: z.string().min(1),
          riskBand: z.enum(["unknown", "low", "medium", "high", "critical"]),
          assessmentIds: z.array(z.string()).default([]),
          evidenceIds: z.array(z.string()).default([]),
        })
        .strict(),
    ),
    limitations: z.array(z.string()),
  })
  .strict();

export const artifactManifestSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    artifactId: z.string().min(1),
    runId: z.string().min(1),
    diagramType: archifyDiagramTypeSchema,
    storageKey: z.string().min(1),
    contentSha256: z.string().regex(/^[0-9a-f]{64}$/i),
    candidateSha256: z.string().regex(/^[0-9a-f]{64}$/i),
    rendererVersion: z.string().min(1),
    rendererCommit: z.string().regex(/^[0-9a-f]{40}$/i),
    sourceCommit: z.string().regex(/^[0-9a-f]{40}$/i),
    finalizeReceiptHash: z.string().optional(),
    createdAt: z.string().datetime(),
  })
  .strict();

export type ArchifyDiagramType = z.infer<typeof archifyDiagramTypeSchema>;
export type AnalysisLevel = z.infer<typeof analysisLevelSchema>;
export type RunStatus = z.infer<typeof runStatusSchema>;
export type StartRunRequest = z.infer<typeof startRunRequestSchema>;
export type RunSummary = z.infer<typeof runSummarySchema>;
export type IntelligenceSidecar = z.infer<typeof intelligenceSidecarSchema>;
export type ArtifactManifest = z.infer<typeof artifactManifestSchema>;
