# Architecture Overview

The platform is a modular monolith with separate API, web, worker, and CLI applications.

- `contracts`: runtime-validated DTOs shared across boundaries.
- `domain`: provider-independent graph and evidence types.
- `providers`: Jev/local/rules provider ports and routing.
- `policy-engine`: deterministic policy outcomes.
- `archify-adapter`: strict upstream renderer boundary.
- `security`: data redaction and low-level safety primitives.

The domain graph and intelligence sidecar are platform-owned. Archify native IR remains untouched. Generated HTML must eventually be hosted on an isolated origin and embedded in a sandboxed iframe.
