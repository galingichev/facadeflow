import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { clientsStore } from '../../src/stores/clientsStore';
import { formatPhone, initials } from '../../src/utils';
import { config } from '../../src/lib/config';

export default function ClientsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<any[]>([]);

  const loadClients = useCallback(async () => {
    try {
      const data = await clientsStore.list();
      setClients(data as any[]);
    } catch (e) {
      console.error('Failed to load clients', e);
    }
  }, []);

  const handleDeleteClient = useCallback(async (clientId: string) => {
    try {
      await clientsStore.remove(clientId);
      loadClients(); // Refresh the list
    } catch (e) {
      const message = (e as any).response?.data?.error || (e as any).message || 'Failed to delete client.';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Error', message);
      }
    }
  }, [loadClients]);

  useFocusEffect(useCallback(() => {
    loadClients();
  }, [loadClients]));

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
        renderItem={({ item }) => <ClientCard client={item} onDelete={handleDeleteClient} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people" size={64} color={config.theme.border} />
            <Text style={styles.emptyText}>No clients found</Text>
            <Button
              title="Add Client"
              variant="primary"
              size="medium"
              onPress={() => router.push('/clients/create' as any)}
              style={styles.emptyButton}
            />
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/clients/create' as any)}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function ClientCard({ client, onDelete }: { client: any; onDelete: (id: string) => void }) {
  const router = useRouter();

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Confirm Client Delete\n\nDelete ${client.name}?`)) {
        onDelete(client.id);
      }
      return;
    }

    Alert.alert(
      "Confirm Client Delete",
      `Delete ${client.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", style: "destructive", onPress: () => onDelete(client.id) }
      ],
      { cancelable: true }
    );
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        onPress={() => {
          const url = ('/clients/' + client.id + '/edit');
          router.push(url as any);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Open ${client.name}`}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(client.name)}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{client.name}</Text>
            {client.company && <Text style={styles.company}>{client.company}</Text>}
            <Text style={styles.email}>{client.email}</Text>
            {client.phone ? <Text style={styles.phone}>{formatPhone(client.phone)}</Text> : null}
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.cardFooter}>
        <Text style={styles.projectsCount}>{client.projects_count} project(s)</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${client.name}`}
          >
            <MaterialIcons name="delete-outline" size={22} color={config.theme.error} />
          </TouchableOpacity>
          <MaterialIcons name="chevron-right" size={24} color={config.theme.border} />
        </View>
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
  deleteIcon: {
    marginRight: 10,
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 6,
    marginRight: 4,
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
