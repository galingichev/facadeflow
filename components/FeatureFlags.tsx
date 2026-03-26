import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { config } from '../src/config';

const FEATURE_FLAGS_KEY = 'facadeflow_feature_flags';

interface FeatureFlags {
  voiceNotes: boolean;
  photoAnnotations: boolean;
  offlineMode: boolean;
  dailyBrief: boolean;
  githubSync: boolean;
  webDashboard: boolean;
  multiTenant: boolean;
  betaFeatures: boolean;
}

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  isEnabled: (key: keyof FeatureFlags) => boolean;
  enable: (key: keyof FeatureFlags) => Promise<void>;
  disable: (key: keyof FeatureFlags) => Promise<void>;
  reset: () => Promise<void>;
}

const defaultFlags: FeatureFlags = {
  voiceNotes: true,
  photoAnnotations: true,
  offlineMode: false,
  dailyBrief: true,
  githubSync: false,
  webDashboard: false,
  multiTenant: false,
  betaFeatures: false,
};

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export const FeatureFlagsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      const saved = await SecureStore.getItemAsync(FEATURE_FLAGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFlags({ ...defaultFlags, ...parsed });
      } else {
        // Initial defaults from config.features
        setFlags({ ...defaultFlags, ...config.features });
      }
    } catch (error) {
      console.error('Failed to load feature flags:', error);
      setFlags({ ...defaultFlags, ...config.features });
    }
  };

  const saveFlags = async (newFlags: FeatureFlags) => {
    try {
      await SecureStore.setItemAsync(FEATURE_FLAGS_KEY, JSON.stringify(newFlags));
    } catch (error) {
      console.error('Failed to save feature flags:', error);
    }
  };

  const enable = async (key: keyof FeatureFlags) => {
    const updated = { ...flags, [key]: true };
    setFlags(updated);
    await saveFlags(updated);
  };

  const disable = async (key: keyof FeatureFlags) => {
    const updated = { ...flags, [key]: false };
    setFlags(updated);
    await saveFlags(updated);
  };

  const reset = async () => {
    setFlags({ ...defaultFlags, ...config.features });
    await SecureStore.deleteItemAsync(FEATURE_FLAGS_KEY);
  };

  const isEnabled = (key: keyof FeatureFlags) => {
    return flags[key];
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, isEnabled, enable, disable, reset }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  }
  return context;
};

// Higher-order component to conditionally render features
export const withFeatureFlag = <P extends object>(
  Component: React.ComponentType<P>,
  flagKey: keyof FeatureFlags
) => {
  return function WithFeatureFlagWrapper(props: P) {
    const { isEnabled } = useFeatureFlags();
    const enabled = isEnabled(flagKey);

    if (!enabled) {
      return null; // or a placeholder/upcoming feature component
    }

    return <Component {...props} />;
  };
};
