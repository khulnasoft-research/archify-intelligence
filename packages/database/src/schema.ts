import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const providerMode = pgEnum("provider_mode", [
  "remote-only",
  "local-only",
  "hybrid",
  "rules-only",
]);
export const runStatus = pgEnum("run_status", [
  "queued",
  "running",
  "completed",
  "failed",
  "cancelled",
]);
export const policyOutcome = pgEnum("policy_outcome", [
  "pass",
  "review_required",
  "blocked",
  "inconclusive",
]);
export const membershipRole = pgEnum("membership_role", [
  "owner",
  "admin",
  "developer",
  "reviewer",
  "viewer",
]);
export const analysisLevel = pgEnum("analysis_level", [
  "L0",
  "L1",
  "L2",
  "L3",
  "L4",
]);
export const snapshotStatus = pgEnum("snapshot_status", [
  "pending",
  "ready",
  "failed",
]);
export const questionKind = pgEnum("question_kind", [
  "choice",
  "score",
  "noul",
]);
export const calibrationStatus = pgEnum("calibration_status", [
  "provider-calibrated",
  "calibrated",
  "uncalibrated",
  "not-applicable",
]);
export const approvalDecision = pgEnum("approval_decision", [
  "approved",
  "rejected",
]);

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  plan: varchar("plan", { length: 64 }).default("developer").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    externalSubject: varchar("external_subject", { length: 256 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    status: varchar("status", { length: 32 }).default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_external_subject_uq").on(table.externalSubject),
  ],
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: membershipRole("role").default("viewer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("organization_members_org_user_uq").on(
      table.organizationId,
      table.userId,
    ),
    index("organization_members_user_idx").on(table.userId),
  ],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    providerMode: providerMode("provider_mode").default("local-only").notNull(),
    dataClassification: varchar("data_classification", { length: 32 })
      .default("internal")
      .notNull(),
    settings: jsonb("settings")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("projects_org_idx").on(table.organizationId)],
);

export const repositories = pgTable(
  "repositories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    provider: varchar("provider", { length: 32 }).notNull(),
    externalId: varchar("external_id", { length: 256 }).notNull(),
    defaultBranch: varchar("default_branch", { length: 256 }),
    encryptedCredentialRef: text("encrypted_credential_ref"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("repositories_project_idx").on(table.projectId),
    uniqueIndex("repositories_project_external_uq").on(
      table.projectId,
      table.provider,
      table.externalId,
    ),
  ],
);

export const repositorySnapshots = pgTable(
  "repository_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    repositoryId: uuid("repository_id")
      .references(() => repositories.id, { onDelete: "cascade" })
      .notNull(),
    commitSha: varchar("commit_sha", { length: 64 }).notNull(),
    treeSha: varchar("tree_sha", { length: 64 }),
    analysisLevel: analysisLevel("analysis_level").default("L1").notNull(),
    status: snapshotStatus("status").default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("repository_snapshots_identity_uq").on(
      table.repositoryId,
      table.commitSha,
      table.analysisLevel,
    ),
    index("repository_snapshots_commit_idx").on(table.commitSha),
  ],
);

export const analysisRuns = pgTable(
  "analysis_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    repositoryId: uuid("repository_id")
      .references(() => repositories.id, { onDelete: "cascade" })
      .notNull(),
    headSnapshotId: uuid("head_snapshot_id").references(
      () => repositorySnapshots.id,
    ),
    baseSnapshotId: uuid("base_snapshot_id").references(
      () => repositorySnapshots.id,
    ),
    idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull(),
    headCommit: varchar("head_commit", { length: 64 }).notNull(),
    baseCommit: varchar("base_commit", { length: 64 }),
    analysisLevel: analysisLevel("analysis_level").default("L1").notNull(),
    status: runStatus("status").default("queued").notNull(),
    providerMode: providerMode("provider_mode").notNull(),
    dataClassification: varchar("data_classification", { length: 32 })
      .default("internal")
      .notNull(),
    failureCode: varchar("failure_code", { length: 64 }),
    summary: jsonb("summary").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("analysis_runs_idempotency_uq").on(
      table.projectId,
      table.idempotencyKey,
    ),
    index("analysis_runs_project_idx").on(table.projectId),
    index("analysis_runs_repository_commit_idx").on(
      table.repositoryId,
      table.headCommit,
    ),
    index("analysis_runs_status_time_idx").on(table.status, table.createdAt),
  ],
);

