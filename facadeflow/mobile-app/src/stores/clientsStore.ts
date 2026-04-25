import { clientsApi } from '../api/endpoints';

export const clientsStore = {
  list: () => clientsApi.list(),
  createClient: (data: { name: string; phone?: string; email?: string }) =>
    clientsApi.create(data),
  remove: (clientId: string) => clientsApi.delete(clientId),
};
