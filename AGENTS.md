# FacadeFlow MVP Agent Instructions

## Project goal

FacadeFlow is a vertical SaaS MVP for companies working with aluminium facades, windows, doors, and facade elements.

The MVP focus is:
1. Projects
2. Clients
3. Production/installation workflow later
4. Inventory later
5. Team communication later

For now, keep the product narrow and reliable: Projects + Clients CRUD first.

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
- Supabase migrations: `supabase/migrations/`
- Docs: root-level markdown files

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
10. After edits, summarize:
   - files changed
   - why changed
   - manual test steps
   - any risk or follow-up

## Current MVP priorities

1. Align project create/update payloads with Supabase required fields.
2. Unify API base URL handling.
3. Resolve PATCH vs PUT update contract for projects and clients.
4. Verify Clients CRUD end to end.
5. Verify Projects CRUD end to end.
6. Keep dashboard/daily-brief and non-MVP features secondary.

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
