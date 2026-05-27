import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { config, getApiUrl } from '../../src/lib/config/index';
import { formatCurrency, formatDate, getProjectStatusLabel } from '../../src/utils';
import { formatMarginPercent, getBudgetActualPercent, getJobHealth, getLastExpense, getPaymentReadiness } from '../../src/utils/projectInsights';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DemoPage, FacadeFlowMark, MoneyText, SectionTitle, StatusPill } from '../../components/ui/DemoShell';
import type { DashboardSummary, Project, ProjectExpense } from '../../src/types';

type RiskProject = { project: Project; reason: string; tone: 'warning' | 'danger' };
type RecentExpense = ProjectExpense & { projectName: string; clientName?: string };

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    const apiBaseUrl = getApiUrl();
    try {
      const [summaryRes, projectsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/dashboard/summary`),
        fetch(`${apiBaseUrl}/projects`),
      ]);
      if (!summaryRes.ok) throw new Error('Failed to fetch summary');
      if (!projectsRes.ok) throw new Error('Failed to fetch projects');
      const summaryData = await summaryRes.json();
      const projectsData = await projectsRes.json();
      const listedProjects = projectsData.data || [];
      const detailedProjects = await Promise.all(
        listedProjects.map(async (project: Project) => {
          try {
            const detailRes = await fetch(`${apiBaseUrl}/projects/${project.id}`);
            if (!detailRes.ok) return project;
            const detailData = await detailRes.json();
            return detailData.data || project;
          } catch {
            return project;
          }
        })
      );
      setSummary(summaryData.data);
      setProjects(detailedProjects);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setLoading(true); handleFetch(); }, []);

  const actualProfit = summary?.total_actual_profit ?? 0;
  const margin = summary?.actual_margin;
  const topProjects = useMemo(() => projects.slice(0, 4), [projects]);
  const atRiskProjects = useMemo(() => getAtRiskProjects(projects), [projects]);
  const recentExpenses = useMemo(() => getRecentExpenses(projects), [projects]);
  const ownerBriefing = useMemo(() => getOwnerBriefing(projects, summary), [projects, summary]);
  const primaryReportProject = useMemo(() => projects.find((project) => project.status === 'in_progress') || projects[0], [projects]);
  const quickStats = [
    { label: 'Contract value', value: formatCurrency(summary?.total_contract_value ?? 0), icon: 'payments', tone: config.theme.primaryHover },
    { label: 'Budgeted cost', value: formatCurrency(summary?.total_budgeted_cost ?? 0), icon: 'account-balance-wallet', tone: '#60a5fa' },
    { label: 'Actual cost', value: formatCurrency(summary?.total_actual_cost ?? 0), icon: 'receipt-long', tone: config.theme.warning },
    { label: 'Actual profit', value: formatCurrency(actualProfit), icon: 'trending-up', tone: actualProfit < 0 ? config.theme.error : config.theme.success },
  ];

  if (loading) {
    return <DemoPage title="Loading dashboard" subtitle="Preparing the FacadeFlow client demo workspace."><View style={styles.centerCard}><Text style={styles.muted}>Loading dashboard...</Text></View></DemoPage>;
  }

  if (error) {
    return <DemoPage title="Dashboard unavailable" subtitle="The demo backend did not respond."><Card><Text style={styles.error}>{error}</Text><Button title="Retry" onPress={() => { setLoading(true); setError(null); handleFetch(); }} /></Card></DemoPage>;
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <DemoPage
        title="Run facade, window and door jobs with profit visible from day one."
        subtitle="FacadeFlow turns scattered client notes, budgets and expenses into a clean operating dashboard for contractors who need every project to stay on margin."
        rightSlot={<View style={styles.headerActions}><Button title="New Project" icon="add" onPress={() => router.push('/projects/create' as any)} /><Button title="View Projects" variant="outline" icon="business-center" onPress={() => router.push('/projects' as any)} /></View>}
      >
        <Card style={styles.introPanel} padding="large">
          <View style={styles.introLogo}><FacadeFlowMark size={46} /><View><Text style={styles.introTitle}>Client demo storyline</Text><Text style={styles.muted}>Show the owner how a job moves from quote to expenses to profit report.</Text></View></View>
          <View style={styles.storySteps}>
            {['Client and project created', 'Budget and contract recorded', 'Expenses tracked by category', 'At-risk jobs highlighted', 'One-page profit report preview'].map((item, index) => (
              <View key={item} style={styles.storyStep}><Text style={styles.storyNumber}>{index + 1}</Text><Text style={styles.storyText}>{item}</Text></View>
            ))}
          </View>
        </Card>

        <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
          {quickStats.map((stat) => (
            <Card key={stat.label} style={[styles.metricCard, isWide && styles.metricCardWide]} padding="medium">
              <View style={styles.metricIconRow}><View style={[styles.metricIcon, { backgroundColor: `${stat.tone}22`, borderColor: `${stat.tone}55` }]}><MaterialIcons name={stat.icon as any} size={20} color={stat.tone} /></View><Text style={styles.metricLabel}>{stat.label}</Text></View>
              <MoneyText value={stat.value} color={stat.tone} />
            </Card>
          ))}
        </View>

        <Card style={styles.ownerBriefingCard} padding="large">
          <SectionTitle title="Owner briefing" subtitle="What needs attention before the next site or client call." />
          <View style={[styles.briefingGrid, isWide && styles.briefingGridWide]}>
            {ownerBriefing.map((item) => (
              <View key={item.title} style={styles.briefingItem}>
                <View style={[styles.briefingIcon, { backgroundColor: `${item.color}22`, borderColor: `${item.color}55` }]}><MaterialIcons name={item.icon as any} size={19} color={item.color} /></View>
                <View style={styles.briefingText}><Text style={styles.briefingTitle}>{item.title}</Text><Text style={styles.briefingCopy}>{item.copy}</Text></View>
              </View>
            ))}
          </View>
        </Card>

        <View style={[styles.mainGrid, isWide && styles.mainGridWide]}>
          <Card style={styles.snapshotCard} padding="large">
            <SectionTitle title="Profit Snapshot" subtitle="Dashboard summary: the client can understand portfolio health in under one minute." />
            <View style={styles.snapshotHero}>
              <Text style={styles.snapshotLabel}>Portfolio margin</Text>
              <Text style={styles.marginValue}>{formatMargin(margin)}</Text>
              <Text style={styles.muted}>{summary?.profitable_projects ?? 0} profitable projects • {summary?.loss_projects ?? 0} loss projects • {summary?.total_expenses ?? 0} expenses</Text>
            </View>
            <View style={styles.financeRows}>
              <FinanceRow label="Projects with financials" value={`${summary?.projects_with_financials ?? 0} of ${summary?.total_projects ?? 0}`} />
              <FinanceRow label="Active projects" value={`${summary?.active_projects ?? 0}`} />
              <FinanceRow label="Revenue pipeline" value={formatCurrency(summary?.revenue_pipeline ?? 0)} />
            </View>
          </Card>

          <Card style={styles.workflowCard} padding="large">
            <SectionTitle title="At-risk projects" subtitle="Highlights jobs that need a quick owner decision." />
            {atRiskProjects.length === 0 ? <View style={styles.safeState}><MaterialIcons name="verified" size={24} color={config.theme.success} /><Text style={styles.muted}>No major margin or status risk in the current demo data.</Text></View> : atRiskProjects.map(({ project, reason, tone }) => (
              <View key={project.id} style={styles.riskRow}>
                <StatusPill label={tone === 'danger' ? 'High risk' : 'Watch'} tone={tone} />
                <Text style={styles.riskName}>{project.name}</Text>
                <Text style={styles.riskReason}>{reason}</Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={[styles.mainGrid, isWide && styles.mainGridWide]}>
          <Card style={styles.snapshotCard} padding="large">
            <SectionTitle title="Recent expenses" subtitle="The live feed that explains why profit changed." />
            {recentExpenses.length === 0 ? <Text style={styles.muted}>No expenses recorded yet.</Text> : recentExpenses.map((expense) => (
              <View key={expense.id} style={styles.expenseRow}>
                <View style={styles.expenseIcon}><MaterialIcons name="receipt-long" size={18} color={config.theme.warning} /></View>
                <View style={styles.expenseText}><Text style={styles.expenseTitle}>{expense.description}</Text><Text style={styles.expenseMeta}>{expense.projectName} • {formatDate(expense.expense_date, 'short')}</Text></View>
                <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
              </View>
            ))}
          </Card>

          <Card style={styles.workflowCard} padding="large">
            <SectionTitle title="Report preview" subtitle="Client-facing snapshot with the next financial action." />
            <View style={styles.reportPreview}>
              <View style={styles.reportHeader}><FacadeFlowMark size={30} /><View><Text style={styles.reportTitle}>FacadeFlow Project Report</Text><Text style={styles.reportSub}>{primaryReportProject?.name || 'Demo portfolio'} • {primaryReportProject?.client?.name || 'Demo client'}</Text></View></View>
              <FinanceRow label="Contract value" value={formatCurrency(primaryReportProject?.financials?.contract_value ?? primaryReportProject?.contract_value ?? summary?.total_contract_value ?? 0)} />
              <FinanceRow label="Budgeted cost" value={formatCurrency(primaryReportProject?.financials?.budgeted_cost ?? primaryReportProject?.budget ?? summary?.total_budgeted_cost ?? 0)} />
              <FinanceRow label="Actual cost" value={formatCurrency(primaryReportProject?.financials?.actual_cost ?? summary?.total_actual_cost ?? 0)} />
              <FinanceRow label="Profit / margin" value={`${formatCurrency(primaryReportProject?.financials?.actual_profit ?? summary?.total_actual_profit ?? 0)} • ${formatMarginPercent(primaryReportProject?.financials?.actual_margin ?? summary?.actual_margin)}`} />
              {primaryReportProject ? <StatusPill label={getPaymentReadiness(primaryReportProject).label} tone={getPaymentReadiness(primaryReportProject).tone} /> : null}
              <View style={styles.reportFooter}><Text style={styles.reportFooterText}>Notes / next action: verify latest site costs, then send the owner-ready progress claim.</Text></View>
            </View>
          </Card>
        </View>

        <SectionTitle title="Active demo projects" subtitle="Realistic sample work for client discussion." />
        <View style={[styles.projectGrid, isWide && styles.projectGridWide]}>
          {topProjects.map((project) => <ProjectPreview key={project.id} project={project} onPress={() => router.push(`/projects/${project.id}` as any)} />)}
        </View>

        <Card style={styles.actionPanel} padding="large">
          <View style={styles.actionText}><Text style={styles.actionTitle}>Ready for a client walkthrough</Text><Text style={styles.muted}>Use the demo data only. Show dashboard → at-risk project → expenses → report preview.</Text></View>
          <View style={styles.actionButtons}><Button title="New Project" icon="add" onPress={() => router.push('/projects/create' as any)} /><Button title="Add Client" variant="secondary" icon="person-add" onPress={() => router.push('/clients/create' as any)} /></View>
        </Card>
      </DemoPage>
    </ScrollView>
  );
}

function ProjectPreview({ project, onPress }: { project: Project; onPress: () => void }) {
  const financials = project.financials;
  const contract = financials?.contract_value ?? project.contract_value ?? null;
  const budget = financials?.budgeted_cost ?? project.budget ?? null;
  const actualCost = financials?.actual_cost ?? 0;
  const profit = financials?.actual_profit ?? null;
  const margin = financials?.actual_margin ?? null;
  const health = getJobHealth(project);
  const readiness = getPaymentReadiness(project);
  const lastExpense = getLastExpense(project);
  const budgetPercent = getBudgetActualPercent(project);
  return (
    <Card style={styles.projectPreview} onPress={onPress} padding="medium">
      <View style={styles.projectPillRow}><StatusPill label={getProjectStatusLabel(project.status)} tone={statusTone(project.status)} /><StatusPill label={health.label} tone={health.tone} /></View>
      <Text style={styles.projectName}>{project.name}</Text>
      <Text style={styles.projectClient}>{project.client?.name || 'No client'}</Text>
      <View style={styles.projectMoneyRow}><Text style={styles.smallLabel}>Contract</Text><Text style={styles.smallValue}>{contract != null ? formatCurrency(contract) : '—'}</Text></View>
      <View style={styles.projectMoneyRow}><Text style={styles.smallLabel}>Actual cost</Text><Text style={styles.smallValue}>{formatCurrency(actualCost)}</Text></View>
      <View style={styles.projectMoneyRow}><Text style={styles.smallLabel}>Profit / margin</Text><Text style={[styles.smallValue, { color: profit != null && profit < 0 ? config.theme.error : config.theme.success }]}>{profit == null ? '—' : `${formatCurrency(profit)} • ${formatMarginPercent(margin)}`}</Text></View>
      <View style={styles.budgetBlock}><View style={styles.projectMoneyRow}><Text style={styles.smallLabel}>Budget vs actual</Text><Text style={styles.smallValue}>{budget == null ? '—' : `${budgetPercent}%`}</Text></View><View style={styles.progressTrack}><View style={[styles.budgetFill, { width: `${budgetPercent}%`, backgroundColor: budgetPercent > 100 ? config.theme.error : config.theme.primaryHover }]} /></View></View>
      <Text style={styles.lastExpense}>Last expense: {lastExpense ? `${lastExpense.description} • ${formatCurrency(lastExpense.amount)}` : 'No expenses yet'}</Text>
      <StatusPill label={readiness.label} tone={readiness.tone} />
    </Card>
  );
}

function FinanceRow({ label, value }: { label: string; value: string }) { return <View style={styles.financeRow}><Text style={styles.financeLabel}>{label}</Text><Text style={styles.financeValue}>{value}</Text></View>; }
function formatMargin(value: number | null | undefined) { return formatMarginPercent(value); }
function statusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'purple' { if (status === 'completed') return 'success'; if (status === 'quoted' || status === 'inquired') return 'warning'; if (status === 'on_hold' || status === 'cancelled') return 'danger'; if (status === 'in_progress') return 'info'; if (status === 'approved') return 'purple'; return 'neutral'; }
function getOwnerBriefing(projects: Project[], summary: DashboardSummary | null) {
  const healthRows = projects.map((project) => ({ project, health: getJobHealth(project) }));
  const riskCount = healthRows.filter(({ health }) => health.tone === 'danger' || health.label === 'Low margin').length;
  const claimReady = projects.filter((project) => getPaymentReadiness(project).label === 'Ready for progress claim').length;
  const recentTotal = getRecentExpenses(projects).reduce((sum, expense) => sum + expense.amount, 0);
  const nextRisk = healthRows.find(({ health }) => health.tone === 'danger' || health.label === 'Low margin');
  return [
    { title: 'Job Health', copy: riskCount > 0 ? `${riskCount} project${riskCount === 1 ? '' : 's'} need owner review.` : 'All active demo jobs look controlled.', icon: riskCount > 0 ? 'warning' : 'verified', color: riskCount > 0 ? config.theme.warning : config.theme.success },
    { title: 'Payment readiness', copy: claimReady > 0 ? `${claimReady} job${claimReady === 1 ? '' : 's'} ready for progress claim.` : 'No progress claim is ready yet.', icon: 'request-quote', color: claimReady > 0 ? config.theme.success : config.theme.textMuted },
    { title: 'Recent cost movement', copy: `${formatCurrency(recentTotal)} in latest recorded facade expenses.`, icon: 'receipt-long', color: config.theme.warning },
    { title: 'Next owner decision', copy: nextRisk ? `${nextRisk.project.name}: ${nextRisk.health.reason}` : `${summary?.active_projects ?? 0} active projects can continue as planned.`, icon: 'assignment-late', color: nextRisk ? config.theme.error : config.theme.primaryHover },
  ];
}
function getAtRiskProjects(projects: Project[]): RiskProject[] {
  return projects.map((project) => {
    const f = project.financials;
    const variance = f?.cost_variance ?? null;
    const margin = f?.actual_margin ?? null;
    if (project.status === 'on_hold' || project.status === 'cancelled') return { project, reason: 'Paused or cancelled status needs attention.', tone: 'danger' as const };
    if (variance != null && variance < 0) return { project, reason: `${formatCurrency(Math.abs(variance))} over budget.`, tone: 'danger' as const };
    if (margin != null && margin < 0.18) return { project, reason: `Margin at ${formatMargin(margin)}; review pricing or expenses.`, tone: 'warning' as const };
    return null;
  }).filter(Boolean).slice(0, 3) as RiskProject[];
}
function getRecentExpenses(projects: Project[]): RecentExpense[] {
  return projects.flatMap((project) => (project.expenses || []).map((expense) => ({ ...expense, projectName: project.name, clientName: project.client?.name }))).sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()).slice(0, 5);
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: config.theme.background },
  scrollContent: { paddingBottom: 118 },
  centerCard: { minHeight: 220, alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  introPanel: { gap: 18, backgroundColor: 'rgba(94,106,210,0.11)' },
  introLogo: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  introTitle: { color: config.theme.text, fontSize: 20, fontWeight: '800' },
  storySteps: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  storyStep: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: config.theme.border, backgroundColor: 'rgba(255,255,255,0.035)', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 11 },
  storyNumber: { color: '#fff', backgroundColor: config.theme.primary, borderRadius: 999, width: 22, height: 22, textAlign: 'center', lineHeight: 22, fontWeight: '800', fontSize: 12 },
  storyText: { color: config.theme.textSecondary, fontSize: 13, fontWeight: '700' },
  statsGrid: { gap: 12 },
  statsGridWide: { flexDirection: 'row' },
  metricCard: { gap: 12 },
  metricCardWide: { flex: 1 },
  metricIconRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metricIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  metricLabel: { color: config.theme.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  ownerBriefingCard: { gap: 16, borderColor: 'rgba(94,106,210,0.28)' },
  briefingGrid: { gap: 12 },
  briefingGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  briefingItem: { flex: 1, minWidth: 210, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: config.theme.borderSubtle, backgroundColor: 'rgba(255,255,255,0.025)', borderRadius: 16, padding: 13 },
  briefingIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  briefingText: { flex: 1, gap: 3 },
  briefingTitle: { color: config.theme.text, fontSize: 14, fontWeight: '900' },
  briefingCopy: { color: config.theme.textSecondary, fontSize: 13, lineHeight: 18 },
  mainGrid: { gap: 14 },
  mainGridWide: { flexDirection: 'row' },
  snapshotCard: { gap: 18, flex: 1.35 },
  workflowCard: { gap: 16, flex: 1 },
  snapshotHero: { borderWidth: 1, borderColor: config.theme.border, borderRadius: 18, padding: 18, backgroundColor: 'rgba(94,106,210,0.10)' },
  snapshotLabel: { color: config.theme.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  marginValue: { color: config.theme.text, fontSize: 46, lineHeight: 52, fontWeight: '800', letterSpacing: -1.6, marginTop: 6 },
  financeRows: { gap: 12 },
  financeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, borderBottomWidth: 1, borderBottomColor: config.theme.borderSubtle, paddingBottom: 10 },
  financeLabel: { color: config.theme.textSecondary, fontSize: 14 },
  financeValue: { color: config.theme.text, fontSize: 14, fontWeight: '800' },
  safeState: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, backgroundColor: 'rgba(16,185,129,0.09)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)' },
  riskRow: { gap: 8, borderWidth: 1, borderColor: config.theme.borderSubtle, borderRadius: 16, padding: 13, backgroundColor: 'rgba(255,255,255,0.025)' },
  riskName: { color: config.theme.text, fontSize: 15, fontWeight: '800' },
  riskReason: { color: config.theme.textSecondary, fontSize: 13, lineHeight: 18 },
  expenseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: config.theme.borderSubtle },
  expenseIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)' },
  expenseText: { flex: 1, gap: 2 },
  expenseTitle: { color: config.theme.text, fontSize: 14, fontWeight: '800' },
  expenseMeta: { color: config.theme.textMuted, fontSize: 12 },
  expenseAmount: { color: config.theme.warning, fontSize: 14, fontWeight: '800' },
  reportPreview: { gap: 12, padding: 16, backgroundColor: '#f8fafc', borderRadius: 16 },
  reportHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  reportTitle: { color: '#111827', fontSize: 17, fontWeight: '900' },
  reportSub: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  reportFooter: { marginTop: 4, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  reportFooterText: { color: '#64748b', fontSize: 11, fontWeight: '700' },
  projectGrid: { gap: 12 },
  projectGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  projectPreview: { gap: 12, flexBasis: '23.5%', minWidth: 230, flexGrow: 1 },
  projectPillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  projectName: { color: config.theme.text, fontSize: 16, fontWeight: '800', letterSpacing: -0.3, lineHeight: 21 },
  projectClient: { color: config.theme.textMuted, fontSize: 13, lineHeight: 18 },
  projectMoneyRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  budgetBlock: { gap: 7 },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' },
  budgetFill: { height: 8, borderRadius: 999 },
  lastExpense: { color: config.theme.textMuted, fontSize: 12, lineHeight: 17 },
  smallLabel: { color: config.theme.textMuted, fontSize: 12 },
  smallValue: { color: config.theme.text, fontSize: 13, fontWeight: '800' },
  actionPanel: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, alignItems: 'center', backgroundColor: 'rgba(94,106,210,0.12)' },
  actionText: { flex: 1, minWidth: 240, gap: 4 },
  actionTitle: { color: config.theme.text, fontSize: 20, fontWeight: '800' },
  actionButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  muted: { color: config.theme.textSecondary, fontSize: 14, lineHeight: 20 },
  error: { color: config.theme.error, marginBottom: 16 },
});
