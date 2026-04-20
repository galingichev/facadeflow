import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../../../src/lib/config';
import { Card } from '../../../components/ui/Card';
import { useProjectsStore } from '../../../src/stores/projectsStore';
import { useEffect } from 'react';

export default function ProjectsListScreen() {
  const router = useRouter();
  const { projects, isLoading, refresh } = useProjectsStore();
  useEffect(() => { refresh(); }, [refresh]);

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => router.push(`/projects/${item.id}` as any)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.client}>{item.client?.name || 'No client'}</Text>
            <View style={styles.footer}>
              <View style={[styles.status, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
              <Text style={styles.budget}>${item.budget?.toLocaleString() || '—'}</Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="business" size={64} color={config.theme.border} />
            <Text style={styles.emptyText}>No projects yet</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/projects/create')}>
        <MaterialIcons name='add' size={24} color='white' />
      </TouchableOpacity>
    </View>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: '#94a3b8',
    inquired: '#3b82f6',
    quoted: '#f59e0b',
    approved: '#8b5cf6',
    in_progress: '#2563eb',
    on_hold: '#ef4444',
    completed: '#10b981',
    cancelled: '#64748b',
  };
  return colors[status] || '#94a3b8';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.theme.background,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: config.theme.text,
    marginBottom: 4,
  },
  client: {
    fontSize: 14,
    color: config.theme.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  budget: {
    fontSize: 14,
    fontWeight: '600',
    color: config.theme.text,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: config.theme.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#2563eb',
    borderRadius: 28,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});