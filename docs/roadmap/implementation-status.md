# Implementation Status

## Current scaffold

- [x] Monorepo workspace and Turbo task graph
- [x] Strict TypeScript base config
- [x] Environment validation with Jev disabled by default
- [x] Shared Zod contracts for provider modes, decisions and policy outcomes
- [x] Domain graph and evidence types
- [x] Graph delta starter
- [x] Repository path boundary helper
- [x] Full P2 Drizzle schema for core platform tables
- [x] Generated initial SQL migration (`packages/database/drizzle`)
- [x] Analysis run state machine and deterministic run idempotency keys
- [x] BullMQ job lifecycle helpers (retry policy, heartbeat, cancellation, dead letters)
- [x] Tenant access helper and unit tests
- [x] Canonical graph / sidecar / artifact / run JSON Schema generation
- [x] Initial Drizzle schema baseline
- [x] Initial provider routing with local-only egress guard
- [x] Jev adapter boundary and request normalization scaffold (disabled until contract verification gate passes)
- [x] Explicit not-yet-implemented local inference protocol boundary
- [x] Deterministic policy-engine starter
- [x] Archify adapter pin guard
- [x] API health endpoint, worker shell, CLI shell, web landing page
- [x] Readiness endpoint returns 503 until dependencies are wired
- [x] Docker Compose and CI skeleton
- [x] Initial ADRs and threat model

## Not complete

- [ ] Verify/pin exact Archify upstream commit and inspect exact JSON schemas
- [ ] Complete live Jev response contract against current official docs and sandbox
- [ ] Implement and contract-test local Ollama/OpenAI-compatible provider
- [ ] Authentication, RBAC and tenant isolation
- [ ] Database repositories and PostgreSQL row-level security (migration generated, not yet applied)
- [ ] Redis/BullMQ live integration suite in CI (helpers are unit-tested)
- [ ] Repository checkout sandbox and AST analysis
- [ ] Concrete BullMQ processors for each pipeline stage
- [ ] Archify IR mapping and real `finalize` invocation
- [ ] Immutable object storage and artifact-origin isolation
- [ ] Frontend product journeys and evidence viewer
- [ ] Full unit/contract/integration/E2E/security suite
- [ ] Load, calibration and cost benchmarks

Do not label this scaffold production-ready.
