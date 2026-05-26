-- FacadeFlow Database Schema
-- PostgreSQL 15+ (Supabase)
-- Run this migration to create all tables, indexes, and RLS policies

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE project_status AS ENUM (
  'draft',
  'inquired',
  'quoted',
  'approved',
  'in_progress',
  'on_hold',
  'completed',
  'cancelled'
);

CREATE TYPE estimate_status AS ENUM (
  'draft',
  'sent',
  'accepted',
  'rejected',
  'expired'
);

CREATE TYPE task_status AS ENUM (
  'todo',
  'in_progress',
  'review',
  'done'
);

CREATE TYPE task_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE user_role AS ENUM (
  'admin',
  'estimator',
  'field_technician',
  'project_manager',
  'viewer'
);

CREATE TYPE photo_type AS ENUM (
  'before',
  'during',
  'after',
  'damage',
  'detail'
);

CREATE TYPE annotation_type AS ENUM (
  'arrow',
  'circle',
  'text',
  'highlight'
);

-- ============================================
-- USERS (Profile extension for Supabase Auth)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  role user_role DEFAULT 'viewer',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- CLIENTS
-- ============================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  address JSONB, -- {street, city, state, country, zip, latitude, longitude}
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_name ON clients USING gin(to_tsvector('english', name));
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_company ON clients(company);
CREATE INDEX idx_clients_created_by ON clients(created_by);

-- ============================================
-- PROJECTS
-- ============================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  address JSONB NOT NULL, -- {street, city, state, country, zip, latitude, longitude}
  status project_status DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  budget NUMERIC(12, 2),
  estimated_hours NUMERIC(6, 2),
  actual_hours NUMERIC(6, 2),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_name ON projects USING gin(to_tsvector('english', name));

-- ============================================
-- ESTIMATES
-- ============================================

CREATE TABLE IF NOT EXISTS estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  number TEXT UNIQUE NOT NULL, -- e.g., EST-2025-001
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 4) NOT NULL DEFAULT 0, -- 0.0875 = 8.75%
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status estimate_status DEFAULT 'draft',
  notes TEXT,
  terms TEXT,
  valid_until DATE,
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_estimates_project_id ON estimates(project_id);
CREATE INDEX idx_estimates_number ON estimates(number);
CREATE INDEX idx_estimates_status ON estimates(status);
CREATE INDEX idx_estimates_created_by ON estimates(created_by);

-- ============================================
-- ESTIMATE ITEMS (Line items)
-- ============================================

CREATE TABLE IF NOT EXISTS estimate_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'each', -- each, sqft, hour, lf, etc.
  total NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  category TEXT CHECK (category IN ('material', 'labor', 'overhead', 'other')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_estimate_items_estimate_id ON estimate_items(estimate_id);
CREATE INDEX idx_estimate_items_category ON estimate_items(category);

-- ============================================
-- TASKS
-- ============================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  external_id TEXT, -- For GitHub issues, etc.
  external_source TEXT, -- 'github', 'email', etc.
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);

-- ============================================
-- PROJECT PHOTOS
-- ============================================

CREATE TABLE IF NOT EXISTS project_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  type photo_type DEFAULT 'during',
  caption TEXT,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  analysis JSONB, -- Store AI analysis results
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_photos_project_id ON project_photos(project_id);
CREATE INDEX idx_project_photos_type ON project_photos(type);
CREATE INDEX idx_project_photos_created_at ON project_photos(created_at DESC);

-- ============================================
-- PHOTO ANNOTATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS photo_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES project_photos(id) ON DELETE CASCADE,
  type annotation_type NOT NULL,
  -- Coordinates are stored as normalized 0-1 values relative to image dimensions
  x NUMERIC(4, 3) NOT NULL,
  y NUMERIC(4, 3) NOT NULL,
  width NUMERIC(4, 3),
  height NUMERIC(4, 3),
  text TEXT,
  color TEXT NOT NULL DEFAULT '#ff0000',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photo_annotations_photo_id ON photo_annotations(photo_id);

-- ============================================
-- VOICE NOTES
-- ============================================

CREATE TABLE IF NOT EXISTS voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  transcript TEXT,
  transcript_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_notes_project_id ON voice_notes(project_id);
CREATE INDEX idx_voice_notes_task_id ON voice_notes(task_id);
CREATE INDEX idx_voice_notes_created_at ON voice_notes(created_at DESC);

-- ============================================
-- SUPPLIERS
-- ============================================

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suppliers_name ON suppliers USING gin(to_tsvector('english', name));
CREATE INDEX idx_suppliers_email ON suppliers(email);

