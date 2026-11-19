# Initial Threat Model

| Asset               | Threat                            | Baseline mitigation / required next control                                            |
| ------------------- | --------------------------------- | -------------------------------------------------------------------------------------- |
| Repository source   | Secret exfiltration               | Scan/redact before remote inference; local-only egress deny                            |
| Git credentials     | Credential theft                  | Secret manager, least privilege, no worker env inheritance                             |
| Tenant artifacts    | IDOR/cross-tenant access          | Auth + per-object tenant authorization (not implemented in scaffold)                   |
| Generated HTML      | XSS / same-origin compromise      | Isolated artifact origin and sandboxed iframe                                          |
| Repository checkout | Path traversal / symlink escape   | Canonical realpath checks, read-only worktree, resource limits                         |
| Model output        | Prompt injection / invalid schema | Treat as untrusted data; strict schema validation; no tool authority                   |
| Jev provider        | Rate limit / outage               | Timeout, bounded retry, circuit breaker, local/rules fallback only when policy permits |
| Local model URL     | SSRF                              | Admin allowlist, private network policy, DNS/IP validation                             |
| Worker jobs         | Poisoned payload / replay         | Signed payloads, schema validation, idempotency and tenant scoping                     |

This is an initial threat model, not a completed security assessment.
