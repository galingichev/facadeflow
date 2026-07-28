const fs = require('fs');
const path = require('path');

const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:3000/api';
const PREFIX = process.env.CLIENT_DEMO_PREFIX || 'Client Demo:';
const ROOT_DIR = path.resolve(__dirname, '../../..');
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INTERNAL_ARTIFACT_PATTERN = /\b(QA|Everest|test)\b/i;
const BLANK_AMOUNT_PATTERN = /blank\s+amount/i;

const EXPECTED = {
  clients: 3,
  projects: 5,
  expenses: 7,
  activeProjects: 1,
  contractValue: 322500,
  actualCost: 148750,
  actualProfit: 173750,
};

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return fs.readFileSync(filePath, 'utf8').split(/\r?\n/).reduce((env, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return env;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) return env;
    const [, key, rawValue] = match;
    env[key] = rawValue.replace(/^['"]|['"]$/g, '').trim();
    return env;
  }, {});
}

function resolveOwnerId() {
  const backendEnv = readEnvFile(path.join(ROOT_DIR, 'backend/.env'));
  return process.env.FACADEFLOW_MVP_OWNER_ID
    || process.env.MVP_OWNER_ID
    || process.env.PROJECTS_CREATED_BY
    || backendEnv.FACADEFLOW_MVP_OWNER_ID
    || backendEnv.MVP_OWNER_ID
    || backendEnv.PROJECTS_CREATED_BY;
}

function assertOwnerConfigured() {
  if (process.env.SKIP_OWNER_ENV_CHECK === '1') return;

  const ownerId = resolveOwnerId();
  const ownerIdWarning = !ownerId
    ? 'FACADEFLOW_MVP_OWNER_ID is missing.'
    : ownerId.includes('<')
      ? 'FACADEFLOW_MVP_OWNER_ID is still a placeholder.'
      : !UUID_REGEX.test(ownerId)
        ? 'FACADEFLOW_MVP_OWNER_ID is present but is not a valid UUID.'
        : null;

  if (ownerIdWarning) {
    throw new Error([
      ownerIdWarning,
      'Set it in backend/.env to an existing Supabase users.id UUID, then restart the backend.',
      'Example: FACADEFLOW_MVP_OWNER_ID=00000000-0000-4000-8000-000000000000',
    ].join('\n'));
  }
}

async function runStep(label, action) {
  try {
    console.log(`\n==> ${label}`);
    return await action();
  } catch (error) {
    throw new Error(`Failed step: ${label}\n${error.message || error}`);
  }
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok && response.status !== 404) {
    throw new Error(`${options.method || 'GET'} ${path} failed ${response.status}: ${text}`);
  }
  return { status: response.status, body };
}

const clients = [
  { key: 'homeowner', name: `${PREFIX} Elena Petrova Residence`, phone: '+359 88 810 2040', email: 'elena.petrova@example.com' },
  { key: 'commercial', name: `${PREFIX} Vitosha Office Park`, phone: '+359 88 820 3050', email: 'facilities@vitosha-office.example' },
  { key: 'architect', name: `${PREFIX} Studio Archline`, phone: '+359 88 830 4060', email: 'projects@archline.example' },
];

const projects = [
  { name: `${PREFIX} Boyana Villa Curtain Wall`, clientKey: 'homeowner', status: 'inquired', contract_value: 28000, budget: 18400, start_date: '2026-06-03', end_date: '2026-07-18', description: 'Owner action: confirm glazing specification before issuing the formal quote.' },
  { name: `${PREFIX} Sofia Office Curtain Wall`, clientKey: 'commercial', status: 'quoted', contract_value: 74000, budget: 51200, start_date: '2026-06-10', end_date: '2026-08-12', description: 'Owner action: present projected margin and ask for quote approval before ordering profiles.' },
  { name: `${PREFIX} Varna Residential Windows`, clientKey: 'homeowner', status: 'approved', contract_value: 42000, budget: 27600, start_date: '2026-06-17', end_date: '2026-07-30', description: 'Owner action: confirm lift access and book the second-floor install slot.' },
  { name: `${PREFIX} Plovdiv Hotel Rainscreen`, clientKey: 'commercial', status: 'in_progress', contract_value: 142000, budget: 121000, start_date: '2026-05-20', end_date: '2026-09-05', description: 'Owner action: approve a variation for extra anchoring plates before the next facade installation shift.' },
  { name: `${PREFIX} Burgas Aluminium Door Package`, clientKey: 'architect', status: 'completed', contract_value: 36500, budget: 24100, start_date: '2026-04-02', end_date: '2026-05-16', description: 'Owner action: send final invoice and archive signed handover notes.' },
];

