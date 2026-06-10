const projectsService = require('../services/projectsService');

function getRequestContext(req) {
  return req.authUser?.id ? { userId: req.authUser.id } : {};
}

async function listProjects(req, res) {
  try {
    const projects = await projectsService.getProjects(req.query, getRequestContext(req));
    res.json({ data: projects });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

async function getProject(req, res) {
  try {
    const project = await projectsService.getProjectById(req.params.id, getRequestContext(req));
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json({ data: project });
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

async function createProject(req, res) {
  try {
    const project = await projectsService.createProject(req.body, getRequestContext(req));
    res.status(201).json({ data: project });
  } catch (err) {
    console.error('Error creating project:', err);
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to create project' });
  }
}

async function updateProject(req, res) {
  try {
    const project = await projectsService.updateProject(req.params.id, req.body, getRequestContext(req));
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json({ data: project });
  } catch (err) {
    console.error('Error updating project:', err);
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to update project' });
  }
}

async function deleteProject(req, res) {
  try {
    await projectsService.deleteProject(req.params.id, getRequestContext(req));
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
}

async function listProjectExpenses(req, res) {
  try {
    const expenses = await projectsService.getProjectExpenses(req.params.id, getRequestContext(req));
    res.json({ data: expenses });
  } catch (err) {
    console.error('Error fetching project expenses:', err);
    res.status(500).json({ error: 'Failed to fetch project expenses' });
  }
}

async function createProjectExpenseHandler(req, res) {
  try {
    const expense = await projectsService.createProjectExpense(req.params.id, req.body, getRequestContext(req));
    res.status(201).json({ data: expense });
  } catch (err) {
    console.error('Error creating project expense:', err);
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to create project expense' });
  }
}

async function updateProjectExpenseHandler(req, res) {
  try {
    const expense = await projectsService.updateProjectExpense(req.params.id, req.params.expenseId, req.body, getRequestContext(req));
    if (!expense) return res.status(404).json({ error: 'Not found' });
    res.json({ data: expense });
  } catch (err) {
    console.error('Error updating project expense:', err);
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to update project expense' });
  }
}

async function deleteProjectExpenseHandler(req, res) {
  try {
    const expense = await projectsService.deleteProjectExpense(req.params.id, req.params.expenseId, getRequestContext(req));
    if (!expense) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting project expense:', err);
    res.status(500).json({ error: 'Failed to delete project expense' });
  }
}

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  listProjectExpenses,
  createProjectExpenseHandler,
  updateProjectExpenseHandler,
  deleteProjectExpenseHandler,
};
