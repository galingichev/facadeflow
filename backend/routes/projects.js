const express = require('express');
const router = express.Router();
const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectsController');

// GET /api/projects
router.get('/', listProjects);

// GET /api/projects/:id
router.get('/:id', getProject);

// POST /api/projects
router.post('/', createProject);

// PUT /api/projects/:id
router.patch('/:id', updateProject);

// DELETE /api/projects/:id
router.delete('/:id', deleteProject);

module.exports = router;
