#!/usr/bin/env ts-node

/**
 * Database Setup Script for FacadeFlow
 *
 * Seeds the database with sample data for development.
 *
 * Prerequisites:
 * - Supabase project created and configured
 * - .env file with SUPABASE_URL and SUPABASE_ANON_KEY
 * - Schema already applied (see types/src/types/index.ts for table definitions)
 *
 * Usage: npx ts-node scripts/setup-db.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');

  // Delete in reverse order of dependencies
  const tables = [
    'voice_notes',
    'project_photos',
    'tasks',
    'estimates',
    'projects',
    'clients',
    'inventory_items',
    'suppliers',
    'users',
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '');
    if (error) {
      console.warn(`⚠️  Could not clear ${table}: ${error.message}`);
    } else {
      console.log(`  ✓ Cleared ${table}`);
    }
  }
}

async function seedClients() {
  console.log('👥 Seeding clients...');

  const clientsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../samples/data/mock-clients.json'), 'utf-8')
  );

  const { data, error } = await supabase.from('clients').insert(clientsData).select();

  if (error) {
    console.error('❌ Error seeding clients:', error);
    throw error;
  }

  console.log(`  ✓ Inserted ${data.length} clients`);
  return data;
}

async function seedProjects(clients: any[]) {
  console.log('🏗️ Seeding projects...');

  const projectsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../samples/data/mock-projects.json'), 'utf-8')
  );

  // Map client_ids from mock data to real IDs
  const clientMap = new Map(clients.map(c => [c.id, c.id])); // Keep same IDs if seeded
  const projects = projectsData.map(p => ({
    ...p,
    client_id: clientMap.get(p.client_id) || p.client_id,
  }));

  const { data, error } = await supabase.from('projects').insert(projects).select();

  if (error) {
    console.error('❌ Error seeding projects:', error);
    throw error;
  }

  console.log(`  ✓ Inserted ${data.length} projects`);
  return data;
}

async function seedTasks(projects: any[]) {
  console.log('✅ Seeding tasks...');

  const tasksData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../samples/data/mock-tasks.json'), 'utf-8')
  );

  // Map project_ids from mock data to real IDs
  const projectMap = new Map(projects.map(p => [p.id, p.id]));
  const tasks = tasksData.map(t => ({
    ...t,
    project_id: projectMap.get(t.project_id) || t.project_id,
  }));

  const { data, error } = await supabase.from('tasks').insert(tasks).select();

  if (error) {
    console.error('❌ Error seeding tasks:', error);
    throw error;
  }

  console.log(`  ✓ Inserted ${data.length} tasks`);
}

async function seedEstimates(projects: any[]) {
  console.log('💰 Seeding estimates...');

  const estimatesData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../samples/data/mock-estimates.json'), 'utf-8')
  );

  const projectMap = new Map(projects.map(p => [p.id, p.id]));
  const estimates = estimatesData.map(e => ({
    ...e,
    project_id: projectMap.get(e.project_id) || e.project_id,
  }));

  // Insert estimate items separately as they need estimate_id
  const { data: estimatesRes, error: estError } = await supabase
    .from('estimates')
    .insert(estimates.map(({ items, ...rest }) => rest))
    .select();

  if (estError) {
    console.error('❌ Error seeding estimates:', estError);
    throw estError;
  }

  const estimateMap = new Map(estimatesRes.map((e: any) => [e.number, e.id]));

  // Now insert estimate items
  const estimateItems: any[] = [];
  estimates.forEach((est, idx) => {
    const estimateId = estimateMap.get(est.number);
    if (estimateId) {
      est.items.forEach(item => {
        estimateItems.push({
          ...item,
          estimate_id: estimateId,
        });
      });
    }
  });

  const { error: itemsError } = await supabase.from('estimate_items').insert(estimateItems);
  if (itemsError) {
    console.error('❌ Error seeding estimate items:', itemsError);
    throw itemsError;
  }

  console.log(`  ✓ Inserted ${estimatesRes.length} estimates with ${estimateItems.length} line items`);
}

async function main() {
  console.log('🌱 FacadeFlow Database Setup\n');

  try {
    // Uncomment to clear first time
    // await clearExistingData();

    const clients = await seedClients();
    const projects = await seedProjects(clients);
    await seedTasks(projects);
    await seedEstimates(projects);

    console.log('\n✅ Database seeding complete!\n');
    console.log('📊 Summary:');
    console.log(`   Clients: ${clients.length}`);
    console.log(`   Projects: ${projects.length}`);
    console.log(`   Tasks: (seed script done)`);
    console.log(`   Estimates: (seed script done)`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main as setupDatabase };
