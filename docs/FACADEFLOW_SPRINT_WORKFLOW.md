Use FACADEFLOW_SENIOR_AGENT.md

Sprint Goal:
Make the Projects module fully functional (list + create + basic navigation)

---

Tasks (execute in order):

1. FIX PROJECTS LOADING
- File: app/(tabs)/projects/index.tsx
- Ensure useEffect calls refresh() on mount
- Do not create new files

---

2. VERIFY API INTEGRATION
- File: src/services/projectService.ts
- Ensure GET /projects uses EXPO_PUBLIC_API_URL
- Ensure response format: { data }

---

3. ADD CREATE PROJECT BUTTON (UI ONLY)
- File: app/(tabs)/projects/index.tsx
- Add a button (top or floating)
- On press → navigate to /projects/create

---

4. CREATE PROJECT SCREEN
- File: app/(tabs)/projects/create.tsx

Requirements:
- Simple form:
  - name (text)
  - client_id (number or dropdown later)
- Submit button
- On submit → call POST /projects
- On success → navigate back to /projects

---

5. CONNECT POST API
- File: src/services/projectService.ts
- Add createProject(data)
- Use POST /projects

---

6. AUTO REFRESH AFTER CREATE
- After returning to list → projects should refresh

---

Rules:
- Do NOT create duplicate screens
- Do NOT modify unrelated files
- Do NOT refactor structure
- Keep implementation simple

---

Goal:
User can:
1. Open app
2. See projects list
3. Create new project
4. See it appear in list
