# FacadeFlow MVP Progress

Updated: 2026-05-15

## Current MVP State

Phase 1 project profit tracking is working end to end at project level:

- Clients can be created, updated, listed, and deleted when they have no linked projects.
- Clients with linked projects are protected from deletion with a clear `409 Conflict` message.
- Projects can be created, edited, listed, opened, and deleted.
- Projects support `contract_value` and existing `budget` as Budgeted Cost.
- Project expenses can be created, listed, and deleted from Project Detail.
- Project actual cost and actual profit are calculated from linked expenses.
- Project Detail guards against stale project state when switching between projects.

## Database

Applied manually in Supabase SQL Editor:

- `supabase/migrations/20260514150000_add_project_financial_tracking.sql`

Active database now includes:

- `projects.contract_value`
- `project_expenses`

## Recent Product Fixes

- Added mobile Project Detail Expenses tab with create/list/delete flow.
- Added Project Detail financial summary for contract value, budgeted cost, actual cost, and actual profit.
- Replaced web-broken project status `Alert.alert` pickers with cross-platform `Select`.
- Fixed client delete on web with browser confirmation.
- Added clear client-delete blocking when linked projects exist.
- Removed nested pressable button structure from client cards.
- Added web-safe theme storage fallback using `localStorage`.
- Fixed stale config import paths and small lint blockers.
- Installed `@playwright/test` for browser-level testing with system Chrome.

## Verification

Passed:

- `node --check backend/services/clientsService.js`
- `node --check backend/controllers/clientsController.js`
- `npx tsc --noEmit` in `facadeflow/mobile-app`
- `npm run lint` in `facadeflow/mobile-app` with warnings only
- Backend API smoke for project expenses and financial recalculation
- Playwright browser smoke for:
  - Home dashboard rendering
  - standalone client delete
  - linked-client delete blocking
  - project edit including status, contract value, and budgeted cost
  - project expense entry and financial recalculation

## Remaining Known Issues

- Mobile lint still reports warnings in unrelated existing files.
- Linked-client delete intentionally logs a browser network `409 Conflict` when tested.
- Dashboard profit summary is not yet part of the MVP loop; project-level profit works first.
- Dependency audit follow-up is needed later, starting with a targeted Axios review. Do not run broad `npm audit fix` or force Expo/toolchain major changes without a specific upgrade plan.

## Next Recommended Tasks

1. Manual web smoke by user on the latest branch.
2. If manual smoke passes, commit and prepare for the next MVP slice.
3. Next product slice: Dashboard profit summary from project financials.
