import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { config, getApiUrl } from '../../src/lib/config/index';
import { formatCurrency } from '../../src/utils';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

import type { DashboardSummary } from '../../src/types';

export default function DashboardScreen() {
  const router = useRouter();

  const handleFetch = async () => {
    const apiBaseUrl = getApiUrl();
    console.log("API URL being used:", apiBaseUrl);
    try {
      const summaryRes = await fetch(`${apiBaseUrl}/dashboard/summary`);
      if (!summaryRes.ok) throw new Error('Failed to fetch summary');
      const summaryData = await summaryRes.json();
      if (!summaryData.data) throw new Error('Invalid summary response');
      setSummary(summaryData.data);

      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    handleFetch();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    handleFetch();
  };

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Retry" onPress={handleRetry} />
      </View>
    );
  }

  const actualProfit = summary?.total_actual_profit ?? 0;
  const actualProfitColor = actualProfit < 0 ? config.theme.error : config.theme.success;
  const quickStats = [
    { label: 'Active Projects', value: summary?.active_projects ?? 0, icon: 'business' as const, color: config.theme.primary },
    { label: 'Contract Value', value: summary?.total_contract_value ?? 0, icon: 'request-quote' as const, color: config.theme.primary, format: 'currency' },
    { label: 'Actual Cost', value: summary?.total_actual_cost ?? 0, icon: 'receipt-long' as const, color: config.theme.secondary, format: 'currency' },
    { label: 'Actual Profit', value: actualProfit, icon: 'trending-up' as const, color: actualProfitColor, format: 'currency' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning!</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        {quickStats.map((stat, index) => (
          <Card key={index} style={styles.statCard} padding="small">
            <View style={styles.statHeader}>
              <MaterialIcons name={stat.icon as any} size={24} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]} numberOfLines={1} adjustsFontSizeToFit>
                {stat.format === 'currency' ? formatCurrency(stat.value) : stat.value}
              </Text>
            </View>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </Card>
        ))}
      </View>

      <Card style={styles.section} padding="medium">
        <Text style={styles.sectionTitle}>Profit Snapshot</Text>
        <View style={styles.financeRows}>
          <FinanceRow label="Budgeted Cost" value={formatCurrency(summary?.total_budgeted_cost ?? 0)} />
          <FinanceRow label="Actual Margin" value={formatMargin(summary?.actual_margin)} />
          <FinanceRow label="Projects with Financials" value={`${summary?.projects_with_financials ?? 0} of ${summary?.total_projects ?? 0}`} />
          <FinanceRow label="Expense Entries" value={`${summary?.total_expenses ?? 0}`} />
          <FinanceRow label="Profitable Projects" value={`${summary?.profitable_projects ?? 0}`} />
          <FinanceRow label="Loss Projects" value={`${summary?.loss_projects ?? 0}`} valueColor={summary?.loss_projects ? config.theme.error : config.theme.text} />
        </View>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.section} padding="medium">
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <QuickAction
            icon="add-circle"
            label="New Project"
            onPress={() => router.push('/projects/create' as any)}
          />
          <QuickAction
            icon="person-add"
            label="Add Client"
            onPress={() => router.push('/clients/create' as any)}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

function FinanceRow({ label, value, valueColor = config.theme.text }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.financeRow}>
      <Text style={styles.financeLabel}>{label}</Text>
      <Text style={[styles.financeValue, { color: valueColor }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

function formatMargin(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${Math.round(value * 1000) / 10}%`;
}

function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <MaterialIcons name={icon as any} size={28} color={config.theme.primary} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.theme.background,
  },
  content: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: config.theme.text,
  },
  date: {
    fontSize: 16,
    color: config.theme.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    flexShrink: 1,
  },
  statLabel: {
    fontSize: 12,
    color: config.theme.textSecondary,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: config.theme.text,
    marginBottom: 12,
  },
  financeRows: {
    gap: 10,
  },
  financeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  financeLabel: {
    flex: 1,
    fontSize: 14,
    color: config.theme.textSecondary,
  },
  financeValue: {
    maxWidth: '48%',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: config.theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: config.theme.border,
  },
  quickActionLabel: {
    fontSize: 12,
    color: config.theme.text,
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
    color: config.theme.textSecondary,
    padding: 16,
  },
  error: {
    textAlign: 'center',
    color: config.theme.error,
    marginBottom: 16,
  },
});
