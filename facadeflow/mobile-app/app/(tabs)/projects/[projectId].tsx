import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, useWindowDimensions, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../../../src/lib/config';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useProjectsStore } from '../../../src/stores/projectsStore';
import { projectsApi } from '../../../src/api/endpoints';
import { DemoPage, FacadeFlowMark, SectionTitle, StatusPill } from '../../../components/ui/DemoShell';
import type { ExpenseCategory, Project, ProjectExpense, ProjectFinancials } from '../../../src/types';
import { formatCurrency, formatDate, getProjectStatusLabel } from '../../../src/utils';
import { useI18n } from '../../../src/i18n';

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
const EXPENSE_AMOUNT_ERROR = 'Amount is required and must be greater than 0.';

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { currentProject, fetchProject, isLoading } = useProjectsStore();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  React.useEffect(() => { if (projectId) fetchProject(projectId); }, [projectId, fetchProject]);
  const [activeTab, setActiveTab] = React.useState('overview');
  React.useEffect(() => { setActiveTab('overview'); }, [projectId]);
  const project = currentProject;

  if (isLoading || (project && project.id !== projectId)) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={config.theme.primary} /></View>;
  }

  if (!project) {
    return <View style={styles.notFoundContainer}><MaterialIcons name="error-outline" size={48} color={config.theme.textSecondary} /><Text style={styles.notFoundTitle}>{t('Project not found')}</Text><Text style={styles.notFoundText}>{t('This project may have been deleted or is no longer available.')}</Text><Button title="Back to Projects" onPress={() => router.replace('/projects' as any)} /></View>;
  }

  const deleteProject = async () => {
    const deleted = await useProjectsStore.getState().deleteProject(project.id);
    if (deleted) router.replace('/projects' as any);
    else Alert.alert(t('Error'), t('Failed to delete project'));
  };
  const confirmDeleteProject = () => {
    if (Platform.OS === 'web') { if (window.confirm(t('Are you sure you want to delete this project?'))) deleteProject(); return; }
    Alert.alert(t('Delete Project'), t('Are you sure you want to delete this project?'), [{ text: t('Cancel'), style: 'cancel' }, { text: t('Delete'), style: 'destructive', onPress: deleteProject }]);
  };
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'expenses', label: 'Expenses', icon: 'receipt-long' },
    { id: 'report', label: 'Report Preview', icon: 'summarize' },
  ];
  const financials = getProjectFinancials(project);
  const formattedAddress = project.address ? [project.address.street, project.address.city, project.address.state, project.address.zip].filter((part) => Boolean(part && String(part).trim())).join(', ') : '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <DemoPage title={project.name} subtitle="Project profit detail view for the client demo: contract value, budget, expenses, current margin and owner-ready report." eyebrow="Project Control Room">
        <Card style={styles.headerCard} padding="large">
          <View style={[styles.headerTop, isWide && styles.headerTopWide]}>
            <View style={styles.titleBlock}>
              <StatusPill label={getProjectStatusLabel(project.status)} tone={statusTone(project.status)} />
              <Text style={styles.title}>{project.name}</Text>
              <View style={styles.clientRow}><MaterialIcons name="person" size={16} color={config.theme.textSecondary} /><Text style={styles.clientName}>{project.client?.name || t('No client')}</Text></View>
              {formattedAddress ? <View style={styles.clientRow}><MaterialIcons name="location-on" size={16} color={config.theme.textSecondary} /><Text style={styles.address}>{formattedAddress}</Text></View> : null}
            </View>
            <View style={styles.headerActions}>
              <Button title="Edit" variant="outline" icon="edit" onPress={() => router.push(`/projects/${project.id}/edit` as any)} />
              <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteProject} accessibilityRole="button" accessibilityLabel={`${t('Delete')} ${project.name}`}><MaterialIcons name="delete" size={20} color={config.theme.error} /></TouchableOpacity>
            </View>
          </View>
          <View style={styles.kpiGrid}>
            <Kpi label="Contract" value={financials.contract_value} tone={config.theme.primaryHover} />
            <Kpi label="Budget" value={financials.budgeted_cost} tone="#60a5fa" />
            <Kpi label="Actual cost" value={financials.actual_cost} tone={config.theme.warning} />
            <Kpi label="Profit" value={financials.actual_profit} tone={(financials.actual_profit ?? 0) < 0 ? config.theme.error : config.theme.success} />
          </View>
        </Card>

        <View style={styles.tabBar}>{tabs.map((tab) => <TouchableOpacity key={tab.id} style={[styles.tab, activeTab === tab.id && styles.tabActive]} onPress={() => setActiveTab(tab.id)}><MaterialIcons name={tab.icon as any} size={19} color={activeTab === tab.id ? config.theme.text : config.theme.textSecondary} /><Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>{t(tab.label)}</Text></TouchableOpacity>)}</View>

        <Card style={styles.contentCard} padding="large">
          {activeTab === 'overview' && <OverviewTab project={project} />}
          {activeTab === 'expenses' && <ExpensesTab project={project} />}
          {activeTab === 'report' && <ReportPreview project={project} />}
        </Card>
      </DemoPage>
    </ScrollView>
  );
}

