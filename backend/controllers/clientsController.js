const clientsService = require('../services/clientsService');

const CLIENT_CREATE_FIELDS = ['name', 'email', 'phone', 'address', 'notes'];

function normalizeClientCreatePayload(body = {}) {
  return CLIENT_CREATE_FIELDS.reduce((payload, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      const value = body[field];
      payload[field] = typeof value === 'string' ? value.trim() : value;
    }
    return payload;
  }, {});
}

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
    const payload = normalizeClientCreatePayload(req.body);
    if (!payload.name || typeof payload.name !== 'string') {
      return res.status(400).json({ error: 'Client name is required' });
    }

    const client = await clientsService.createClient(payload);
    res.status(201).json({ data: client });
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ error: 'Failed to create client' });
  }
}

async function deleteClient(req, res) {
  try {
    const { id } = req.params;
    await clientsService.deleteClient(id);
    res.status(204).send(); // No Content
  } catch (err) {
    console.error('Error deleting client:', err);
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to delete client' });
  }
}


async function getClient(req, res) {
  try {
    const client = await clientsService.getClient(req.params.id);
    if (!client) return res.status(404).json({ error: 'Not found' });
    res.json({ data: client });
  } catch (err) {
    console.error('Error fetching client:', err);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
}

async function updateClient(req, res) {
  try {
    const client = await clientsService.updateClient(req.params.id, req.body);
    res.json({ data: client });
  } catch (err) {
    console.error('Error updating client:', err);
    res.status(500).json({ error: 'Failed to update client' });
  }
}
module.exports = {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
};
