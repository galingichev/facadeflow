-- FacadeFlow Seed Data
-- This script inserts sample data for development and testing

-- IMPORTANT: Run this AFTER the main migration (001_initial_schema.sql)
-- Make sure RLS is DISABLED during seeding, or use admin privileges

-- ============================================
-- SAMPLE USERS (local/demo only; replace with your own auth users)
-- Note: These users must exist in auth.users first (via Supabase UI or signup)
-- The IDs here are placeholders - replace with actual auth.user IDs
-- ============================================

INSERT INTO users (id, name, email, role) VALUES
  ('f1b66f89-4a07-43a7-aa39-1034f41845ff', 'Demo Admin', 'demo.admin@example.com', 'admin')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- ============================================
-- SAMPLE CLIENTS
-- ============================================

INSERT INTO clients (id, name, email, phone, company, address, notes) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Acme Construction Co.',
    'john@acmeconstruction.com',
    '+1-555-0101',
    'Acme Construction',
    '{"street": "123 Main St", "city": "Springfield", "state": "IL", "country": "USA", "zip": "62701"}',
    'Prefers email communication. Large volume contractor. Always pays on time.'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Sarah Johnson',
    'sarah.j@email.com',
    '+1-555-0102',
    NULL,
    '{"street": "456 Oak Avenue", "city": "Springfield", "state": "IL", "country": "USA", "zip": "62702"}',
    'Homeowner. Very detail-oriented. Wants multiple quotes before deciding.'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Metro Property Management',
    'repairs@metroprop.com',
    '+1-555-0103',
    'Metro Property Management',
    '{"street": "789 Corporate Blvd", "city": "Springfield", "state": "IL", "country": "USA", "zip": "62703"}',
    'Manages 50+ units. Quick turnarounds needed. Emergency repairs common.'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE PROJECTS
-- ============================================

INSERT INTO projects (id, client_id, name, description, address, status, start_date, end_date, budget, estimated_hours, created_by) VALUES
  (
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'Acme Office Building Window Retrofit',
    'Replace all 50 windows in 3-story office building with energy-efficient Double Pane units. Includes removing existing aluminum frames and installing new vinyl. Phased work on weekends to minimize disruption.',
    '{"street": "123 Main St", "city": "Springfield", "state": "IL", "country": "USA", "zip": "62701", "latitude": 39.7817, "longitude": -89.6501}',
    'in_progress',
    '2025-03-01',
    '2025-03-25',
    45000.00,
    120.00,
    'f1b66f89-4a07-43a7-aa39-1034f41845ff' -- admin user
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'Sarah''s Kitchen Bay Window',
    'Install custom bay window in kitchen. Customer wants view of garden. Requires minor framing modifications. Lead time on glass is 2 weeks.',
    '{"street": "456 Oak Avenue", "city": "Springfield", "state": "IL", "country": "USA", "zip": "62702"}',
    'quoted',
    NULL,
    NULL,
    3500.00,
    8.00,
    'f1b66f89-4a07-43a7-aa39-1034f41845ff'
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    '33333333-3333-3333-3333-333333333333',
    'Metro Property - Building A Facade Repair',
    'Repair cracked stucco and reseal all window perimeters on 2nd floor. Pressure wash entire section before work begins. Must match existing color exactly.',
    '{"street": "101 Metro Plaza", "city": "Springfield", "state": "IL", "country": "USA", "zip": "62704"}',
    'completed',
    '2025-02-01',
    '2025-02-14',
    12000.00,
    40.00,
    'f1b66f89-4a07-43a7-aa39-1034f41845ff'
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    '11111111-1111-1111-1111-111111111111',
    'Acme Warehouse Door Installation',
    'Install 3 overhead roll-up doors for warehouse bay. Includes removal of old sliding doors and new tracks. Electrical work for automatic openers.',
    '{"street": "200 Industrial Way", "city": "Springfield", "state": "IL", "country": "USA", "zip": "62705"}',
    'draft',
    NULL,
    NULL,
    18500.00,
    32.00,
    'f1b66f89-4a07-43a7-aa39-1034f41845ff'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE TASKS
-- ============================================

INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, due_date, estimated_minutes, created_by) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '44444444-4444-4444-4444-444444444444',
    'Order window materials',
    'Order 50 double-pane vinyl windows from supplier. Confirm lead time of 2 weeks. Request sample color chips.',
    'done',
    'high',
    'f1b66f89-4a07-43a7-aa39-1034f41845ff',
    '2025-03-05',
    30,
    'f1b66f89-4a07-43a7-aa39-1034f41845ff'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '44444444-4444-4444-4444-444444444444',
    'Schedule building access with property manager',
    'Need key fob for weekend work. Call John at Acme to arrange delivery. Also need parking permits for crew truck.',
    'todo',
    'medium',
    'f1b66f89-4a07-43a7-aa39-1034f41845ff',
    '2025-03-18',
    15,
    'f1b66f89-4a07-43a7-aa39-1034f41845ff'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '55555555-5555-5555-5555-555555555555',
    'Measure bay window opening',
    'Field visit to confirm exact dimensions before ordering custom window. Check square of opening and note any abnormalities.',
    'in_progress',
    'high',
    'f1b66f89-4a07-43a7-aa39-1034f41845ff',
    '2025-03-19',
    60,
    'f1b66f89-4a07-43a7-aa39-1034f41845ff'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '66666666-6666-6666-6666-666666666666',
    'Clean up site and final walkthrough',
    'Remove all debris, pressure wash building facade again, get client sign-off on completed work. Final invoice.',
    'done',
    'medium',
    'f1b66f89-4a07-43a7-aa39-1034f41845ff',
    '2025-02-14',
    120,
    'f1b66f89-4a07-43a7-aa39-1034f41845ff'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '44444444-4444-4444-4444-444444444444',
    'Finalize project plan with client',
    'Review scope, confirm finish date, discuss material selections. Get signed contract.',
    'todo',
    'urgent',
    'f1b66f89-4a07-43a7-aa39-1034f41845ff',
    '2025-03-20',
    90,
    'f1b66f89-4a07-43a7-aa39-1034f41845ff'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE ESTIMATES WITH ITEMS
