import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../../src/lib/config';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: config.theme.primary,
        tabBarInactiveTintColor: config.theme.textSecondary,
        tabBarStyle: {
          backgroundColor: config.theme.background,
          borderTopColor: config.theme.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      {/* ✅ VISIBLE TABS ONLY */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="projects/index"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="business" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="people" size={24} color={color} />
          ),
        }}
      />

      {/* 🚫 HIDDEN ROUTES */}

      
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
