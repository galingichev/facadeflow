import React, { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useClientsStore } from '../../../../src/stores/clientsStore';
import { config } from '../../../../src/lib/config';

export default function EditClientScreen() {
  const router = useRouter();
  const { clientId } = useLocalSearchParams<{ clientId: string }>();
  const currentClient = useClientsStore(state => state.currentClient);
  const fetchClient = useClientsStore(state => state.fetchClient);
  const updateClient = useClientsStore(state => state.updateClient);
  const removeClient = useClientsStore(state => state.removeClient);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
    setLoading(false);
      fetchClient(clientId).finally(() => setInitialLoading(false));
    }
  }, [clientId]);

  useEffect(() => {
    if (currentClient) {
      setName(currentClient.name || '');
      setPhone(currentClient.phone || '');
      setEmail(currentClient.email || '');
    }
  }, [currentClient]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Client name is required');
      return;
    }
    setLoading(true);
    try {
      await updateClient(clientId, {
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

  const handleDelete = () => {
    Alert.alert(
      'Delete Client',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await removeClient(clientId);
              router.replace('/clients' as any);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete client');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (initialLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={config.theme.primary} />
      </View>
    );
  }

  if (!currentClient) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: config.theme.text }}>Client not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => { console.log("back pressed"); router.navigate("/clients" as any); }} style={styles.backButton} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
        <MaterialIcons name="arrow-back" size={24} color={config.theme.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
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
        placeholder="Optional"
        placeholderTextColor={config.theme.textSecondary}
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Optional"
        placeholderTextColor={config.theme.textSecondary}
      />
      <View style={{ height: 20 }} />
      <Button
        title={loading ? 'Updating...' : 'Update Client'}
        onPress={handleSubmit}
        disabled={loading}
        color={config.theme.primary}
      />
      <View style={{ height: 10 }} />
      <Button
        title={loading ? 'Deleting...' : 'Delete Client'}
        onPress={handleDelete}
        disabled={loading}
        color={config.theme.error}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: config.theme.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: config.theme.text,
    marginLeft: 4,
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
});
