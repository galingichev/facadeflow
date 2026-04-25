const express = require('express');
const router = express.Router();
const {
  listClients,
  createClient,
  deleteClient,
} = require('../controllers/clientsController');

// GET /api/clients
router.get('/', listClients);

// POST /api/clients
router.post('/', createClient);

// DELETE /api/clients/:id
router.delete('/:id', deleteClient);

module.exports = router;
