const clientsService = require('../services/clientsService');

async function listClients(req, res) {
  try {
    const clients = await clientsService.getClients();
    res.json({ data: clients });
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
}

async function createClient(req, res) {
  try {
    const client = await clientsService.createClient(req.body);
    res.status(201).json({ data: client });
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ error: 'Failed to create client' });
  }
}

module.exports = {
  listClients,
  createClient,
};
