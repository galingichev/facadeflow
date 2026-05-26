# Supabase Database Setup for FacadeFlow

This folder contains the database schema and seed data for FacadeFlow.

## Files

- `migrations/001_initial_schema.sql` - Complete database schema with tables, indexes, RLS policies, functions, and triggers
- `seed.sql` - Sample data for development (clients, projects, tasks, estimates, inventory, suppliers)
- `README.md` - This file

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Choose organization, enter project name (e.g., "facadeflow")
4. Set strong database password
5. Choose region close to you
6. Wait for project to initialize (~2 minutes)

### 2. Get Connection Details

In your Supabase project:
1. Go to **Settings** → **Database**
2. Copy the **Connection string** (includes password)
3. Also note your **Project URL** and **anon/public key** from **Settings** → **API**

### 3. Set Environment Variables

Create a `.env` file in the root of your mobile-app:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Install Supabase Client

```bash
cd facadeflow/mobile-app
npm install @supabase/supabase-js
```

### 5. Run Migration

In Supabase SQL Editor:

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy contents of `migrations/001_initial_schema.sql`
4. Paste and click "Run" (or use `Ctrl+Enter`)
5. Verify tables appear in **Table Editor**

Alternatively, use Supabase CLI:

```bash
# Install Supabase CLI if not already
npm install -g supabase

# Link your local project to Supabase
supabase link --project-ref your-project-ref

# Apply migration
supabase db push
```

### 6. Seed Sample Data

After running the main migration, run the seed script:

```sql
-- In SQL Editor, run:
\i 'path/to/seed.sql'
```

Or via CLI:

```bash
supabase db seed
```

**Important:** The seed references user IDs from `auth.users`. You need to create these users first via signup or admin API. The seed uses placeholder IDs (all zeros). Update the seed.sql with actual user IDs from your `auth.users` table before running.

### 7. Enable Row Level Security (RLS)

The migration already enables RLS on all tables. After seeding, you may need to:

1. Go to **Authentication** → **Policies**
2. Verify policies are active for each table
3. For production, review policies to ensure correct access control

### 8. Create Admin User (Optional)

To give a user admin role:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'galin@example.com';
```

### 9. Test Connection

In your React Native app:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

const { data, error } = await supabase.from('clients').select('*');
console.log(data, error);
```

## Database Structure

### Core Tables

- `users` - User profiles (extends `auth.users`)
- `clients` - Customer/client information
- `projects` - Main project records
- `estimates` - Quotes and proposals
- `estimate_items` - Line items within estimates
- `tasks` - Project tasks and todos
- `project_photos` - Photos with optional annotations
- `photo_annotations` - Drawing/text overlays on photos
- `voice_notes` - Audio recordings with transcripts
- `inventory_items` - Materials and stock tracking
- `suppliers` - Vendor information

### Key Features

- **UUID primary keys** for security
- **Foreign key constraints** for data integrity
- **Generated columns** for estimate totals
- **JSONB columns** for flexible address storage
- **Indexed** for performance on frequently queried fields
- **Row Level Security** enabled on all tables
- **Automatic `updated_at`** triggers
- **Auto-generate estimate numbers** (EST-2025-XXXX)
- **Functions for reporting** (daily brief)

## RLS Policies Summary

- All authenticated users can read all data
- Users can only create/update/delete records they own (via `created_by`)
- Admin role has full access to inventory and suppliers
- Client/project access based on creator ownership

## Customizing

### Add More Columns

1. Edit `migrations/001_initial_schema.sql`
2. Add column: `ALTER TABLE projects ADD COLUMN site_manager_id UUID REFERENCES users(id);`
3. Re-run migration or create a new migration file (recommended for production)

### Change Policies

Modify the `CREATE POLICY` statements in the migration file to suit your business rules.

### Add Indexes

For slow queries, add indexes in the migration:

```sql
CREATE INDEX idx_projects_status_created ON projects(status, created_at DESC);
```

## Backup & Restore

### Using Supabase CLI

```bash
# Dump database
supabase db dump -f backup.sql

# Restore database
supabase db reset
supabase db execute < backup.sql
```

### Using Supabase Dashboard

1. Go to **Database** → **Settings**
2. Click "Export"
3. Choose format and download

## Troubleshooting

**Error: "permission denied for relation"**
- Make sure RLS policies are correctly configured
- Verify you're using the anon key (not service role) in app

**Error: "duplicate key value violates unique constraint"**
- The seed tries INSERT with `ON CONFLICT DO NOTHING` to avoid duplicates
- If you want to force re-seed, delete data manually first

**RLS not working as expected**
- Check policy `USING` and `WITH CHECK` clauses
- Test policies in SQL Editor:

```sql
SET auth.uid = 'user-uuid-here';
SELECT * FROM projects;  -- Should filter to rows where created_by = auth.uid
```

## Next Steps

- Set up **realtime** subscriptions for live updates
- Configure **storage** for file uploads (photos, PDFs)
- Set up **edge functions** for PDF generation, webhooks
- Implement **authentication flows** in mobile app

## Support

- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Discord](https://discord.supabase.com/)
