import { Stack } from 'expo-router';
import { config } from '../../src/config';

/**
 * More Stack Navigator (Settings & Overflow)
 *
 * Screens:
 * - MoreHome: menu of options (Settings, Team, Reports, Inventory, About)
 * - Settings: app settings (theme, notifications, etc.)
 * - Team: manage crew members, assign roles
 * - Reports: financial, time tracking, custom reports
 * - Inventory: materials and suppliers
 * - About: app info, version, licenses
 */
export default function MoreNavigator() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: config.theme.background,
        },
        headerTintColor: config.theme.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: config.theme.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'More',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="team"
        options={{
          title: 'Team',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="reports"
        options={{
          title: 'Reports',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: 'About',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
