#!/usr/bin/env ts-node

/**
 * FacadeFlow database setup wrapper.
 *
 * This command delegates to scripts/apply-migration.js so fresh setup applies
 * every tracked migration in order instead of relying on stale mock JSON files.
 *
 * Required env:
 * - SUPABASE_PROJECT_ID or SUPABASE_DB_HOST
 * - SUPABASE_DB_PASSWORD
 * - FACADEFLOW_CONFIRM_DB_APPLY=yes
 *
 * Optional:
 * - FACADEFLOW_APPLY_SEED=yes
 * - FACADEFLOW_DB_DRY_RUN=yes
 */

import path from 'path';
import { spawnSync } from 'child_process';

const scriptPath = path.join(__dirname, 'apply-migration.js');
const result = spawnSync(process.execPath, [scriptPath], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error('Failed to start database setup:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
