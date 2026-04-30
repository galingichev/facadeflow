import { create } from 'zustand';
import { clientsApi } from '../api/endpoints';
import type { Client } from '../types';

interface ClientState {
  clients: Client[];
  currentClient: Client | null;
  isLoading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  fetchClient: (clientId: string) => Promise<void>;
  createClient: (data: Partial<Client>) => Promise<void>;
  updateClient: (clientId: string, data: Partial<Client>) => Promise<void>;
  removeClient: (clientId: string) => Promise<void>;
}

export const useClientsStore = create<ClientState>()((set, get) => ({
  clients: [],
  currentClient: null,
  isLoading: false,
  error: null,

  fetchClients: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await clientsApi.list();
      set({ clients: Array.isArray(response) ? response : (response as any).data ?? [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch clients', isLoading: false });
    }
  },

  fetchClient: async (clientId: string) => {
    set({ isLoading: true, error: null, currentClient: null });
    try {
      const response = await clientsApi.get(clientId);
      set({ currentClient: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch client', isLoading: false });
    }
  },

  createClient: async (data: Partial<Client>) => {
    set({ isLoading: true, error: null });
    try {
      await clientsApi.create(data);
      await get().fetchClients(); // Refresh list after creation
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to create client', isLoading: false });
    }
  },

  updateClient: async (clientId: string, data: Partial<Client>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await clientsApi.update(clientId, data);
      set((state) => ({
        currentClient: state.currentClient?.id === clientId ? response.data : state.currentClient,
        clients: state.clients.map((client) =>
          client.id === clientId ? response.data : client
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update client', isLoading: false });
    }
  },

  removeClient: async (clientId: string) => {
    set({ isLoading: true, error: null });
    try {
      await clientsApi.delete(clientId);
      await get().fetchClients(); // Refresh list after removal
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to remove client', isLoading: false });
    }
  },
}));

// Plain object for direct use outside React components
export const clientsStore = {
  list: async () => {
    const response = await clientsApi.list();
    return Array.isArray(response) ? response : (response as any).data ?? [];
  },
  remove: async (clientId: string) => {
    await clientsApi.delete(clientId);
  },
};
