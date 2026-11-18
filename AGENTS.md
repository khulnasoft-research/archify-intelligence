# Agent Engineering Rules

1. Read `MASTER_IMPLEMENTATION_PLAN.md` before implementing features.
2. Preserve user changes; inspect `git status` before every milestone.
3. Do not claim production readiness without the full definition-of-done evidence.
4. Never treat Jev as locally deployable. Local inference is an independent provider.
5. `local-only` must never fall back to Jev or send repository content to a remote endpoint.
6. Model output is advisory; only deterministic policy code produces policy outcomes.
7. Keep platform intelligence metadata outside Archify's native IR unless the pinned upstream schema explicitly supports a field.
8. Pin Archify to a reviewed commit and preserve its license and NOTICE files.
9. Never execute repository scripts during static analysis. Any execution belongs in a separate sandbox with no credentials and network disabled by default.
10. Every milestone requires tests, typecheck, lint, docs, and an honest completion report.
