#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:3000/api';
const ROOT_DIR = path.resolve(__dirname, '..');
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return fs.readFileSync(filePath, 'utf8').split(/\r?\n/).reduce((env, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return env;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) return env;
    const [, key, rawValue] = match;
    env[key] = rawValue.replace(/^['"]|['"]$/g, '').trim();
    return env;
  }, {});
}

function resolveOwnerId() {
  const backendEnv = readEnvFile(path.join(ROOT_DIR, 'backend/.env'));
  return process.env.FACADEFLOW_MVP_OWNER_ID
    || process.env.MVP_OWNER_ID
    || process.env.PROJECTS_CREATED_BY
    || backendEnv.FACADEFLOW_MVP_OWNER_ID
    || backendEnv.MVP_OWNER_ID
    || backendEnv.PROJECTS_CREATED_BY;
}

function getOwnerIdWarning(ownerId) {
  if (!ownerId) return 'FACADEFLOW_MVP_OWNER_ID is missing.';
  if (ownerId.includes('<')) return 'FACADEFLOW_MVP_OWNER_ID is still a placeholder.';
  if (!UUID_REGEX.test(ownerId)) return 'FACADEFLOW_MVP_OWNER_ID is present but is not a valid UUID.';
  return null;
}

function runStep(label, command, args, options = {}) {
  console.log(`\n==> ${label}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...(options.env || {}) },
  });

  if (result.error) {
    console.error(`\nDemo verification failed during "${label}".`);
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`\nDemo verification failed during "${label}" with exit code ${result.status}.`);
    process.exit(result.status || 1);
  }
}

async function fetchJson(path) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    const text = await response.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!response.ok) {
      throw new Error(`GET ${path} failed ${response.status}: ${text}`);
    }

    return body;
  } finally {
    clearTimeout(timeout);
  }
}

async function runApiChecksIfAvailable() {
  console.log(`\n==> API health check (${API_BASE_URL})`);

  try {
    const health = await fetchJson('/system/health');
    console.log(`API health ok: ${health.status || 'ok'}`);
  } catch (error) {
    console.log(`API health skipped: no reachable API at ${API_BASE_URL}.`);
    console.log('Start it with: bash scripts/start-demo.sh');
    return;
  }

  const ownerId = resolveOwnerId();
  const ownerIdWarning = getOwnerIdWarning(ownerId);
  if (ownerIdWarning) {
    console.log(`Client demo seed skipped: ${ownerIdWarning}`);
    console.log('Set backend/.env FACADEFLOW_MVP_OWNER_ID to an existing Supabase users.id UUID, restart the backend, then rerun npm run verify:demo.');
    return;
  }

  runStep('Client demo reset/seed/verification', 'npm', [
    'run',
    'seed:client-demo',
    '--prefix',
    'facadeflow/mobile-app',
  ], {
    env: { API_BASE_URL },
  });
}

async function main() {
  runStep('Backend API tests', 'npm', ['test', '--prefix', 'backend', '--', '--runInBand']);
  runStep('Mobile client/project smoke checks', 'npm', [
    'run',
    'smoke:mobile-flows',
    '--prefix',
    'facadeflow/mobile-app',
  ]);
  runStep('Expo lint', 'npm', ['run', 'lint', '--prefix', 'facadeflow/mobile-app']);
  await runApiChecksIfAvailable();

  console.log('\nFacadeFlow demo verification complete.');
}

main().catch((error) => {
  console.error('\nDemo verification failed.');
  console.error(error.message || error);
  process.exit(1);
});
