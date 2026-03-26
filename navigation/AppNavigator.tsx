import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../src/config';

/**
 * Main App Navigator - Tab Bar
 *
 * 5 Tabs:
 * - Dashboard (home) - quick overview, today's schedule
 * - Projects (list of all projects)
 * - Clients (CRM database)
 * - Estimates (quotes/proposals)
 * - Field (camera, voice, measurements)
 *
 * Plus "More" tab for overflow: Settings, Team, Reports, Inventory, About
 */
export default function AppNavigator() {
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
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="business" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="estimates"
        options={{
          title: 'Estimates',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="description" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="field"
        options={{
          title: 'Field',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="construction" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
