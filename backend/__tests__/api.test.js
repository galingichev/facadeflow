const request = require('supertest');

jest.mock('../services/clientsService', () => ({
  getClients: jest.fn(),
  getClient: jest.fn(),
  createClient: jest.fn(),
  updateClient: jest.fn(),
  deleteClient: jest.fn(),
}));

jest.mock('../services/projectsService', () => ({
  getProjects: jest.fn(),
  getProjectById: jest.fn(),
  createProject: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
  getProjectExpenses: jest.fn(),
  createProjectExpense: jest.fn(),
  updateProjectExpense: jest.fn(),
  deleteProjectExpense: jest.fn(),
}));

const clientsService = require('../services/clientsService');
const projectsService = require('../services/projectsService');
const app = require('../server');

describe('FacadeFlow backend API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('clients CRUD endpoints return wrapped data and expected status codes', async () => {
    const client = { id: 'client-1', name: 'ACME Facades' };
    clientsService.getClients.mockResolvedValue([client]);
    clientsService.getClient.mockResolvedValue(client);
    clientsService.createClient.mockResolvedValue(client);
    clientsService.updateClient.mockResolvedValue({ ...client, name: 'ACME Updated' });
    clientsService.deleteClient.mockResolvedValue(true);

    await request(app).get('/api/clients').expect(200).expect({ data: [client] });
    await request(app).get('/api/clients/client-1').expect(200).expect({ data: client });
    await request(app).post('/api/clients').send({ name: 'ACME Facades' }).expect(201).expect({ data: client });
    await request(app).patch('/api/clients/client-1').send({ name: 'ACME Updated' }).expect(200).expect({ data: { ...client, name: 'ACME Updated' } });
    await request(app).delete('/api/clients/client-1').expect(204);

    expect(clientsService.createClient).toHaveBeenCalledWith({ name: 'ACME Facades' });
    expect(clientsService.updateClient).toHaveBeenCalledWith('client-1', { name: 'ACME Updated' });
    expect(clientsService.deleteClient).toHaveBeenCalledWith('client-1');
  });

  test('projects CRUD endpoints return wrapped data and expected status codes', async () => {
    const project = { id: 'project-1', client_id: 'client-1', name: 'Main Elevation' };
    projectsService.getProjects.mockResolvedValue([project]);
    projectsService.getProjectById.mockResolvedValue(project);
    projectsService.createProject.mockResolvedValue(project);
    projectsService.updateProject.mockResolvedValue({ ...project, status: 'in_progress' });
    projectsService.deleteProject.mockResolvedValue({ success: true });

    await request(app).get('/api/projects').expect(200).expect({ data: [project] });
    await request(app).get('/api/projects/project-1').expect(200).expect({ data: project });
    await request(app).post('/api/projects').send({ name: 'Main Elevation', client_id: 'client-1' }).expect(201).expect({ data: project });
    await request(app).patch('/api/projects/project-1').send({ status: 'in_progress' }).expect(200).expect({ data: { ...project, status: 'in_progress' } });
    await request(app).delete('/api/projects/project-1').expect(204);

    expect(projectsService.createProject).toHaveBeenCalledWith({ name: 'Main Elevation', client_id: 'client-1' });
    expect(projectsService.updateProject).toHaveBeenCalledWith('project-1', { status: 'in_progress' });
    expect(projectsService.deleteProject).toHaveBeenCalledWith('project-1');
  });

  test('project expense endpoints support list, create, update, and delete', async () => {
    const expense = { id: 'expense-1', project_id: 'project-1', category: 'materials', amount: 125 };
    projectsService.getProjectExpenses.mockResolvedValue([expense]);
    projectsService.createProjectExpense.mockResolvedValue(expense);
    projectsService.updateProjectExpense.mockResolvedValue({ ...expense, amount: 150 });
    projectsService.deleteProjectExpense.mockResolvedValue({ id: 'expense-1' });

    await request(app).get('/api/projects/project-1/expenses').expect(200).expect({ data: [expense] });
    await request(app).post('/api/projects/project-1/expenses').send({ category: 'materials', amount: 125 }).expect(201).expect({ data: expense });
    await request(app).patch('/api/projects/project-1/expenses/expense-1').send({ amount: 150 }).expect(200).expect({ data: { ...expense, amount: 150 } });
    await request(app).delete('/api/projects/project-1/expenses/expense-1').expect(204);

    expect(projectsService.createProjectExpense).toHaveBeenCalledWith('project-1', { category: 'materials', amount: 125 });
    expect(projectsService.updateProjectExpense).toHaveBeenCalledWith('project-1', 'expense-1', { amount: 150 });
    expect(projectsService.deleteProjectExpense).toHaveBeenCalledWith('project-1', 'expense-1');
  });
});
