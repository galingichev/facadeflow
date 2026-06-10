const { createClient: supabaseCreateClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseCreateClient(supabaseUrl, supabaseKey);

function scopeToUser(query, context = {}) {
  return context.userId ? query.eq('created_by', context.userId) : query;
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

async function getClients(context = {}) {
  const query = scopeToUser(supabase
    .from('clients')
    .select('*'), context)
    .order('name', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function createClient(clientData, context = {}) {
  const payload = context.userId
    ? { ...clientData, created_by: context.userId }
    : clientData;

  const { data, error } = await supabase
    .from('clients')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteClient(clientId, context = {}) {
  const projectCountQuery = scopeToUser(supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId), context);

  const { count, error: countError } = await projectCountQuery;

  if (countError) throw countError;

  if ((count || 0) > 0) {
    throw new ConflictError('This client has projects and cannot be deleted. Move or delete the projects first.');
  }

  const deleteQuery = scopeToUser(supabase
    .from('clients')
    .delete()
    .eq('id', clientId), context);

  const { error } = await deleteQuery;
  if (error) throw error;
  return true;
}


async function getClient(clientId, context = {}) {
  const query = scopeToUser(supabase
    .from('clients')
    .select('*')
    .eq('id', clientId), context)
    .single();

  const { data, error } = await query;
  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

async function updateClient(clientId, clientData, context = {}) {
  const query = scopeToUser(supabase
    .from('clients')
    .update(clientData)
    .eq('id', clientId)
    .select(), context)
    .single();

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
};