export const graphNodes = pgTable(
  "graph_nodes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    snapshotId: uuid("snapshot_id")
      .references(() => repositorySnapshots.id, { onDelete: "cascade" })
      .notNull(),
    stableKey: varchar("stable_key", { length: 512 }).notNull(),
    kind: varchar("kind", { length: 32 }).notNull(),
    name: varchar("name", { length: 512 }).notNull(),
    payload: jsonb("payload")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
  },
  (table) => [
    uniqueIndex("graph_nodes_snapshot_stable_uq").on(
      table.snapshotId,
      table.stableKey,
    ),
    index("graph_nodes_snapshot_idx").on(table.snapshotId),
  ],
);

export const graphEdges = pgTable(
  "graph_edges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    snapshotId: uuid("snapshot_id")
      .references(() => repositorySnapshots.id, { onDelete: "cascade" })
      .notNull(),
    stableKey: varchar("stable_key", { length: 512 }).notNull(),
    sourceNodeId: uuid("source_node_id")
      .references(() => graphNodes.id, { onDelete: "cascade" })
      .notNull(),
    targetNodeId: uuid("target_node_id")
      .references(() => graphNodes.id, { onDelete: "cascade" })
      .notNull(),
    relation: varchar("relation", { length: 32 }).notNull(),
    payload: jsonb("payload")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
  },
  (table) => [
    uniqueIndex("graph_edges_snapshot_stable_uq").on(
      table.snapshotId,
      table.stableKey,
    ),
    index("graph_edges_source_idx").on(table.sourceNodeId),
    index("graph_edges_target_idx").on(table.targetNodeId),
  ],
);

export const evidenceRefs = pgTable(
  "evidence_refs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    evidenceKey: varchar("evidence_key", { length: 256 }).notNull(),
    snapshotId: uuid("snapshot_id")
      .references(() => repositorySnapshots.id, { onDelete: "cascade" })
      .notNull(),
    commitSha: varchar("commit_sha", { length: 64 }).notNull(),
    path: text("path").notNull(),
    startLine: integer("start_line"),
    endLine: integer("end_line"),
    blobSha: varchar("blob_sha", { length: 64 }),
    evidenceType: varchar("evidence_type", { length: 32 }).notNull(),
    excerptHash: varchar("excerpt_hash", { length: 128 }).notNull(),
    redactionApplied: boolean("redaction_applied").default(false).notNull(),
  },
  (table) => [
    uniqueIndex("evidence_refs_snapshot_key_uq").on(
      table.snapshotId,
      table.evidenceKey,
    ),
    index("evidence_refs_path_idx").on(table.snapshotId, table.path),
  ],
);

export const decisionAssessments = pgTable(
  "decision_assessments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id")
      .references(() => analysisRuns.id, { onDelete: "cascade" })
      .notNull(),
    provider: varchar("provider", { length: 32 }).notNull(),
    modelId: varchar("model_id", { length: 128 }).notNull(),
    questionKey: varchar("question_key", { length: 100 }).notNull(),
    questionKind: questionKind("question_kind").notNull(),
    valueJson: jsonb("value_json").$type<unknown>().notNull(),
    probabilitiesJson: jsonb("probabilities_json").$type<Record<
      string,
      number
    > | null>(),
    confidence: doublePrecision("confidence"),
    calibrationStatus: calibrationStatus("calibration_status").notNull(),
    usageJson: jsonb("usage_json").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("decision_assessments_run_idx").on(table.runId),
    index("decision_assessments_question_idx").on(
      table.runId,
      table.questionKey,
    ),
  ],
);

