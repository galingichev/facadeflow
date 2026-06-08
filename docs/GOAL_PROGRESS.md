# FacadeFlow Goal Progress

Updated: 2026-05-27

## Product goal

Build FacadeFlow into a focused vertical SaaS MVP for doors, windows, and facades contractors.

The core demo should show how a contractor can track:

- clients
- projects
- contract value
- budgeted cost
- real expenses
- actual cost
- profit/loss
- at-risk projects
- dashboard business totals

## Current status

FacadeFlow is now in a client-demo-ready foundation state.

Completed today:

- GitHub `main` is clean and current.
- CI is configured and passing with the `Validate FacadeFlow` check.
- Branch protection requires CI before merge.
- Backend tests cover clients, projects, and project expenses.
- Mobile smoke tests cover Dashboard, Clients, and Projects flows.
- Client demo terminology is standardized.
- Client-facing repository cleanup was merged.
- A polished SaaS-style mobile dashboard/demo UI was merged into `main`.
- Demo storytelling and brand polish were added.
- Client demo decision experience was added through the PR stack.

Latest merged work:

- `eea2bfc feat: add polished SaaS demo dashboard (#4)`
- PR #5 was merged into PR #4 before PR #4 was merged to `main`.
- Open GitHub PRs after merge: none.

## Current MVP surface

Keep the main demo focused on:

1. Dashboard financial summary.
2. At-risk project visibility.
3. Clients list and client detail flow.
4. Projects list and project detail flow.
5. Contract value, budgeted cost, actual cost, and profit/loss.
6. Project expenses.
7. Client demo seed data and repeatable smoke validation.

Keep these secondary modules out of the main demo until the core business flow is stronger:

- Photos
- Voice notes
- Field workflows
- Estimates
- Scheduling
- Inventory

## Recommended next focused PR

Highest-impact next PR:

**Supabase setup + repeatable client demo runbook**

Scope:

- Document the exact Supabase setup required to run the app.
- Add or verify database migration steps for the current clients/projects/expenses schema.
- Make the client demo seed workflow reliable from a clean environment.
- Add a short demo runbook for Canyon/Everest to reset data and launch the mobile demo.
- Add one verification command that proves the demo data and smoke flow work after setup.

Do not expand into new product modules yet. The next PR should make the existing demo easy to reproduce and trust.
