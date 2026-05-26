import { clientsApi } from '../api/endpoints';
import type { Client, PaginationParams } from '../types';

export const getClients = (params?: PaginationParams) => clientsApi.list(params);

export const getClientById = (id: string) => clientsApi.get(id);

export const createClient = (data: Partial<Client>) => clientsApi.create(data);

export const updateClient = (id: string, data: Partial<Client>) => clientsApi.update(id, data);

export const deleteClient = (id: string) => clientsApi.delete(id);