export const policyVersions = pgTable(
  "policy_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    version: varchar("version", { length: 64 }).notNull(),
    rulesJson: jsonb("rules_json").$type<Record<string, unknown>>().notNull(),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("policy_versions_org_version_uq").on(
      table.organizationId,
      table.version,
    ),
  ],
);

export const policyDecisions = pgTable(
  "policy_decisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id")
      .references(() => analysisRuns.id, { onDelete: "cascade" })
      .notNull(),
    policyVersionId: uuid("policy_version_id").references(
      () => policyVersions.id,
    ),
    outcome: policyOutcome("outcome").notNull(),
    policyVersion: varchar("policy_version", { length: 64 }).notNull(),
    reasons: jsonb("reasons")
      .$type<Record<string, unknown>[]>()
      .default([])
      .notNull(),
    requiresHumanApproval: boolean("requires_human_approval")
      .default(false)
      .notNull(),
    decidedAt: timestamp("decided_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("policy_decisions_run_idx").on(table.runId)],
);

export const humanApprovals = pgTable(
  "human_approvals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id")
      .references(() => analysisRuns.id, { onDelete: "cascade" })
      .notNull(),
    policyDecisionId: uuid("policy_decision_id").references(
      () => policyDecisions.id,
    ),
    reviewerId: uuid("reviewer_id")
      .references(() => users.id)
      .notNull(),
    decision: approvalDecision("decision").notNull(),
    note: text("note"),
    commitSha: varchar("commit_sha", { length: 64 }).notNull(),
    snapshotId: uuid("snapshot_id")
      .references(() => repositorySnapshots.id)
      .notNull(),
    artifactHashes: jsonb("artifact_hashes")
      .$type<string[]>()
      .default([])
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("human_approvals_run_idx").on(table.runId)],
);

export const archifyArtifacts = pgTable(
  "archify_artifacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id")
      .references(() => analysisRuns.id, { onDelete: "cascade" })
      .notNull(),
    diagramType: varchar("diagram_type", { length: 32 }).notNull(),
    storageKey: text("storage_key").notNull(),
    contentSha256: varchar("content_sha256", { length: 64 }).notNull(),
    candidateSha256: varchar("candidate_sha256", { length: 64 }).notNull(),
    rendererVersion: varchar("renderer_version", { length: 64 }).notNull(),
    rendererCommit: varchar("renderer_commit", { length: 40 }).notNull(),
    sourceCommit: varchar("source_commit", { length: 40 }).notNull(),
    finalizeReceiptJson: jsonb("finalize_receipt_json").$type<Record<
      string,
      unknown
    > | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("archify_artifacts_run_type_content_uq").on(
      table.runId,
      table.diagramType,
      table.contentSha256,
    ),
    index("archify_artifacts_hash_idx").on(table.contentSha256),
  ],
);

export const providerUsage = pgTable(
  "provider_usage",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id")
      .references(() => analysisRuns.id, { onDelete: "cascade" })
      .notNull(),
    provider: varchar("provider", { length: 32 }).notNull(),
    modelId: varchar("model_id", { length: 128 }).notNull(),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    latencyMs: integer("latency_ms"),
    status: varchar("status", { length: 32 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("provider_usage_run_idx").on(table.runId)],
);

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    actorId: uuid("actor_id").references(() => users.id),
    action: varchar("action", { length: 100 }).notNull(),
    resourceType: varchar("resource_type", { length: 64 }).notNull(),
    resourceId: varchar("resource_id", { length: 128 }).notNull(),
    metadataRedacted: jsonb("metadata_redacted")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_events_org_time_idx").on(
      table.organizationId,
      table.createdAt,
    ),
  ],
);

export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: varchar("provider", { length: 32 }).notNull(),
    deliveryId: varchar("delivery_id", { length: 128 }).notNull(),
    signatureValid: boolean("signature_valid").notNull(),
    status: varchar("status", { length: 32 }).default("received").notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("webhook_deliveries_provider_delivery_uq").on(
      table.provider,
      table.deliveryId,
    ),
  ],
);