-- ============================================

-- Sarah''s Kitchen Bay Window Estimate (Draft)
INSERT INTO estimates (id, project_id, number, subtotal, tax_rate, tax_amount, status, notes, terms, created_by) VALUES
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    '55555555-5555-5555-5555-555555555555',
    'EST-2025-042',
    3950.00,
    0.0875,
    345.62,
    'draft',
    'Price valid for 30 days. Includes cleanup. Lead time 2 weeks.',
    '50% deposit required before work begins. Balance due upon completion.',
    'f1b66f89-4a07-43a7-aa39-1034f41845ff'
  );

INSERT INTO estimate_items (id, estimate_id, description, quantity, unit_price, unit, category, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Custom Bay Window - Double Pane Vinyl, 72x60', 1, 2400.00, 'each', 'material', 1),
  ('22222222-2222-2222-2222-222222222222', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Framing modifications (carpentry)', 1, 800.00, 'each', 'labor', 2),
  ('33333333-3333-3333-3333-333333333333', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Sealant and weatherproofing', 1, 150.00, 'each', 'material', 3),
  ('44444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Install labor (2 technicians, 4 hours)', 1, 600.00, 'each', 'labor', 4);

-- Acme Office Estimate (Accepted)
INSERT INTO estimates (id, project_id, number, subtotal, tax_rate, tax_amount, status, notes, terms, sent_at, accepted_at, pdf_url, created_by) VALUES
  (
    '55555555-5555-5555-5555-555555555555',
    '44444444-4444-4444-4444-444444444444',
    NULL,
    24270.00,
    0.0875,
    2123.62,
    'accepted',
    'Work to be performed on weekends to minimize disruption. All materials upgraded to premium grade.',
    '30% deposit required, 40% at midpoint, 30% upon completion.',
    '2025-02-20T11:00:00Z',
    '2025-02-25T14:30:00Z',
    'https://storage.example.com/estimates/est_002_final.pdf',
    'f1b66f89-4a07-43a7-aa39-1034f41845ff'
  );

INSERT INTO estimate_items (id, estimate_id, description, quantity, unit_price, unit, category, sort_order) VALUES
  ('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'Double Pane Vinyl Window - Standard, 36x48', 50, 280.00, 'each', 'material', 1),
  ('77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', 'Removal and disposal of old windows', 50, 45.00, 'each', 'labor', 2),
  ('88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', 'Installation labor per unit', 50, 95.00, 'each', 'labor', 3),
  ('99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', 'Caulking and perimeter sealing', 1, 900.00, 'each', 'material', 4),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'Project management (10% of subtotal)', 1, 2170.00, 'each', 'overhead', 5);

-- ============================================
-- SAMPLE SUPPLIERS
-- ============================================

INSERT INTO suppliers (id, name, contact_name, email, phone, website) VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Window World Inc.',
    'Robert Johnson',
    'sales@windowworld.com',
    '+1-800-555-0100',
    'https://windowworld.example.com'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Glass & Glazing Supply Co.',
    'Maria Garcia',
    'orders@glasssupply.co',
    '+1-800-555-0200',
    'https://glasssupply.example.com'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'National Sealants',
    'Tom Wilson',
    'quotes@nationalsealants.com',
    '+1-800-555-0300',
    'https://nationalsealants.example.com'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE INVENTORY
-- ============================================

INSERT INTO inventory_items (id, sku, name, description, category, unit, quantity, reorder_threshold, cost_per_unit, supplier_id) VALUES
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'VIN-001',
    'Double Pane Vinyl Window - 36x48',
    'Energy Star rated double pane vinyl window, white frame',
    'Windows',
    'each',
    15,
    5,
    145.00,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'VIN-002',
    'Double Pane Vinyl Window - 48x60',
    'Energy Star rated double pane vinyl window, white frame',
    'Windows',
    'each',
    8,
    3,
    195.00,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'SEAL-001',
    'Silicone Sealant - Gray',
    '100% silicone sealant, 10.3 oz cartridge, 10-year warranty',
    'Sealants',
    'tube',
    50,
    20,
    8.50,
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'CAULK-001',
    'Exterior Grade Caulk - White',
    'Paintable acrylic latex caulk, 12 oz',
    'Sealants',
    'tube',
    100,
    30,
    4.25,
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTIONS FOR DEVELOPMENT/DEBUGGING
-- ============================================

-- Reset sequence/counts for estimate numbers (run yearly on Jan 1)
-- UPDATE estimates SET number = NULL WHERE created_at >= '2025-01-01';

COMMIT;
