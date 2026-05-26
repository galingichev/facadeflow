import { projectsApi } from '../api/endpoints';
import type { Project, PaginationParams } from '../types';

export const getProjects = (params?: PaginationParams) => projectsApi.list(params);

export const getProjectById = (id: string) => projectsApi.get(id);

export const createProject = (data: Partial<Project>) => projectsApi.create(data);

export const updateProject = (id: string, data: Partial<Project>) => projectsApi.update(id, data);

export const deleteProject = (id: string) => projectsApi.delete(id);
