import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !clientId.trim()) {
      Alert.alert('Error', 'Name and client are required');
      return;
    }

    const parsedContractValue = contractValue.trim() ? Number(contractValue) : undefined;
    const parsedBudget = budget.trim() ? Number(budget) : undefined;
    const normalizedStartDate = startDate.trim();
    const normalizedEndDate = endDate.trim();

    if (
      (parsedContractValue !== undefined && !Number.isFinite(parsedContractValue)) ||
      (parsedBudget !== undefined && !Number.isFinite(parsedBudget))
    ) {
      Alert.alert('Error', 'Contract value and budgeted cost must be valid numbers');
      return;
    }

    if (!isValidDateInput(normalizedStartDate) || !isValidDateInput(normalizedEndDate)) {
      Alert.alert('Error', 'Start date and end date must use YYYY-MM-DD format');
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
        start_date: normalizedStartDate || undefined,
        end_date: normalizedEndDate || undefined,
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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

      <Text style={styles.label}>Start Date</Text>
      <TextInput
        style={styles.input}
        value={startDate}
        onChangeText={setStartDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={config.theme.textSecondary}
        inputMode="numeric"
      />

      <Text style={styles.label}>End Date</Text>
      <TextInput
        style={styles.input}
        value={endDate}
        onChangeText={setEndDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={config.theme.textSecondary}
        inputMode="numeric"
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
    </ScrollView>
  );
}

function isValidDateInput(date: string): boolean {
  if (!date) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.theme.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
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
