const projectsService = require('../services/projectsService');

async function listProjects(req, res) {
  try {
    const projects = await projectsService.getProjects(req.query);
    res.json({ data: projects });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

async function getProject(req, res) {
  try {
    const project = await projectsService.getProjectById(req.params.id);
    res.json({ data: project });
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

async function createProject(req, res) {
  try {
    const project = await projectsService.createProject(req.body);
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
    const project = await projectsService.updateProject(req.params.id, req.body);
    res.json({ data: project });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
}

async function deleteProject(req, res) {
  try {
    await projectsService.deleteProject(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
}

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
