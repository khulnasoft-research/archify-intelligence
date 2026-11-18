# Security Policy

Do not report vulnerabilities in public issues. Contact the maintainers through the private security reporting channel once one has been configured for this project.

## Current security posture

This scaffold is not hardened for untrusted multi-tenant production use. It must not be exposed publicly until authentication, authorization, rate limits, secrets management, isolated repository workers, SSRF controls, artifact-origin isolation, retention controls, and security regression tests are implemented.

## Required controls

- Treat repositories, model responses, generated HTML and user-provided diagram content as untrusted.
- Do not mount the host Docker socket into analysis workers.
- Default repository analysis network access to disabled.
- Keep Jev keys server-side and disabled by default.
- Enforce tenant authorization on every resource access.
- Serve generated HTML from a separate sandboxed origin.
