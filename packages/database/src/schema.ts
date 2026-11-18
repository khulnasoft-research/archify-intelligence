import { pgTable, text, timestamp, uuid, varchar, jsonb, pgEnum, index } from 'drizzle-orm/pg-core';

export const providerMode = pgEnum('provider_mode', ['remote-only', 'local-only', 'hybrid', 'rules-only']);
export const runStatus = pgEnum('run_status', ['queued', 'running', 'completed', 'failed', 'cancelled']);
export const policyOutcome = pgEnum('policy_outcome', ['pass', 'review_required', 'blocked', 'inconclusive']);

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  providerMode: providerMode('provider_mode').default('local-only').notNull(),
  dataClassification: varchar('data_classification', { length: 32 }).default('internal').notNull(),
  settings: jsonb('settings').$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('projects_org_idx').on(table.organizationId)]);

export const repositories = pgTable('repositories', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  provider: varchar('provider', { length: 32 }).notNull(),
  externalId: varchar('external_id', { length: 256 }).notNull(),
  defaultBranch: varchar('default_branch', { length: 256 }),
  encryptedCredentialRef: text('encrypted_credential_ref'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('repositories_project_idx').on(table.projectId)]);

export const analysisRuns = pgTable('analysis_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  repositoryId: uuid('repository_id').references(() => repositories.id).notNull(),
  headCommit: varchar('head_commit', { length: 64 }).notNull(),
  baseCommit: varchar('base_commit', { length: 64 }),
  status: runStatus('status').default('queued').notNull(),
  providerMode: providerMode('provider_mode').notNull(),
  summary: jsonb('summary').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
}, (table) => [index('analysis_runs_project_idx').on(table.projectId), index('analysis_runs_status_idx').on(table.status)]);

export const policyDecisions = pgTable('policy_decisions', {
  id: uuid('id').defaultRandom().primaryKey(),
  runId: uuid('run_id').references(() => analysisRuns.id).notNull(),
  outcome: policyOutcome('outcome').notNull(),
  policyVersion: varchar('policy_version', { length: 64 }).notNull(),
  reasons: jsonb('reasons').$type<Record<string, unknown>[]>().default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('policy_decisions_run_idx').on(table.runId)]);
