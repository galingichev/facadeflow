import { Stack } from 'expo-router';
import { ThemeProvider } from '@/components/ThemeProvider';
import { I18nProvider } from '@/src/i18n';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </I18nProvider>
    </ThemeProvider>
  );
}
