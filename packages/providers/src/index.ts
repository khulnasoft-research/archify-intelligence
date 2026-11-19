import { createHash } from "node:crypto";
import type { AppConfig } from "@archify-intelligence/config";
import {
  decisionBatchSchema,
  type DecisionBatch,
  type DecisionRequest,
} from "@archify-intelligence/contracts";
import type {
  ProviderKind,
  ProviderRouteContext,
} from "@archify-intelligence/domain";

export interface DecisionProvider {
  readonly kind: ProviderKind;
  assess(
    request: DecisionRequest,
    signal?: AbortSignal,
  ): Promise<DecisionBatch>;
  health(): Promise<{
    available: boolean;
    provider: ProviderKind;
    checkedAt: string;
  }>;
}

export type ProviderRoute = {
  provider: "jev" | "local-model" | "rules" | "unavailable";
  reason: string;
};

export function selectProvider(context: ProviderRouteContext): ProviderRoute {
  if (context.mode === "rules-only")
    return { provider: "rules", reason: "rules-only mode" };

  if (context.mode === "local-only") {
    return context.localProviderAvailable
      ? {
          provider: "local-model",
          reason: "local-only mode; remote egress prohibited",
        }
      : {
          provider: "rules",
          reason: "local provider unavailable; deterministic-only fallback",
        };
  }

  if (context.mode === "remote-only") {
    if (!context.remoteAllowed || context.dataClassification === "restricted") {
      return {
        provider: "unavailable",
        reason: "remote processing prohibited by data policy",
      };
    }
    return context.jevEnabled && context.jevHealthy
      ? { provider: "jev", reason: "remote-only mode; Jev healthy" }
      : {
          provider: "unavailable",
          reason:
            "remote-only provider unavailable; local fallback is disabled",
        };
  }

  // Hybrid: remote is eligible only when explicitly allowed and data is not restricted.
  if (
    context.remoteAllowed &&
    context.dataClassification !== "restricted" &&
    context.jevEnabled &&
    context.jevHealthy
  ) {
    return {
      provider: "jev",
      reason: "hybrid mode; Jev preferred and remote processing permitted",
    };
  }
  if (context.localProviderAvailable) {
    return {
      provider: "local-model",
      reason: "hybrid mode; remote provider not eligible, using local model",
    };
  }
  return {
    provider: "rules",
    reason: "no eligible model provider; deterministic-only fallback",
  };
}

export class JevProvider implements DecisionProvider {
  readonly kind = "jev" as const;
  constructor(
    private readonly config: Pick<
      AppConfig,
      | "jevEnabled"
      | "jevContractVerified"
      | "jevApiKey"
      | "jevBaseUrl"
      | "jevModel"
      | "jevTimeoutMs"
    >,
  ) {}

