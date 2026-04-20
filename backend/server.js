require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Route imports
const projectsRouter = require('./routes/projects');
const clientsRouter = require('./routes/clients');

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = '/api';

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get(`${API_PREFIX}/system/health`, (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dashboard summary (live data)
app.get(`${API_PREFIX}/dashboard/summary`, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Start of week (Monday)
    const now = new Date();
    const day = now.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = day === 0 ? 6 : day - 1;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);
    const weekStartISO = startOfWeek.toISOString();

    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Active projects: counts projects with status 'in_progress'
    const { count: activeProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress');

    // Overdue tasks: due_date < today and status not 'done'
    const { count: overdueTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .lt('due_date', today)
      .neq('status', 'done');

    // Today's appointments: tasks due today
    const { count: todayAppointments } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('due_date', today);

    // Estimates sent this week: status 'sent' and sent_at >= week start
    const { count: estimatesSentWeek } = await supabase
      .from('estimates')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent')
      .gte('sent_at', weekStartISO);

    // Revenue pipeline: sum total of accepted estimates
    const { data: acceptedEstimates } = await supabase
      .from('estimates')
      .select('total')
      .eq('status', 'accepted');
    let revenuePipeline = 0;
    if (acceptedEstimates) {
      revenuePipeline = acceptedEstimates.reduce((sum, est) => sum + (est.total || 0), 0);
    }

    res.json({
      data: {
        active_projects: activeProjects || 0,
        overdue_tasks: overdueTasks || 0,
        today_appointments: todayAppointments || 0,
        estimates_sent_this_week: estimatesSentWeek || 0,
        revenue_pipeline: revenuePipeline
      }
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ error: 'Failed to load dashboard summary' });
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

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}${API_PREFIX}`);
});

// Dashboard endpoints
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const { data: projects, error: projErr } = await supabase
      .from('projects')
      .select('id')
      .in('status', ['draft','inquired','quoted','approved','in_progress','on_hold']);
    if (projErr) throw projErr;
    const active_projects = projects.length;

    // Overdue tasks
    const now = new Date().toISOString();
    const { data: overdueTasks, error: overdueErr } = await supabase
      .from('tasks')
      .select('id')
      .lt('due_date', now)
      .neq('status', 'done');
    if (overdueErr) throw overdueErr;
    const overdue_tasks = overdueTasks.length;

    // Today's appointments
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);
    const { data: todayTasks, error: todayErr } = await supabase
      .from('tasks')
      .select('id')
      .gte('due_date', startOfDay.toISOString())
      .lte('due_date', endOfDay.toISOString());
    if (todayErr) throw todayErr;
    const today_appointments = todayTasks.length;

    // Estimates sent this week
    const nowDate = new Date();
    const day = nowDate.getDay();
    const diff = nowDate.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(nowDate);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0,0,0,0);
    const { data: estimates, error: estErr } = await supabase
      .from('estimates')
      .select('total')
      .gte('sent_at', startOfWeek.toISOString());
    if (estErr) throw estErr;
    const estimates_sent_this_week = estimates.length;
    const revenue_pipeline = estimates.reduce((sum, est) => sum + (est.total || 0), 0);

    res.json({ data: { active_projects, overdue_tasks, today_appointments, estimates_sent_this_week, revenue_pipeline } });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

app.get('/api/dashboard/brief', async (req, res) => {
  try {
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
    const items = tasks.map(t => ({
      type: 'task',
      title: t.title,
      due_date: t.due_date
    }));
    res.json({ data: { items } });
  } catch (error) {
    console.error('Dashboard brief error:', error);
    res.status(500).json({ error: 'Failed to fetch brief' });
  }
});
