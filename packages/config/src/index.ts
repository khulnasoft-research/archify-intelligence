import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  DEFAULT_PROVIDER_MODE: z
    .enum(["remote-only", "local-only", "hybrid", "rules-only"])
    .default("local-only"),
  JEV_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  JEV_CONTRACT_VERIFIED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  JEV_BASE_URL: z.string().url().default("https://api.typesafe.ai"),
  JEV_API_KEY: z.string().optional(),
  JEV_MODEL: z.string().default("jev-latest"),
  JEV_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  LOCAL_MODEL_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  LOCAL_MODEL_BASE_URL: z.string().url().default("http://localhost:11434"),
  LOCAL_MODEL_PROTOCOL: z
    .enum(["ollama", "openai-compatible"])
    .default("ollama"),
  LOCAL_MODEL_NAME: z.string().optional(),
  ARCHIFY_REPO_PATH: z.string().default("./vendor/archify"),
  ARCHIFY_EXPECTED_COMMIT: z.string().optional(),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
});

export type AppConfig = {
  nodeEnv: "development" | "test" | "production";
  apiHost: string;
  apiPort: number;
  databaseUrl?: string;
  redisUrl?: string;
  defaultProviderMode: "remote-only" | "local-only" | "hybrid" | "rules-only";
  jevEnabled: boolean;
  jevContractVerified: boolean;
  jevBaseUrl: string;
  jevApiKey?: string;
  jevModel: string;
  jevTimeoutMs: number;
  localModelEnabled: boolean;
  localModelBaseUrl: string;
  localModelProtocol: "ollama" | "openai-compatible";
  localModelName?: string;
  archifyRepoPath: string;
  archifyExpectedCommit?: string;
  logLevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
};

export function loadConfig(
  source: NodeJS.ProcessEnv | Record<string, string | undefined>,
): AppConfig {
  const parsed = envSchema.parse(source);
  if (parsed.JEV_ENABLED && !parsed.JEV_CONTRACT_VERIFIED) {
    throw new Error(
      "JEV_CONTRACT_VERIFIED=true is required before enabling the Jev adapter",
    );
  }
  if (parsed.JEV_ENABLED && !parsed.JEV_API_KEY) {
    throw new Error("JEV_API_KEY is required when JEV_ENABLED=true");
  }
  if (
    parsed.NODE_ENV === "production" &&
    parsed.DEFAULT_PROVIDER_MODE === "remote-only" &&
    !parsed.JEV_ENABLED
  ) {
    throw new Error("Remote-only mode requires JEV_ENABLED=true");
  }
  return {
    nodeEnv: parsed.NODE_ENV,
    apiHost: parsed.API_HOST,
    apiPort: parsed.API_PORT,
    ...(parsed.DATABASE_URL ? { databaseUrl: parsed.DATABASE_URL } : {}),
    ...(parsed.REDIS_URL ? { redisUrl: parsed.REDIS_URL } : {}),
    defaultProviderMode: parsed.DEFAULT_PROVIDER_MODE,
    jevEnabled: parsed.JEV_ENABLED,
    jevContractVerified: parsed.JEV_CONTRACT_VERIFIED,
    jevBaseUrl: parsed.JEV_BASE_URL,
    ...(parsed.JEV_API_KEY ? { jevApiKey: parsed.JEV_API_KEY } : {}),
    jevModel: parsed.JEV_MODEL,
    jevTimeoutMs: parsed.JEV_TIMEOUT_MS,
    localModelEnabled: parsed.LOCAL_MODEL_ENABLED,
    localModelBaseUrl: parsed.LOCAL_MODEL_BASE_URL,
    localModelProtocol: parsed.LOCAL_MODEL_PROTOCOL,
    ...(parsed.LOCAL_MODEL_NAME
      ? { localModelName: parsed.LOCAL_MODEL_NAME }
      : {}),
    archifyRepoPath: parsed.ARCHIFY_REPO_PATH,
    ...(parsed.ARCHIFY_EXPECTED_COMMIT
      ? { archifyExpectedCommit: parsed.ARCHIFY_EXPECTED_COMMIT }
      : {}),
    logLevel: parsed.LOG_LEVEL,
  };
}
