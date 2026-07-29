import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { createProject } from '../../../src/services/projectService';
import { useProjectsStore } from '../../../src/stores/projectsStore';
import { config } from '../../../src/lib/config';
import type { ProjectStatus } from '../../../src/types';
import ClientPicker from '../../../components/ui/ClientPicker';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useI18n } from '../../../src/i18n';
import { BackButton } from '../../../components/ui/BackButton';

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

type FormErrors = {
  name?: string;
  clientId?: string;
  contractValue?: string;
  budget?: string;
  startDate?: string;
  endDate?: string;
  submit?: string;
};

export default function CreateProjectScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { refresh } = useProjectsStore();
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('draft');
  const [contractValue, setContractValue] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined, submit: undefined }));
  };

  const handleSubmit = async () => {
    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = 'Project name is required.';
    if (!clientId.trim()) nextErrors.clientId = 'Client is required.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
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
      setErrors({
        contractValue: parsedContractValue !== undefined && !Number.isFinite(parsedContractValue) ? 'Contract value must be a valid number.' : undefined,
        budget: parsedBudget !== undefined && !Number.isFinite(parsedBudget) ? 'Budgeted cost must be a valid number.' : undefined,
      });
      return;
    }

    const dateErrors: FormErrors = {};
    if (!isValidDateInput(normalizedStartDate)) dateErrors.startDate = 'Start date must use YYYY-MM-DD format.';
    if (!isValidDateInput(normalizedEndDate)) dateErrors.endDate = 'End date must use YYYY-MM-DD format.';

    if (Object.keys(dateErrors).length > 0) {
      setErrors(dateErrors);
      return;
    }

    setErrors({});
    setSuccessMessage('');
    setLoading(true);
    try {
      const project = await createProject({
        name: name.trim(),
        client_id: clientId.trim(),
        status,
        contract_value: parsedContractValue,
        budget: parsedBudget,
        start_date: normalizedStartDate || undefined,
        end_date: normalizedEndDate || undefined,
      });
      await refresh();
      setSuccessMessage('Project created. Opening project detail...');
      setTimeout(() => router.replace(`/projects/${project.id}` as any), 650);
    } catch (error: any) {
      setErrors({ submit: error?.response?.data?.error || error.message || 'Failed to create project.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <BackButton fallbackRoute="/projects" />
      <Input
        label="Project Name"
        error={errors.name}
        value={name}
        onChangeText={(value) => {
          setName(value);
          clearFieldError('name');
        }}
        placeholder="Enter project name"
      />

      <ClientPicker
        label="Client"
        value={clientId}
        onChange={(value) => {
          setClientId(value);
          clearFieldError('clientId');
        }}
        error={errors.clientId}
      />

      <Select
        label="Status"
        options={STATUS_OPTIONS}
        value={status}
        onValueChange={(value) => setStatus(value as ProjectStatus)}
        placeholder="Select status"
        style={styles.selectField}
      />

      <Input
        label="Start Date"
        error={errors.startDate}
        value={startDate}
        onChangeText={(value) => {
          setStartDate(value);
          clearFieldError('startDate');
        }}
        placeholder="YYYY-MM-DD"
        inputMode="numeric"
      />

      <Input
        label="End Date"
        error={errors.endDate}
        value={endDate}
        onChangeText={(value) => {
          setEndDate(value);
          clearFieldError('endDate');
        }}
        placeholder="YYYY-MM-DD"
        inputMode="numeric"
      />

      <Input
        label="Contract Value"
        error={errors.contractValue}
        value={contractValue}
        onChangeText={(value) => {
          setContractValue(value);
          clearFieldError('contractValue');
        }}
        placeholder="Total payable by client"
        keyboardType="numeric"
      />

      <Input
        label="Budgeted Cost"
        error={errors.budget}
        value={budget}
        onChangeText={(value) => {
          setBudget(value);
          clearFieldError('budget');
        }}
        placeholder="Expected spend to complete"
        keyboardType="numeric"
      />

      {errors.submit ? <Text style={styles.formError}>{t(errors.submit)}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{t(successMessage)}</Text> : null}
      <View style={{ height: 20 }} />
      <Button
        title={loading ? t('Creating...') : t('Create Project')}
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
  formError: {
    color: config.theme.error,
    fontSize: 14,
    marginBottom: 12,
  },
  successText: {
    color: config.theme.success,
    fontSize: 14,
    marginBottom: 12,
  },
  selectField: {
    marginBottom: 16,
  },
});
