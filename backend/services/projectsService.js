const { createClient: supabaseCreateClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseCreateClient(supabaseUrl, supabaseKey);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  'start_date',
  'end_date',
  'budget',
  'estimated_hours',
  'actual_hours',
];

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

function resolveMvpOwnerId() {
  return process.env.FACADEFLOW_MVP_OWNER_ID || process.env.MVP_OWNER_ID || process.env.PROJECTS_CREATED_BY;
}

function normalizeCreateProjectPayload(projectData = {}) {
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

  if (!payload.address) {
    payload.address = DEFAULT_PROJECT_ADDRESS;
  }

  const createdBy = resolveMvpOwnerId();
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

  if (Object.keys(payload).length === 0) {
    throw new ValidationError('No valid project fields provided');
  }

  return payload;
}

/**
 * Get all projects with optional filters
 */
async function getProjects(filters = {}) {
  let query = supabase.from('projects').select(`
    *,
    client:clients (*)
  `);

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/**
 * Get a single project by ID
 */
async function getProjectById(id) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients (*)
    `)
    .eq('id', id)
    .single();

  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

/**
 * Create a new project
 */
async function createProject(projectData) {
  const payload = normalizeCreateProjectPayload(projectData);

  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select()
    .single();

  if (error?.code === '23503' && error.message?.includes('created_by')) {
    throw new ValidationError('Project created_by must reference an existing user');
  }

  if (error) throw error;
  return data;
}

/**
 * Update a project
 */
async function updateProject(id, projectData) {
  const payload = normalizeUpdateProjectPayload(projectData);

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

/**
 * Delete a project
 */
async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
  return { success: true };
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
