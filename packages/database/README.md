# Database package

Drizzle schema for the P2 core platform tables: organizations, users, memberships, projects, repositories, snapshots, analysis runs, graph nodes/edges, evidence, decision assessments, policy versions/decisions, approvals, Archify artifacts, provider usage, audit events, and webhook deliveries.

```bash
pnpm --filter @archify-intelligence/database db:generate
pnpm --filter @archify-intelligence/database db:migrate
```

`db:migrate` needs a live `DATABASE_URL`. The generated migration in `drizzle/` has not been applied in this environment and PostgreSQL row-level security is not implemented yet. Application-level tenant checks live in `@archify-intelligence/security`; they are unit-tested but not a substitute for database policies.