-- ============================================
-- INVENTORY ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'each',
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
  reorder_threshold NUMERIC(10, 2),
  cost_per_unit NUMERIC(10, 4),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_supplier_id ON inventory_items(supplier_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_estimates_updated_at BEFORE UPDATE ON estimates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_project_photos_updated_at BEFORE UPDATE ON project_photos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_voice_notes_updated_at BEFORE UPDATE ON voice_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate estimate number automatically
CREATE OR REPLACE FUNCTION generate_estimate_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.number IS NULL THEN
    NEW.number := 'EST-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' ||
                  LPAD((
                    SELECT COUNT(*) + 1
                    FROM estimates
                    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
                  )::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_estimate_number BEFORE INSERT ON estimates FOR EACH ROW EXECUTE FUNCTION generate_estimate_number();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Policies
-- Allow authenticated users to read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Clients: users can read all clients, but only create/update/delete if they have write access
CREATE POLICY "Authenticated users can view clients" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create clients" ON clients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update clients they created" ON clients
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete clients they created" ON clients
  FOR DELETE USING (auth.uid() = created_by);

-- Projects
CREATE POLICY "Authenticated users can view projects" ON projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "Users can update projects they created" ON projects
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete projects they created" ON projects
  FOR DELETE USING (auth.uid() = created_by);

-- Estimates (readable by all authenticated, edit by creator or admin)
CREATE POLICY "Authenticated users can view estimates" ON estimates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create estimates" ON estimates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "Users can update estimates they created" ON estimates
  FOR UPDATE USING (auth.uid() = created_by);

-- Estimate items cascade with estimates
CREATE POLICY "Authenticated users can view estimate items" ON estimate_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- Tasks
CREATE POLICY "Authenticated users can view tasks" ON tasks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update tasks" ON tasks
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete tasks" ON tasks
  FOR DELETE USING (auth.role() = 'authenticated');

-- Project photos
CREATE POLICY "Authenticated users can view project photos" ON project_photos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can upload photos" ON project_photos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update photos they uploaded" ON project_photos
  FOR UPDATE USING (auth.uid() = created_by);

-- Photo annotations
CREATE POLICY "Authenticated users can view annotations" ON photo_annotations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create annotations" ON photo_annotations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Voice notes
CREATE POLICY "Authenticated users can view voice notes" ON voice_notes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create voice notes" ON voice_notes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Inventory (all authenticated can read, admins can write)
CREATE POLICY "Authenticated users can view inventory" ON inventory_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage inventory" ON inventory_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Suppliers
CREATE POLICY "Authenticated users can view suppliers" ON suppliers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage suppliers" ON suppliers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS FOR REPORTS
-- ============================================

-- Get daily brief data
CREATE OR REPLACE FUNCTION get_daily_brief(p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'date', p_date,
    'summary', json_build_object(
      'active_projects', (SELECT COUNT(*) FROM projects WHERE status = 'in_progress'),
      'overdue_tasks', (SELECT COUNT(*) FROM tasks WHERE status != 'done' AND due_date < p_date),
      'today_appointments', 0, -- Placeholder for appointments table
      'estimates_sent_this_week', (
        SELECT COUNT(*) FROM estimates
        WHERE status = 'sent' AND sent_at >= p_date - INTERVAL '7 days'
      ),
      'revenue_pipeline', (
        SELECT COALESCE(SUM(total), 0) FROM estimates
        WHERE status IN ('sent', 'accepted') AND created_at >= p_date - INTERVAL '30 days'
      )
    ),
    'items', (
      SELECT json_agg(
        json_build_object(
          'type', 'task',
          'id', t.id,
          'title', t.title,
          'description', t.description,
          'due_date', t.due_date,
          'priority', t.priority
        )
      ) FROM tasks t
      WHERE t.status != 'done' AND t.due_date <= (p_date + INTERVAL '3 days')
      ORDER BY t.due_date ASC
      LIMIT 10
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'User profiles extending Supabase Auth';
COMMENT ON TABLE clients IS 'Customer/client information';
COMMENT ON TABLE projects IS 'Main project data';
COMMENT ON TABLE estimates IS 'Quotes and proposals';
COMMENT ON TABLE estimate_items IS 'Line items within estimates';
COMMENT ON TABLE tasks IS 'Project tasks and todos';
COMMENT ON TABLE project_photos IS 'Photos attached to projects';
COMMENT ON TABLE photo_annotations IS 'Drawing/text overlays on photos';
COMMENT ON TABLE voice_notes IS 'Recorded voice memos with transcripts';
COMMENT ON TABLE inventory_items IS 'Materials and equipment inventory';
COMMENT ON TABLE suppliers IS 'Vendor and supplier information';