function OverviewTab({ project }: { project: Project }) {
  const { t } = useI18n();
  const financials = getProjectFinancials(project);
  const marginText = financials.actual_margin == null ? '—' : `${Math.round(financials.actual_margin * 1000) / 10}%`;
  const variance = financials.cost_variance;
  return (
    <View style={styles.sectionStack}>
      <SectionTitle title="Profit detail view" subtitle="A simple explanation of whether this job is still on plan." />
      <View style={styles.profitPanel}>
        <View><Text style={styles.panelLabel}>{t('Current margin')}</Text><Text style={styles.marginValue}>{marginText}</Text></View>
        <View style={styles.panelCopy}><Text style={styles.panelTitle}>{t(getProfitStory(financials))}</Text><Text style={styles.muted}>{t('Contract value minus actual expenses. Budget variance updates as expenses are recorded.')}</Text></View>
      </View>
      <View style={styles.detailGrid}>
        <Detail label="Client" value={project.client?.name || t('N/A')} />
        <Detail label="Status" value={getProjectStatusLabel(project.status)} />
        <Detail label="Start Date" value={project.start_date || '—'} />
        <Detail label="End Date" value={project.end_date || '—'} />
        <Detail label="Expense Count" value={`${financials.expense_count}`} />
        <Detail label="Cost Variance" value={variance == null ? '—' : formatCurrency(variance)} color={variance != null && variance < 0 ? config.theme.error : config.theme.success} />
        <Detail label="Created" value={formatDate(project.created_at, 'long')} />
        <Detail label="Last Updated" value={formatDate(project.updated_at, 'long')} />
      </View>
      {project.description ? <View style={styles.descriptionBlock}><Text style={styles.detailLabel}>{t('Description')}</Text><Text style={styles.description}>{project.description}</Text></View> : null}
    </View>
  );
}

