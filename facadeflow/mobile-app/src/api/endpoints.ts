import api from './client';
import type {
  Client,
  Project,
  Estimate,
  Task,
  ProjectPhoto,
  VoiceNote,
  InventoryItem,
  Supplier,
  User,
  DailyBrief,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
  ProjectStatus,
  EstimateStatus,
  TaskStatus,
  EstimateItem,
  PhotoAnnotation,
} from '../types';

// =====================
// Auth
// =====================
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User; access_token: string; refresh_token: string }>('/auth/login', {
      email,
      password,
    }),

  logout: () => api.post('/auth/logout'),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<{ user: User }>('/auth/reset-password', { token, password }),
};

// =====================
// Clients
// =====================
export const clientsApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Client>>('/clients', { params }),

  get: (clientId: string) => api.get<Client>(`/clients/${clientId}`),

  create: (data: Partial<Client>) => api.post<Client>('/clients', data),

  update: (clientId: string, data: Partial<Client>) =>
    api.patch<Client>(`/clients/${clientId}`, data),

  delete: (clientId: string) => api.delete<void>(`/clients/${clientId}`),

  search: (query: string) => api.get<Client[]>('/clients/search', { params: { q: query } }),
};

// =====================
// Projects
// =====================
export const projectsApi = {
  list: (params?: PaginationParams & { status?: ProjectStatus }) =>
    api.get<PaginatedResponse<Project>>('/projects', { params }),

  get: (projectId: string) =>
    api.get<Project & { client: Client }>(`/projects/${projectId}`),

  create: (data: Partial<Project>) => api.post<Project>('/projects', data),

  update: (projectId: string, data: Partial<Project>) =>
    api.patch<Project>(`/projects/${projectId}`, data),

  delete: (projectId: string) => api.delete<void>(`/projects/${projectId}`),

  // Related data
  getPhotos: (projectId: string) =>
    api.get<ProjectPhoto[]>(`/projects/${projectId}/photos`),

  uploadPhoto: (projectId: string, file: { uri: string; name: string; type?: string }, metadata: { type: ProjectPhoto['type']; caption?: string }) =>
    api.post<ProjectPhoto>(`/projects/${projectId}/photos`, { file, metadata }),

  getTasks: (projectId: string) => api.get<Task[]>(`/projects/${projectId}/tasks`),

  getEstimates: (projectId: string) => api.get<Estimate[]>(`/projects/${projectId}/estimates`),

  getVoiceNotes: (projectId: string) => api.get<VoiceNote[]>(`/projects/${projectId}/voice-notes`),
};

// =====================
// Estimates
// =====================
export const estimatesApi = {
  list: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Estimate>>('/estimates', { params }),

  get: (estimateId: string) =>
    api.get<Estimate & { project: Project; items: EstimateItem[] }>(`/estimates/${estimateId}`),

  create: (projectId: string, data: Partial<Estimate>) =>
    api.post<Estimate>(`/projects/${projectId}/estimates`, data),

  update: (estimateId: string, data: Partial<Estimate>) =>
    api.patch<Estimate>(`/estimates/${estimateId}`, data),

  delete: (estimateId: string) => api.delete<void>(`/estimates/${estimateId}`),

  send: (estimateId: string, recipientEmail?: string) =>
    api.post<{ success: boolean }>(`/estimates/${estimateId}/send`, { recipientEmail }),

  generatePdf: (estimateId: string) =>
    api.post<{ pdf_url: string }>(`/estimates/${estimateId}/generate-pdf`),

  duplicate: (estimateId: string) => api.post<Estimate>(`/estimates/${estimateId}/duplicate`),
};

// =====================
// Tasks
// =====================
export const tasksApi = {
  list: (params?: PaginationParams & { status?: TaskStatus; assignee_id?: string }) =>
    api.get<PaginatedResponse<Task>>('/tasks', { params }),

  get: (taskId: string) => api.get<Task>(`/tasks/${taskId}`),

  create: (data: Partial<Task>) => api.post<Task>('/tasks', data),

  update: (taskId: string, data: Partial<Task>) =>
    api.patch<Task>(`/tasks/${taskId}`, data),

  delete: (taskId: string) => api.delete<void>(`/tasks/${taskId}`),

  complete: (taskId: string) => api.patch<Task>(`/tasks/${taskId}/complete`),

  assign: (taskId: string, assigneeId: string) =>
    api.patch<Task>(`/tasks/${taskId}/assign`, { assignee_id: assigneeId }),
};

