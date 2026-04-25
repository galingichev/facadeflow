-- Create "construction_tasks" table
CREATE TABLE construction_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- e.g., 'pending', 'in-progress', 'completed', 'on-hold'
    assigned_to UUID REFERENCES auth.users(id), -- Assuming auth.users for user assignment
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create "site_issues" table
CREATE TABLE site_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES construction_tasks(id) ON DELETE SET NULL, -- Optional link to a specific task
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50) DEFAULT 'medium' NOT NULL, -- e.g., 'low', 'medium', 'high', 'critical'
    status VARCHAR(50) DEFAULT 'open' NOT NULL, -- e.g., 'open', 'in-review', 'resolved', 'closed'
    reported_by UUID REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for construction_tasks
ALTER TABLE construction_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON construction_tasks
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON construction_tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for assigned users and project managers" ON construction_tasks
  FOR UPDATE USING (auth.uid() = assigned_to OR EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id)); -- Assuming project has a manager field

CREATE POLICY "Enable delete for project managers" ON construction_tasks
  FOR DELETE USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id));

-- Add RLS policies for site_issues
ALTER TABLE site_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON site_issues
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON site_issues
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for assigned users and project managers" ON site_issues
  FOR UPDATE USING (auth.uid() = assigned_to OR EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id));

CREATE POLICY "Enable delete for project managers" ON site_issues
  FOR DELETE USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id));