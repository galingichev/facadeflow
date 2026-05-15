import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../../../src/lib/config';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useProjectsStore } from '../../../src/stores/projectsStore';
import { projectsApi } from '../../../src/api/endpoints';
import type { ExpenseCategory, Project, ProjectExpense, ProjectFinancials } from '../../../src/types';
import { formatCurrency, formatDate, getProjectStatusColor } from '../../../src/utils';

const EXPENSE_CATEGORY_OPTIONS: { label: string; value: ExpenseCategory }[] = [
  { label: 'Materials', value: 'materials' },
  { label: 'Labor', value: 'labor' },
  { label: 'Subcontractor', value: 'subcontractor' },
  { label: 'Equipment', value: 'equipment' },
  { label: 'Transport', value: 'transport' },
  { label: 'Permits', value: 'permits' },
  { label: 'Overhead', value: 'overhead' },
  { label: 'Other', value: 'other' },
];

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { currentProject, fetchProject, isLoading } = useProjectsStore();

  React.useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId, fetchProject]);

  const [activeTab, setActiveTab] = React.useState('overview');
  React.useEffect(() => {
    setActiveTab('overview');
  }, [projectId]);

  const project = currentProject;

  if (isLoading || !project || project.id !== projectId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={config.theme.primary} />
      </View>
    );
  }

  const deleteProject = async () => {
    await useProjectsStore.getState().deleteProject(project.id);
    router.back();
  };

  const confirmDeleteProject = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this project?')) {
        deleteProject();
      }
      return;
    }

    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteProject,
        },
      ]
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'expenses', label: 'Expenses', icon: 'receipt-long' },
    { id: 'photos', label: 'Photos', icon: 'photo-library' },
    { id: 'tasks', label: 'Tasks', icon: 'checklist' },
    { id: 'estimates', label: 'Estimates', icon: 'description' },
    { id: 'notes', label: 'Notes', icon: 'notes' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Project Header */}
      <Card style={styles.headerCard} padding="medium">
        <View style={styles.headerTop}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{project.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getProjectStatusColor(project.status) }]}>
              <Text style={styles.statusText}>{project.status.replace('_', ' ')}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push(`/projects/${project.id}/edit` as any)}
            >
              <MaterialIcons name="edit" size={20} color={config.theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={confirmDeleteProject}
            >
              <MaterialIcons name="delete" size={20} color={config.theme.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.clientRow}>
          <MaterialIcons name="person" size={16} color={config.theme.textSecondary} />
          <Text style={styles.clientName}>{project.client?.name || 'No client'}</Text>
        </View>

        {project.address && (
        <View style={styles.addressRow}>
          <MaterialIcons name="location-on" size={16} color={config.theme.textSecondary} />
          <Text style={styles.address}>
            {project.address.street}, {project.address.city}, {project.address.state} {project.address.zip}
          </Text>
        </View>
        )}

        {project.description && (
          <Text style={styles.description}>{project.description}</Text>
        )}

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Start Date</Text>
            <Text style={styles.metaValue}>{project.start_date || '—'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>End Date</Text>
            <Text style={styles.metaValue}>{project.end_date || '—'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Budgeted Cost</Text>
            <Text style={styles.metaValue}>{project.budget !== undefined && project.budget !== null ? formatCurrency(project.budget) : '—'}</Text>
          </View>
        </View>
      </Card>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.id ? config.theme.primary : config.theme.textSecondary}
            />
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <Card style={styles.contentCard} padding="medium">
        {activeTab === 'overview' && <OverviewTab project={project} />}
        {activeTab === 'expenses' && <ExpensesTab project={project} />}
        {activeTab === 'photos' && <PhotosTab projectId={project.id} />}
        {activeTab === 'tasks' && <TasksTab projectId={project.id} />}
        {activeTab === 'estimates' && <EstimatesTab projectId={project.id} />}
        {activeTab === 'notes' && <NotesTab projectId={project.id} />}
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button
          title="Add Photo"
          icon="camera-alt"
          variant="outline"
          size="small"
          style={styles.quickActionButton}
          onPress={() => router.push(`/projects/photo?projectId=${project.id}` as any)}
        />
        <Button
          title="Voice Note"
          icon="mic"
          variant="outline"
          size="small"
          style={styles.quickActionButton}
          onPress={() => router.push('/field/voice' as any)}
        />
        <Button
          title="Estimate"
          icon="description"
          variant="outline"
          size="small"
          style={styles.quickActionButton}
          onPress={() => router.push(`/projects/estimate/new?projectId=${project.id}` as any)}
        />
      </View>
    </ScrollView>
  );
}

