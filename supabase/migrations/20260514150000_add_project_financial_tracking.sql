-- Add Phase 1 MVP project profit tracking fields.

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS contract_value NUMERIC(12, 2);

CREATE TABLE IF NOT EXISTS project_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'materials',
    'labor',
    'subcontractor',
    'equipment',
    'transport',
    'permits',
    'overhead',
    'other'
  )),
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_expenses_project_id ON project_expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_project_expenses_category ON project_expenses(category);
CREATE INDEX IF NOT EXISTS idx_project_expenses_date ON project_expenses(expense_date);

CREATE TRIGGER update_project_expenses_updated_at
BEFORE UPDATE ON project_expenses
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE project_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view project expenses" ON project_expenses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create project expenses" ON project_expenses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update expenses they created" ON project_expenses
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete expenses they created" ON project_expenses
  FOR DELETE USING (auth.uid() = created_by);
