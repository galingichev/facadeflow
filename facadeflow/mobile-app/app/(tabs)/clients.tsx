import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../../src/lib/config';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useProjectsStore } from '../../src/stores/projectsStore'; // Will have clientsStore later
import { formatPhone, initials } from '../../src/utils';

// Mock clients data for now - will be replaced by clientsStore
const mockClients = [
  { id: 'c1', name: 'Acme Construction', email: 'john@acme.com', phone: '555-0101', company: 'Acme', projects_count: 5 },
  { id: 'c2', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '555-0102', company: null, projects_count: 2 },
  { id: 'c3', name: 'Metro Property Mgmt', email: 'repairs@metro.com', phone: '555-0103', company: 'Metro', projects_count: 12 },
];

export default function ClientsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = mockClients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialIcons name="search" size={20} color={config.theme.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients..."
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

      {/* Clients List */}
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ClientCard client={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people" size={64} color={config.theme.border} />
            <Text style={styles.emptyText}>No clients found</Text>
            <Button
              title="Add Client"
              variant="primary"
              size="medium"
              onPress={() => router.push('/clients/edit' as any)}
              style={styles.emptyButton}
            />
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/clients/edit' as any)}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function ClientCard({ client }: { client: any }) {
  const router = useRouter();

  return (
    <Card style={styles.card} onPress={() => router.push(`/clients/${client.id}` as any)}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(client.name)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{client.name}</Text>
          {client.company && <Text style={styles.company}>{client.company}</Text>}
          <Text style={styles.email}>{client.email}</Text>
          <Text style={styles.phone}>{formatPhone(client.phone)}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.projectsCount}>{client.projects_count} project(s)</Text>
        <MaterialIcons name="chevron-right" size={24} color={config.theme.border} />
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
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: config.theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: config.theme.text,
  },
  company: {
    fontSize: 14,
    color: config.theme.textSecondary,
    marginTop: 2,
  },
  email: {
    fontSize: 13,
    color: config.theme.textSecondary,
    marginTop: 2,
  },
  phone: {
    fontSize: 13,
    color: config.theme.textSecondary,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: config.theme.border,
  },
  projectsCount: {
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
