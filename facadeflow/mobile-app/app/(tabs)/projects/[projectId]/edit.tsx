import React, { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, type AlertButton } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProjectsStore } from '../../../../src/stores/projectsStore';
import { config } from '../../../../src/lib/config';
import type { ProjectStatus } from '../../../../src/types';
import ClientPicker from '../../../../components/ui/ClientPicker';

export default function EditProjectScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const currentProject = useProjectsStore(state => state.currentProject);
  const fetchProject = useProjectsStore(state => state.fetchProject);
  const updateProject = useProjectsStore(state => state.updateProject);

  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('draft');
  const [contractValue, setContractValue] = useState('');
  const [budget, setBudget] = useState('');
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
      setContractValue(currentProject.contract_value !== undefined && currentProject.contract_value !== null ? String(currentProject.contract_value) : '');
      setBudget(currentProject.budget !== undefined && currentProject.budget !== null ? String(currentProject.budget) : '');
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
    const buttons: AlertButton[] = statusOptions.map((s) => ({
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

    const parsedContractValue = contractValue.trim() ? Number(contractValue) : undefined;
    const parsedBudget = budget.trim() ? Number(budget) : undefined;

    if (
      (parsedContractValue !== undefined && !Number.isFinite(parsedContractValue)) ||
      (parsedBudget !== undefined && !Number.isFinite(parsedBudget))
    ) {
      Alert.alert('Error', 'Contract value and budgeted cost must be valid numbers');
      return;
    }

    setLoading(true);
    try {
      await updateProject(projectId, {
        name: name.trim(),
        client_id: clientId.trim(),
        status,
        contract_value: parsedContractValue,
        budget: parsedBudget,
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
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color={config.theme.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
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

      <Text style={styles.label}>Contract Value</Text>
      <TextInput
        style={styles.input}
        value={contractValue}
        onChangeText={setContractValue}
        placeholder="Total payable by client"
        placeholderTextColor={config.theme.textSecondary}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Budgeted Cost</Text>
      <TextInput
        style={styles.input}
        value={budget}
        onChangeText={setBudget}
        placeholder="Expected spend to complete"
        placeholderTextColor={config.theme.textSecondary}
        keyboardType="numeric"
      />

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
