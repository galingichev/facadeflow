# FacadeFlow Goal Progress

Updated: 2026-05-27

## Product goal

Build FacadeFlow into a reliable vertical SaaS MVP for doors, windows, and facades contractors.

The MVP must help a contractor track:

- clients
- projects
- contract value
- budgeted cost
- real expenses
- actual cost
- project profit/loss
- dashboard totals

## Current status

Completed:

- Main app code is on GitHub `main`.
- GitHub Actions CI is configured and passing.
- Branch protection requires the `Validate FacadeFlow` check before merge.
- Backend API tests cover clients, projects, and project expenses.
- Mobile smoke checks cover Dashboard, Client, and Project flows.
- Client demo terminology is standardized.
- Obvious backend scratch files were removed.

## Current MVP surface

Keep current work focused on:

1. Dashboard financial summary.
2. Clients CRUD.
3. Projects CRUD.
4. Project contract value and budget fields.
5. Project expenses.
6. Actual cost and profit/loss summary.

Secondary modules should stay out of the main demo until they have a reliable flow:

- Photos
- Voice notes
- Field workflows
- Estimates
- Scheduling
- Inventory

## Next recommended work

1. Verify the app end-to-end with real Supabase data.
2. Document exact Supabase setup and migration steps.
3. Harden the client demo seed and runbook.
4. Add service/integration tests against a test database.
5. Add stronger mobile UI tests after the demo flow is stable.
