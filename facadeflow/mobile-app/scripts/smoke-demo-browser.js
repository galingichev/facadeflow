const { chromium } = require('playwright');
const assert = require('assert');

const DEMO_URL = normalizeBaseUrl(
  process.env.FACADEFLOW_DEMO_URL || process.env.WEB_BASE_URL || 'http://127.0.0.1:8081'
);

const STORAGE_KEYS = ['facadeflow.language', 'facadeflow.currency'];
const BENIGN_CONSOLE_PATTERNS = [
  /props\.pointerEvents is deprecated/i,
  /shadow\* style props are deprecated/i,
  /TouchableWithoutFeedback is deprecated/i,
];

function normalizeBaseUrl(value) {
  return String(value).replace(/\/+$/, '');
}

function buildUrl(path) {
  return `${DEMO_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function isBenignConsoleMessage(text) {
  return BENIGN_CONSOLE_PATTERNS.some((pattern) => pattern.test(text));
}

async function fetchJson(path) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(buildUrl(path), {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    const text = await response.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!response.ok) {
      throw new Error(`GET ${path} failed ${response.status}: ${text}`);
    }

    return body;
  } finally {
    clearTimeout(timeout);
  }
}

async function getBodyText(page) {
  return (await page.locator('body').innerText({ timeout: 20000 })).replace(/\s+/g, ' ');
}

async function waitForDashboard(page) {
  await page.getByText('Profit Snapshot', { exact: true }).waitFor({ timeout: 30000 });
  await page.getByText('Revenue pipeline', { exact: true }).waitFor({ timeout: 10000 });
}

async function assertNoDashboardMobileOverflow(page, width) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto(buildUrl('/'), { waitUntil: 'domcontentloaded', timeout: 45000 });
  await waitForDashboard(page);

  const overflow = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const documentWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body?.scrollWidth || 0
    );
    const targets = [
      'Client demo storyline',
      'Show the owner how a job moves from quote to expenses to profit report.',
      'Report preview',
      'FacadeFlow Project Report',
      'Notes / next action: verify latest site costs',
    ];

    const findSmallestTextElement = (text) => {
      const matches = Array.from(document.querySelectorAll('body *')).filter((element) => (
        element.textContent?.includes(text)
      ));
      return matches.find((element) => !Array.from(element.children).some((child) => child.textContent?.includes(text))) || null;
    };

    const offenders = [];
    for (const text of targets) {
      let element = findSmallestTextElement(text);
      let depth = 0;
      while (element && depth < 7 && element !== document.body) {
        const rect = element.getBoundingClientRect();
        const overflowRight = rect.right - viewportWidth;
        const hasScrollOverflow = element.scrollWidth - element.clientWidth > 1;
        const escapesViewport = rect.left < -1 || overflowRight > 1;

        if (hasScrollOverflow || escapesViewport) {
          offenders.push({
            text,
            tag: element.tagName.toLowerCase(),
            className: String(element.getAttribute('class') || ''),
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            viewportWidth,
          });
        }

        element = element.parentElement;
        depth += 1;
      }
    }

    return {
      viewportWidth,
      documentWidth,
      documentOverflow: documentWidth - viewportWidth,
      offenders,
    };
  });

  assert(
    overflow.documentOverflow <= 1,
    `Dashboard document overflows horizontally at ${width}px: ${JSON.stringify(overflow, null, 2)}`
  );
  assert.equal(
    overflow.offenders.length,
    0,
    `Dashboard storyline/report content overflows horizontally at ${width}px: ${JSON.stringify(overflow.offenders, null, 2)}`
  );
}

async function assertLabelQueriesWork(page, projectId) {
  await page.goto(buildUrl('/clients/create'), { waitUntil: 'domcontentloaded', timeout: 45000 });
  for (const label of ['Client Name', 'Phone', 'Email']) {
    const field = page.getByLabel(label, { exact: true });
    await field.waitFor({ timeout: 10000 });
    assert.equal(await field.count(), 1, `Expected one create-client field labelled "${label}"`);
  }

  await page.goto(buildUrl('/projects/create'), { waitUntil: 'domcontentloaded', timeout: 45000 });
  for (const label of ['Project Name', 'Client', 'Status', 'Start Date', 'End Date', 'Contract Value', 'Budgeted Cost']) {
    const field = page.getByLabel(label, { exact: true });
    await field.waitFor({ timeout: 10000 });
    assert.equal(await field.count(), 1, `Expected one create-project field labelled "${label}"`);
  }

  await page.goto(buildUrl(`/projects/${projectId}`), { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.getByText('Expenses', { exact: true }).click();
  for (const label of ['Category', 'Description', 'Amount', 'Vendor', 'Expense Date']) {
    const field = page.getByLabel(label, { exact: true });
    await field.waitFor({ timeout: 10000 });
    assert.equal(await field.count(), 1, `Expected one expense field labelled "${label}"`);
  }

  console.log('Label query checks passed: client, project, expense forms');
}

async function chooseCurrency(page, code) {
  await page.getByLabel(/Choose currency|Избор на валута/).click();
  await page.getByLabel(new RegExp(`^${code}\\b`)).click();
  await page.waitForTimeout(500);
}

async function chooseBulgarian(page) {
  await page.getByLabel('Choose language').click();
  await page.getByLabel('Български', { exact: true }).click();
  await page.waitForTimeout(700);
}

async function main() {
  const health = await fetchJson('/api/system/health');
  assert.equal(health.status, 'ok', 'API health did not return status ok');

  const projectsResponse = await fetchJson('/api/projects');
  const projects = projectsResponse.data || [];
  assert(projects.length > 0, 'No projects returned from API; seed demo data before running browser smoke');
  const projectId = projects[0].id;
  assert(projectId, 'First API project has no id');

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
    args: ['--no-sandbox'],
  });

  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  await context.addInitScript((keys) => {
    for (const key of keys) {
      globalThis.localStorage?.removeItem(key);
    }
  }, STORAGE_KEYS);

  const page = await context.newPage();
  const consoleErrors = [];
  const consoleWarnings = [];
  const pageErrors = [];
  const requestFailures = [];
  const dialogs = [];

  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && !isBenignConsoleMessage(text)) {
      consoleErrors.push(text);
    }
    if (message.type() === 'warning' && !isBenignConsoleMessage(text)) {
      consoleWarnings.push(text);
    }
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    const failure = request.failure();
    requestFailures.push(`${request.method()} ${request.url()} ${failure?.errorText || 'failed'}`);
  });
  page.on('dialog', async (dialog) => {
    dialogs.push(`${dialog.type()}: ${dialog.message().replace(/\s+/g, ' ')}`);
    await dialog.accept();
  });

  try {
    await page.goto(buildUrl('/'), { waitUntil: 'domcontentloaded', timeout: 45000 });
    await waitForDashboard(page);

    let text = await getBodyText(page);
    assert(text.includes('Profit Snapshot'), 'Dashboard Profit Snapshot is missing');
    assert(text.includes('Revenue pipeline'), 'Dashboard money row is missing');
    assert(text.includes('USD') || text.includes('$'), 'USD formatting is not visible');

    for (const width of [360, 390, 430]) {
      await assertNoDashboardMobileOverflow(page, width);
    }
    console.log('Dashboard mobile overflow checks passed: 360px, 390px, 430px');

    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto(buildUrl('/'), { waitUntil: 'domcontentloaded', timeout: 45000 });
    await waitForDashboard(page);
    await assertLabelQueriesWork(page, projectId);

    await page.goto(buildUrl('/'), { waitUntil: 'domcontentloaded', timeout: 45000 });
    await waitForDashboard(page);

    const usdText = text;
    await chooseCurrency(page, 'EUR');
    text = await getBodyText(page);
    assert.notEqual(text, usdText, 'Switching USD to EUR did not change visible dashboard text');
    assert(text.includes('€') || text.includes('EUR'), 'EUR formatting is not visible');

    const eurText = text;
    await chooseCurrency(page, 'BGN');
    text = await getBodyText(page);
    assert.notEqual(text, eurText, 'Switching EUR to BGN did not change visible dashboard text');
    assert(/BGN|лв\./.test(text), 'BGN formatting is not visible');

    await chooseBulgarian(page);
    text = await getBodyText(page);
    assert(text.includes('Преглед на печалбата'), 'Bulgarian dashboard translation is not visible');
    assert(text.includes('BGN') || text.includes('лв.'), 'Bulgarian + BGN formatting is not visible');

    await chooseCurrency(page, 'EUR');
    text = await getBodyText(page);
    assert(text.includes('Преглед на печалбата'), 'Bulgarian language did not remain active after currency switch');
    assert(text.includes('€') || text.includes('EUR'), 'Bulgarian + EUR formatting is not visible');

    await page.goto(buildUrl(`/projects/${projectId}`), { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.getByText(/Overview|Обзор/).waitFor({ timeout: 30000 });
    text = await getBodyText(page);
    assert(/Overview|Обзор/.test(text), 'Project route did not show overview tab');
    assert(/Expenses|Разходи/.test(text), 'Project route did not show expenses tab');
  } finally {
    await browser.close();
  }

  const uniqueConsoleErrors = [...new Set(consoleErrors)];
  const uniquePageErrors = [...new Set(pageErrors)];
  const uniqueWarnings = [...new Set(consoleWarnings)];
  const uniqueRequestFailures = [...new Set(requestFailures)];

  if (uniqueWarnings.length > 0) {
    console.log('Browser console warnings captured:');
    console.log(JSON.stringify(uniqueWarnings, null, 2));
  }
  if (dialogs.length > 0) {
    console.log('Browser dialogs accepted:');
    console.log(JSON.stringify([...new Set(dialogs)], null, 2));
  }
  if (uniqueRequestFailures.length > 0) {
    console.log('Browser request failures captured:');
    console.log(JSON.stringify(uniqueRequestFailures, null, 2));
  }

  if (uniqueConsoleErrors.length > 0 || uniquePageErrors.length > 0) {
    console.error('Browser errors captured:');
    console.error(JSON.stringify({
      consoleErrors: uniqueConsoleErrors,
      pageErrors: uniquePageErrors,
    }, null, 2));
    process.exit(1);
  }

  console.log(`Demo browser smoke passed: ${DEMO_URL}`);
  console.log('Browser console errors captured: 0');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
