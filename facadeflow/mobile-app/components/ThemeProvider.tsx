import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

const lightColors: ThemeColors = {
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
};

const darkColors: ThemeColors = {
  primary: '#3b82f6',
  secondary: '#94a3b8',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
};

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_MODE_KEY = 'facadeflow_theme_mode';

async function getStoredThemeMode(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return window.localStorage.getItem(THEME_MODE_KEY);
  }

  return SecureStore.getItemAsync(THEME_MODE_KEY);
}

async function setStoredThemeMode(mode: ThemeMode): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(THEME_MODE_KEY, mode);
    return;
  }

  await SecureStore.setItemAsync(THEME_MODE_KEY, mode);
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('auto');

  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    try {
      const saved = await getStoredThemeMode();
      if (saved === 'light' || saved === 'dark' || saved === 'auto' || saved === null) {
        setModeState((saved as any) || 'auto');
      }
    } catch (error) {
      console.error('Failed to load theme mode:', error);
    }
  };

  const setMode = async (newMode: ThemeMode) => {
    try {
      await setStoredThemeMode(newMode);
      setModeState(newMode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  const toggle = () => {
    if (mode === 'auto') {
      setMode('dark');
    } else if (mode === 'dark') {
      setMode('light');
    } else {
      setMode('auto');
    }
  };

  // Determine actual colors based on mode and system
  const isDark = mode === 'dark' || (mode === 'auto' && systemColorScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  // Update config's theme at runtime (inject)
  // This would ideally be done with a proper theming system
  // For now, we provide colors via context

  return (
    <ThemeContext.Provider value={{ mode, colors, isDark, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Styles generator helper
export const createThemedStyles = <T extends Record<string, any>>(
  styles: (colors: ThemeColors) => T
) => {
  return () => {
    const { colors } = useTheme();
    return styles(colors);
  };
};
