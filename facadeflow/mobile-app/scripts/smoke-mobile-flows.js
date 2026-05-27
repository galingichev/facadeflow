const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const includesAll = (label, content, expected) => {
  for (const text of expected) {
    assert(content.includes(text), `${label} is missing expected text: ${text}`);
  }
};

const dashboard = read('app/(tabs)/index.tsx');
includesAll('dashboard flow', dashboard, [
  '/dashboard/summary',
  'Owner briefing',
  'Job Health',
  'Budget vs actual',
  'Ready for progress claim',
  'New Project',
  '/projects/create',
  'Add Client',
  '/clients/create',
]);

const clientFlow = [
  read('app/(tabs)/clients.tsx'),
  read('app/(tabs)/clients/create.tsx'),
  read('app/(tabs)/clients/[clientId]/edit.tsx'),
  read('src/stores/clientsStore.ts'),
].join('\n');
includesAll('client flow', clientFlow, [
  'clientsApi.list',
  'clientsApi.create',
  'clientsApi.update',
  'clientsApi.delete',
  'Create Client',
]);

const projectFlow = [
  read('app/(tabs)/projects/index.tsx'),
  read('app/(tabs)/projects/create.tsx'),
  read('app/(tabs)/projects/[projectId].tsx'),
  read('app/(tabs)/projects/[projectId]/edit.tsx'),
  read('src/stores/projectsStore.ts'),
  read('src/services/projectService.ts'),
].join('\n');
includesAll('project flow', projectFlow, [
  'projectsApi.list',
  'projectsApi.create',
  'projectsApi.update',
  'projectsApi.delete',
  'projectsApi.createExpense',
  'projectsApi.deleteExpense',
  'Create Project',
  'Expenses',
  'Job Health',
  'Budget vs actual',
  'Last expense',
]);

const apiEndpoints = read('src/api/endpoints.ts');
includesAll('API endpoint contract', apiEndpoints, [
  "api.get<PaginatedResponse<Client>>('/clients'",
  "api.post<Client>('/clients'",
  "api.get<PaginatedResponse<Project>>('/projects'",
  "api.post<Project>('/projects'",
  '`/projects/${projectId}/expenses`',
  '`/projects/${projectId}/expenses/${expenseId}`',
]);

console.log('Mobile dashboard/client/project smoke checks passed');
