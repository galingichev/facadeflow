# FacadeFlow MVP Progress

Updated: 2026-05-18

## Current MVP State

Phase 1 project profit tracking is working end to end at project level:

- Clients can be created, updated, listed, and deleted when they have no linked projects.
- Clients with linked projects are protected from deletion with a clear `409 Conflict` message.
- Projects can be created, edited, listed, opened, and deleted.
- Projects support `contract_value` and existing `budget` as Budgeted Cost.
- Project Create supports start date and end date.
- Project Edit supports updating start date and end date.
- Missing/deleted projects return a clean not-found state instead of a backend `500` or endless loading screen.
- Visible MVP navigation now focuses on Dashboard, Projects, Clients, Project Overview, and Project Expenses.
- Project expenses can be created, listed, and deleted from Project Detail.
- Project actual cost and actual profit are calculated from linked expenses.
- Project Detail guards against stale project state when switching between projects.
- Dashboard now summarizes project-level financials: total contract value, budgeted cost, actual cost, actual profit, margin, expense count, and profit/loss project counts.

## Database

Applied manually in Supabase SQL Editor:

- `supabase/migrations/20260514150000_add_project_financial_tracking.sql`

Active database now includes:

- `projects.contract_value`
- `project_expenses`

## Recent Product Fixes

- Added mobile Project Detail Expenses tab with create/list/delete flow.
- Added Project Detail financial summary for contract value, budgeted cost, actual cost, and actual profit.
- Added Dashboard profit summary cards backed by project expenses and project financial fields.
- Removed dead Dashboard quick actions that routed to missing screens.
- Removed dead Project Detail quick actions that routed to missing screens.
- Hid placeholder Project Detail tabs that are outside the current MVP loop: Photos, Tasks, Estimates, and Notes.
- Removed Dashboard schedule/brief placeholder UI from the visible MVP surface.
- Added accessible labels to Project Detail edit/delete icon buttons.
- Added clean project not-found handling for Project Detail and Project Edit.
- Added Project Create start date and end date fields with `YYYY-MM-DD` validation.
- Added Project Edit start date and end date fields with `YYYY-MM-DD` validation.
- Added repeatable MVP web smoke test script: `npm run smoke:web:mvp`.
- Cleaned mobile lint warnings in current/shared UI files; `npm run lint` now passes with zero warnings.
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
- `node --check backend/services/projectsService.js`
- `node --check backend/server.js`
- `npx tsc --noEmit` in `facadeflow/mobile-app`
- `npm run lint` in `facadeflow/mobile-app`
- `npm run smoke:web:mvp` in `facadeflow/mobile-app`
- Browser smoke for missing project not-found states, Project Create dates, Dashboard quick actions, Project Detail quick actions, and Project Detail edit/delete accessibility labels
- Backend API smoke for `/api/dashboard/summary`
- Backend API smoke for project expenses and financial recalculation
- Playwright browser smoke for:
  - Home dashboard rendering
  - standalone client delete
  - linked-client delete blocking
  - project edit including status, contract value, and budgeted cost
  - project expense entry and financial recalculation

## Remaining Known Issues

- Linked-client delete intentionally logs a browser network `409 Conflict` when tested.
- Dashboard profit summary needs browser/manual smoke against the current backend data.
- Dependency audit follow-up is needed later, starting with a targeted Axios review. Do not run broad `npm audit fix` or force Expo/toolchain major changes without a specific upgrade plan.
- React Native Web still logs framework deprecation warnings for `shadow*` and `props.pointerEvents`.

## Next Recommended Tasks

1. Manual web smoke by user on the latest branch, focused on Dashboard, Clients, Projects, Project Edit, and Expenses.
2. If manual smoke passes, commit and prepare a client-testing build.
3. Next product slice: only reintroduce hidden modules, such as photos, tasks, estimates, notes, field, and scheduling, when each has a working route and basic flow.
