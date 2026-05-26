const { createClient: supabaseCreateClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseCreateClient(supabaseUrl, supabaseKey);

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

async function createClient(clientData) {
  const { data, error } = await supabase
    .from('clients')
    .insert(clientData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteClient(clientId) {
  const { count, error: countError } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId);

  if (countError) throw countError;

  if ((count || 0) > 0) {
    throw new ConflictError('This client has projects and cannot be deleted. Move or delete the projects first.');
  }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId);
  if (error) throw error;
  return true;
}


async function getClient(clientId) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();
  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

async function updateClient(clientId, clientData) {
  const { data, error } = await supabase
    .from('clients')
    .update(clientData)
    .eq('id', clientId)
    .select()
    .single();
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
