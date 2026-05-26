const { chromium } = require('playwright');
const assert = require('assert');

const WEB_BASE_URL = process.env.WEB_BASE_URL || 'http://localhost:8081';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const RUN_ID = Date.now();

let clientId = null;
let projectId = null;

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: response.status, body };
}

async function cleanup() {
  if (projectId) {
    await api(`/projects/${projectId}`, { method: 'DELETE' }).catch(() => {});
    projectId = null;
  }

  if (clientId) {
    await api(`/clients/${clientId}`, { method: 'DELETE' }).catch(() => {});
    clientId = null;
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const events = [];

  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      events.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on('dialog', async (dialog) => {
    events.push(`${dialog.type()}: ${dialog.message()}`);
    await dialog.accept();
  });

  async function goto(route, delay = 1200) {
    await page.goto(`${WEB_BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(delay);
  }

  async function bodyText() {
    return (await page.locator('body').innerText({ timeout: 10000 })).replace(/\s+/g, ' ');
  }

  await goto('/');
  const dashboardText = await bodyText();
  assert(dashboardText.includes('Profit Snapshot'), 'Dashboard profit snapshot is missing');
  assert(dashboardText.includes('New Project'), 'Dashboard New Project action is missing');
  assert(dashboardText.includes('Add Client'), 'Dashboard Add Client action is missing');
  assert(!dashboardText.includes('Create Estimate'), 'Dashboard exposes unavailable Create Estimate action');
  assert(!dashboardText.includes('Voice Note'), 'Dashboard exposes unavailable Voice Note action');

  await goto('/clients/create');
  await page.getByPlaceholder('Enter client name').fill(`Smoke MVP Client ${RUN_ID}`);
  await page.getByText('Create Client', { exact: false }).click();
  await page.waitForTimeout(1500);

  const clients = (await api('/clients')).body.data || [];
  const client = clients.find((item) => item.name === `Smoke MVP Client ${RUN_ID}`);
  assert(client, 'Created smoke client was not found through API');
  clientId = client.id;

  await goto('/projects/create');
  await page.getByPlaceholder('Enter project name').fill(`Smoke MVP Project ${RUN_ID}`);
  await page.getByText('Select a client', { exact: true }).click();
  await page.getByText(`Smoke MVP Client ${RUN_ID}`, { exact: true }).click();
  await page.getByPlaceholder('YYYY-MM-DD').nth(0).fill('2026-08-01');
  await page.getByPlaceholder('YYYY-MM-DD').nth(1).fill('2026-08-31');
  await page.getByPlaceholder('Total payable by client').fill('15000');
  await page.getByPlaceholder('Expected spend to complete').fill('9000');
  await page.getByText('Create Project', { exact: false }).click();
  await page.waitForTimeout(1800);

  const projects = (await api('/projects')).body.data || [];
  const project = projects.find((item) => item.name === `Smoke MVP Project ${RUN_ID}`);
  assert(project, 'Created smoke project was not found through API');
  assert.equal(project.start_date, '2026-08-01');
  assert.equal(project.end_date, '2026-08-31');
  projectId = project.id;

  await goto(`/projects/${projectId}`, 1800);
  const detailText = await bodyText();
  assert(detailText.includes('Overview'), 'Project Overview tab is missing');
  assert(detailText.includes('Expenses'), 'Project Expenses tab is missing');
  assert(!detailText.includes('Photos'), 'Project exposes unavailable Photos tab');
  assert(!detailText.includes('Tasks'), 'Project exposes unavailable Tasks tab');
  assert(!detailText.includes('Notes'), 'Project exposes unavailable Notes tab');

  await page.getByText('Expenses', { exact: true }).click();
  await page.getByPlaceholder('e.g. Aluminium profiles').fill(`Smoke MVP Expense ${RUN_ID}`);
  await page.getByPlaceholder('0.00').fill('222.25');
  await page.getByPlaceholder('YYYY-MM-DD').fill('2026-08-02');
  await page.getByText('Add Expense', { exact: true }).click();
  await page.waitForTimeout(2200);

  let reloadedProject = (await api(`/projects/${projectId}`)).body.data;
  assert.equal(reloadedProject.financials.actual_cost, 222.25);

  await page.getByLabel(`Delete expense Smoke MVP Expense ${RUN_ID}`).click();
  await page.waitForTimeout(1800);
  reloadedProject = (await api(`/projects/${projectId}`)).body.data;
  assert.equal(reloadedProject.financials.actual_cost, 0);

  await goto(`/projects/${projectId}`, 1600);
  await page.getByLabel(`Delete Smoke MVP Project ${RUN_ID}`).click();
  await page.waitForTimeout(1800);
  const deletedProject = await api(`/projects/${projectId}`);
  assert.equal(deletedProject.status, 404);
  projectId = null;

  await cleanup();
  await browser.close();

  const notableEvents = [...new Set(events)].filter(
    (event) => !event.includes('shadow*') && !event.includes('pointerEvents') && !event.includes('TouchableWithoutFeedback')
  );

  if (notableEvents.length > 0) {
    console.log('Non-blocking browser events:');
    console.log(JSON.stringify(notableEvents, null, 2));
  }

  console.log('MVP web smoke passed');
}

main().catch(async (error) => {
  await cleanup();
  console.error(error);
  process.exit(1);
});
