require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Route imports
const projectsRouter = require('./routes/projects');
const clientsRouter = require('./routes/clients');
const projectsService = require('./services/projectsService');
const { createClient: createSupabaseClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = '/api';

const getCorsOrigins = () => (process.env.FACADEFLOW_CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    const allowedOrigins = getCorsOrigins();
    if (allowedOrigins.length === 0 || !origin) {
      callback(null, true);
      return;
    }

    callback(null, allowedOrigins.includes(origin));
  },
};

const buildAuthClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

const requireBearerToken = async (req, res, next) => {
  if (
    process.env.FACADEFLOW_REQUIRE_AUTH !== 'true' ||
    req.method === 'OPTIONS' ||
    req.path === `${API_PREFIX}/system/health` ||
    !req.path.startsWith(API_PREFIX)
  ) {
    next();
    return;
  }

  const authHeader = req.get('Authorization') || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/);
  if (!match || !match[1].trim()) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }

  const authClient = buildAuthClient();
  if (!authClient) {
    res.status(500).json({ error: 'Auth is enabled but Supabase auth is not configured' });
    return;
  }

  try {
    const token = match[1].trim();
    const { data, error } = await authClient.auth.getUser(token);

    if (error || !data?.user?.id) {
      res.status(401).json({ error: 'Invalid bearer token' });
      return;
    }

    req.authToken = token;
    req.authUser = data.user;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get(`${API_PREFIX}/system/health`, (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(requireBearerToken);

const sendDashboardSummary = async (req, res) => {
  try {
    const projects = await projectsService.getProjects();
    const financialProjects = projects.filter((project) => {
      const financials = project.financials || {};
      return (
        (financials.contract_value !== null && financials.contract_value !== undefined) ||
        (financials.budgeted_cost !== null && financials.budgeted_cost !== undefined) ||
        financials.expense_count > 0
      );
    });

    const totals = projects.reduce((summary, project) => {
      const financials = project.financials || {};

      summary.contractValue += financials.contract_value || 0;
      summary.budgetedCost += financials.budgeted_cost || 0;
      summary.actualCost += financials.actual_cost || 0;
      summary.expenseCount += financials.expense_count || 0;

      if (financials.actual_profit !== null && financials.actual_profit !== undefined) {
        summary.actualProfit += financials.actual_profit;
        if (financials.actual_profit < 0) summary.lossProjects += 1;
        if (financials.actual_profit > 0) summary.profitableProjects += 1;
      }

      return summary;
    }, {
      contractValue: 0,
      budgetedCost: 0,
      actualCost: 0,
      actualProfit: 0,
      expenseCount: 0,
      profitableProjects: 0,
      lossProjects: 0,
    });

    const activeProjects = projects.filter((project) => project.status === 'in_progress').length;
    const actualMargin = totals.contractValue > 0
      ? totals.actualProfit / totals.contractValue
      : null;

    res.json({
      data: {
        active_projects: activeProjects,
        total_projects: projects.length,
        projects_with_financials: financialProjects.length,
        total_contract_value: totals.contractValue,
        total_budgeted_cost: totals.budgetedCost,
        total_actual_cost: totals.actualCost,
        total_actual_profit: totals.actualProfit,
        actual_margin: actualMargin,
        total_expenses: totals.expenseCount,
        profitable_projects: totals.profitableProjects,
        loss_projects: totals.lossProjects,
        revenue_pipeline: totals.contractValue,
        overdue_tasks: 0,
        today_appointments: 0,
        estimates_sent_this_week: 0,
      }
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ error: 'Failed to load dashboard summary' });
  }
};

// Dashboard summary (live data)
app.get(`${API_PREFIX}/dashboard/summary`, sendDashboardSummary);
app.get(`${API_PREFIX}/summary`, sendDashboardSummary);

// Dashboard brief
app.get(`${API_PREFIX}/dashboard/brief`, async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);
    const { data: tasks, error: taskErr } = await supabase
      .from('tasks')
      .select('title, due_date')
      .gte('due_date', now.toISOString())
      .lte('due_date', threeDaysLater.toISOString())
      .order('due_date', { ascending: true })
      .limit(10);
    if (taskErr) throw taskErr;
    const items = (tasks || []).map(t => ({ type: 'task', title: t.title, due_date: t.due_date }));
    res.json({ data: { items } });
  } catch (error) {
    console.error('Dashboard brief error:', error);
    res.status(500).json({ error: 'Failed to fetch brief' });
  }
});
// API routes
app.use(`${API_PREFIX}/projects`, projectsRouter);
app.use(`${API_PREFIX}/clients`, clientsRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server only when this file is run directly. Export app for tests.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}${API_PREFIX}`);
  });
}

module.exports = app;