  async assess(
    request: DecisionRequest,
    signal?: AbortSignal,
  ): Promise<DecisionBatch> {
    if (
      !this.config.jevEnabled ||
      !this.config.jevApiKey ||
      !this.config.jevContractVerified
    )
      throw new Error(
        "Jev provider is disabled or its response contract is not verified",
      );
    if (
      request.dataClassification === "confidential" ||
      request.dataClassification === "restricted"
    ) {
      throw new Error(
        "Confidential or restricted data cannot be sent to Jev by the default adapter policy",
      );
    }
    const started = Date.now();
    const questions = Object.fromEntries(
      request.questions.map((question) => [
        question.key,
        {
          type: question.kind,
          instructions: question.instructions,
          ...(question.criteria ? { criteria: question.criteria } : {}),
        },
      ]),
    );
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(new Error("Jev request timeout")),
      this.config.jevTimeoutMs,
    );
    const abort = () => controller.abort(signal?.reason);
    signal?.addEventListener("abort", abort, { once: true });
    try {
      const response = await fetch(
        `${this.config.jevBaseUrl.replace(/\/$/, "")}/v1/systemone`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.jevApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: this.config.jevModel,
            state: request.state,
            questions,
          }),
          signal: controller.signal,
        },
      );
      if (!response.ok)
        throw new Error(`Jev request failed with HTTP ${response.status}`);
      const payload: unknown = await response.json();
      const parsed = normalizeJevResponse(
        payload,
        request,
        Date.now() - started,
      );
      return decisionBatchSchema.parse(parsed);
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    }
  }

  async health() {
    return {
      available: false,
      provider: this.kind,
      checkedAt: new Date().toISOString(),
    }; // Requires an external circuit-breaker/connection check.
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function normalizeJevResponse(
  payload: unknown,
  request: DecisionRequest,
  latencyMs: number,
): DecisionBatch {
  const root = asRecord(payload);
  if (!root) throw new Error("Invalid Jev response: expected object");
  const answersObject = asRecord(root["answers"]);
  if (!answersObject) throw new Error("Invalid Jev response: answers missing");
  const modelId =
    typeof root["model"] === "string" ? root["model"] : "unknown-jev-model";

  const answers = request.questions.map((question) => {
    const answer = asRecord(answersObject[question.key]);
    if (!answer) throw new Error(`Jev answer missing: ${question.key}`);

    const probabilitiesRaw = asRecord(answer["probabilities"]);
    const probabilities = probabilitiesRaw
      ? Object.fromEntries(
          Object.entries(probabilitiesRaw).filter(
            (entry): entry is [string, number] => typeof entry[1] === "number",
          ),
        )
      : undefined;

    const value =
      question.kind === "noul"
        ? Number(answer["value"] ?? answer["probability"] ?? answer["result"])
        : typeof answer["choice"] === "string"
          ? answer["choice"]
          : Number(answer["score"] ?? answer["value"]);
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new Error(`Invalid numeric Jev answer: ${question.key}`);
    }

    const digest = createHash("sha256")
      .update(JSON.stringify(answer))
      .digest("hex");
    const confidence =
      typeof answer["confidence"] === "number" ? answer["confidence"] : null;

    return {
      key: question.key,
      kind: question.kind,
      value,
      ...(probabilities ? { probabilities } : {}),
      // Jev Noul responses do not carry a documented confidence field.
      confidence: question.kind === "noul" ? null : confidence,
      provider: "jev" as const,
      modelId,
      rawAnswerHash: `sha256:${digest}`,
      calibrationStatus: "provider-calibrated" as const,
    };
  });

  const usage = asRecord(root["usage"]);
  return {
    requestId: request.requestId,
    provider: "jev",
    modelId,
    answers,
    latencyMs,
    observedAt: new Date().toISOString(),
    ...(usage
      ? {
          usage: {
            ...(typeof usage["input_tokens"] === "number"
              ? { inputTokens: usage["input_tokens"] }
              : {}),
            ...(typeof usage["output_tokens"] === "number"
              ? { outputTokens: usage["output_tokens"] }
              : {}),
          },
        }
      : {}),
  };
}

export class LocalModelProvider implements DecisionProvider {
  readonly kind = "local-model" as const;
  constructor(
    private readonly options: {
      enabled: boolean;
      baseUrl: string;
      model?: string;
      timeoutMs?: number;
    },
  ) {}
  async assess(
    _request: DecisionRequest,
    _signal?: AbortSignal,
  ): Promise<DecisionBatch> {
    if (!this.options.enabled || !this.options.model)
      throw new Error("Local model provider is not configured");
    // Deliberately fail closed until a deployment-specific inference protocol is selected and contract-tested.
    throw new Error(
      "Local model protocol adapter is not implemented yet; configure Ollama/OpenAI-compatible contract in P4",
    );
  }
  async health() {
    return {
      available: false,
      provider: this.kind,
      checkedAt: new Date().toISOString(),
    }; // Protocol adapter is not implemented yet.
  }
}

export class RulesOnlyProvider implements DecisionProvider {
  readonly kind = "rules" as const;
  async assess(request: DecisionRequest): Promise<DecisionBatch> {
    // Rules-only mode intentionally produces no model answers. Deterministic findings
    // are evaluated directly by the policy engine; never fabricate probabilities.
    void request;
    return {
      requestId: request.requestId,
      provider: "rules",
      modelId: "deterministic-rules-no-model",
      answers: [],
      latencyMs: 0,
      observedAt: new Date().toISOString(),
    };
  }
  async health() {
    return {
      available: true,
      provider: this.kind,
      checkedAt: new Date().toISOString(),
    };
  }
}
