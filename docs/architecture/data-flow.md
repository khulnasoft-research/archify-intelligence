# Data Flow and Trust Boundaries

1. Repository intake receives a repository URL/ref or local path; validate identity and path containment.
2. A disposable worker workspace checks out an immutable commit with read-only source access.
3. Static inventory and parsers produce facts plus commit-pinned evidence.
4. Secret scanning and data classification happen before model serialization.
5. Provider routing enforces project mode and classification. `local-only` cannot call Jev.
6. Model outputs are schema-validated and stored with provider/model provenance.
7. Deterministic policy code produces `pass`, `review_required`, `blocked`, or `inconclusive`.
8. Archify adapter maps canonical graph to pinned upstream IR and runs the documented finalize flow.
9. Artifact storage publishes only validated output with content hashes and provenance.

## Trust boundaries

Browser/API, API/worker, worker/repository, worker/Jev, worker/local model, worker/Archify CLI, artifact viewer, and any optional code-execution sandbox are separate trust boundaries. Never mount Docker socket or credentials into repository analysis workers.
