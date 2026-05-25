# FacadeFlow Clio Demo Checklist

## Startup

1. SSH to the Ubuntu laptop or ask Canyon to run:

```bash
bash /home/galin/start-facadeflow-demo.sh
```

2. Confirm it prints:

```text
FacadeFlow demo is ready.
Open from Windows/Everest: http://100.66.191.125:8081/
```

3. If demo data is missing or messy, reseed:

```bash
cd /home/galin/.openclaw/workspace/FacadeFlow/facadeflow/mobile-app
API_BASE_URL=http://127.0.0.1:3000/api npm run seed:clio-demo
```

## Demo URL

```text
http://100.66.191.125:8081/
```

## 3-minute Clio talk track

1. "This is FacadeFlow — a lightweight operations dashboard for facade contractors."
2. "The dashboard gives a quick view of active projects, contract value, costs, profit, and expense entries."
3. "Clients are tracked separately, so every project is connected to the customer or partner."
4. "Projects track status, contract value, budgeted cost, actual expenses, and profit."
5. "When we add an expense, project financials update immediately."
6. "The goal is to replace spreadsheet chaos with one operational view for facade work."

## Happy-path flow

1. Open Dashboard.
2. Show Profit Snapshot and Quick Actions.
3. Open Clients.
4. Show the three Clio Demo clients.
5. Open Projects.
6. Open `Clio Demo: Plovdiv Hotel Rainscreen`.
7. Show Overview financials.
8. Open Expenses.
9. Add one small demo expense:
   - Category: Materials
   - Description: Clio live demo sealant
   - Amount: 320
   - Vendor: Demo Supplier
10. Confirm Actual Cost / Actual Profit changes.
11. Delete the live demo expense if desired.

## Backup plan

If the app freezes:

```bash
bash /home/galin/start-facadeflow-demo.sh
```

If the browser does not open:

```bash
curl http://100.66.191.125:8081/api/system/health
curl http://100.66.191.125:8081/
```

If data looks wrong:

```bash
cd /home/galin/.openclaw/workspace/FacadeFlow/facadeflow/mobile-app
API_BASE_URL=http://127.0.0.1:3000/api npm run seed:clio-demo
```

If everything fails, show screenshots from the latest browser test and explain the product flow.

## Verification commands

```bash
cd /home/galin/.openclaw/workspace/FacadeFlow/facadeflow/mobile-app
npx tsc --noEmit --pretty false
WEB_BASE_URL=http://127.0.0.1:8081 API_BASE_URL=http://127.0.0.1:3000/api npm run smoke:web:mvp
```
