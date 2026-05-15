import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import type { User } from '../types';
import { authApi } from '../api/endpoints';
import { getApiUrl } from '../lib/config';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  clearTokens: () => Promise<void>;
  refresh: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const secureStorageMiddleware = {
  getItem: async (name: string) => {
    const value = await SecureStore.getItemAsync(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      get isAuthenticated() {
        return !!this.accessToken;
      },

      setUser: (user) => set({ user }),

      setTokens: async (accessToken, refreshToken) => {
        await SecureStore.setItemAsync('access_token', accessToken);
        await SecureStore.setItemAsync('refresh_token', refreshToken);
        set({ accessToken, refreshToken });
      },

      clearTokens: async () => {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        set({ accessToken: null, refreshToken: null, user: null });
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          const { user, access_token, refresh_token } = response;
          await useAuthStore.getState().setTokens(access_token, refresh_token);
          set({ user, isLoading: false });
          return true;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          return false;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error', error);
        } finally {
          await useAuthStore.getState().clearTokens();
          set({ isLoading: false, error: null });
        }
      },

      refresh: async () => {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) {
          await useAuthStore.getState().clearTokens();
          return false;
        }

        set({ isLoading: true });
        try {
          // This would call your refresh endpoint
          // For now, we'll just simulate success or trigger re-login
          const response = await fetch(`${getApiUrl()}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (!response.ok) throw new Error('Refresh failed');

          const { access_token } = await response.json();
          set({ accessToken: access_token, isLoading: false });
          return true;
        } catch (error) {
          await useAuthStore.getState().clearTokens();
          set({ isLoading: false });
          return false;
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorageMiddleware),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);

// Initialize tokens from secure storage on app start (persist does this automatically)
// You can also add an initialization function to check token validity
