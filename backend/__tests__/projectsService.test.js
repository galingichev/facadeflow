const mockFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
  })),
}));

function createQuery(data = [], error = null) {
  return {
    data,
    error,
    select: jest.fn(function select() { return this; }),
    in: jest.fn(function filterIn() { return this; }),
    eq: jest.fn(function filterEq() { return this; }),
    order: jest.fn(function order() { return this; }),
    maybeSingle: jest.fn(function maybeSingle() { return this; }),
    single: jest.fn(function single() { return this; }),
    insert: jest.fn(function insert() { return this; }),
    update: jest.fn(function update() { return this; }),
    delete: jest.fn(function deleteRow() { return this; }),
  };
}

describe('projectsService', () => {
  beforeEach(() => {
    jest.resetModules();
    mockFrom.mockReset();
  });

  test('getProjects hydrates the latest expense while keeping aggregate financial totals', async () => {
    const projectsQuery = createQuery([
      {
        id: 'project-1',
        name: 'Client Demo: Plovdiv Hotel Rainscreen',
        contract_value: 118000,
        budget: 83500,
        status: 'in_progress',
      },
      {
        id: 'project-2',
        name: 'Client Demo: Boyana Villa Curtain Wall',
        contract_value: 28000,
        budget: 18400,
        status: 'inquired',
      },
    ]);
    const expensesQuery = createQuery([
      {
        id: 'expense-3',
        project_id: 'project-1',
        category: 'transport',
        description: 'Scaffold and panel delivery',
        amount: 1450,
        expense_date: '2026-05-30',
        vendor: 'TransBuild Logistics',
        created_at: '2026-05-30T10:00:00.000Z',
        updated_at: '2026-05-30T10:00:00.000Z',
      },
      {
        id: 'expense-2',
        project_id: 'project-1',
        category: 'labor',
        description: 'Installation crew week 1',
        amount: 9200,
        expense_date: '2026-05-29',
        vendor: 'Facade Team 2',
        created_at: '2026-05-29T10:00:00.000Z',
        updated_at: '2026-05-29T10:00:00.000Z',
      },
      {
        id: 'expense-1',
        project_id: 'project-1',
        category: 'materials',
        description: 'Aluminium composite panels deposit',
        amount: 18600,
        expense_date: '2026-05-24',
        vendor: 'AluPanel BG',
        created_at: '2026-05-24T10:00:00.000Z',
        updated_at: '2026-05-24T10:00:00.000Z',
      },
    ]);
    mockFrom.mockImplementation((table) => {
      if (table === 'projects') return projectsQuery;
      if (table === 'project_expenses') return expensesQuery;
      throw new Error(`Unexpected table: ${table}`);
    });

    const projectsService = require('../services/projectsService');
    const projects = await projectsService.getProjects();

    expect(projects[0].expenses).toEqual([expensesQuery.data[0]]);
    expect(projects[0].financials).toMatchObject({
      actual_cost: 29250,
      expense_count: 3,
      actual_profit: 88750,
    });
    expect(projects[1].expenses).toEqual([]);
    expect(projects[1].financials).toMatchObject({
      actual_cost: 0,
      expense_count: 0,
      actual_profit: 28000,
    });
  });
});
