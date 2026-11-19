import { describe, expect, it } from "vitest";
import { isPathWithinRoot, redactSecrets } from "./index.js";

describe("security helpers", () => {
  it("redacts common key-value credentials", () => {
    const result = redactSecrets("api_key=supersecret123 password:hello");
    expect(result.text).not.toContain("supersecret123");
    expect(result.redactions).toBe(2);
  });
  it("checks lexical path containment", () => {
    expect(isPathWithinRoot("/repo", "/repo/src/a.ts")).toBe(true);
    expect(isPathWithinRoot("/repo", "/repo-evil/a.ts")).toBe(false);
    expect(isPathWithinRoot("/repo", "/repo/../etc/passwd")).toBe(false);
  });
});
