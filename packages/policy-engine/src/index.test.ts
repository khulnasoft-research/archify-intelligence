import { describe, expect, it } from "vitest";
import { evaluatePolicy } from "./index.js";

describe("evaluatePolicy", () => {
  it("blocks a verified critical static finding", () => {
    const result = evaluatePolicy({
      runId: "run1",
      policyVersion: "1.0",
      assessments: [],
      requiredAssessmentKeys: [],
      staticFindings: [
        {
          id: "f1",
          severity: "critical",
          message: "Critical finding",
          evidenceIds: ["ev1"],
        },
      ],
    });
    expect(result.outcome).toBe("blocked");
  });
  it("returns inconclusive when a required assessment is missing", () => {
    const result = evaluatePolicy({
      runId: "run2",
      policyVersion: "1.0",
      assessments: [],
      requiredAssessmentKeys: ["risk"],
      staticFindings: [],
    });
    expect(result.outcome).toBe("inconclusive");
  });
});
