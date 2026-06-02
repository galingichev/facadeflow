# FacadeFlow Client Demo Runbook

Recommended for the "Supabase setup + repeatable client demo runbook" follow-up from [GOAL_PROGRESS.md](./GOAL_PROGRESS.md).

## Prerequisites

- Node.js 18+ and npm, matching the root `package.json` engine.
- Supabase project access and either Supabase CLI or the Supabase SQL editor.
- Local env files created from the existing examples:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

- `.env` populated with `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- `backend/.env` populated with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, and a real `FACADEFLOW_MVP_OWNER_ID`.
- Dependencies installed at the repo root, plus inside `backend` and `facadeflow/mobile-app` if not already present.

## One-time Supabase setup

Apply the checked-in schema from [`supabase/migrations/`](../supabase/migrations) and load the base sample seed from [`supabase/seed.sql`](../supabase/seed.sql).

Using the existing Supabase README flow:

```bash
supabase link --project-ref your-project-ref
supabase db push
supabase db seed
```

## Clean demo reset and seed

Use this before each client demo to get back to the repeatable demo dataset.

1. Stop any existing local demo stack:

```bash
bash scripts/stop-demo.sh
```

2. Start the local stack:

```bash
bash scripts/start-demo.sh
```

3. Rebuild the client demo dataset against the local API. This script first deletes existing `Client Demo:` clients and projects, then recreates the expected records and expenses:

```bash
cd facadeflow/mobile-app
API_BASE_URL=http://127.0.0.1:3000/api npm run seed:client-demo
```

## Launch commands

From the repository root:

```bash
bash scripts/start-demo.sh
```

Default local demo URL:

```text
http://127.0.0.1:8081/
```

If you need a shareable host or tunnel URL:

```bash
FACADEFLOW_DEMO_URL=http://your-demo-host:8081 bash scripts/start-demo.sh
```

## Verification

Run one health check after startup:

```bash
curl http://127.0.0.1:8081/api/system/health
```

## Troubleshooting

- If startup hangs, check the logs printed by `scripts/start-demo.sh`. They are written under `FACADEFLOW_RUN_DIR` or `/tmp/facadeflow-run` by default.
- If the backend fails on create/update flows, re-check `backend/.env`, especially `SUPABASE_SERVICE_ROLE_KEY` and `FACADEFLOW_MVP_OWNER_ID`.
- If the app opens but demo records are missing, rerun `API_BASE_URL=http://127.0.0.1:3000/api npm run seed:client-demo` from `facadeflow/mobile-app`.
- If the schema is behind the repo, rerun `supabase db push` and `supabase db seed` before reseeding the client demo dataset.
