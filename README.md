# FacadeFlow

FacadeFlow is a vertical SaaS MVP for doors, windows, and facades contractors.

The first product goal is simple: help a contractor see whether each project is profitable by connecting clients, projects, contract value, budgets, expenses, actual cost, and profit/loss in one operational dashboard.

## MVP loop

1. Create a client.
2. Create a project for that client.
3. Enter contract value and budgeted cost.
4. Add real project expenses.
5. Track actual cost.
6. See project profit/loss and dashboard totals.

## Current app structure

- `backend/` - Node.js / Express API.
- `facadeflow/mobile-app/` - Expo / React Native app.
- `supabase/` - database migrations and local seed data.
- `scripts/` - local development and demo helper scripts.
- `.github/workflows/ci.yml` - CI validation for pull requests.

## Tech stack

- Expo / React Native / TypeScript
- Expo Router
- Zustand
- Node.js / Express
- Supabase / Postgres
- npm

## Local development

Install dependencies:

```bash
npm ci
npm ci --prefix backend
npm ci --prefix facadeflow/mobile-app
```

Start the local demo stack:

```bash
bash scripts/start-demo.sh
```

By default the demo proxy is available at:

```text
http://127.0.0.1:8081/
```

Stop the demo stack:

```bash
bash scripts/stop-demo.sh
```

Run checks:

```bash
npm test --prefix backend -- --runInBand
npm run lint --prefix facadeflow/mobile-app
npm run smoke:mobile-flows --prefix facadeflow/mobile-app
```

## Environment

Copy the example environment files and fill them with local development values:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Never commit real `.env` files, tokens, service role keys, passwords, or private credentials.

## MVP scope

In scope now:

- Dashboard financial summary
- Clients
- Projects
- Project budgets and contract values
- Expenses linked to projects
- Project actual cost and profit/loss

Later scope:

- Scheduling
- Materials / inventory
- Installation team workflows
- Quote generation
- Production planning
- Invoicing
- Advanced analytics
