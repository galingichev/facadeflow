const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'pbmeovrhujwmcelwaivi';
const DB_HOST = `db.${PROJECT_ID}.supabase.co`;
const DB_PORT = 5432;
const DB_NAME = 'postgres';
const DB_USER = 'postgres';

// Get password from environment
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
if (!DB_PASSWORD) {
  console.error('ERROR: Set SUPABASE_DB_PASSWORD environment variable');
  process.exit(1);
}

// Build connection string with family=4 to force IPv4
const connectionString = `postgresql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require&family=4`;

async function run() {
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to database (IPv4 forced via connection string)...');
    await client.connect();
    console.log('Connected.');

    // Read migration SQL
    const migrationPath = path.join(__dirname, 'supabase/migrations/001_initial_schema.sql');
    const seedPath = path.join(__dirname, 'supabase/seed.sql');

    console.log('Reading migration file...');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Reading seed file...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    // Execute migration (includes DROP statements)
    console.log('Running migration (this may take a moment)...');
    await client.query(migrationSql);
    console.log('✅ Migration complete.');

    // Execute seed
    console.log('Seeding database...');
    await client.query(seedSql);
    console.log('✅ Seed complete.');

    console.log('\nAll done! Database is ready.');
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
