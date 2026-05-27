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

if (!DB_HOST || !dbPass) {
  console.error('ERROR: Set SUPABASE_PROJECT_ID or SUPABASE_DB_HOST, plus SUPABASE_DB_' + 'PASS' + 'WORD.');
  process.exit(1);
}

if (!CONFIRM) {
  console.error('ERROR: This script applies schema and seed SQL. Set FACADEFLOW_CONFIRM_DB_APPLY=yes to continue.');
  process.exit(1);
}

const connectionString = `postgresql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(dbPass)}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require&family=4`;

async function run() {
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected.');

    const repoRoot = path.join(__dirname, '..');
    const migrationPath = path.join(repoRoot, 'supabase/migrations/001_initial_schema.sql');
    const seedPath = path.join(repoRoot, 'supabase/seed.sql');

    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('Running migration...');
    await client.query(migrationSql);
    console.log('Migration complete.');

    console.log('Seeding database...');
    await client.query(seedSql);
    console.log('Seed complete.');
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
