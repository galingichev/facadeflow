# FacadeFlow Goal Progress

Date: 2026-05-12

## Repository

- Current branch: `fix/project-create-contract`
- Worktree status: tracked project files clean before this progress note; untracked OpenClaw/config files present and intentionally untouched.
- Latest commits:
  - `7ac17b5 docs: document MVP owner env variable`
  - `cc8adca fix: normalize project create contract for MVP payload`
  - `46b26dc docs: add FacadeFlow Codex agent instructions`

## Environment

- `backend/.env` exists.
- `backend/.env` is ignored by git via `.gitignore`.
- `FACADEFLOW_MVP_OWNER_ID` key is present in `backend/.env`; value was not printed or inspected.

## Backend

- Start command:

```bash
cd /home/galin/.openclaw/workspace/FacadeFlow/backend
npm start
```

- Health endpoint: `GET /api/system/health`
- Project create endpoint: `POST /api/projects`
- Expected mobile payload shape:

```json
{
  "name": "MVP Contract Test",
  "client_id": "<CLIENT_UUID>",
  "status": "draft"
}
```

## Checks Run

```bash
cd /home/galin/.openclaw/workspace/FacadeFlow/backend
node --check server.js
node --check routes/projects.js
node --check controllers/projectsController.js
node --check services/projectsService.js
npm run
```

Result:
- Syntax checks passed.
- Backend scripts are `start`, `dev`, and placeholder `test`.
- No backend lint script exists.
- No real backend test suite exists; `npm test` remains a placeholder that exits with `Error: no test specified`.

## Manual API Commands Used

```bash
curl -i http://localhost:3000/api/system/health
```

Result: HTTP `200 OK`.

```bash
curl -s http://localhost:3000/api/clients
```

Result: returned existing clients. One existing client id was selected from the response for the create test.

```bash
curl -s -o /tmp/facadeflow_project_create_response.json -w 'HTTP_STATUS:%{http_code}\n' \
  -X POST http://localhost:3000/api/projects \
  -H 'Content-Type: application/json' \
  -d '{"name":"MVP Contract Test 2026-05-12","client_id":"f95395dc-8793-4991-afdc-00c997ba082a","status":"draft"}'
```

Result: HTTP `201 Created`.

Sanitized created project response:

```json
{
  "id": "926b5347-8ccc-45e0-b7e4-49427c5e431d",
  "name": "MVP Contract Test 2026-05-12",
  "client_id": "f95395dc-8793-4991-afdc-00c997ba082a",
  "status": "draft",
  "address": {
    "zip": "",
    "city": "",
    "state": "",
    "street": "",
    "country": ""
  }
}
```

```bash
curl -s -o /tmp/facadeflow_projects_response.json http://localhost:3000/api/projects
```

Result: created project was found in the projects list with related client `ABC Ltd`.

## Validation Result

`POST /api/projects` was manually verified end-to-end after `FACADEFLOW_MVP_OWNER_ID` was set to an existing Supabase `users.id`.

The backend contract is behaving correctly:
- Mobile payload fields are accepted server-side.
- Missing `address` is supplied by the backend.
- `created_by` is resolved server-side from `FACADEFLOW_MVP_OWNER_ID`.
- The created project appears in `GET /api/projects` with related client data.

## Mobile Contract Inspection

- Create Project screen sends `name`, `client_id`, and `status`.
- Create Project screen does not send `created_by`.
- `ClientPicker` supplies the selected client UUID to `client_id`.
- API client unwraps backend `{ data: ... }` responses.
- Projects list refreshes after successful creation.
- Bottom tabs remain limited to Home, Projects, and Clients; internal routes stay hidden with `href: null`.

## Files Changed

- `docs/GOAL_PROGRESS.md`

## Blocker

None for the Projects create contract validation.

## Next Recommended Task

Verify the same flow from the mobile Create Project screen against the running backend, then proceed to the next MVP contract task: project update `PATCH`/`PUT` alignment.

## 2026-05-12 Follow-up

Mobile Create Project contract was verified by inspection:
- `app/(tabs)/projects/create.tsx` sends `name`, `client_id`, and `status`.
- `ClientPicker` passes the selected client UUID through `onChange(item.id)`.
- The screen does not send `created_by` or `address`.
- The API client unwraps backend `{ data: ... }` responses.
- The screen calls `refresh()` after successful create.

Project update `PATCH`/`PUT` alignment was addressed:
- `PATCH /api/projects/:id` remains supported for the existing mobile update path.
- `PUT /api/projects/:id` now routes to the same update controller for API/spec compatibility.

