import React, { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProjectsStore } from '../../../../src/stores/projectsStore';
import { config } from '../../../../src/lib/config';
import type { ProjectStatus } from '../../../../src/types';
import ClientPicker from '../../../../components/ui/ClientPicker';
import { Select } from '../../../../components/ui/Select';

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
      setStartDate(formatDateInput(currentProject.start_date));
      setEndDate(formatDateInput(currentProject.end_date));
    }
  }, [currentProject]);

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
      await updateProject(projectId, {
        name: name.trim(),
        client_id: clientId.trim(),
        status,
        contract_value: parsedContractValue,
        budget: parsedBudget,
        start_date: normalizedStartDate || null,
        end_date: normalizedEndDate || null,
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
    return (
      <View style={styles.notFoundContainer}>
        <MaterialIcons name="error-outline" size={48} color={config.theme.textSecondary} />
        <Text style={styles.notFoundTitle}>Project not found</Text>
        <Text style={styles.notFoundText}>This project may have been deleted or is no longer available.</Text>
        <Button
          title="Back to Projects"
          onPress={() => router.replace('/projects' as any)}
          color={config.theme.primary}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
        title={loading ? 'Updating...' : 'Update Project'}
        onPress={handleSubmit}
        disabled={loading}
        color={config.theme.primary}
      />
    </ScrollView>
  );
}

function formatDateInput(date: string | undefined): string {
  if (!date) return '';
  return date.slice(0, 10);
}

function isValidDateInput(date: string): boolean {
  if (!date) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: config.theme.background,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: config.theme.background,
  },
  notFoundTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '700',
    color: config.theme.text,
  },
  notFoundText: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 14,
    color: config.theme.textSecondary,
    textAlign: 'center',
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
