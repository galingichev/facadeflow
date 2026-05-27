import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { config, getApiUrl } from '../../src/lib/config/index';
import { formatCurrency, getProjectStatusLabel } from '../../src/utils';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DemoPage, MoneyText, SectionTitle, StatusPill } from '../../components/ui/DemoShell';
import type { DashboardSummary, Project } from '../../src/types';

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
      setSummary(summaryData.data);
      setProjects(projectsData.data || []);
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
        title="Profit control for facade, window and door contractors."
        subtitle="A client-facing MVP dashboard that connects projects, clients, budgets, expenses and live profit in one simple operating view."
        rightSlot={<View style={styles.headerActions}><Button title="New Project" icon="add" onPress={() => router.push('/projects/create' as any)} /><Button title="View Projects" variant="outline" icon="business-center" onPress={() => router.push('/projects' as any)} /></View>}
      >
        <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
          {quickStats.map((stat) => (
            <Card key={stat.label} style={[styles.metricCard, isWide && styles.metricCardWide]} padding="medium">
              <View style={styles.metricIconRow}><View style={[styles.metricIcon, { backgroundColor: `${stat.tone}22`, borderColor: `${stat.tone}55` }]}><MaterialIcons name={stat.icon as any} size={20} color={stat.tone} /></View><Text style={styles.metricLabel}>{stat.label}</Text></View>
              <MoneyText value={stat.value} color={stat.tone} />
            </Card>
          ))}
        </View>

        <View style={[styles.mainGrid, isWide && styles.mainGridWide]}>
          <Card style={styles.snapshotCard} padding="large">
            <SectionTitle title="Profit Snapshot" subtitle="Financial health across the current demo portfolio." />
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
            <SectionTitle title="Demo workflow" subtitle="The first client story should stay focused and easy." />
            {['Create a client', 'Add a facade project', 'Enter contract value and budget', 'Record expenses', 'See profit update live'].map((item, index) => (
              <View key={item} style={styles.workflowStep}><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View><Text style={styles.workflowText}>{item}</Text></View>
            ))}
          </Card>
        </View>

        <SectionTitle title="Active demo projects" subtitle="Realistic sample work for client discussion." />
        <View style={[styles.projectGrid, isWide && styles.projectGridWide]}>
          {topProjects.map((project) => <ProjectPreview key={project.id} project={project} onPress={() => router.push(`/projects/${project.id}` as any)} />)}
        </View>

        <Card style={styles.actionPanel} padding="large">
          <View style={styles.actionText}><Text style={styles.actionTitle}>Ready for a client walkthrough</Text><Text style={styles.muted}>Use the demo data only. Show dashboard → projects → expenses → profit change.</Text></View>
          <View style={styles.actionButtons}><Button title="New Project" icon="add" onPress={() => router.push('/projects/create' as any)} /><Button title="Add Client" variant="secondary" icon="person-add" onPress={() => router.push('/clients/create' as any)} /></View>
        </Card>
      </DemoPage>
    </ScrollView>
  );
}

function ProjectPreview({ project, onPress }: { project: Project; onPress: () => void }) {
  const financials = project.financials;
  const profit = financials?.actual_profit ?? null;
  return (
    <Card style={styles.projectPreview} onPress={onPress} padding="medium">
      <StatusPill label={getProjectStatusLabel(project.status)} tone={statusTone(project.status)} />
      <Text style={styles.projectName}>{project.name}</Text>
      <Text style={styles.projectClient}>{project.client?.name || 'No client'}</Text>
      <View style={styles.projectMoneyRow}><Text style={styles.smallLabel}>Contract</Text><Text style={styles.smallValue}>{project.contract_value != null ? formatCurrency(project.contract_value) : '—'}</Text></View>
      <View style={styles.projectMoneyRow}><Text style={styles.smallLabel}>Profit</Text><Text style={[styles.smallValue, { color: profit != null && profit < 0 ? config.theme.error : config.theme.success }]}>{profit == null ? '—' : formatCurrency(profit)}</Text></View>
    </Card>
  );
}

function FinanceRow({ label, value }: { label: string; value: string }) { return <View style={styles.financeRow}><Text style={styles.financeLabel}>{label}</Text><Text style={styles.financeValue}>{value}</Text></View>; }
function formatMargin(value: number | null | undefined) { if (value == null) return '—'; return `${Math.round(value * 1000) / 10}%`; }
function statusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'purple' { if (status === 'completed') return 'success'; if (status === 'quoted' || status === 'inquired') return 'warning'; if (status === 'on_hold' || status === 'cancelled') return 'danger'; if (status === 'in_progress') return 'info'; if (status === 'approved') return 'purple'; return 'neutral'; }

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: config.theme.background },
  scrollContent: { paddingBottom: 118 },
  centerCard: { minHeight: 220, alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statsGrid: { gap: 12 },
  statsGridWide: { flexDirection: 'row' },
  metricCard: { gap: 12 },
  metricCardWide: { flex: 1 },
  metricIconRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metricIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  metricLabel: { color: config.theme.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
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
  workflowStep: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNumber: { width: 28, height: 28, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: config.theme.border },
  stepNumberText: { color: config.theme.text, fontSize: 12, fontWeight: '800' },
  workflowText: { color: config.theme.textSecondary, fontSize: 14, flex: 1 },
  projectGrid: { gap: 12 },
  projectGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  projectPreview: { gap: 12, flexBasis: '23.5%', minWidth: 230, flexGrow: 1 },
  projectName: { color: config.theme.text, fontSize: 16, fontWeight: '800', letterSpacing: -0.3, lineHeight: 21 },
  projectClient: { color: config.theme.textMuted, fontSize: 13, lineHeight: 18 },
  projectMoneyRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  smallLabel: { color: config.theme.textMuted, fontSize: 12 },
  smallValue: { color: config.theme.text, fontSize: 13, fontWeight: '800' },
  actionPanel: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, alignItems: 'center', backgroundColor: 'rgba(94,106,210,0.12)' },
  actionText: { flex: 1, minWidth: 240, gap: 4 },
  actionTitle: { color: config.theme.text, fontSize: 20, fontWeight: '800' },
  actionButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  muted: { color: config.theme.textSecondary, fontSize: 14, lineHeight: 20 },
  error: { color: config.theme.error, marginBottom: 16 },
});