Safe checks run:

```bash
cd /home/galin/.openclaw/workspace/FacadeFlow/backend
node --check server.js
node --check routes/projects.js
node --check controllers/projectsController.js
node --check services/projectsService.js
```

Result: all backend syntax checks passed.

Mobile lint command:

```bash
cd /home/galin/.openclaw/workspace/FacadeFlow/facadeflow/mobile-app
npm run lint
```

Result: failed on pre-existing unrelated lint errors in `app/(tabs)/index.tsx`, `components/ui/Input.tsx`, `src/index.ts`, and `src/stores/authStore.ts`, plus warnings. These were not related to the Projects create/update contract and were not changed.

Manual update validation was run against a temporary backend instance on port `3001` to avoid disturbing the running backend on port `3000`.

```bash
curl -s -o /tmp/facadeflow_project_put_response.json -w 'HTTP_STATUS:%{http_code}\n' \
  -X PUT http://localhost:3001/api/projects/926b5347-8ccc-45e0-b7e4-49427c5e431d \
  -H 'Content-Type: application/json' \
  -d '{"name":"MVP Contract Test 2026-05-12 PUT Verified","client_id":"f95395dc-8793-4991-afdc-00c997ba082a","status":"draft"}'
```

Result: HTTP `200 OK`.

```bash
curl -s -o /tmp/facadeflow_project_patch_response.json -w 'HTTP_STATUS:%{http_code}\n' \
  -X PATCH http://localhost:3001/api/projects/926b5347-8ccc-45e0-b7e4-49427c5e431d \
  -H 'Content-Type: application/json' \
  -d '{"name":"MVP Contract Test 2026-05-12 PATCH Verified","client_id":"f95395dc-8793-4991-afdc-00c997ba082a","status":"draft"}'
```

Result: HTTP `200 OK`.

Files changed in this follow-up:
- `backend/routes/projects.js`
- `docs/GOAL_PROGRESS.md`

Blockers:
- None for the Projects create contract or project update `PATCH`/`PUT` route alignment.

Next recommended FacadeFlow task:
- Verify the project edit flow from the mobile UI against the running backend, then move to Clients CRUD end-to-end validation.

## 2026-05-12 Project Edit and Clients CRUD Validation

Project Edit contract was verified by inspection:
- `app/(tabs)/projects/[projectId]/edit.tsx` loads the project by id.
- The edit submit payload sends `name`, `client_id`, and `status`.
- The mobile store calls `projectsApi.update`, which uses `PATCH /projects/:id`.
- Backend supports both `PATCH /api/projects/:id` and `PUT /api/projects/:id`.

Project Edit API validation against the running backend on port `3000`:

```bash
curl -s -o /tmp/facadeflow_project_edit_response.json -w 'HTTP_STATUS:%{http_code}\n' \
  -X PATCH http://localhost:3000/api/projects/926b5347-8ccc-45e0-b7e4-49427c5e431d \
  -H 'Content-Type: application/json' \
  -d '{"name":"MVP Contract Test 2026-05-12 Project Edit Verified","client_id":"f95395dc-8793-4991-afdc-00c997ba082a","status":"draft"}'
```

Result: HTTP `200 OK`.

Clients CRUD contract was verified by inspection:
- Create Client sends `name`, `phone`, and `email`.
- Edit Client sends `name`, `phone`, and `email`.
- Client store calls `GET /clients`, `GET /clients/:id`, `POST /clients`, `PATCH /clients/:id`, and `DELETE /clients/:id`.

Clients CRUD API validation against the running backend on port `3000`:

```bash
curl -s -o /tmp/facadeflow_client_create_response.json -w 'HTTP_STATUS:%{http_code}\n' \
  -X POST http://localhost:3000/api/clients \
  -H 'Content-Type: application/json' \
  -d '{"name":"MVP Client CRUD Test 2026-05-12","phone":"0888000000","email":"mvp-client-crud@example.com"}'
```

Result: HTTP `201 Created`.

Temporary client id:

```text
71c6c1cf-aa43-4030-b740-8a0004dd0c2d
```

```bash
curl -s -o /tmp/facadeflow_client_get_response.json -w 'HTTP_STATUS:%{http_code}\n' \
  http://localhost:3000/api/clients/71c6c1cf-aa43-4030-b740-8a0004dd0c2d
```

Result: HTTP `200 OK`.

```bash
curl -s -o /tmp/facadeflow_clients_list_response.json -w 'HTTP_STATUS:%{http_code}\n' \
  http://localhost:3000/api/clients
```

