import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProjectsStore } from '../../../../src/stores/projectsStore';
import { config } from '../../../../src/lib/config';
import type { ProjectStatus } from '../../../../src/types';
import ClientPicker from '../../../../components/ui/ClientPicker';

export default function EditProjectScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { currentProject, fetchProject, updateProject } = useProjectsStore();

  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('draft');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      if (!currentProject || currentProject.id !== projectId) {
        fetchProject(projectId).finally(() => setInitialLoading(false));
      } else {
        setInitialLoading(false);
      }
    }
  }, [projectId, currentProject, fetchProject]);

  useEffect(() => {
    if (currentProject) {
      setName(currentProject.name);
      setClientId(String(currentProject.client_id || ''));
      setStatus(currentProject.status);
    }
  }, [currentProject]);

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
      await updateProject(projectId, {
        name: name.trim(),
        client_id: clientId.trim(),
        status,
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={config.theme.primary} />
      </View>
    );
  }

  if (!currentProject) {
    router.replace('/projects'); // Redirect if project not found or failed to load
    return null;
  }

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
      <TouchableOpacity style={styles.trigger} onPress={showStatusPicker}>
        <Text style={styles.triggerText}>{status}</Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />
      <Button
        title={loading ? 'Updating...' : 'Update Project'}
        onPress={handleSubmit}
        disabled={loading}
        color={config.theme.primary}
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
  trigger: {
    borderWidth: 1,
    borderColor: config.theme.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: config.theme.background,
  },
  triggerText: {
    color: config.theme.text,
  },
});
