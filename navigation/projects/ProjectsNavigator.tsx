import { Stack } from 'expo-router';
import { config } from '../../src/config';

/**
 * Projects Stack Navigator
 *
 * Screens:
 * - ProjectsList: main list with search/filter
 * - ProjectDetail: full project view with tabs
 * - ProjectEdit: create/edit form
 * - EstimateCreate: create estimate for project
 * - PhotoCapture: camera/gallery for project
 */
export default function ProjectsNavigator() {
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
          title: 'Projects',
          headerShown: false, // We'll have custom header in screen
        }}
      />
      <Stack.Screen
        name="[projectId]"
        options={{
          title: 'Project Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: 'Edit Project',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="estimate/new"
        options={{
          title: 'Create Estimate',
        }}
      />
      <Stack.Screen
        name="photo"
        options={{
          title: 'Add Photo',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
