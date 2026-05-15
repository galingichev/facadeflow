import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createProject } from '../../../src/services/projectService';
import { useProjectsStore } from '../../../src/stores/projectsStore';
import { config } from '../../../src/lib/config';
import type { ProjectStatus } from '../../../src/types';
import ClientPicker from '../../../components/ui/ClientPicker';
import { Select } from '../../../components/ui/Select';

const STATUS_OPTIONS: { label: string; value: ProjectStatus }[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Inquired', value: 'inquired' },
  { label: 'Quoted', value: 'quoted' },
  { label: 'Approved', value: 'approved' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function CreateProjectScreen() {
  const router = useRouter();
  const { refresh } = useProjectsStore();
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('draft');
  const [contractValue, setContractValue] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);

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
      await createProject({
        name: name.trim(),
        client_id: clientId.trim(),
        status,
        contract_value: parsedContractValue,
        budget: parsedBudget,
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
      <Select
        options={STATUS_OPTIONS}
        value={status}
        onValueChange={(value) => setStatus(value as ProjectStatus)}
        placeholder="Select status"
        style={styles.selectField}
      />

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
  selectField: {
    marginBottom: 16,
  },
});
