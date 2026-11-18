import { describe, expect, it } from 'vitest';
import Fastify from 'fastify';

describe('API baseline', () => {
  it('serves a health response', async () => {
    const app = Fastify();
    app.get('/health', async () => ({ status: 'ok', service: 'api' }));
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'ok', service: 'api' });
    await app.close();
  });
});