Result: HTTP `200 OK`; temporary client was found in list.

```bash
curl -s -o /tmp/facadeflow_client_update_response.json -w 'HTTP_STATUS:%{http_code}\n' \
  -X PATCH http://localhost:3000/api/clients/71c6c1cf-aa43-4030-b740-8a0004dd0c2d \
  -H 'Content-Type: application/json' \
  -d '{"name":"MVP Client CRUD Test 2026-05-12 Updated","phone":"0888111111","email":"mvp-client-crud-updated@example.com"}'
```

Result: HTTP `200 OK`.

```bash
curl -s -o /tmp/facadeflow_client_delete_response.txt -w 'HTTP_STATUS:%{http_code}\n' \
  -X DELETE http://localhost:3000/api/clients/71c6c1cf-aa43-4030-b740-8a0004dd0c2d
```

Result: HTTP `204 No Content`.

During delete verification, `GET /api/clients/:id` returned HTTP `500` for the deleted client because Supabase's no-row error was thrown before the controller could return its intended `404`. A minimal fix was made in `backend/services/clientsService.js` to return `null` on Supabase `PGRST116`.

The missing-client fix was validated on a temporary backend on port `3002`:

```bash
curl -s -o /tmp/facadeflow_client_missing_get_response.json -w 'HTTP_STATUS:%{http_code}\n' \
  http://localhost:3002/api/clients/71c6c1cf-aa43-4030-b740-8a0004dd0c2d
```

Result: HTTP `404 Not Found` with body:

```json
{"error":"Not found"}
```

Safe checks run:

```bash
cd /home/galin/.openclaw/workspace/FacadeFlow/backend
node --check server.js
node --check routes/projects.js
node --check routes/clients.js
node --check services/clientsService.js
```

Result: all syntax checks passed.

Files changed in this follow-up:
- `backend/services/clientsService.js`
- `docs/GOAL_PROGRESS.md`

Blockers:
- None for Project Edit API validation or Clients CRUD API validation.

Next recommended FacadeFlow task:
- Validate project delete from API/mobile flow, then decide whether to normalize project update payload fields server-side the same way project create is normalized.

## 2026-05-12 Project Delete Validation

Project Delete contract was verified by inspection:
- `app/(tabs)/projects/[projectId].tsx` calls `useProjectsStore.getState().deleteProject(project.id)`.
- The project store calls `projectsApi.delete(projectId)`.
- The API client calls `DELETE /projects/:id`.
- Backend route maps `DELETE /api/projects/:id` to `deleteProject`.

Project Delete API validation against the running backend on port `3000`:

```bash
curl -s -o /tmp/facadeflow_project_delete_response.txt -w 'HTTP_STATUS:%{http_code}\n' \
  -X DELETE http://localhost:3000/api/projects/926b5347-8ccc-45e0-b7e4-49427c5e431d
```

Result: HTTP `204 No Content`.

During delete verification, `GET /api/projects/:id` returned HTTP `500` for the deleted project because Supabase's no-row error was thrown before the controller could return a proper missing-resource response.

Minimal fix:
- `backend/services/projectsService.js` now returns `null` on Supabase `PGRST116`.
- `backend/controllers/projectsController.js` now returns HTTP `404` with `{ "error": "Not found" }` when `getProjectById` returns `null`.

The missing-project fix was validated on a temporary backend on port `3003`:

```bash
curl -s -o /tmp/facadeflow_project_missing_get_response.json -w 'HTTP_STATUS:%{http_code}\n' \
  http://localhost:3003/api/projects/926b5347-8ccc-45e0-b7e4-49427c5e431d
```

Result: HTTP `404 Not Found` with body:

```json
{"error":"Not found"}
```

Safe checks run:

```bash
cd /home/galin/.openclaw/workspace/FacadeFlow/backend
node --check server.js
node --check routes/projects.js
node --check controllers/projectsController.js
node --check services/projectsService.js
```

Result: all syntax checks passed.

Files changed in this follow-up:
- `backend/controllers/projectsController.js`
- `backend/services/projectsService.js`
- `docs/GOAL_PROGRESS.md`

Blockers:
- None for Project Delete API validation.

Next recommended FacadeFlow task:
- Normalize project update payload fields server-side to match the create-field allowlist, then run a full Projects CRUD smoke pass on the updated backend.

## 2026-05-12 Project Update Normalization and CRUD Smoke

