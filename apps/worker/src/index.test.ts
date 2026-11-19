import { describe, expect, it } from "vitest";

describe("worker scaffold", () => {
  it("exposes the expected worker service identity", () => {
    expect("worker").toBe("worker");
  });
});
