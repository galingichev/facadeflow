import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
// Assume useClientsStore will be created or clientsStore will be extended
import { useClientsStore } from '../../../../src/stores/clientsStore'; // Changed to useClientsStore
import { config } from '../../../../src/lib/config';
// Removed ProjectStatus import

export default function EditClientScreen() { // Renamed component
  const router = useRouter();
  const { clientId } = useLocalSearchParams<{ clientId: string }>(); // Changed to clientId
  // Assuming clientsStore will provide currentClient, fetchClient, updateClient
  const { currentClient, fetchClient, updateClient, removeClient, isLoading: storeLoading } = useClientsStore(); // Use useClientsStore hook

  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); // Added phone
  const [email, setEmail] = useState(''); // Added email
  const [loading, setLoading] = useState(false); // Local loading state for form submission
  const [initialLoading, setInitialLoading] = useState(true); // Renamed local loading for initial fetch

  useEffect(() => {
    if (clientId) {
      if (!currentClient || currentClient.id !== clientId) {
        // Need to ensure fetchClient exists on clientsStore
        fetchClient(clientId).finally(() => setInitialLoading(false));
      } else {
        setInitialLoading(false);
      }
    }
  }, [clientId, currentClient, fetchClient]); // dependencies updated

  useEffect(() => {
    if (currentClient) {
      setName(currentClient.name);
      setPhone(currentClient.phone || ''); // Set phone
      setEmail(currentClient.email || ''); // Set email
    }
  }, [currentClient]);

  // Removed statusOptions and showStatusPicker as they are project-specific

  const handleSubmit = async () => {
    if (!name.trim()) { // Only name is strictly required per current client create. Phone/email are optional.
      Alert.alert('Error', 'Client name is required');
      return;
    }
    setLoading(true);
    try {
      // Need to ensure updateClient exists on clientsStore
      updateClient(clientId, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Client',
      'Are you sure you want to delete this client? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            setLoading(true);
            try {
              // Need to ensure remove (or deleteClient) exists on clientsStore
              await removeClient(clientId);
              router.replace('/clients'); // Go back to clients list after deletion
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete client');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };


  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={config.theme.primary} />
      </View>
    );
  }

  if (!currentClient) { // Changed currentProject to currentClient
    router.replace('/clients'); // Redirect if client not found or failed to load
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Client Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter client name"
        placeholderTextColor={config.theme.textSecondary}
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter phone number"
        placeholderTextColor={config.theme.textSecondary}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email address"
        placeholderTextColor={config.theme.textSecondary}
      />

      <View style={{ height: 20 }} />
      <Button
        title={loading ? 'Updating...' : 'Update Client'} // Changed button text
        onPress={handleSubmit}
        disabled={loading}
        color={config.theme.primary}
      />
      <View style={{ height: 10 }} />
      <Button
        title={loading ? 'Deleting...' : 'Delete Client'} // Added Delete button
        onPress={handleDelete}
        disabled={loading}
        color={config.theme.danger} // Assuming a danger color for delete
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: config.theme.background,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: config.theme.background,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: config.theme.text,
  },
  input: {
    borderWidth: 1,
    borderColor: config.theme.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: config.theme.text,
  },
  // Removed trigger and triggerText styles as they are project-specific
});
