const { createClient: supabaseCreateClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseCreateClient(supabaseUrl, supabaseKey);

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

  if (error) throw error;
  return data;
}

/**
 * Create a new project
 */
async function createProject(projectData, createdBy) {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...projectData,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a project
 */
async function updateProject(id, projectData) {
  const { data, error } = await supabase
    .from('projects')
    .update(projectData)
    .eq('id', id)
    .select()
    .single();

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