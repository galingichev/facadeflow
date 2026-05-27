import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../../../src/lib/config';
import { Card } from '../../../components/ui/Card';
import { DemoPage, SectionTitle, StatusPill } from '../../../components/ui/DemoShell';
import { useProjectsStore } from '../../../src/stores/projectsStore';
import { useEffect } from 'react';
import { formatCurrency, getProjectStatusLabel } from '../../../src/utils';
import { formatMarginPercent, getBudgetActualPercent, getJobHealth, getLastExpense, getPaymentReadiness } from '../../../src/utils/projectInsights';
import type { Project } from '../../../src/types';

export default function ProjectsListScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const { projects, isLoading, refresh } = useProjectsStore();
  useEffect(() => { refresh(); }, [refresh]);

  return (
    <DemoPage title="Projects that show profit, cost and progress." subtitle="Every facade job stays connected to its client, budget, expenses and live profitability.">
      <SectionTitle title="Project pipeline" subtitle={`${projects.length} demo projects loaded`} />
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, isWide && styles.listWide]}
        numColumns={isWide ? 2 : 1}
        key={isWide ? 'wide' : 'narrow'}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={config.theme.primaryHover} />}
        renderItem={({ item }) => <ProjectCard project={item} onPress={() => router.push(`/projects/${item.id}` as any)} isWide={isWide} />}
        ListEmptyComponent={<View style={styles.empty}><MaterialIcons name="business-center" size={64} color={config.theme.textMuted} /><Text style={styles.emptyText}>No projects yet</Text></View>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/projects/create')} accessibilityRole="button" accessibilityLabel="New Project">
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
    </DemoPage>
  );
}

function ProjectCard({ project, onPress, isWide }: { project: Project; onPress: () => void; isWide: boolean }) {
  const financials = project.financials;
  const contract = financials?.contract_value ?? project.contract_value ?? null;
  const budget = financials?.budgeted_cost ?? project.budget ?? null;
  const actualCost = financials?.actual_cost ?? 0;
  const profit = financials?.actual_profit ?? (contract == null ? null : contract - actualCost);
  const margin = financials?.actual_margin ?? (profit == null || contract == null || contract <= 0 ? null : profit / contract);
  const progress = getProgress(project.status);
  const health = getJobHealth(project);
  const readiness = getPaymentReadiness(project);
  const budgetPercent = getBudgetActualPercent(project);
  const lastExpense = getLastExpense(project);
  return (
    <Card style={[styles.card, isWide && styles.cardWide]} onPress={onPress} padding="large">
      <View style={styles.cardTop}><View style={styles.pillRow}><StatusPill label={getProjectStatusLabel(project.status)} tone={statusTone(project.status)} /><StatusPill label={health.label} tone={health.tone} /></View><MaterialIcons name="chevron-right" size={22} color={config.theme.textMuted} /></View>
      <Text style={styles.name}>{project.name}</Text>
      <Text style={styles.client}>{project.client?.name || 'No client'}</Text>
      <View style={styles.progressWrap}><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View><Text style={styles.progressText}>{progress}% progress</Text></View>
      <View style={styles.budgetPanel}><View style={styles.moneyRow}><Text style={styles.moneyLabel}>Budget vs actual</Text><Text style={styles.moneyValue}>{budget == null ? '—' : `${budgetPercent}%`}</Text></View><View style={styles.progressTrack}><View style={[styles.budgetFill, { width: `${budgetPercent}%`, backgroundColor: budgetPercent > 100 ? config.theme.error : config.theme.primaryHover }]} /></View></View>
      <View style={styles.moneyGrid}>
        <MoneyCell label="Contract" value={contract == null ? '—' : formatCurrency(contract)} />
        <MoneyCell label="Budget" value={budget == null ? '—' : formatCurrency(budget)} />
        <MoneyCell label="Actual cost" value={formatCurrency(actualCost)} />
        <MoneyCell label="Profit / margin" value={profit == null ? '—' : `${formatCurrency(profit)} • ${formatMarginPercent(margin)}`} color={profit != null && profit < 0 ? config.theme.error : config.theme.success} />
      </View>
      <Text style={styles.lastExpense}>Last expense: {lastExpense ? `${lastExpense.description} • ${formatCurrency(lastExpense.amount)}` : 'No expenses yet'}</Text>
      <Text style={styles.healthReason}>Job Health: {health.reason}</Text>
      <StatusPill label={readiness.label} tone={readiness.tone} />
    </Card>
  );
}
function MoneyCell({ label, value, color = config.theme.text }: { label: string; value: string; color?: string }) { return <View style={styles.moneyCell}><Text style={styles.moneyLabel}>{label}</Text><Text style={[styles.moneyValue, { color }]}>{value}</Text></View>; }
function getProgress(status: string) { return { draft: 8, inquired: 12, quoted: 24, approved: 38, in_progress: 62, on_hold: 44, completed: 100, cancelled: 0 }[status] || 15; }
function statusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'purple' { if (status === 'completed') return 'success'; if (status === 'quoted' || status === 'inquired') return 'warning'; if (status === 'on_hold' || status === 'cancelled') return 'danger'; if (status === 'in_progress') return 'info'; if (status === 'approved') return 'purple'; return 'neutral'; }

const styles = StyleSheet.create({
  list: { gap: 14, paddingBottom: 110 },
  listWide: { gap: 16 },
  card: { marginBottom: 14, gap: 12 },
  cardWide: { flex: 1, marginHorizontal: 7 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  pillRow: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  name: { fontSize: 19, fontWeight: '800', color: config.theme.text, letterSpacing: -0.4, lineHeight: 24 },
  client: { fontSize: 14, color: config.theme.textSecondary, marginTop: -4 },
  progressWrap: { gap: 8 },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 999, backgroundColor: config.theme.primaryHover },
  budgetPanel: { gap: 7, borderWidth: 1, borderColor: config.theme.borderSubtle, backgroundColor: 'rgba(255,255,255,0.025)', borderRadius: 14, padding: 12 },
  budgetFill: { height: 8, borderRadius: 999 },
  moneyRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  progressText: { color: config.theme.textMuted, fontSize: 12, fontWeight: '700' },
  moneyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moneyCell: { width: '47%', borderWidth: 1, borderColor: config.theme.borderSubtle, backgroundColor: 'rgba(255,255,255,0.025)', borderRadius: 14, padding: 12, gap: 4 },
  moneyLabel: { color: config.theme.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  moneyValue: { color: config.theme.text, fontSize: 15, fontWeight: '800' },
  lastExpense: { color: config.theme.textMuted, fontSize: 12, lineHeight: 17 },
  healthReason: { color: config.theme.textSecondary, fontSize: 13, lineHeight: 18 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { marginTop: 16, fontSize: 16, color: config.theme.textSecondary },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: config.theme.primary, borderRadius: 999, padding: 15, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
});
