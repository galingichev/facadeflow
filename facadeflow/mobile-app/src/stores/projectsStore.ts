import { create } from 'zustand';
import { projectsApi } from '../api/endpoints';
import type { Project, ProjectStatus, PaginationParams } from '../types';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  filters: {
    status?: ProjectStatus;
    search?: string;
  };
}

interface ProjectsActions {
  fetchProjects: (params?: PaginationParams & { status?: ProjectStatus }) => Promise<void>;
  fetchProject: (projectId: string) => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project | null>;
  updateProject: (projectId: string, data: Partial<Project>) => Promise<Project | null>;
  deleteProject: (projectId: string) => Promise<boolean>;
  setCurrentProject: (project: Project | null) => void;
  setFilters: (filters: Partial<ProjectsState['filters']>) => void;
  clearFilters: () => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjectsStore = create<ProjectsState & ProjectsActions>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
  filters: {},

  fetchProjects: async (params: Partial<PaginationParams> & { status?: ProjectStatus } = {}) => {
    const { filters, pagination } = get();
    set({ isLoading: true, error: null });

    try {
      const mergedParams: PaginationParams = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...params,
      };

      const response = await projectsApi.list(mergedParams);

      set({
        projects: Array.isArray(response) ? response : [],
        pagination: {
          ...pagination,
          total: 0,
          hasMore: false,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch projects',
        isLoading: false,
      });
    }
  },

  fetchProject: async (projectId: string) => {
    set((state) => ({
      currentProject: state.currentProject?.id === projectId ? state.currentProject : null,
      isLoading: true,
      error: null,
    }));
    try {
      const project = await projectsApi.get(projectId);
      set({ currentProject: project, isLoading: false });
    } catch (error: any) {
      set({
        currentProject: null,
        error: error.response?.data?.message || 'Failed to fetch project',
        isLoading: false,
      });
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsApi.create(data);
      set((state) => ({
        projects: [project, ...state.projects],
        isLoading: false,
      }));
      return project;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create project',
        isLoading: false,
      });
      return null;
    }
  },

  updateProject: async (projectId, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await projectsApi.update(projectId, data);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === projectId ? updated : p)),
        currentProject: state.currentProject?.id === projectId ? updated : state.currentProject,
        isLoading: false,
      }));
      return updated;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update project',
        isLoading: false,
      });
      return null;
    }
  },

  deleteProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      await projectsApi.delete(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete project',
        isLoading: false,
      });
      return false;
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters }, pagination: { ...get().pagination, page: 1 } });
    get().fetchProjects();
  },

  clearFilters: () => {
    set({ filters: {}, pagination: { ...get().pagination, page: 1 } });
    get().fetchProjects();
  },

  loadMore: async () => {
    const { pagination, projects, filters } = get();
    if (!pagination.hasMore || pagination.page >= pagination.total / pagination.limit) {
      return;
    }

    set({ isLoading: true });
    try {
      const nextPage = pagination.page + 1;
      const response = await projectsApi.list({
        page: nextPage,
        limit: pagination.limit,
        ...filters,
      });

      set((state) => ({
        projects: [...state.projects, ...response.data],
        pagination: {
          ...state.pagination,
          page: nextPage,
          hasMore: response.has_more,
        },
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load more projects',
        isLoading: false,
      });
    }
  },

  refresh: () => get().fetchProjects(),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
