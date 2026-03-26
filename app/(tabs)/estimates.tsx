import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../../src/config';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../src/utils';

// Mock estimates - will be replaced with estimatesStore
const mockEstimates = [
  {
    id: 'e1',
    number: 'EST-2025-042',
    project_name: "Sarah's Kitchen Bay Window",
    client_name: 'Sarah Johnson',
    total: 4095.62,
    status: 'draft',
    created_at: '2025-03-12',
  },
  {
    id: 'e2',
    number: 'EST-2025-025',
    project_name: 'Acme Office Window Retrofit',
    client_name: 'Acme Construction Co.',
    total: 24393.62,
    status: 'accepted',
    created_at: '2025-02-18',
  },
];

const statusColors: Record<string, string> = {
  draft: '#94a3b8',
  sent: '#3b82f6',
  accepted: '#10b981',
  rejected: '#ef4444',
  expired: '#64748b',
};

export default function EstimatesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filtered = mockEstimates.filter(e => {
    const matchesSearch = e.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = ['All', 'Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'];

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialIcons name="search" size={20} color={config.theme.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search estimates..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={config.theme.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={config.theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={statusOptions}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterPill,
              (statusFilter === item.toLowerCase() || (!statusFilter && item === 'All')) && styles.filterPillActive,
            ]}
            onPress={() => setStatusFilter(item === 'All' ? null : item.toLowerCase())}
          >
            <Text
              style={[
                styles.filterPillText,
                (statusFilter === item.toLowerCase() || (!statusFilter && item === 'All')) && styles.filterPillTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Estimates List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <EstimateCard estimate={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="description" size={64} color={config.theme.border} />
            <Text style={styles.emptyText}>No estimates found</Text>
            <Button
              title="Create Estimate"
              variant="primary"
              size="medium"
              onPress={() => router.push('/estimates/create')}
              style={styles.emptyButton}
            />
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/estimates/create')}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function EstimateCard({ estimate }: { estimate: any }) {
  const router = useRouter();

  return (
    <Card style={styles.card} onPress={() => router.push(`/estimates/${estimate.id}`)}>
      <View style={styles.cardHeader}>
        <Text style={styles.estimateNumber}>{estimate.number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[estimate.status] }]}>
          <Text style={styles.statusText}>{estimate.status}</Text>
        </View>
      </View>

      <Text style={styles.projectName} numberOfLines={1}>
        {estimate.project_name}
      </Text>
      <Text style={styles.clientName}>{estimate.client_name}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.total}>{formatCurrency(estimate.total)}</Text>
        <Text style={styles.date}>{estimate.created_at}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.theme.background,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: config.theme.border,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: config.theme.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: config.theme.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: config.theme.text,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: config.theme.surface,
    borderWidth: 1,
    borderColor: config.theme.border,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: config.theme.primary,
    borderColor: config.theme.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: config.theme.textSecondary,
  },
  filterPillTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  estimateNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: config.theme.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  projectName: {
    fontSize: 15,
    fontWeight: '500',
    color: config.theme.text,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 13,
    color: config.theme.textSecondary,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: config.theme.border,
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: config.theme.text,
  },
  date: {
    fontSize: 12,
    color: config.theme.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: config.theme.textSecondary,
  },
  emptyButton: {
    marginTop: 24,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: config.theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