const expenses = {
  'Plovdiv Hotel Rainscreen': [
    { category: 'materials', description: 'Aluminium composite panels deposit', amount: 76500, expense_date: '2026-05-24', vendor: 'AluPanel BG' },
    { category: 'labor', description: 'Installation crew week 1', amount: 34200, expense_date: '2026-05-29', vendor: 'Facade Team 2' },
    { category: 'transport', description: 'Scaffold and panel delivery', amount: 8500, expense_date: '2026-05-30', vendor: 'TransBuild Logistics' },
  ],
  'Burgas Aluminium Door Package': [
    { category: 'materials', description: 'Triple-glazed window package', amount: 15100, expense_date: '2026-04-09', vendor: 'ThermoGlass' },
    { category: 'labor', description: 'Final installation and sealing', amount: 5800, expense_date: '2026-05-03', vendor: 'Facade Team 1' },
  ],
  'Varna Residential Windows': [
    { category: 'materials', description: 'Low-E glass units deposit', amount: 7400, expense_date: '2026-06-20', vendor: 'Black Sea Glass' },
    { category: 'equipment', description: 'Lift rental for second-floor installation', amount: 1250, expense_date: '2026-06-21', vendor: 'Varna Lift Hire' },
  ],
};

async function cleanupExisting() {
  const existingProjects = (await api('/projects')).body.data || [];
  for (const project of existingProjects) {
    if (project.name?.startsWith(PREFIX)) await api(`/projects/${project.id}`, { method: 'DELETE' });
  }
  const existingClients = (await api('/clients')).body.data || [];
  for (const client of existingClients) {
    if (client.name?.startsWith(PREFIX)) await api(`/clients/${client.id}`, { method: 'DELETE' });
  }
}

function isInternalArtifactText(value) {
  return typeof value === 'string' && INTERNAL_ARTIFACT_PATTERN.test(value);
}

function isInternalArtifactClient(client) {
  return [client.name, client.email, client.phone, client.company, client.notes].some(isInternalArtifactText);
}

function isInternalArtifactProject(project) {
  return [project.name, project.description, project.client?.name, project.client?.email].some(isInternalArtifactText);
}

function isInternalArtifactExpense(expense) {
  return [expense.description, expense.vendor, expense.category].some(isInternalArtifactText)
    || (BLANK_AMOUNT_PATTERN.test(expense.description || '') && Number(expense.amount || 0) <= 0);
}

async function assertDemoDatasetIsIsolated() {
  const [clientsResult, projectsResult] = await Promise.all([
    api('/clients'),
    api('/projects'),
  ]);
  const unexpectedClients = (clientsResult.body.data || []).filter(
    (client) => !client.name?.startsWith(PREFIX) && !isInternalArtifactClient(client)
  );
  const unexpectedProjects = (projectsResult.body.data || []).filter(
    (project) => !project.name?.startsWith(PREFIX) && !isInternalArtifactProject(project)
  );

  if (unexpectedClients.length || unexpectedProjects.length) {
    throw new Error(`Refusing demo reset because non-demo records exist. Use an isolated demo database or remove them explicitly first: ${JSON.stringify({
      clients: unexpectedClients.map((client) => ({ id: client.id, name: client.name })),
      projects: unexpectedProjects.map((project) => ({ id: project.id, name: project.name })),
    }, null, 2)}`);
  }
}

async function cleanupInternalArtifacts() {
  const existingProjects = (await api('/projects')).body.data || [];
  const removed = {
    expenses: [],
    projects: [],
    clients: [],
  };

  for (const project of existingProjects) {
    const expenses = (await api(`/projects/${project.id}/expenses`)).body.data || [];
    for (const expense of expenses) {
      if (!isInternalArtifactExpense(expense)) continue;
      await api(`/projects/${project.id}/expenses/${expense.id}`, { method: 'DELETE' });
      removed.expenses.push({
        id: expense.id,
        project: project.name,
        description: expense.description,
        amount: Number(expense.amount || 0),
      });
    }
  }

  for (const project of existingProjects) {
    if (!isInternalArtifactProject(project)) continue;
    await api(`/projects/${project.id}`, { method: 'DELETE' });
    removed.projects.push({ id: project.id, name: project.name });
  }

  const existingClients = (await api('/clients')).body.data || [];
  for (const client of existingClients) {
    if (!isInternalArtifactClient(client)) continue;
    await api(`/clients/${client.id}`, { method: 'DELETE' });
    removed.clients.push({ id: client.id, name: client.name });
  }

  console.log('Removed internal demo artifacts:');
  console.log(JSON.stringify(removed, null, 2));
  return removed;
}

