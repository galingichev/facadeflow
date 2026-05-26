const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:3000/api';
const PREFIX = process.env.CLIENT_DEMO_PREFIX || 'Client Demo:';

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
  { name: `${PREFIX} Boyana Villa Curtain Wall`, clientKey: 'homeowner', status: 'inquired', contract_value: 28000, budget: 18400, start_date: '2026-06-03', end_date: '2026-07-18' },
  { name: `${PREFIX} Vitosha Office Entrance Facade`, clientKey: 'commercial', status: 'quoted', contract_value: 74000, budget: 51200, start_date: '2026-06-10', end_date: '2026-08-12' },
  { name: `${PREFIX} Sofia Retail Aluminium Louvers`, clientKey: 'architect', status: 'approved', contract_value: 42000, budget: 27600, start_date: '2026-06-17', end_date: '2026-07-30' },
  { name: `${PREFIX} Plovdiv Hotel Rainscreen`, clientKey: 'commercial', status: 'in_progress', contract_value: 118000, budget: 83500, start_date: '2026-05-20', end_date: '2026-09-05' },
  { name: `${PREFIX} Bankya Passive House Windows`, clientKey: 'homeowner', status: 'completed', contract_value: 36500, budget: 24100, start_date: '2026-04-02', end_date: '2026-05-16' },
];

const expenses = {
  'Plovdiv Hotel Rainscreen': [
    { category: 'materials', description: 'Aluminium composite panels deposit', amount: 18600, expense_date: '2026-05-24', vendor: 'AluPanel BG' },
    { category: 'labor', description: 'Installation crew week 1', amount: 9200, expense_date: '2026-05-29', vendor: 'Facade Team 2' },
    { category: 'transport', description: 'Scaffold and panel delivery', amount: 1450, expense_date: '2026-05-30', vendor: 'TransBuild Logistics' },
  ],
  'Bankya Passive House Windows': [
    { category: 'materials', description: 'Triple-glazed window package', amount: 15100, expense_date: '2026-04-09', vendor: 'ThermoGlass' },
    { category: 'labor', description: 'Final installation and sealing', amount: 5800, expense_date: '2026-05-03', vendor: 'Facade Team 1' },
  ],
  'Sofia Retail Aluminium Louvers': [
    { category: 'materials', description: 'Powder-coated louver batch', amount: 7400, expense_date: '2026-06-20', vendor: 'MetalColor Sofia' },
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

async function main() {
  await api('/system/health');
  await cleanupExisting();
  const clientIds = new Map();
  for (const client of clients) {
    const { key, ...payload } = client;
    const created = await api('/clients', { method: 'POST', body: JSON.stringify(payload) });
    clientIds.set(key, created.body.data.id);
    console.log(`Created client: ${client.name}`);
  }
  const projectIds = new Map();
  for (const project of projects) {
    const { clientKey, ...payload } = project;
    payload.client_id = clientIds.get(clientKey);
    const created = await api('/projects', { method: 'POST', body: JSON.stringify(payload) });
    projectIds.set(project.name, created.body.data.id);
    console.log(`Created project: ${project.name}`);
  }
  for (const [fragment, rows] of Object.entries(expenses)) {
    const fullProjectName = [...projectIds.keys()].find((name) => name.includes(fragment));
    const projectId = projectIds.get(fullProjectName);
    for (const expense of rows) {
      await api(`/projects/${projectId}/expenses`, { method: 'POST', body: JSON.stringify(expense) });
      console.log(`Created expense for ${fullProjectName}: ${expense.description}`);
    }
  }
  const summary = (await api('/dashboard/summary')).body.data;
  console.log();
  console.log('Client demo dataset ready. Dashboard summary:');
  console.log(JSON.stringify({
    active_projects: summary.active_projects,
    total_contract_value: summary.total_contract_value,
    total_actual_cost: summary.total_actual_cost,
    total_actual_profit: summary.total_actual_profit,
    total_expenses: summary.total_expenses,
  }, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