function OverviewTab({ project }: { project: Project }) {
  const financials = project.financials || {
    contract_value: project.contract_value ?? null,
    budgeted_cost: project.budget ?? null,
    actual_cost: 0,
    planned_profit: null,
    actual_profit: null,
    cost_variance: null,
    actual_margin: null,
    expense_count: 0,
  };

  return (
    <View>
      <Text style={styles.tabContentTitle}>Financial Summary</Text>
      <View style={styles.financialGrid}>
        <FinancialMetric label="Contract Value" value={financials.contract_value} />
        <FinancialMetric label="Budgeted Cost" value={financials.budgeted_cost} />
        <FinancialMetric label="Actual Cost" value={financials.actual_cost} />
        <FinancialMetric label="Actual Profit" value={financials.actual_profit} />
      </View>

      <Text style={styles.tabContentTitle}>Project Details</Text>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Client</Text>
        <Text style={styles.detailValue}>{project.client?.name || 'N/A'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Status</Text>
        <Text style={[styles.detailValue, { textTransform: 'capitalize' }]}>{project.status.replace('_', ' ')}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Contract Value</Text>
        <Text style={styles.detailValue}>{project.contract_value !== undefined && project.contract_value !== null ? formatCurrency(project.contract_value) : '—'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Budgeted Cost</Text>
        <Text style={styles.detailValue}>{project.budget !== undefined && project.budget !== null ? formatCurrency(project.budget) : '—'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Expense Count</Text>
        <Text style={styles.detailValue}>{financials.expense_count}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Created</Text>
        <Text style={styles.detailValue}>{formatDate(project.created_at, 'long')}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Last Updated</Text>
        <Text style={styles.detailValue}>{formatDate(project.updated_at, 'long')}</Text>
      </View>
      {project.description && (
        <View style={styles.descriptionBlock}>
          <Text style={styles.detailLabel}>Description</Text>
          <Text style={styles.description}>{project.description}</Text>
        </View>
      )}
    </View>
  );
}

function ExpensesTab({ project }: { project: Project }) {
  const fetchProject = useProjectsStore((state) => state.fetchProject);
  const [expenses, setExpenses] = React.useState<ProjectExpense[]>(project.expenses || []);
  const [category, setCategory] = React.useState<ExpenseCategory>('materials');
  const [description, setDescription] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [vendor, setVendor] = React.useState('');
  const [expenseDate, setExpenseDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [isLoadingExpenses, setIsLoadingExpenses] = React.useState(false);
  const [isSavingExpense, setIsSavingExpense] = React.useState(false);

  const financials = getProjectFinancials(project);

  const loadExpenses = React.useCallback(async () => {
    setIsLoadingExpenses(true);
    try {
      const nextExpenses = await projectsApi.getExpenses(project.id);
      setExpenses(nextExpenses);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to fetch project expenses');
    } finally {
      setIsLoadingExpenses(false);
    }
  }, [project.id]);

  React.useEffect(() => {
    if (project.expenses) {
      setExpenses(project.expenses);
      return;
    }

    loadExpenses();
  }, [loadExpenses, project.expenses]);

  const resetForm = () => {
    setCategory('materials');
    setDescription('');
    setAmount('');
    setVendor('');
    setExpenseDate(new Date().toISOString().slice(0, 10));
  };

  const createExpense = async () => {
    const parsedAmount = Number(amount);

    if (!description.trim()) {
      Alert.alert('Error', 'Expense description is required');
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      Alert.alert('Error', 'Expense amount must be a non-negative number');
      return;
    }

    if (!expenseDate.trim()) {
      Alert.alert('Error', 'Expense date is required');
      return;
    }

    setIsSavingExpense(true);
    try {
      await projectsApi.createExpense(project.id, {
        category,
        description: description.trim(),
        amount: parsedAmount,
        expense_date: expenseDate.trim(),
        vendor: vendor.trim() || undefined,
      });
      resetForm();
      await Promise.all([loadExpenses(), fetchProject(project.id)]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create project expense');
    } finally {
      setIsSavingExpense(false);
    }
  };

  const deleteExpense = async (expense: ProjectExpense) => {
    const removeExpense = async () => {
      try {
        await projectsApi.deleteExpense(project.id, expense.id);
        await Promise.all([loadExpenses(), fetchProject(project.id)]);
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.error || 'Failed to delete project expense');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Delete this expense?')) {
        await removeExpense();
      }
      return;
    }

    Alert.alert('Delete Expense', 'Delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: removeExpense },
    ]);
  };

  return (
    <View>
      <Text style={styles.tabContentTitle}>Expenses</Text>

      <View style={styles.expenseSummary}>
        <FinancialMetric label="Actual Cost" value={financials.actual_cost} />
        <FinancialMetric label="Actual Profit" value={financials.actual_profit} />
      </View>

      <View style={styles.expenseForm}>
        <Select
          label="Category"
          options={EXPENSE_CATEGORY_OPTIONS}
          value={category}
          onValueChange={(value) => setCategory(value as ExpenseCategory)}
          style={styles.expenseField}
        />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Aluminium profiles"
        />
        <Input
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
        <Input
          label="Vendor"
          value={vendor}
          onChangeText={setVendor}
          placeholder="Optional"
        />
        <Input
          label="Expense Date"
          value={expenseDate}
          onChangeText={setExpenseDate}
          placeholder="YYYY-MM-DD"
        />
        <Button
          title="Add Expense"
          variant="primary"
          loading={isSavingExpense}
          onPress={createExpense}
          fullWidth
        />
      </View>

      <View style={styles.expenseListHeader}>
        <Text style={styles.expenseListTitle}>Recorded Expenses</Text>
        <Text style={styles.expenseListCount}>{expenses.length}</Text>
      </View>

      {isLoadingExpenses ? (
        <ActivityIndicator size="small" color={config.theme.primary} />
      ) : expenses.length === 0 ? (
        <View style={styles.placeholder}>
          <MaterialIcons name="receipt-long" size={48} color={config.theme.border} />
          <Text style={styles.placeholderText}>No expenses yet</Text>
        </View>
      ) : (
        expenses.map((expense) => (
          <View key={expense.id} style={styles.expenseRow}>
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseDescription}>{expense.description}</Text>
              <Text style={styles.expenseMeta}>
                {formatExpenseCategory(expense.category)} • {formatDate(expense.expense_date, 'short')}
                {expense.vendor ? ` • ${expense.vendor}` : ''}
              </Text>
            </View>
            <View style={styles.expenseAmountBlock}>
              <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
              <TouchableOpacity
                style={styles.expenseDeleteButton}
                onPress={() => deleteExpense(expense)}
                accessibilityRole="button"
                accessibilityLabel={`Delete expense ${expense.description}`}
              >
                <MaterialIcons name="delete-outline" size={20} color={config.theme.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function FinancialMetric({ label, value }: { label: string; value: number | null }) {
  return (
    <View style={styles.financialMetric}>
      <Text style={styles.financialLabel}>{label}</Text>
      <Text style={styles.financialValue}>{value === null || value === undefined ? '—' : formatCurrency(value)}</Text>
    </View>
  );
}

function getProjectFinancials(project: Project): ProjectFinancials {
  return project.financials || {
    contract_value: project.contract_value ?? null,
    budgeted_cost: project.budget ?? null,
    actual_cost: 0,
    planned_profit: null,
    actual_profit: null,
    cost_variance: null,
    actual_margin: null,
    expense_count: 0,
  };
}

function formatExpenseCategory(category: ExpenseCategory) {
  return category.replace('_', ' ');
}

function PhotosTab({ projectId }: { projectId: string }) {
  return (
    <View>
      <Text style={styles.tabContentTitle}>Project Photos</Text>
      <View style={styles.placeholder}>
        <MaterialIcons name="photo-library" size={48} color={config.theme.border} />
        <Text style={styles.placeholderText}>No photos yet</Text>
        <Button
          title="Take Photo"
          variant="primary"
          size="small"
          onPress={() => {}}
          style={{ marginTop: 12 }}
        />
      </View>
    </View>
  );
}

function TasksTab({ projectId }: { projectId: string }) {
  return (
    <View>
      <Text style={styles.tabContentTitle}>Tasks</Text>
      <View style={styles.placeholder}>
        <MaterialIcons name="checklist" size={48} color={config.theme.border} />
        <Text style={styles.placeholderText}>No tasks yet</Text>
      </View>
    </View>
  );
}

function EstimatesTab({ projectId }: { projectId: string }) {
  return (
    <View>
      <Text style={styles.tabContentTitle}>Estimates</Text>
      <View style={styles.placeholder}>
        <MaterialIcons name="description" size={48} color={config.theme.border} />
        <Text style={styles.placeholderText}>No estimates yet</Text>
        <Button
          title="Create Estimate"
          variant="primary"
          size="small"
          onPress={() => {}}
          style={{ marginTop: 12 }}
        />
      </View>
    </View>
  );
}

function NotesTab({ projectId }: { projectId: string }) {
  return (
    <View>
      <Text style={styles.tabContentTitle}>Notes & Activity</Text>
      <View style={styles.placeholder}>
        <MaterialIcons name="notes" size={48} color={config.theme.border} />
        <Text style={styles.placeholderText}>No notes yet</Text>
      </View>
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
    backgroundColor: config.theme.background,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: config.theme.text,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientName: {
    marginLeft: 6,
    fontSize: 15,
    color: config.theme.text,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  address: {
    marginLeft: 6,
    fontSize: 14,
    color: config.theme.textSecondary,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: config.theme.textSecondary,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: config.theme.border,
  },
  metaItem: {
    alignItems: 'center',
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: config.theme.textSecondary,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: config.theme.text,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: config.theme.border,
    backgroundColor: config.theme.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: config.theme.primary,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: config.theme.textSecondary,
    marginTop: 4,
  },
  tabLabelActive: {
    color: config.theme.primary,
    fontWeight: '600',
  },
  contentCard: {
    margin: 16,
    minHeight: 300,
  },
  tabContentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: config.theme.text,
    marginBottom: 16,
  },
  financialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  financialMetric: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: config.theme.border,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: config.theme.surface,
  },
  financialLabel: {
    fontSize: 12,
    color: config.theme.textSecondary,
    marginBottom: 6,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '700',
    color: config.theme.text,
  },
  expenseSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  expenseForm: {
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: config.theme.border,
  },
  expenseField: {
    marginBottom: 16,
  },
  expenseListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  expenseListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: config.theme.text,
  },
  expenseListCount: {
    fontSize: 13,
    fontWeight: '600',
    color: config.theme.textSecondary,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: config.theme.border,
  },
  expenseInfo: {
    flex: 1,
    paddingRight: 12,
  },
  expenseDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: config.theme.text,
    marginBottom: 4,
  },
  expenseMeta: {
    fontSize: 12,
    color: config.theme.textSecondary,
    textTransform: 'capitalize',
  },
  expenseAmountBlock: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: config.theme.text,
    marginBottom: 6,
  },
  expenseDeleteButton: {
    padding: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: config.theme.border,
  },
  detailLabel: {
    fontSize: 14,
    color: config.theme.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: config.theme.text,
    textTransform: 'capitalize',
  },
  descriptionBlock: {
    marginTop: 12,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  placeholderText: {
    marginTop: 12,
    color: config.theme.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: config.theme.border,
    backgroundColor: config.theme.surface,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
