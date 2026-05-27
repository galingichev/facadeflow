# Supabase Database Setup for FacadeFlow

This folder contains database migrations and local seed data for FacadeFlow.

## Files

- `migrations/001_initial_schema.sql` - main schema.
- `migrations/20260423184623_create_coordination_tables.sql` - coordination tables.
- `migrations/20260514150000_add_project_financial_tracking.sql` - project financial tracking.
- `seed.sql` - local/demo sample data.

## Setup

1. Create a Supabase project.
2. Copy your project URL and anon key from Supabase settings.
3. Create local env files from examples:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

4. Fill the local env files with your own Supabase values.
5. Apply migrations using the Supabase SQL editor or Supabase CLI.

Using Supabase CLI:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

## Seed data

`seed.sql` is local/demo data only. Review it before running against any shared environment.

The seed references demo users and sample clients/projects. Replace demo IDs and emails with values that exist in your own Supabase Auth project if needed.

```bash
supabase db seed
```

## Security notes

- Do not commit real `.env` files.
- Do not commit Supabase service role keys.
- Do not commit database passwords or connection strings.
- Use the anon key only where public client access is intended.
- Use service role keys only on trusted backend/server environments.