function ExpensesTab({ project }: { project: Project }) {
  const { t } = useI18n();
  const fetchProject = useProjectsStore((state) => state.fetchProject);
  const [expenses, setExpenses] = React.useState<ProjectExpense[]>(project.expenses || []);
  const [category, setCategory] = React.useState<ExpenseCategory>('materials');
  const [description, setDescription] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [amountError, setAmountError] = React.useState('');
  const [vendor, setVendor] = React.useState('');
  const [expenseDate, setExpenseDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [successMessage, setSuccessMessage] = React.useState('');
  const [isLoadingExpenses, setIsLoadingExpenses] = React.useState(false);
  const [isSavingExpense, setIsSavingExpense] = React.useState(false);
  const descriptionRef = React.useRef<TextInput>(null);
  const amountRef = React.useRef<TextInput>(null);
  const vendorRef = React.useRef<TextInput>(null);
  const expenseDateRef = React.useRef<TextInput>(null);
  const financials = getProjectFinancials(project);
  const loadExpenses = React.useCallback(async () => { setIsLoadingExpenses(true); try { setExpenses(await projectsApi.getExpenses(project.id)); } catch (error: any) { Alert.alert(t('Error'), t(error.response?.data?.error || 'Failed to fetch project expenses')); } finally { setIsLoadingExpenses(false); } }, [project.id, t]);
  React.useEffect(() => { if (project.expenses) setExpenses(project.expenses); else loadExpenses(); }, [loadExpenses, project.expenses]);
  const resetForm = () => { setCategory('materials'); setDescription(''); setAmount(''); setAmountError(''); setVendor(''); setExpenseDate(new Date().toISOString().slice(0, 10)); };
  const normalizeAmount = (value: string) => value.replace(',', '.').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  const createExpense = async () => {
    const trimmedAmount = amount.trim();
    const parsedAmount = Number(trimmedAmount);
    setSuccessMessage('');
    if (!description.trim()) { Alert.alert(t('Error'), t('Expense description is required')); descriptionRef.current?.focus(); return; }
    if (!trimmedAmount || !Number.isFinite(parsedAmount) || parsedAmount <= 0) { setAmountError(EXPENSE_AMOUNT_ERROR); amountRef.current?.focus(); return; }
    if (!expenseDate.trim()) { Alert.alert(t('Error'), t('Expense date is required')); expenseDateRef.current?.focus(); return; }
    setAmountError('');
    setIsSavingExpense(true);
    try {
      const createdExpense = await projectsApi.createExpense(project.id, { category, description: description.trim(), amount: parsedAmount, expense_date: expenseDate.trim(), vendor: vendor.trim() || undefined });
      setExpenses((current) => [createdExpense, ...current.filter((expense) => expense.id !== createdExpense.id)]);
      resetForm();
      const [, updatedProject] = await Promise.all([loadExpenses(), projectsApi.get(project.id)]);
      useProjectsStore.getState().setCurrentProject(updatedProject);
      setSuccessMessage('Expense added. Project totals updated.');
    }
    catch (error: any) { Alert.alert(t('Error'), t(error.response?.data?.error || 'Failed to create project expense')); }
    finally { setIsSavingExpense(false); }
  };
  const deleteExpense = async (expense: ProjectExpense) => {
    const removeExpense = async () => { try { await projectsApi.deleteExpense(project.id, expense.id); await Promise.all([loadExpenses(), fetchProject(project.id)]); } catch (error: any) { Alert.alert(t('Error'), t(error.response?.data?.error || 'Failed to delete project expense')); } };
    if (Platform.OS === 'web') { if (window.confirm(t('Delete this expense?'))) await removeExpense(); return; }
    Alert.alert(t('Delete Expense'), t('Delete this expense?'), [{ text: t('Cancel'), style: 'cancel' }, { text: t('Delete'), style: 'destructive', onPress: removeExpense }]);
  };
  return (
    <View style={styles.sectionStack}>
      <SectionTitle title="Expenses" subtitle="Record costs and immediately show the client how profit changes." />
      <View style={styles.expenseSummary}><Kpi label="Actual Cost" value={financials.actual_cost} tone={config.theme.warning} /><Kpi label="Actual Profit" value={financials.actual_profit} tone={(financials.actual_profit ?? 0) < 0 ? config.theme.error : config.theme.success} /></View>
      <View style={styles.expenseForm}>
        <Select label="Category" options={EXPENSE_CATEGORY_OPTIONS} value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)} style={styles.expenseField} />
        <Input ref={descriptionRef} label="Description" value={description} onChangeText={(value) => { setDescription(value); if (successMessage) setSuccessMessage(''); }} placeholder="e.g. Aluminium profiles" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => amountRef.current?.focus()} />
        <Input ref={amountRef} label="Amount" value={amount} onChangeText={(value) => { setAmount(normalizeAmount(value)); if (amountError) setAmountError(''); if (successMessage) setSuccessMessage(''); }} keyboardType="decimal-pad" inputMode="decimal" placeholder="0.00" error={amountError} returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => vendorRef.current?.focus()} />
        <Input ref={vendorRef} label="Vendor" value={vendor} onChangeText={(value) => { setVendor(value); if (successMessage) setSuccessMessage(''); }} placeholder="Optional" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => expenseDateRef.current?.focus()} />
        <Input ref={expenseDateRef} label="Expense Date" value={expenseDate} onChangeText={(value) => { setExpenseDate(value); if (successMessage) setSuccessMessage(''); }} placeholder="YYYY-MM-DD" returnKeyType="done" onSubmitEditing={createExpense} />
        {successMessage ? <Text style={styles.successMessage}>{t(successMessage)}</Text> : null}
        <Button title="Add Expense" variant="primary" loading={isSavingExpense} disabled={isSavingExpense} onPress={createExpense} fullWidth />
      </View>
      <View style={styles.expenseListHeader}><Text style={styles.expenseListTitle}>{t('Recorded Expenses')}</Text><Text style={styles.expenseListCount}>{expenses.length}</Text></View>
      {isLoadingExpenses ? <ActivityIndicator size="small" color={config.theme.primary} /> : expenses.length === 0 ? <View style={styles.placeholder}><MaterialIcons name="receipt-long" size={48} color={config.theme.border} /><Text style={styles.placeholderText}>{t('No expenses yet')}</Text></View> : expenses.map((expense) => (
        <View key={expense.id} style={styles.expenseRow}><View style={styles.expenseInfo}><Text style={styles.expenseDescription}>{expense.description}</Text><Text style={styles.expenseMeta}>{[t(formatExpenseCategory(expense.category)), formatDate(expense.expense_date, 'short'), expense.vendor].filter(Boolean).join(' - ')}</Text></View><View style={styles.expenseAmountBlock}><Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text><TouchableOpacity style={styles.expenseDeleteButton} onPress={() => deleteExpense(expense)} accessibilityRole="button" accessibilityLabel={`${t('Delete expense')} ${expense.description}`}><MaterialIcons name="delete-outline" size={20} color={config.theme.error} /></TouchableOpacity></View></View>
      ))}
    </View>
  );
}

