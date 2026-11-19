import type {
  DecisionAnswer,
  PolicyDecision,
} from "@archify-intelligence/contracts";

export interface StaticFinding {
  id: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  message: string;
  evidenceIds: string[];
}
export interface PolicyInput {
  runId: string;
  policyVersion: string;
  assessments: DecisionAnswer[];
  staticFindings: StaticFinding[];
  requiredAssessmentKeys: string[];
}

export function evaluatePolicy(input: PolicyInput): PolicyDecision {
  const reasons: PolicyDecision["reasons"] = input.staticFindings.map(
    (finding) => ({
      code: `STATIC_${finding.severity.toUpperCase()}`,
      severity: finding.severity,
      message: finding.message,
      evidenceIds: finding.evidenceIds,
      assessmentIds: [],
    }),
  );
  const assessmentKeys = new Set(input.assessments.map((item) => item.key));
  const missing = input.requiredAssessmentKeys.filter(
    (key) => !assessmentKeys.has(key),
  );
  for (const key of missing)
    reasons.push({
      code: "ASSESSMENT_MISSING",
      severity: "medium",
      message: `Required assessment unavailable: ${key}`,
      evidenceIds: [],
      assessmentIds: [],
    });

  const blocked = input.staticFindings.some(
    (finding) => finding.severity === "critical",
  );
  const highRisk = input.staticFindings.some(
    (finding) => finding.severity === "high",
  );
  const outcome = blocked
    ? "blocked"
    : missing.length > 0
      ? "inconclusive"
      : highRisk
        ? "review_required"
        : "pass";
  return {
    id: `policy_${input.runId}`,
    runId: input.runId,
    outcome,
    policyVersion: input.policyVersion,
    ruleIds: [
      "critical-static-finding-block",
      "missing-assessment-inconclusive",
      "high-severity-review",
    ],
    reasons,
    requiresHumanApproval: blocked || highRisk || missing.length > 0,
    decidedAt: new Date().toISOString(),
  };
}
