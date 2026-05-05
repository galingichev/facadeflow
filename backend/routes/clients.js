const express = require('express');
const router = express.Router();
const {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} = require('../controllers/clientsController');

// GET /api/clients
router.get('/', listClients);

// POST /api/clients
router.post('/', createClient);

// GET /api/clients/:id
router.get('/:id', getClient);
// PATCH /api/clients/:id
router.patch('/:id', updateClient);
// DELETE /api/clients/:id
router.delete('/:id', deleteClient);

module.exports = router;
