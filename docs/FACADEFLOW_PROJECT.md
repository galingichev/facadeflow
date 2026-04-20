# FacadeFlow — AGENT EXECUTION SPEC (MVP)

## 🎯 OBJECTIVE

Deliver a working mobile MVP where a user can:

* Create a project
* View projects
* Edit project
* Delete project

All data must persist via backend API and database.

---

# ⚙️ GLOBAL RULES

* DO NOT add new features beyond Projects + Clients
* DO NOT refactor entire architecture
* DO NOT introduce new libraries unless required
* KEEP implementation simple
* ALL data must come from API (no mock data)

---

# 📁 PROJECT PATHS

* Backend: `FacadeFlow/backend`
* Mobile: `FacadeFlow/facadeflow/mobile-app`

---

# 🧩 TASK 1 — BACKEND: PROJECTS API

## Goal:

Implement full CRUD for `/projects`

## Steps:

1. Create files if missing:

   * `routes/projects.ts`
   * `controllers/projectsController.ts`
   * `services/projectsService.ts`

2. Implement endpoints:

* GET `/projects`
* GET `/projects/:id`
* POST `/projects`
* PUT `/projects/:id`
* DELETE `/projects/:id`

3. Use Supabase inside `services/projectsService.ts`

4. Keep logic separation:

```id="ark9g6"
route → controller → service → supabase
```

5. Ensure all endpoints return JSON

---

## ✅ DONE when:

* API returns real project data from DB
* Can create/update/delete project via API (Postman or curl)

---

# 🧩 TASK 2 — BACKEND: CLIENTS (MINIMAL)

## Goal:

Support project creation

## Steps:

* GET `/clients`
* POST `/clients`

Minimal fields:

* id
* name
* phone (optional)

---

## ✅ DONE when:

* Clients can be fetched and created

---

# 🧩 TASK 3 — FRONTEND: API LAYER

## Goal:

Connect mobile app to backend

## Steps:

1. Create:

   * `src/services/projectService.ts`
   * `src/services/clientService.ts`

2. Implement:

```ts id="b1x4kz"
getProjects()
getProjectById(id)
createProject(data)
updateProject(id, data)
deleteProject(id)
```

3. Use fetch/axios to call backend

---

## ✅ DONE when:

* Services return real API data

---

# 🧩 TASK 4 — FRONTEND: PROJECTS LIST SCREEN

## Goal:

Display all projects

## File:

`app/projects/index.tsx`

## Requirements:

* Fetch projects on load
* Display list (name + status)
* Button: “+ New Project”

---

## ✅ DONE when:

* Projects from DB appear in mobile app

---

# 🧩 TASK 5 — FRONTEND: CREATE / EDIT PROJECT

## File:

`app/projects/create.tsx` (or similar)

## Requirements:

Form fields:

* name
* client (dropdown from API)
* status

Actions:

* Submit → POST / PUT
* Navigate back after save

---

## ✅ DONE when:

* New project appears in list after creation

---

# 🧩 TASK 6 — FRONTEND: PROJECT DETAILS

## File:

`app/projects/[id].tsx`

## Requirements:

* Display project data
* Edit button
* Delete button

---

## ✅ DONE when:

* Project can be edited and deleted from UI

---

# 🧩 TASK 7 — BASIC AUTH (OPTIONAL AFTER CORE FLOW)

## Goal:

Protect routes

## Steps:

* Implement login using Supabase Auth
* Store session
* Attach token to API requests

---

## ✅ DONE when:

* User must be logged in to use app

---

# 🧪 FINAL VALIDATION (REQUIRED)

System is COMPLETE when:

1. User creates project from mobile
2. Project appears in list
3. User opens project details
4. User edits project
5. User deletes project
6. Changes persist in database

---

# 🚫 OUT OF SCOPE (STRICT)

* Tasks
* Production tracking
* Installations
* Materials
* Roles/permissions
* Advanced UI polish

---

# 🧠 EXECUTION STRATEGY

Agent must:

1. Complete tasks in order
2. Verify each task before moving forward
3. Avoid adding extra abstractions
4. Prefer simple, direct implementations

---

# 🔥 PRIORITY

If blocked:

👉 ALWAYS prioritize:

* Backend `/projects`
* Then frontend list

Everything else is secondary.

