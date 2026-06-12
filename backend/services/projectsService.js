const { createClient: supabaseCreateClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseCreateClient(supabaseUrl, supabaseKey);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function scopeToUser(query, context = {}) {
  return context.userId ? query.eq('created_by', context.userId) : query;
}

const DEFAULT_PROJECT_ADDRESS = {
  street: '',
  city: '',
  state: '',
  country: '',
  zip: '',
};

const CREATE_PROJECT_FIELDS = [
  'client_id',
  'name',
  'description',
  'address',
  'status',
  'contract_value',
  'start_date',
  'end_date',
  'budget',
  'estimated_hours',
  'actual_hours',
];

const EXPENSE_CATEGORIES = new Set([
  'materials',
  'labor',
  'subcontractor',
  'equipment',
  'transport',
  'permits',
  'overhead',
  'other',
]);

const EXPENSE_FIELDS = [
  'category',
  'description',
  'amount',
  'expense_date',
  'vendor',
];

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

function resolveMvpOwnerId(context = {}) {
  return context.userId || process.env.FACADEFLOW_MVP_OWNER_ID || process.env.MVP_OWNER_ID || process.env.PROJECTS_CREATED_BY;
}

function normalizeCreateProjectPayload(projectData = {}, context = {}) {
  const payload = {};

  for (const field of CREATE_PROJECT_FIELDS) {
    if (projectData[field] !== undefined) {
      payload[field] = projectData[field];
    }
  }

  if (typeof payload.name === 'string') {
    payload.name = payload.name.trim();
  }

  if (!payload.name) {
    throw new ValidationError('Project name is required');
  }

  if (!payload.client_id) {
    throw new ValidationError('Project client_id is required');
  }

  normalizeProjectFinancialFields(payload);

  if (!payload.address) {
    payload.address = DEFAULT_PROJECT_ADDRESS;
  }

  const createdBy = resolveMvpOwnerId(context);
  if (!createdBy || !UUID_REGEX.test(createdBy)) {
    throw new ValidationError('Project created_by cannot be resolved. Set FACADEFLOW_MVP_OWNER_ID to a valid user UUID.');
  }

  payload.created_by = createdBy;
  return payload;
}

function normalizeUpdateProjectPayload(projectData = {}) {
  const payload = {};

  for (const field of CREATE_PROJECT_FIELDS) {
    if (projectData[field] !== undefined) {
      payload[field] = projectData[field];
    }
  }

  if (typeof payload.name === 'string') {
    payload.name = payload.name.trim();
  }

  if (payload.name !== undefined && !payload.name) {
    throw new ValidationError('Project name cannot be empty');
  }

  if (payload.client_id !== undefined && !payload.client_id) {
    throw new ValidationError('Project client_id cannot be empty');
  }

  normalizeProjectFinancialFields(payload);

  if (Object.keys(payload).length === 0) {
    throw new ValidationError('No valid project fields provided');
  }

  return payload;
}

function normalizeProjectFinancialFields(payload) {
  for (const field of ['contract_value', 'budget']) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      continue;
    }

    const amount = Number(payload[field]);
    if (!Number.isFinite(amount) || amount < 0) {
      throw new ValidationError(`Project ${field} must be a non-negative number`);
    }
    payload[field] = amount;
  }
}

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function buildProjectFinancials(project, expenses = []) {
  const contractValue = project.contract_value === null || project.contract_value === undefined
    ? null
    : toNumber(project.contract_value);
  const budgetedCost = project.budget === null || project.budget === undefined
    ? null
    : toNumber(project.budget);
  const actualCost = expenses.reduce((sum, expense) => sum + toNumber(expense.amount), 0);
  const actualProfit = contractValue === null ? null : contractValue - actualCost;
  const plannedProfit = contractValue === null || budgetedCost === null ? null : contractValue - budgetedCost;
  const costVariance = budgetedCost === null ? null : budgetedCost - actualCost;

  return {
    contract_value: contractValue,
    budgeted_cost: budgetedCost,
    actual_cost: actualCost,
    planned_profit: plannedProfit,
    actual_profit: actualProfit,
    cost_variance: costVariance,
    actual_margin: contractValue ? actualProfit / contractValue : null,
    expense_count: expenses.length,
  };
}

function isMissingExpenseTableError(error) {
  return error?.code === '42P01' || error?.message?.includes('project_expenses');
}

async function getExpenseSummariesByProjectIds(projectIds, context = {}) {
  if (!projectIds.length) return new Map();

  const query = scopeToUser(supabase
    .from('project_expenses')
    .select('id, project_id, category, description, amount, expense_date, vendor, created_by, created_at, updated_at')
    .in('project_id', projectIds), context)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (isMissingExpenseTableError(error)) return new Map();
  if (error) throw error;

  const summaries = new Map();
  for (const expense of data || []) {
    const current = summaries.get(expense.project_id) || { actualCost: 0, expenseCount: 0, latestExpense: null };
    current.actualCost += toNumber(expense.amount);
    current.expenseCount += 1;
    if (!current.latestExpense) current.latestExpense = expense;
    summaries.set(expense.project_id, current);
  }

  return summaries;
}

function attachProjectFinancials(project, expenses = []) {
  return {
    ...project,
    expenses,
    financials: buildProjectFinancials(project, expenses),
  };
}

