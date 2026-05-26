const express = require('express');
const router = express.Router();
const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  listProjectExpenses,
  createProjectExpenseHandler,
  updateProjectExpenseHandler,
  deleteProjectExpenseHandler,
} = require('../controllers/projectsController');

// GET /api/projects
router.get('/', listProjects);

// GET /api/projects/:id
router.get('/:id', getProject);

// POST /api/projects
router.post('/', createProject);

// PATCH /api/projects/:id
router.patch('/:id', updateProject);

// PUT /api/projects/:id
router.put('/:id', updateProject);

// DELETE /api/projects/:id
router.delete('/:id', deleteProject);

// GET /api/projects/:id/expenses
router.get('/:id/expenses', listProjectExpenses);

// POST /api/projects/:id/expenses
router.post('/:id/expenses', createProjectExpenseHandler);

// PATCH /api/projects/:id/expenses/:expenseId
router.patch('/:id/expenses/:expenseId', updateProjectExpenseHandler);

// DELETE /api/projects/:id/expenses/:expenseId
router.delete('/:id/expenses/:expenseId', deleteProjectExpenseHandler);

module.exports = router;
