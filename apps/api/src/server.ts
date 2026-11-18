import 'dotenv/config';
import Fastify from 'fastify';
import { loadConfig } from '@archify-intelligence/config';
import { healthResponseSchema } from '@archify-intelligence/contracts';

const config = loadConfig(process.env);
const app = Fastify({ logger: { level: config.logLevel }, bodyLimit: 1024 * 1024 });

app.get('/health', async () => healthResponseSchema.parse({
  status: 'ok',
  service: 'api',
  version: '0.1.0',
  timestamp: new Date().toISOString(),
}));

app.get('/ready', async (_request, reply) => {
  // P1 baseline only. Add database/Redis/object-store readiness probes before production.
  return reply.code(503).send({ status: 'not-ready', checks: { application: 'ok', dependencies: 'not-configured' } });
});

app.setNotFoundHandler(async (_request, reply) => reply.code(404).send({
  error: { code: 'NOT_FOUND', message: 'Route not found', retryable: false },
}));

app.setErrorHandler(async (error, _request, reply) => {
  app.log.error({ err: error }, 'Unhandled request error');
  return reply.code(500).send({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', retryable: false },
  });
});

try {
  await app.listen({ host: config.apiHost, port: config.apiPort });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
