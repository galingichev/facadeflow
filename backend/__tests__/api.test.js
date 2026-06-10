const request = require('supertest');

const mockGetUser = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

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
    delete process.env.FACADEFLOW_CORS_ORIGINS;
    delete process.env.FACADEFLOW_REQUIRE_AUTH;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
  });

  test('CORS preflight allows configured origins and rejects unlisted origins', async () => {
    process.env.FACADEFLOW_CORS_ORIGINS = 'https://demo.facadeflow.app, https://app.facadeflow.app';

    await request(app)
      .options('/api/clients')
      .set('Origin', 'https://demo.facadeflow.app')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204)
      .expect('Access-Control-Allow-Origin', 'https://demo.facadeflow.app');

    const rejected = await request(app)
      .options('/api/clients')
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'GET');

    expect(rejected.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('optional auth guard verifies bearer tokens when enabled and keeps health public', async () => {
    process.env.FACADEFLOW_REQUIRE_AUTH = 'tr' + 'ue';
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    clientsService.getClients.mockResolvedValue([]);

    await request(app).get('/api/system/health').expect(200);
    await request(app).get('/api/clients').expect(401).expect({ error: 'Missing bearer token' });
    await request(app)
      .get('/api/clients')
      .set('Authorization', 'Bearer demo-token')
      .expect(200)
      .expect({ data: [] });

    expect(mockGetUser).toHaveBeenCalledWith('demo-token');
  });

  test('optional auth guard rejects invalid bearer tokens', async () => {
    process.env.FACADEFLOW_REQUIRE_AUTH = 'tr' + 'ue';
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('invalid') });

    await request(app)
      .get('/api/clients')
      .set('Authorization', 'Bearer bad-token')
      .expect(401)
      .expect({ error: 'Invalid bearer token' });
  });

  test('optional auth guard fails closed when auth is enabled without Supabase credentials', async () => {
    process.env.FACADEFLOW_REQUIRE_AUTH = 'tr' + 'ue';

    await request(app)
      .get('/api/clients')
      .set('Authorization', 'Bearer demo-token')
      .expect(500)
      .expect({ error: 'Auth is enabled but Supabase auth is not configured' });
  });

  test('client create rejects empty names without calling the service', async () => {
    await request(app)
      .post('/api/clients')
      .send({ name: '   ' })
      .expect(400)
      .expect({ error: 'Client name is required' });

    expect(clientsService.createClient).not.toHaveBeenCalled();
  });

  test('client create trims allowed fields and ignores unexpected fields', async () => {
    const client = { id: 'client-1', name: 'ACME Facades' };
    clientsService.createClient.mockResolvedValue(client);

    await request(app)
      .post('/api/clients')
      .send({
        id: 'malicious-id',
        created_by: 'attacker',
        name: '  ACME Facades  ',
        email: ' test@example.com ',
        phone: ' +359 888 123 456 ',
        address: ' Site 1 ',
        notes: ' VIP ',
      })
      .expect(201)
      .expect({ data: client });

    expect(clientsService.createClient).toHaveBeenCalledWith({
      name: 'ACME Facades',
      email: 'test@example.com',
      phone: '+359 888 123 456',
      address: 'Site 1',
      notes: 'VIP',
    });
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
