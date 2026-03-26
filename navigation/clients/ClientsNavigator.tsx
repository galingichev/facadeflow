import { Stack } from 'expo-router';
import { config } from '../../src/config';

/**
 * Clients Stack Navigator (CRM)
 *
 * Screens:
 * - ClientsList: searchable list of all clients
 * - ClientDetail: client info + related projects
 * - ClientEdit: create/edit client form
 */
export default function ClientsNavigator() {
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
          title: 'Clients',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[clientId]"
        options={{
          title: 'Client Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: 'Edit Client',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
