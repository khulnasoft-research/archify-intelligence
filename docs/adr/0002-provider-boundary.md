# ADR-0002: Jev is online-only; local AI is independent

- Status: Accepted
- Decision: Use a `DecisionProvider` port. Jev is optional and online-only; offline mode uses a separate local provider or deterministic rules.
- Rationale: No assumption that Jev model weights or runtime are available for local deployment. Prevents accidental remote egress in local-only mode.
