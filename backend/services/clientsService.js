const { createClient: supabaseCreateClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseCreateClient(supabaseUrl, supabaseKey);

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
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId);
  if (error) throw error;
  return true;
}

module.exports = {
  getClients,
  createClient,
  deleteClient,
};