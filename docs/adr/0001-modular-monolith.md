# ADR-0001: Start with a modular monolith

- Status: Accepted
- Decision: Separate web, API, worker and CLI processes, but keep domain capabilities in workspace packages.
- Rationale: Lower operational complexity while preserving explicit trust and dependency boundaries. Split services only when measured scale or ownership requires it.
