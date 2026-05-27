import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../../src/lib/config';

export default function TabsLayout() {
  return (
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
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <MaterialIcons name="space-dashboard" size={23} color={color} /> }} />
      <Tabs.Screen name="projects/index" options={{ title: 'Projects', tabBarIcon: ({ color }) => <MaterialIcons name="business-center" size={23} color={color} /> }} />
      <Tabs.Screen name="clients" options={{ title: 'Clients', tabBarIcon: ({ color }) => <MaterialIcons name="groups" size={23} color={color} /> }} />
      <Tabs.Screen name="more" options={{ href: null }} />
      <Tabs.Screen name="field" options={{ href: null }} />
      <Tabs.Screen name="estimates" options={{ href: null }} />
      <Tabs.Screen name="projects/create" options={{ href: null }} />
      <Tabs.Screen name="projects/[projectId]" options={{ href: null }} />
      <Tabs.Screen name="projects/[projectId]/edit" options={{ href: null }} />
      <Tabs.Screen name="clients/create" options={{ href: null }} />
      <Tabs.Screen name="clients/[clientId]/edit" options={{ href: null }} />
    </Tabs>
  );
}