function ReportPreview({ project }: { project: Project }) {
  const { t } = useI18n();
  const financials = getProjectFinancials(project);
  return (
    <View style={styles.sectionStack}>
      <SectionTitle title="Report preview" subtitle="Brand-polished one-page PDF/report style for the client conversation." />
      <View style={styles.reportPage}>
        <View style={styles.reportHeader}><FacadeFlowMark size={38} /><View><Text style={styles.reportBrand}>FacadeFlow</Text><Text style={styles.reportSubtitle}>{t('Project Profit Report')}</Text></View></View>
        <Text style={styles.reportProject}>{project.name}</Text>
        <Text style={styles.reportClient}>{project.client?.name || t('No client')} • {t(getProjectStatusLabel(project.status))}</Text>
        <View style={styles.reportGrid}><ReportMetric label="Contract" value={financials.contract_value} /><ReportMetric label="Budget" value={financials.budgeted_cost} /><ReportMetric label="Actual cost" value={financials.actual_cost} /><ReportMetric label="Actual profit" value={financials.actual_profit} /></View>
        <View style={styles.reportNote}><Text style={styles.reportNoteTitle}>{t('Owner summary')}</Text><Text style={styles.reportNoteText}>{t(getProfitStory(financials))} {t('This preview is designed to become the printable report/PDF styling in Phase 3.')}</Text></View>
      </View>
    </View>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number | null; tone: string }) { const { t } = useI18n(); return <View style={styles.kpi}><Text style={styles.kpiLabel}>{t(label)}</Text><Text style={[styles.kpiValue, { color: tone }]}>{value == null ? '—' : formatCurrency(value)}</Text></View>; }
