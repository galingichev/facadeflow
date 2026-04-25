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
    // For MVP, use a fixed user ID or extract from auth later
    const createdBy = req.body.created_by || 'f1b66f89-4a07-43a7-aa39-1034f41845ff';
    const project = await projectsService.createProject(req.body, createdBy);
    res.status(201).json({ data: project });
  } catch (err) {
    console.error('Error creating project:', err);
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