async function verifyDemoData(projectIds) {
  const [allClients, allProjects, summary] = await Promise.all([
    api('/clients'),
    api('/projects'),
    api('/dashboard/summary'),
  ]);

  const demoClients = (allClients.body.data || []).filter((client) => client.name?.startsWith(PREFIX));
  const demoProjects = (allProjects.body.data || []).filter((project) => project.name?.startsWith(PREFIX));
  const allProjectIds = (allProjects.body.data || []).map((project) => project.id);
  const allExpenseLists = await Promise.all(allProjectIds.map((projectId) => api(`/projects/${projectId}/expenses`)));
  const allExpenses = allExpenseLists.flatMap((result) => result.body.data || []);
  const demoExpenseLists = await Promise.all(
    [...projectIds.values()].map((projectId) => api(`/projects/${projectId}/expenses`))
  );
  const demoExpenses = demoExpenseLists.flatMap((result) => result.body.data || []);
  const demoContractValue = demoProjects.reduce((sum, project) => sum + Number(project.contract_value || 0), 0);
  const demoActualCost = demoExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const demoActualProfit = demoContractValue - demoActualCost;
  const forbiddenClients = (allClients.body.data || []).filter(isInternalArtifactClient);
  const forbiddenProjects = (allProjects.body.data || []).filter(isInternalArtifactProject);
  const forbiddenExpenses = allExpenses.filter(isInternalArtifactExpense);

  const checks = [
    ['demo clients', demoClients.length, EXPECTED.clients],
    ['demo projects', demoProjects.length, EXPECTED.projects],
    ['demo expenses', demoExpenses.length, EXPECTED.expenses],
    ['demo contract value', demoContractValue, EXPECTED.contractValue],
    ['demo actual cost', demoActualCost, EXPECTED.actualCost],
    ['demo actual profit', demoActualProfit, EXPECTED.actualProfit],
  ];

  for (const [label, actual, expected] of checks) {
    if (actual !== expected) {
      throw new Error(`${label} expected ${expected}, got ${actual}`);
    }
  }

  if (forbiddenClients.length || forbiddenProjects.length || forbiddenExpenses.length) {
    throw new Error(`Internal demo artifacts still present: ${JSON.stringify({
      clients: forbiddenClients.map((client) => ({ id: client.id, name: client.name })),
      projects: forbiddenProjects.map((project) => ({ id: project.id, name: project.name })),
      expenses: forbiddenExpenses.map((expense) => ({ id: expense.id, description: expense.description, amount: expense.amount })),
    }, null, 2)}`);
  }

  const dashboard = summary.body.data || {};
  if ((dashboard.total_contract_value || 0) < EXPECTED.contractValue) {
    throw new Error(`dashboard total_contract_value should be at least ${EXPECTED.contractValue}, got ${dashboard.total_contract_value}`);
  }
  if ((dashboard.total_actual_cost || 0) < EXPECTED.actualCost) {
    throw new Error(`dashboard total_actual_cost should be at least ${EXPECTED.actualCost}, got ${dashboard.total_actual_cost}`);
  }

  return {
    clients: demoClients.length,
    projects: demoProjects.length,
    expenses: demoExpenses.length,
    demo_contract_value: demoContractValue,
    demo_actual_cost: demoActualCost,
    demo_actual_profit: demoActualProfit,
    dashboard_active_projects: dashboard.active_projects,
    dashboard_total_contract_value: dashboard.total_contract_value,
    dashboard_total_actual_cost: dashboard.total_actual_cost,
    dashboard_total_actual_profit: dashboard.total_actual_profit,
    dashboard_total_expenses: dashboard.total_expenses,
  };
}

async function main() {
  assertOwnerConfigured();
  await runStep('API health check', () => api('/system/health'));
  await runStep('Verify isolated demo dataset', assertDemoDatasetIsIsolated);
  await runStep('Clean internal QA/test demo artifacts', cleanupInternalArtifacts);
  await runStep('Clean existing Client Demo records', cleanupExisting);

  const clientIds = new Map();
  await runStep('Create demo clients', async () => {
    for (const client of clients) {
      const { key, ...payload } = client;
      const created = await api('/clients', { method: 'POST', body: JSON.stringify(payload) });
      clientIds.set(key, created.body.data.id);
      console.log(`Created client: ${client.name}`);
    }
  });

  const projectIds = new Map();
  await runStep('Create demo projects', async () => {
    for (const project of projects) {
      const { clientKey, ...payload } = project;
      payload.client_id = clientIds.get(clientKey);
      const created = await api('/projects', { method: 'POST', body: JSON.stringify(payload) });
      projectIds.set(project.name, created.body.data.id);
      console.log(`Created project: ${project.name}`);
    }
  });

  await runStep('Create demo expenses', async () => {
    for (const [fragment, rows] of Object.entries(expenses)) {
      const fullProjectName = [...projectIds.keys()].find((name) => name.includes(fragment));
      const projectId = projectIds.get(fullProjectName);
      if (!projectId) throw new Error(`Could not resolve project for expense group: ${fragment}`);

      for (const expense of rows) {
        await api(`/projects/${projectId}/expenses`, { method: 'POST', body: JSON.stringify(expense) });
        console.log(`Created expense for ${fullProjectName}: ${expense.description}`);
      }
    }
  });

  const summary = await runStep('Verify demo data and dashboard financials', () => verifyDemoData(projectIds));
  console.log();
  console.log('Client demo dataset ready.');
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