function Detail({ label, value, color = config.theme.text }: { label: string; value: string; color?: string }) { const { t } = useI18n(); return <View style={styles.detailCard}><Text style={styles.detailLabel}>{t(label)}</Text><Text style={[styles.detailValue, { color }]}>{value}</Text></View>; }
function ReportMetric({ label, value }: { label: string; value: number | null }) { const { t } = useI18n(); return <View style={styles.reportMetric}><Text style={styles.reportMetricLabel}>{t(label)}</Text><Text style={styles.reportMetricValue}>{value == null ? '—' : formatCurrency(value)}</Text></View>; }
function getProjectFinancials(project: Project): ProjectFinancials { return project.financials || { contract_value: project.contract_value ?? null, budgeted_cost: project.budget ?? null, actual_cost: 0, planned_profit: null, actual_profit: null, cost_variance: null, actual_margin: null, expense_count: 0 }; }
function formatExpenseCategory(category: ExpenseCategory) { return EXPENSE_CATEGORY_OPTIONS.find((option) => option.value === category)?.label || category.replace('_', ' '); }
function statusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'purple' { if (status === 'completed') return 'success'; if (status === 'quoted' || status === 'inquired') return 'warning'; if (status === 'on_hold' || status === 'cancelled') return 'danger'; if (status === 'in_progress') return 'info'; if (status === 'approved') return 'purple'; return 'neutral'; }
function getProfitStory(financials: ProjectFinancials) { const profit = financials.actual_profit ?? 0; const variance = financials.cost_variance ?? 0; if (profit < 0) return 'This project is currently losing money.'; if (variance < 0) return 'Profit is positive, but spending is above budget.'; return 'This project is currently profitable and inside the demo control range.'; }

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: config.theme.background },
  notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: config.theme.background },
  notFoundTitle: { marginTop: 12, fontSize: 20, fontWeight: '800', color: config.theme.text },
  notFoundText: { marginTop: 8, marginBottom: 20, fontSize: 14, color: config.theme.textSecondary, textAlign: 'center' },
  container: { flex: 1, backgroundColor: config.theme.background },
  scrollContent: { paddingBottom: 110 },
  headerCard: { gap: 18 },
  headerTop: { gap: 16 },
  headerTopWide: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleBlock: { gap: 10, flex: 1 },
  title: { fontSize: 28, lineHeight: 33, fontWeight: '900', color: config.theme.text, letterSpacing: -0.7 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deleteButton: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)', backgroundColor: 'rgba(239,68,68,0.10)' },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  clientName: { fontSize: 15, color: config.theme.textSecondary, fontWeight: '700' },
  address: { fontSize: 14, color: config.theme.textSecondary, flex: 1 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpi: { flexGrow: 1, flexBasis: 160, borderWidth: 1, borderColor: config.theme.border, borderRadius: 16, padding: 14, backgroundColor: 'rgba(255,255,255,0.03)', gap: 5 },
  kpiLabel: { color: config.theme.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  kpiValue: { fontSize: 20, fontWeight: '900', letterSpacing: -0.4 },
  tabBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: config.theme.border, backgroundColor: 'rgba(255,255,255,0.025)' },
  tabActive: { backgroundColor: 'rgba(94,106,210,0.22)', borderColor: 'rgba(113,112,255,0.45)' },
  tabLabel: { fontSize: 13, fontWeight: '800', color: config.theme.textSecondary },
  tabLabelActive: { color: config.theme.text },
  contentCard: { gap: 16 },
  sectionStack: { gap: 16 },
  profitPanel: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, borderWidth: 1, borderColor: config.theme.border, borderRadius: 18, padding: 18, backgroundColor: 'rgba(94,106,210,0.10)' },
  panelLabel: { color: config.theme.textSecondary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  marginValue: { color: config.theme.text, fontSize: 44, fontWeight: '900', letterSpacing: -1.3 },
  panelCopy: { flex: 1, minWidth: 240, gap: 6 },
  panelTitle: { color: config.theme.text, fontSize: 18, fontWeight: '900' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  detailCard: { flexGrow: 1, flexBasis: 190, borderWidth: 1, borderColor: config.theme.borderSubtle, borderRadius: 14, padding: 13, backgroundColor: 'rgba(255,255,255,0.025)', gap: 4 },
  detailLabel: { color: config.theme.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { color: config.theme.text, fontSize: 14, fontWeight: '800' },
  descriptionBlock: { gap: 8, borderWidth: 1, borderColor: config.theme.borderSubtle, borderRadius: 14, padding: 14 },
  description: { fontSize: 14, color: config.theme.textSecondary, lineHeight: 20 },
  expenseSummary: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  expenseForm: { gap: 12, padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: config.theme.border },
  expenseField: { zIndex: 20 },
  expenseListHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  expenseListTitle: { color: config.theme.text, fontSize: 16, fontWeight: '900' },
  expenseListCount: { color: config.theme.textSecondary, fontSize: 13, fontWeight: '800' },
  placeholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  placeholderText: { marginTop: 12, color: config.theme.textSecondary, fontSize: 14 },
  successMessage: { color: config.theme.success, fontSize: 13, fontWeight: '800' },
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: config.theme.borderSubtle },
  expenseInfo: { flex: 1, gap: 4 },
  expenseDescription: { color: config.theme.text, fontSize: 14, fontWeight: '800' },
  expenseMeta: { color: config.theme.textMuted, fontSize: 12, textTransform: 'capitalize' },
  expenseAmountBlock: { alignItems: 'flex-end', gap: 4 },
  expenseAmount: { color: config.theme.warning, fontSize: 14, fontWeight: '900' },
  expenseDeleteButton: { padding: 6 },
  reportPage: { backgroundColor: '#f8fafc', borderRadius: 18, padding: 20, gap: 16 },
  reportHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reportBrand: { color: '#111827', fontSize: 19, fontWeight: '900' },
  reportSubtitle: { color: '#64748b', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7 },
  reportProject: { color: '#111827', fontSize: 26, lineHeight: 31, fontWeight: '900', letterSpacing: -0.8 },
  reportClient: { color: '#475569', fontSize: 14, fontWeight: '700' },
  reportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reportMetric: { flexGrow: 1, flexBasis: 150, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 13, backgroundColor: '#ffffff', gap: 5 },
  reportMetricLabel: { color: '#64748b', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  reportMetricValue: { color: '#111827', fontSize: 17, fontWeight: '900' },
  reportNote: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 14, gap: 4 },
  reportNoteTitle: { color: '#111827', fontSize: 14, fontWeight: '900' },
  reportNoteText: { color: '#475569', fontSize: 13, lineHeight: 19 },
  muted: { color: config.theme.textSecondary, fontSize: 14, lineHeight: 20 },
});
