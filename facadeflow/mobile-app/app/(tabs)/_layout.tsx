import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../../src/lib/config';
import { useI18n } from '../../src/i18n';
import { RouteHistoryTracker } from '../../components/ui/BackButton';

export default function TabsLayout() {
  const { t } = useI18n();
  return (
    <>
      <RouteHistoryTracker />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: config.theme.text,
          tabBarInactiveTintColor: config.theme.textMuted,
          tabBarStyle: {
            backgroundColor: config.theme.backgroundElevated,
            borderTopColor: config.theme.border,
            borderTopWidth: 1,
            paddingBottom: 7,
            paddingTop: 7,
            height: 66,
          },
          tabBarItemStyle: {
            borderRadius: 14,
            marginHorizontal: 6,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
          },
        }}
      >
        <Tabs.Screen name="index" options={{ title: t('Dashboard'), tabBarIcon: ({ color }) => <MaterialIcons name="space-dashboard" size={23} color={color} /> }} />
        <Tabs.Screen name="projects/index" options={{ title: t('Projects'), tabBarIcon: ({ color }) => <MaterialIcons name="business-center" size={23} color={color} /> }} />
        <Tabs.Screen name="clients" options={{ title: t('Clients'), tabBarIcon: ({ color }) => <MaterialIcons name="groups" size={23} color={color} /> }} />
        <Tabs.Screen name="more" options={{ href: null }} />
        <Tabs.Screen name="field" options={{ href: null }} />
        <Tabs.Screen name="estimates" options={{ href: null }} />
        <Tabs.Screen name="projects/create" options={{ href: null }} />
        <Tabs.Screen name="projects/[projectId]" options={{ href: null }} />
        <Tabs.Screen name="projects/[projectId]/edit" options={{ href: null }} />
        <Tabs.Screen name="clients/create" options={{ href: null }} />
        <Tabs.Screen name="clients/[clientId]/edit" options={{ href: null }} />
      </Tabs>
    </>
  );
}
