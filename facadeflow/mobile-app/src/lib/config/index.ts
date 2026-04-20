import * as Updates from 'expo-updates';
import Constants from 'expo-constants';

const {
  extra: expoExtra,
} = Constants.expoConfig || {};

export const config = {
  // Environment
  env: process.env.NODE_ENV || __DEV__ ? 'development' : 'production',

  // API
  api: {
    baseUrl: expoExtra?.API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
  },

  // Supabase (if using)
  supabase: {
    url: expoExtra?.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: expoExtra?.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },

  // Sentry
  sentry: {
    dsn: expoExtra?.SENTRY_DSN || process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    tracesSampleRate: 1.0, // Adjust in production
  },

  // Feature flags
  features: {
    voiceNotes: true,
    photoAnnotations: true,
    offlineMode: false, // Enable when WatermelonDB integrated
    dailyBrief: true,
    githubSync: false,
    webDashboard: false,
    multiTenant: false,
  },

  // App behavior
  app: {
    name: 'FacadeFlow',
    version: '1.0.0',
    buildNumber: '1',
    updatesEnabled: true,
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // Date formats
  dates: {
    short: 'MM/dd/yyyy',
    long: 'MMMM dd, yyyy',
    time: 'h:mm a',
    full: 'MMMM dd, yyyy h:mm a',
  },

  // Currency
  currency: {
    code: 'USD',
    locale: 'en-US',
    symbol: '$',
  },

  // Theme
  theme: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
  },
};

// Helper to get current environment URL
export const getApiUrl = () => {
  if (__DEV__) {
    // Use tunnel for local development if using tunnel URL
    const updates = Updates as any;
    const { tunnelUrl } = updates;
    if (tunnelUrl) {
      return tunnelUrl.replace(/\/$/, '') + '/api';
    }
  }
  return config.api.baseUrl;
};

// Typed config accessors
export const isFeatureEnabled = (feature: keyof typeof config.features) => config.features[feature];
