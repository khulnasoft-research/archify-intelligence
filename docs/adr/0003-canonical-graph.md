# ADR-0003: Canonical graph is platform source of truth

- Status: Accepted
- Decision: Maintain a versioned platform graph and map it to Archify's strict native JSON IR through an adapter. Keep intelligence assessments in a separate sidecar.
- Rationale: Avoid coupling platform semantics to undocumented upstream fields and ease Archify upgrades.