Project update payload normalization was implemented:
- `backend/services/projectsService.js` now filters update payloads through the same MVP project field allowlist used by create.
- Update allows `client_id`, `name`, `description`, `address`, `status`, `start_date`, `end_date`, `budget`, `estimated_hours`, and `actual_hours`.
- Update rejects empty `name`, empty `client_id`, and requests with no valid project fields.
- Update does not accept `created_by`, `id`, relation objects, or other read-only/unrelated fields.
- `backend/controllers/projectsController.js` now returns `400` for validation errors and `404` when updating a missing project.

Safe checks run:

```bash
cd /home/galin/.openclaw/workspace/FacadeFlow/backend
node --check server.js
node --check routes/projects.js
node --check controllers/projectsController.js
node --check services/projectsService.js
```

Result: all syntax checks passed.

Full Projects CRUD smoke was run against a temporary backend on port `3004`.

Health and setup:

```bash
curl -s -o /tmp/facadeflow_crud_health.json -w 'HTTP_STATUS:%{http_code}\n' \
  http://localhost:3004/api/system/health

curl -s -o /tmp/facadeflow_crud_clients.json -w 'HTTP_STATUS:%{http_code}\n' \
  http://localhost:3004/api/clients
```

Result: both returned HTTP `200 OK`.

Create:

```bash
curl -s -o /tmp/facadeflow_crud_project_create.json -w 'HTTP_STATUS:%{http_code}\n' \
  -X POST http://localhost:3004/api/projects \
  -H 'Content-Type: application/json' \
  -d '{"name":"Projects CRUD Smoke 2026-05-12","client_id":"f95395dc-8793-4991-afdc-00c997ba082a","status":"draft","created_by":"ignored-by-allowlist","id":"ignored-by-allowlist"}'
```

Result: HTTP `201 Created`.

Temporary project id:

```text
a3d083ca-18b6-4443-b0b2-6e188198a69f
```

Read and list:

```bash
curl -s -o /tmp/facadeflow_crud_project_get.json -w 'HTTP_STATUS:%{http_code}\n' \
  http://localhost:3004/api/projects/a3d083ca-18b6-4443-b0b2-6e188198a69f

curl -s -o /tmp/facadeflow_crud_projects_list.json -w 'HTTP_STATUS:%{http_code}\n' \
  http://localhost:3004/api/projects
```

Result: both returned HTTP `200 OK`; project was found in the list with related client `ABC Ltd`.

Patch update:

```bash
curl -s -o /tmp/facadeflow_crud_project_patch.json -w 'HTTP_STATUS:%{http_code}\n' \
  -X PATCH http://localhost:3004/api/projects/a3d083ca-18b6-4443-b0b2-6e188198a69f \
  -H 'Content-Type: application/json' \
  -d '{"name":"Projects CRUD Smoke 2026-05-12 PATCH","client_id":"f95395dc-8793-4991-afdc-00c997ba082a","status":"in_progress","created_by":"ignored-by-allowlist","client":{"name":"ignored"}}'
```

Result: HTTP `200 OK`. The request succeeded, confirming invalid `created_by` and relation-object fields were filtered out before Supabase update.

Put update:

```bash
curl -s -o /tmp/facadeflow_crud_project_put.json -w 'HTTP_STATUS:%{http_code}\n' \
  -X PUT http://localhost:3004/api/projects/a3d083ca-18b6-4443-b0b2-6e188198a69f \
  -H 'Content-Type: application/json' \
  -d '{"name":"Projects CRUD Smoke 2026-05-12 PUT","client_id":"f95395dc-8793-4991-afdc-00c997ba082a","status":"quoted","id":"ignored-by-allowlist"}'
```

Result: HTTP `200 OK`.

Invalid update:

```bash
curl -s -o /tmp/facadeflow_crud_project_invalid_update.json -w 'HTTP_STATUS:%{http_code}\n' \
  -X PATCH http://localhost:3004/api/projects/a3d083ca-18b6-4443-b0b2-6e188198a69f \
  -H 'Content-Type: application/json' \
  -d '{"id":"ignored-by-allowlist","created_by":"ignored-by-allowlist","client":{"name":"ignored"}}'
```

Result: HTTP `400 Bad Request` with:

```json
{"error":"No valid project fields provided"}
```

Delete and missing read:

```bash
curl -s -o /tmp/facadeflow_crud_project_delete.json -w 'HTTP_STATUS:%{http_code}\n' \
  -X DELETE http://localhost:3004/api/projects/a3d083ca-18b6-4443-b0b2-6e188198a69f

curl -s -o /tmp/facadeflow_crud_project_missing_after_delete.json -w 'HTTP_STATUS:%{http_code}\n' \
  http://localhost:3004/api/projects/a3d083ca-18b6-4443-b0b2-6e188198a69f
```

Result:
- Delete returned HTTP `204 No Content`.
- Missing read returned HTTP `404 Not Found` with `{ "error": "Not found" }`.

Files changed in this follow-up:
- `backend/controllers/projectsController.js`
- `backend/services/projectsService.js`
- `docs/GOAL_PROGRESS.md`

Blockers:
- None for Projects CRUD backend contract validation.

Next recommended FacadeFlow task:
- Commit the backend contract fixes after review, then run the mobile app against the running backend for an interactive Projects + Clients CRUD pass.

## 2026-05-12 Mobile Projects CRUD UI Smoke

Current branch: `fix/project-create-contract`.

Latest relevant commit: `63196e2 fix: harden project and client CRUD contracts`.

Worktree status after this pass:
- Tracked project files modified.
- Untracked OpenClaw/config files are still present and intentionally untouched.

Backend and mobile startup used:

```bash
cd /home/galin/.openclaw/workspace/FacadeFlow/backend
npm start

cd /home/galin/.openclaw/workspace/FacadeFlow/facadeflow/mobile-app
EXPO_NO_DOTENV=1 EXPO_PUBLIC_API_URL=http://localhost:3000/api npm run web -- --port 8082 --clear
```

Mobile Projects create/edit/delete UI smoke results:
- Create Project screen submitted the existing mobile payload shape: `name`, `client_id`, and `status`.
- Create request used `POST /api/projects` against `localhost:3000` and returned HTTP `201 Created`.
- The created project was found in `GET /api/projects` with related client `ABC Ltd`.
- Edit Project screen submitted `name`, `client_id`, and `status`.
- Update request used `PATCH /api/projects/:id` against `localhost:3000` and returned HTTP `200 OK`.
- Delete from the Project detail screen used `DELETE /api/projects/:id` against `localhost:3000` and returned HTTP `204 No Content`.

Temporary mobile UI smoke project:

```text
dfda42a1-b8f8-47cc-902d-900759f257a9
```

Follow-up backend verification:

```bash
curl -i http://localhost:3000/api/projects/dfda42a1-b8f8-47cc-902d-900759f257a9
```

Result before the backend missing-project fix: HTTP `500 Internal Server Error` with `{ "error": "Failed to fetch project" }`.

Small fixes made:
- `facadeflow/mobile-app/src/api/client.ts`: local Expo web sessions now use `http://localhost:3000/api` when the browser host is `localhost`, avoiding stale public API URL values without editing `.env`.
- `facadeflow/mobile-app/app/(tabs)/projects/[projectId].tsx`: Project delete confirmation now uses `window.confirm` on web because React Native Web's `Alert.alert` is a no-op; native platforms still use `Alert.alert`.
- `backend/services/projectsService.js`: project detail/update queries now use Supabase `.maybeSingle()` so missing rows return `null` and the existing controller returns HTTP `404 Not Found`.

Backend missing-project fix was verified on a temporary backend at port `3001` to avoid stopping the user-running backend on port `3000`:

```bash
PORT=3001 npm start
curl -i http://localhost:3001/api/system/health
curl -i http://localhost:3001/api/projects/dfda42a1-b8f8-47cc-902d-900759f257a9
```

Result:
- Health returned HTTP `200 OK`.
- Deleted project read returned HTTP `404 Not Found` with `{ "error": "Not found" }`.

Checks run:

```bash
cd /home/galin/.openclaw/workspace/FacadeFlow/backend
node --check backend/services/projectsService.js
node --check backend/controllers/projectsController.js
node --check backend/routes/projects.js

cd /home/galin/.openclaw/workspace/FacadeFlow/facadeflow/mobile-app
npm run lint
```

Result:
- Backend syntax checks passed.
- Mobile lint still fails on pre-existing unrelated errors in `app/(tabs)/index.tsx`, `components/ui/Input.tsx`, `src/index.ts`, and `src/stores/authStore.ts`. The touched mobile files no longer add lint warnings.

Blockers / follow-up:
- Home/Dashboard still has a separate API base URL path and can fail after routing back to Home in local web. This should be handled by unifying mobile API base URL handling.

Next recommended FacadeFlow task:
- Unify mobile API base URL handling so Dashboard/Home and Projects/Clients use the same local/tunnel API resolution.