// =====================
// Photos
// =====================
export const photosApi = {
  get: (photoId: string) => api.get<ProjectPhoto>(`/photos/${photoId}`),

  update: (photoId: string, data: Partial<ProjectPhoto>) =>
    api.patch<ProjectPhoto>(`/photos/${photoId}`, data),

  delete: (photoId: string) => api.delete<void>(`/photos/${photoId}`),

  addAnnotation: (photoId: string, annotation: PhotoAnnotation) =>
    api.post<ProjectPhoto>(`/photos/${photoId}/annotations`, annotation),

  removeAnnotation: (photoId: string, annotationId: string) =>
    api.delete<void>(`/photos/${photoId}/annotations/${annotationId}`),
};

// =====================
// Voice Notes
// =====================
export const voiceNotesApi = {
  create: (
    projectId?: string,
    taskId?: string,
    file: { uri: string; name: string; type?: string } = { uri: '', name: '' }
  ) =>
    api.post<VoiceNote>(`/voice-notes`, { project_id: projectId, task_id: taskId, file }),

  get: (voiceNoteId: string) => api.get<VoiceNote>(`/voice-notes/${voiceNoteId}`),

  delete: (voiceNoteId: string) => api.delete<void>(`/voice-notes/${voiceNoteId}`),

  // Transcription
  transcribe: (voiceNoteId: string) =>
    api.post<{ transcript: string }>(`/voice-notes/${voiceNoteId}/transcribe`),
};

// =====================
// Inventory
// =====================
export const inventoryApi = {
  list: (params?: PaginationParams & { category?: string }) =>
    api.get<PaginatedResponse<InventoryItem>>('/inventory', { params }),

  get: (itemId: string) => api.get<InventoryItem>(`/inventory/${itemId}`),

  create: (data: Partial<InventoryItem>) => api.post<InventoryItem>('/inventory', data),

  update: (itemId: string, data: Partial<InventoryItem>) =>
    api.patch<InventoryItem>(`/inventory/${itemId}`, data),

  delete: (itemId: string) => api.delete<void>(`/inventory/${itemId}`),

  adjust: (itemId: string, delta: number, reason?: string) =>
    api.patch<InventoryItem>(`/inventory/${itemId}/adjust`, { delta, reason }),
};

// =====================
// Suppliers
// =====================
export const suppliersApi = {
  list: () => api.get<Supplier[]>('/suppliers'),

  get: (supplierId: string) => api.get<Supplier>(`/suppliers/${supplierId}`),

  create: (data: Partial<Supplier>) => api.post<Supplier>('/suppliers', data),

  update: (supplierId: string, data: Partial<Supplier>) =>
    api.patch<Supplier>(`/suppliers/${supplierId}`, data),

  delete: (supplierId: string) => api.delete<void>(`/suppliers/${supplierId}`),
};

// =====================
// Users & Team
// =====================
export const usersApi = {
  list: () => api.get<User[]>('/users'),

  get: (userId: string) => api.get<User>(`/users/${userId}`),

  updateProfile: (data: Partial<User>) => api.patch<User>('/users/me', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<void>('/users/me/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    }),
};

// =====================
// Dashboard / Daily Brief
// =====================
export const dashboardApi = {
  getSummary: () =>
    api.get<{
      active_projects: number;
      overdue_tasks: number;
      today_appointments: number;
      estimates_sent_this_week: number;
      revenue_pipeline: number;
    }>('/dashboard/summary'),

  getDailyBrief: () => api.get<DailyBrief>('/dashboard/daily-brief'),
};

// =====================
// Reports
// =====================
export const reportsApi = {
  financial: (params: { start_date: string; end_date: string }) =>
    api.get<{ revenue: number; costs: number; profit: number; project_breakdown: { project_id: string; revenue: number; cost: number; profit: number }[] }>(
      '/reports/financial',
      { params }
    ),

  timeTracking: (params: { start_date: string; end_date: string }) =>
    api.get<{ total_hours: number; by_project: { project_id: string; hours: number }[]; by_user: { user_id: string; hours: number }[] }>(
      '/reports/time-tracking',
      { params }
    ),
};

// =====================
// System
// =====================
export const systemApi = {
  health: () => api.get<{ status: 'ok' | 'error'; timestamp: string }>('/system/health'),

  version: () => api.get<{ frontend: string; backend: string }>('/system/version'),
};
