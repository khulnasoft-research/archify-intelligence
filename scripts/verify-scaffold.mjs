import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const required = ['package.json', 'pnpm-workspace.yaml', 'apps/api/src/server.ts', 'packages/contracts/src/index.ts', 'docs/security/threat-model.md'];
const missing = required.filter((path) => !existsSync(resolve(root, path)));
if (missing.length) {
  console.error('Missing scaffold files:', missing.join(', '));
  process.exit(1);
}
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
console.log(`Scaffold structure OK: ${pkg.name} ${pkg.version}`);