function normalizeExpensePayload(expenseData = {}, { isUpdate = false } = {}) {
  const payload = {};

  for (const field of EXPENSE_FIELDS) {
    if (expenseData[field] !== undefined) {
      payload[field] = expenseData[field];
    }
  }

  if (typeof payload.category === 'string') {
    payload.category = payload.category.trim().toLowerCase();
  }

  if (typeof payload.description === 'string') {
    payload.description = payload.description.trim();
  }

  if (typeof payload.vendor === 'string') {
    payload.vendor = payload.vendor.trim();
  }

  if (!isUpdate || payload.category !== undefined) {
    if (!payload.category || !EXPENSE_CATEGORIES.has(payload.category)) {
      throw new ValidationError('Expense category is required and must be valid');
    }
  }

  if (!isUpdate || payload.description !== undefined) {
    if (!payload.description) {
      throw new ValidationError('Expense description is required');
    }
  }

  if (!isUpdate || payload.amount !== undefined) {
    const amount = Number(payload.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new ValidationError('Expense amount must be greater than 0');
    }
    payload.amount = amount;
  }

  if (isUpdate && Object.keys(payload).length === 0) {
    throw new ValidationError('No valid expense fields provided');
  }

  return payload;
}

/**
 * Get all projects with optional filters
 */
async function getProjects(filters = {}, context = {}) {
  let query = scopeToUser(supabase.from('projects').select(`
    *,
    client:clients (*)
  `), context);

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  const summaries = await getExpenseSummariesByProjectIds((data || []).map((project) => project.id), context);

  return (data || []).map((project) => {
    const summary = summaries.get(project.id) || { actualCost: 0, expenseCount: 0, latestExpense: null };
    const expenses = summary.latestExpense
      ? [summary.latestExpense]
      : [];
    const financialExpenses = summary.expenseCount > 0
      ? [{ amount: summary.actualCost }]
      : [];

    return {
      ...project,
      expenses,
      financials: {
        ...buildProjectFinancials(project, financialExpenses),
        expense_count: summary.expenseCount,
      },
    };
  });
}

/**
 * Get a single project by ID
 */
async function getProjectById(id, context = {}) {
  const query = scopeToUser(supabase
    .from('projects')
    .select(`
      *,
      client:clients (*)
    `)
    .eq('id', id), context)
    .maybeSingle();

  const { data, error } = await query;

  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  if (!data) return null;

  const expenses = await getProjectExpenses(id, context);
  return attachProjectFinancials(data, expenses);
}

/**
 * Create a new project
 */
async function createProject(projectData, context = {}) {
  const payload = normalizeCreateProjectPayload(projectData, context);

  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select()
    .single();

  if (error?.code === '23503' && error.message?.includes('created_by')) {
    throw new ValidationError('Project created_by must reference an existing user');
  }

  if (error) throw error;
  return attachProjectFinancials(data);
}

/**
 * Update a project
 */
async function updateProject(id, projectData, context = {}) {
  const payload = normalizeUpdateProjectPayload(projectData);

  const query = scopeToUser(supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select(), context)
    .maybeSingle();

  const { data, error } = await query;

  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  if (!data) return null;
  const expenses = await getProjectExpenses(id, context);
  return attachProjectFinancials(data, expenses);
}

/**
 * Delete a project
 */
async function deleteProject(id, context = {}) {
  const query = scopeToUser(supabase.from('projects').delete().eq('id', id), context);
  const { error } = await query;
  if (error) throw error;
  return { success: true };
}

async function getProjectExpenses(projectId, context = {}) {
  const query = scopeToUser(supabase
    .from('project_expenses')
    .select('*')
    .eq('project_id', projectId), context)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (isMissingExpenseTableError(error)) return [];
  if (error) throw error;
  return data || [];
}

async function createProjectExpense(projectId, expenseData, context = {}) {
  const payload = normalizeExpensePayload(expenseData);
  const createdBy = resolveMvpOwnerId(context);

  if (!createdBy || !UUID_REGEX.test(createdBy)) {
    throw new ValidationError('Expense created_by cannot be resolved. Set FACADEFLOW_MVP_OWNER_ID to a valid user UUID.');
  }

  payload.project_id = projectId;
  payload.created_by = createdBy;

  const { data, error } = await supabase
    .from('project_expenses')
    .insert(payload)
    .select()
    .single();

  if (error?.code === '23503') {
    throw new ValidationError('Expense project_id or created_by must reference an existing record');
  }

  if (error) throw error;
  return data;
}

async function updateProjectExpense(projectId, expenseId, expenseData, context = {}) {
  const payload = normalizeExpensePayload(expenseData, { isUpdate: true });

  const query = scopeToUser(supabase
    .from('project_expenses')
    .update(payload)
    .eq('id', expenseId)
    .eq('project_id', projectId)
    .select(), context)
    .maybeSingle();

  const { data, error } = await query;

  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

async function deleteProjectExpense(projectId, expenseId, context = {}) {
  const query = scopeToUser(supabase
    .from('project_expenses')
    .delete()
    .eq('id', expenseId)
    .eq('project_id', projectId)
    .select('id'), context)
    .maybeSingle();

  const { data, error } = await query;

  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectExpenses,
  createProjectExpense,
  updateProjectExpense,
  deleteProjectExpense,
};
