# Archify Intelligence

A hybrid architecture-intelligence platform scaffold combining repository analysis, Jev online structured judgments, local AI providers, deterministic policy evaluation, and the Archify renderer.

> This repository is a development scaffold, not a production-ready release. External provider credentials, upstream Archify pinning, authentication, tenant authorization, isolated repository workers, object storage, and production policy rules must be completed before deployment.

## Architecture principles

- The canonical architecture graph is the platform source of truth.
- Archify is integrated through an adapter and a pinned upstream CLI; its strict JSON IR is not extended with platform-only metadata.
- Jev is online-only. Local/offline mode uses a separately configured local inference provider.
- Model results are advisory. Deterministic code owns policy outcomes and permissions.
- `local-only` means no model/content egress to remote providers.
- Repository evidence is tied to an exact commit and verified path/line range.

## Requirements

- Node.js 22+
- pnpm 10+
- Docker and Docker Compose (for local infrastructure)

## Quick start

```bash
cp .env.example .env
pnpm install
docker compose -f infra/compose/docker-compose.yml up -d
pnpm dev
```

Services:

- Web: http://localhost:3000
- API: http://localhost:4000/health
- MinIO console: http://localhost:9001

## Useful commands

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm format:check
```

## Current scaffold boundaries

- P0/P1 foundation: workspace, contracts, environment validation, health API, worker/CLI shells, Docker Compose, CI and ADRs.
- P2 foundation: full core database schema and migration, analysis run state machine, run/artifact idempotency, BullMQ lifecycle helpers, tenant access helpers, and generated JSON Schema documents.
- Provider ports and safe routing are implemented as initial foundations; live Jev requests remain disabled until `JEV_CONTRACT_VERIFIED=true` is set after official contract tests. The local inference adapter is an explicit P4 TODO.
- The Archify adapter is an interface and integration boundary. Pin a reviewed upstream Archify commit and inspect its current schemas before enabling rendering.
- Repository scanning, full AST extraction, complete auth/RBAC, production artifact storage, and a polished web UI are later milestones.

## Repository layout

See [`docs/architecture/overview.md`](docs/architecture/overview.md), [`docs/roadmap/implementation-status.md`](docs/roadmap/implementation-status.md), and [`SCAFFOLD_REPORT.md`](SCAFFOLD_REPORT.md).

