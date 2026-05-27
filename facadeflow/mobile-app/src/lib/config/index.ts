import * as Updates from 'expo-updates';
import Constants from 'expo-constants';

const { extra: expoExtra } = Constants.expoConfig || {};

export const config = {
  env: process.env.NODE_ENV || __DEV__ ? 'development' : 'production',

  api: {
    baseUrl: expoExtra?.API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.118:3000/api',
    timeout: 30000,
  },

  supabase: {
    url: expoExtra?.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: expoExtra?.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },

  sentry: {
    dsn: expoExtra?.SENTRY_DSN || process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    tracesSampleRate: 1.0,
  },

  features: {
    voiceNotes: true,
    photoAnnotations: true,
    offlineMode: false,
    dailyBrief: true,
    githubSync: false,
    webDashboard: false,
    multiTenant: false,
  },

  app: {
    name: 'FacadeFlow',
    version: '1.0.0',
    buildNumber: '1',
    updatesEnabled: true,
  },

  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  dates: {
    short: 'MM/dd/yyyy',
    long: 'MMMM dd, yyyy',
    time: 'h:mm a',
    full: 'MMMM dd, yyyy h:mm a',
  },

  currency: {
    code: 'USD',
    locale: 'en-US',
    symbol: '$',
  },

  theme: {
    primary: '#5e6ad2',
    primaryHover: '#7170ff',
    secondary: '#34343a',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#08090a',
    backgroundElevated: '#0f1011',
    surface: '#15171c',
    surfaceSoft: 'rgba(255,255,255,0.035)',
    surfaceStrong: '#191a1b',
    text: '#f7f8f8',
    textSecondary: '#a9b0bc',
    textMuted: '#62666d',
    border: 'rgba(255,255,255,0.08)',
    borderSubtle: 'rgba(255,255,255,0.05)',
  },
};

export const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const { origin, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${origin}/api`;
    }
    return `${origin.replace(/\/$/, '')}/api`;
  }

  if (__DEV__) {
    const updates = Updates as any;
    const tunnelUrl = updates?.tunnelUrl || updates?.manifest2?.extra?.expoGo?.developer?.tool;
    if (typeof tunnelUrl === 'string' && tunnelUrl.length > 0) {
      return tunnelUrl.replace(/\/$/, '') + '/api';
    }
  }

  return expoExtra?.API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
};

export const isFeatureEnabled = (feature: keyof typeof config.features) => config.features[feature];
