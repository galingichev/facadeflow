import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createProject } from '../../../src/services/projectService';
import { useProjectsStore } from '../../../src/stores/projectsStore';
import { config } from '../../../src/lib/config';
import type { ProjectStatus } from '../../../src/types';
import ClientPicker from '../../../components/ui/ClientPicker';

export default function CreateProjectScreen() {
  const router = useRouter();
  const { refresh } = useProjectsStore();
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('draft');
  const [loading, setLoading] = useState(false);

  const statusOptions: ProjectStatus[] = [
    'draft',
    'inquired',
    'quoted',
    'approved',
    'in_progress',
    'on_hold',
    'completed',
    'cancelled',
  ];

  const showStatusPicker = () => {
    const buttons = statusOptions.map((s) => ({
      text: s,
      onPress: () => setStatus(s),
    }));
    buttons.push({ text: 'Cancel', style: 'cancel' as const });
    Alert.alert('Select Status', '', buttons);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !clientId.trim()) {
      Alert.alert('Error', 'Name and client are required');
      return;
    }
    setLoading(true);
    try {
      await createProject({
        name: name.trim(),
        client_id: clientId.trim(),
        status,
      });
      await refresh();
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Project Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter project name"
        placeholderTextColor={config.theme.textSecondary}
      />

      <Text style={styles.label}>Client</Text>
      <ClientPicker value={clientId} onChange={setClientId} />

      <Text style={styles.label}>Status</Text>
      <Button
        title={status}
        onPress={showStatusPicker}
        color={config.theme.primary}
      />

      <View style={{ height: 20 }} />
      <Button
        title={loading ? 'Creating...' : 'Create Project'}
        onPress={handleSubmit}
        disabled={loading}
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
