// Core domain types for FacadeFlow

export type ProjectStatus =
  | 'draft'
  | 'inquired'
  | 'quoted'
  | 'approved'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type EstimateStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type UserRole = 'admin' | 'estimator' | 'field_technician' | 'project_manager' | 'viewer';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: Address;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  address: Address;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  budget?: number;
  estimated_hours?: number;
  actual_hours?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Relations
  client?: Client;
  estimates?: Estimate[];
  tasks?: Task[];
  photos?: ProjectPhoto[];
}

export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  unit: string; // e.g., "each", "sqft", "hour", "lf"
  total: number;
  category?: 'material' | 'labor' | 'overhead' | 'other';
  sort_order: number;
}

export interface Estimate {
  id: string;
  project_id: string;
  number: string; // e.g., EST-2025-001
  items: EstimateItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  adjustments?: Adjustment[]; // discounts, fees
  total: number;
  status: EstimateStatus;
  notes?: string;
  terms?: string;
  valid_until?: string;
  sent_at?: string;
  accepted_at?: string;
  pdf_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Adjustment {
  description: string;
  amount: number; // positive or negative
}

export interface ProjectPhoto {
  id: string;
  project_id: string;
  url: string;
  thumbnail_url?: string;
  type: 'before' | 'during' | 'after' | 'damage' | 'detail';
  annotations?: PhotoAnnotation[];
  caption?: string;
  captured_at: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface PhotoAnnotation {
  id: string;
  type: 'arrow' | 'circle' | 'text' | 'highlight';
  x: number; // normalized 0-1 coordinates
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
}

export interface VoiceNote {
  id: string;
  project_id?: string;
  task_id?: string;
  audio_url: string;
  duration_seconds: number;
  transcript?: string;
  created_by: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string; // user id
  due_date?: string;
  completed_at?: string;
  estimated_minutes?: number;
  actual_minutes?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  sku?: string;
  name: string;
  description?: string;
  category: string;
  unit: string; // each, sqft, lf, gallon, etc.
  quantity: number;
  reorder_threshold?: number;
  cost_per_unit?: number;
  supplier_id?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyBrief {
  date: string;
  summary: {
    active_projects: number;
    overdue_tasks: number;
    today_appointments: number;
    estimates_sent_this_week: number;
    revenue_pipeline: number;
  };
  items: {
    type: 'project' | 'task' | 'estimate' | 'client' | 'appointment';
    id: string;
    title: string;
    description?: string;
    due_date?: string;
    priority?: TaskPriority;
  }[];
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Navigation param lists
export type RootTabParamList = {
  index: undefined;
  projects: undefined;
  clients: undefined;
  estimates: undefined;
  field: undefined;
  more: undefined;
};

export type ProjectsStackParamList = {
  ProjectsList: undefined;
  ProjectDetail: { projectId: string };
  ProjectEdit: { projectId?: string };
  EstimateCreate: { projectId: string };
  PhotoCapture: { projectId: string; type?: 'before' | 'during' | 'after' };
};

export type ClientsStackParamList = {
  ClientsList: undefined;
  ClientDetail: { clientId: string };
  ClientEdit: { clientId?: string };
};

export type EstimatesStackParamList = {
  EstimatesList: undefined;
  EstimateDetail: { estimateId: string };
  EstimateCreate: { projectId: string };
  EstimateEdit: { estimateId: string };
};

export type FieldStackParamList = {
  FieldHome: undefined;
  VoiceRecorder: { projectId?: string; taskId?: string };
  PhotoGallery: { projectId: string };
};

export type MoreStackParamList = {
  Settings: undefined;
  Team: undefined;
  Reports: undefined;
  Inventory: undefined;
  About: undefined;
};
