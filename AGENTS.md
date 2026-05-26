# FacadeFlow MVP Agent Instructions

## Product goal

FacadeFlow is a vertical SaaS MVP for companies working with aluminium facades, windows, doors, and facade elements.

Long-term vision: an operating system for facade and window contractors.

## Phase 1 MVP

The original Phase 1 MVP is project profit tracking.

The first business loop is:

1. Create Client
2. Create Project
3. Enter project contract value/budget
4. Add real project expenses
5. Calculate actual cost
6. Show real profit/loss

Do not let the product drift into a generic Projects + Clients CRUD app. Projects and Clients are only the foundation for the profit-tracking loop.

Phase 1 priorities:

1. Projects
2. Clients
3. Project contract value/budget tracking
4. Real expenses linked to projects
5. Actual cost calculation
6. Project profit/loss calculation and display

## Later phases

Phase 2:

- Materials tracking
- Installation team tracking
- Scheduling

Phase 3:

- Quote generator
- Production planning
- Invoicing
- Analytics

Future:

- AI cost prediction
- AI mistake detection

## Tech stack

- Mobile app: Expo, React Native, TypeScript, Expo Router
- State: Zustand
- API client: Axios
- Backend: Node.js, Express
- Database: Supabase/Postgres
- Package manager: npm

## Repository structure

- Backend: `backend/`
- Mobile app: `facadeflow/mobile-app/`
- Mobile screens source of truth: `facadeflow/mobile-app/app/`
- Do not create new screens in `src/screens`; use Expo Router files under `app/`.
- Supabase migrations: `supabase/migrations/`
- Docs: root-level markdown files and `docs/`

## Working rules

1. Before editing, inspect related files first.
2. Do not make broad refactors unless explicitly requested.
3. Keep changes small, testable, and MVP-focused.
4. Prefer fixing contract mismatches between mobile, backend, and Supabase before adding new features.
5. Do not introduce new frameworks without approval.
6. Do not modify secrets, `.env` files, credentials, or API keys.
7. Do not delete existing data migrations unless explicitly requested.
8. Before changing routes, check mobile services and stores that consume them.
9. Before changing payload fields, check Supabase schema requirements.
10. Keep Dashboard and daily brief secondary until Projects + Expenses + Profit works.
11. OpenClaw/Codex/agent artifacts are not product runtime unless explicitly scoped.
12. After edits, summarize:
   - files changed
   - why changed
   - manual test steps
   - any risk or follow-up

## Current MVP priorities

1. Verify the current Projects + Clients baseline remains working.
2. Add or verify project financial fields: contract value/budget and estimated cost.
3. Add expenses schema and backend endpoints linked to `project_id`.
4. Add mobile expense entry and expense list flow from Project Detail.
5. Calculate actual project cost from expenses.
6. Show project profit/loss in Project Detail.
7. Add Dashboard profit summary later after the project-level loop works.

## Command safety

Ask before running:
- destructive git commands
- database reset commands
- package upgrades
- large refactors
- deleting files
- changing authentication/secrets

Safe commands:
- `git status`
- `git diff`
- `npm run lint`
- `npm test`
- `npm run typecheck`
- read-only file inspection
