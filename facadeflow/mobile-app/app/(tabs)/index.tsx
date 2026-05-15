import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { config, getApiUrl } from '../../src/lib/config/index';
import { formatCurrency } from '../../src/utils';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

import type { DailyBrief } from '../../src/types';

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

      const briefRes = await fetch(`${apiBaseUrl}/dashboard/brief`);
      if (!briefRes.ok) throw new Error('Failed to fetch brief');
      const briefData = await briefRes.json();
      if (!briefData.data) throw new Error('Invalid brief response');
      setBrief(briefData.data);

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

  const [summary, setSummary] = useState<{
    active_projects: number;
    overdue_tasks: number;
    today_appointments: number;
    estimates_sent_this_week: number;
    revenue_pipeline: number;
  } | null>(null);
  const [brief, setBrief] = useState<DailyBrief | null>(null);
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

  const quickStats = [
    { label: 'Active Projects', value: summary?.active_projects ?? 0, icon: 'business' as const, color: config.theme.primary },
    { label: 'Overdue Tasks', value: summary?.overdue_tasks ?? 0, icon: 'warning' as const, color: config.theme.error },
    { label: 'Today Appointments', value: summary?.today_appointments ?? 0, icon: 'event' as const, color: config.theme.secondary },
    { label: 'Revenue Pipeline', value: summary?.revenue_pipeline ?? 0, icon: 'trending-up' as const, color: config.theme.success, format: 'currency' },
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
              <Text style={styles.statValue}>
                {stat.format === 'currency' ? formatCurrency(stat.value) : stat.value}
              </Text>
            </View>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </Card>
        ))}
      </View>

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
            onPress={() => router.push('/clients/edit' as any)}
          />
          <QuickAction
            icon="description"
            label="Create Estimate"
            onPress={() => router.push('/estimates/create' as any)}
          />
          <QuickAction
            icon="camera-alt"
            label="Take Photo"
            onPress={() => router.push('/field' as any)}
          />
          <QuickAction
            icon="mic"
            label="Voice Note"
            onPress={() => router.push('/field/voice' as any)}
          />
          <QuickAction
            icon="calendar-today"
            label="Schedule"
            onPress={() => {}}
          />
        </View>
      </Card>

      {/* Today's Schedule */}
      <Card style={styles.section} padding="medium">
        <Text style={styles.sectionTitle}>{"Today's Schedule"}</Text>
        {brief?.items && brief.items.length > 0 ? (
          brief.items.map((item: DailyBrief['items'][number], idx) => (
            <View key={idx} style={styles.scheduleItem}>
              <MaterialIcons name={getItemIcon(item.type) as any} size={20} color={config.theme.textSecondary} />
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleTitle}>{item.title}</Text>
                {item.due_date && (
                  <Text style={styles.scheduleTime}>
                    {new Date(item.due_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.scheduleItem}>
            <MaterialIcons name="access-time" size={20} color={config.theme.textSecondary} />
            <Text style={styles.scheduleText}>No appointments scheduled</Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
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

function getItemIcon(type: DailyBrief['items'][0]['type']): string {
  switch (type) {
    case 'project':
      return 'business';
    case 'task':
      return 'assignment';
    case 'estimate':
      return 'description';
    case 'client':
      return 'person';
    case 'appointment':
      return 'event';
    default:
      return 'circle';
  }
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
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: config.theme.text,
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
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  scheduleContent: {
    marginLeft: 12,
  },
  scheduleTitle: {
    fontSize: 14,
    color: config.theme.text,
    fontWeight: '500',
  },
  scheduleTime: {
    fontSize: 12,
    color: config.theme.textSecondary,
  },
  scheduleText: {
    marginLeft: 12,
    color: config.theme.textSecondary,
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
