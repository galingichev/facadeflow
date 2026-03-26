import { Stack } from 'expo-router';
import { config } from '../../src/config';

/**
 * Dashboard Stack Navigator
 *
 * Screens:
 * - DashboardHome: main dashboard with KPI cards, today's schedule
 * - TaskDetail: view/edit a single task
 * - AppointmentDetail: view appointment details
 */
export default function DashboardNavigator() {
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
          title: 'Dashboard',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="task/[taskId]"
        options={{
          title: 'Task',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="appointment/[appointmentId]"
        options={{
          title: 'Appointment',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
