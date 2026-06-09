import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useClientsStore } from '../../../src/stores/clientsStore';
import { config } from '../../../src/lib/config';

export default function CreateClientScreen() {
  const router = useRouter();
  const { createClient, isLoading, error } = useClientsStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Client name is required');
      return;
    }
    setLoading(true);
    try {
      await createClient({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.message || error || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

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
        title={isLoading || loading ? 'Creating...' : 'Create Client'}
        onPress={handleSubmit}
        disabled={isLoading || loading}
        color={config.theme.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
