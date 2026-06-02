# FacadeFlow Client Demo Checklist

## Startup

Runbook: [`docs/CLIENT_DEMO_RUNBOOK.md`](docs/CLIENT_DEMO_RUNBOOK.md)

From the repository root:

```bash
bash scripts/start-demo.sh
```

The script prints the local demo URL when the backend, web app, and proxy are ready.

Default local URL:

```text
http://127.0.0.1:8081/
```

To expose the demo through another host or tunnel, set:

```bash
FACADEFLOW_DEMO_URL=http://your-demo-host:8081 bash scripts/start-demo.sh
```

If demo data is missing or messy, reseed from the mobile app folder:

```bash
cd facadeflow/mobile-app
API_BASE_URL=http://127.0.0.1:3000/api npm run seed:client-demo
```

## 3-minute client talk track

1. "FacadeFlow is a lightweight operating dashboard for facade, windows, and doors contractors."
2. "The dashboard shows active projects, contract value, budgeted cost, actual cost, expenses, and profit."
3. "Clients are tracked separately, so every project stays connected to the customer or partner."
4. "Projects track status, contract value, budget, actual expenses, and profit/loss."
5. "When an expense is added, project financials update immediately."
6. "The goal is to replace spreadsheet chaos with one operational view for facade work."

## Happy-path flow

1. Open Dashboard.
2. Show Profit Snapshot and Quick Actions.
3. Open Clients.
4. Show demo clients.
5. Open Projects.
6. Open `Client Demo: Plovdiv Hotel Rainscreen`.
7. Show Overview financials.
8. Open Expenses.
9. Add one small demo expense:
   - Category: Materials
   - Description: Client live demo sealant
   - Amount: 320
   - Vendor: Demo Supplier
10. Confirm Actual Cost / Actual Profit changes.
11. Delete the live demo expense if desired.

## Backup plan

Restart the local demo stack:

```bash
bash scripts/stop-demo.sh
bash scripts/start-demo.sh
```

Check local health:

```bash
curl http://127.0.0.1:8081/api/system/health
curl http://127.0.0.1:8081/
```

Run smoke verification:

```bash
npm run verify:demo
```
