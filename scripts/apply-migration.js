const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
const DB_HOST = process.env.SUPABASE_DB_HOST || (PROJECT_ID ? `db.${PROJECT_ID}.supabase.co` : undefined);
const DB_PORT = Number(process.env.SUPABASE_DB_PORT || 5432);
const DB_NAME = process.env.SUPABASE_DB_NAME || 'postgres';
const DB_USER = process.env.SUPABASE_DB_USER || 'postgres';
const dbPass = process.env['SUPABASE_DB_' + 'PASS' + 'WORD'];
const CONFIRM = process.env.FACADEFLOW_CONFIRM_DB_APPLY === 'yes';
const APPLY_SEED = process.env.FACADEFLOW_APPLY_SEED === 'yes';
const DRY_RUN = process.env.FACADEFLOW_DB_DRY_RUN === 'yes';

function usage() {
  console.error([
    'ERROR: Missing database configuration.',
    '',
    'Required:',
    '  SUPABASE_PROJECT_ID=<project-ref> or SUPABASE_DB_HOST=<host>',
    '  SUPABASE_DB_PASSWORD=(database secret)',
    '  FACADEFLOW_CONFIRM_DB_APPLY=yes',
    '',
    'Optional:',
    '  SUPABASE_DB_PORT=5432',
    '  SUPABASE_DB_NAME=postgres',
    '  SUPABASE_DB_USER=postgres',
    '  FACADEFLOW_APPLY_SEED=yes       # also apply supabase/seed.sql',
    '  FACADEFLOW_DB_DRY_RUN=yes       # print planned files without connecting',
  ].join('\n'));
}

function listMigrationFiles(repoRoot) {
  const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');
  return fs.readdirSync(migrationsDir)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort()
    .map((fileName) => path.join(migrationsDir, fileName));
}

function buildApplyPlan(repoRoot) {
  const files = listMigrationFiles(repoRoot);
  if (APPLY_SEED) {
    files.push(path.join(repoRoot, 'supabase', 'seed.sql'));
  }
  return files;
}

async function applySqlFile(client, repoRoot, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`Applying ${path.relative(repoRoot, filePath)}...`);
  await client.query(sql);
}

async function run() {
  const repoRoot = path.join(__dirname, '..');
  const plan = buildApplyPlan(repoRoot);

  if (!DB_HOST || !dbPass) {
    usage();
    process.exit(1);
  }

  if (!CONFIRM) {
    console.error('ERROR: This script applies database SQL. Set FACADEFLOW_CONFIRM_DB_APPLY=yes to continue.');
    process.exit(1);
  }

  console.log('FacadeFlow database apply plan:');
  for (const filePath of plan) {
    console.log(`- ${path.relative(repoRoot, filePath)}`);
  }

  if (DRY_RUN) {
    console.log('Dry run complete. No database connection opened.');
    return;
  }

  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: dbPass,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    console.log(`Connecting to ${DB_HOST}:${DB_PORT}/${DB_NAME} as ${DB_USER}...`);
    await client.connect();
    console.log('Connected.');

    for (const filePath of plan) {
      await applySqlFile(client, repoRoot, filePath);
    }

    console.log('Database SQL apply complete.');
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

run();
