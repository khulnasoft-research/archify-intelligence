import "dotenv/config";
import { loadConfig } from "@archify-intelligence/config";

const config = loadConfig(process.env);

// Queue processors are intentionally not registered in the initial scaffold.
// Add one processor per bounded pipeline stage after P2 contracts and isolation are ready.
console.info(
  JSON.stringify({
    level: "info",
    service: "worker",
    status: "scaffold-ready",
    redisConfigured: Boolean(config.redisUrl),
    timestamp: new Date().toISOString(),
  }),
);
