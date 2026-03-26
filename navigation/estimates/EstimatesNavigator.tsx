import { Stack } from 'expo-router';
import { config } from '../../src/config';

/**
 * Estimates Stack Navigator
 *
 * Screens:
 * - EstimatesList: all estimates with filter by status
 * - EstimateDetail: view estimate with line items, PDF preview
 * - EstimateCreate: create from project or standalone
 * - EstimateEdit: modify existing estimate
 */
export default function EstimatesNavigator() {
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
          title: 'Estimates',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[estimateId]"
        options={{
          title: 'Estimate',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Create Estimate',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: 'Edit Estimate',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="pdf"
        options={{
          title: 'PDF Preview',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
