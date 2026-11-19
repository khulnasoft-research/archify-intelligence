import { isAbsolute, relative, resolve, sep } from "node:path";

const SECRET_PATTERNS: RegExp[] = [
  /\bsk-[A-Za-z0-9_-]{16,}\b/g,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  /((?:api[_-]?key|access[_-]?token|secret|password)\s*[=:]\s*)[^\s,;"']+/gi,
];

export function redactSecrets(input: string): {
  text: string;
  redactions: number;
} {
  let text = input;
  let redactions = 0;
  for (const pattern of SECRET_PATTERNS) {
    text = text.replace(pattern, (_match, prefix: string | undefined) => {
      redactions += 1;
      return typeof prefix === "string"
        ? `${prefix}[REDACTED]`
        : "[REDACTED_SECRET]";
    });
  }
  return { text, redactions };
}

export function isPathWithinRoot(root: string, candidate: string): boolean {
  // Lexical guard only. Callers must also realpath both values to defeat symlink escapes.
  const normalizedRoot = resolve(root);
  const normalizedCandidate = resolve(candidate);
  const rel = relative(normalizedRoot, normalizedCandidate);
  return (
    rel === "" ||
    (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel))
  );
}

export * from "./tenant.js";
