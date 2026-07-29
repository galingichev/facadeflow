import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { config } from '../../src/lib/config';
import { useI18n } from '../../src/i18n';

const ROUTE_HISTORY_KEY = 'facadeflow.routeHistory';

type BackButtonProps = {
  fallbackRoute: string;
  style?: ViewStyle;
};

export function RouteHistoryTracker() {
  const pathname = usePathname();

  React.useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !pathname) return;

    try {
      const current = readRouteHistory();
      if (current.current === pathname) return;

      window.sessionStorage.setItem(ROUTE_HISTORY_KEY, JSON.stringify({
        previous: current.current,
        current: pathname,
      }));
    } catch {
      // Route tracking is a web enhancement; native/router fallback still works.
    }
  }, [pathname]);

  return null;
}

export function BackButton({ fallbackRoute, style }: BackButtonProps) {
  const router = useRouter();
  const { t } = useI18n();
  const label = t('Back');

  const handlePress = () => {
    const safeRouter = router as typeof router & { canGoBack?: () => boolean };

    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const previousPath = readRouteHistory().previous;
        const currentPath = Platform.OS === 'web' && typeof window !== 'undefined'
          ? window.location.pathname
          : '';

        if (previousPath && previousPath !== currentPath) {
          router.back();
          window.setTimeout(() => {
            if (window.location.pathname !== previousPath) {
              router.replace(previousPath as any);
            }
          }, 120);
          return;
        }

        router.replace(fallbackRoute as any);
        return;
      }

      if (typeof safeRouter.canGoBack === 'function' && safeRouter.canGoBack()) {
        router.back();
        return;
      }
    } catch {
      // Fall through to the explicit route when history is unavailable.
    }

    router.replace(fallbackRoute as any);
  };

  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole="button"
      activeOpacity={0.82}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      onPress={handlePress}
      style={[styles.button, style]}
    >
      <MaterialIcons name="arrow-back" size={21} color={config.theme.text} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

function readRouteHistory(): { previous?: string; current?: string } {
  if (typeof window === 'undefined') return {};

  try {
    const value = window.sessionStorage.getItem(ROUTE_HISTORY_KEY);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: config.theme.border,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  label: {
    color: config.theme.text,
    fontSize: 15,
    fontWeight: '800',
  },
});
