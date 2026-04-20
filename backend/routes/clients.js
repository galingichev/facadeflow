const express = require('express');
const router = express.Router();
const {
  listClients,
  createClient,
} = require('../controllers/clientsController');

// GET /api/clients
router.get('/', listClients);

// POST /api/clients
router.post('/', createClient);

module.exports = router;
