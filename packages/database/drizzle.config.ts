import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  schema: './src/schema.ts', out: './drizzle', dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? 'postgres://archify:archify_dev_password@localhost:5432/archify_intelligence' },
});
