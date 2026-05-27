import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, Platform, useWindowDimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DemoPage, SectionTitle } from '../../components/ui/DemoShell';
import { clientsStore } from '../../src/stores/clientsStore';
import { projectsApi } from '../../src/api/endpoints';
import { formatPhone, initials } from '../../src/utils';
import { config } from '../../src/lib/config';

export default function ClientsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});

  const loadClients = useCallback(async () => {
    try {
      const [clientData, projectData] = await Promise.all([clientsStore.list(), projectsApi.list()]);
      const counts: Record<string, number> = {};
      (projectData as any[]).forEach((project) => {
        if (project.client_id) counts[project.client_id] = (counts[project.client_id] || 0) + 1;
      });
      setClients(clientData as any[]);
      setProjectCounts(counts);
    } catch (e) {
      console.error('Failed to load clients', e);
    }
  }, []);

  const handleDeleteClient = useCallback(async (clientId: string) => {
    try { await clientsStore.remove(clientId); loadClients(); }
    catch (e) {
      const message = (e as any).response?.data?.error || (e as any).message || 'Failed to delete client.';
      if (Platform.OS === 'web') window.alert(message); else Alert.alert('Error', message);
    }
  }, [loadClients]);

  useFocusEffect(useCallback(() => { loadClients(); }, [loadClients]));
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.company?.toLowerCase().includes(searchQuery.toLowerCase()) || c.email?.toLowerCase().includes(searchQuery.toLowerCase()));
  const projectCount = Object.values(projectCounts).reduce((sum, count) => sum + count, 0);

  return (
    <DemoPage title="Clients, companies and project relationships in one place." subtitle="A cleaner client list helps the demo story start with the customer, then move into projects, expenses and profit." eyebrow="Client CRM">
      <Card style={styles.summaryCard} padding="large">
        <View style={styles.summaryItem}><Text style={styles.summaryValue}>{clients.length}</Text><Text style={styles.summaryLabel}>Clients</Text></View>
        <View style={styles.summaryItem}><Text style={styles.summaryValue}>{projectCount}</Text><Text style={styles.summaryLabel}>Linked projects</Text></View>
        <View style={styles.summaryAction}><Button title="Add Client" icon="person-add" onPress={() => router.push('/clients/create' as any)} /></View>
      </Card>

      <SectionTitle title="Client list" subtitle="Search by person, company or email." />
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialIcons name="search" size={20} color={config.theme.textSecondary} />
          <TextInput style={styles.searchInput} placeholder="Search clients..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={config.theme.textMuted} />
          {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><MaterialIcons name="close" size={20} color={config.theme.textSecondary} /></TouchableOpacity>}
        </View>
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        numColumns={isWide ? 2 : 1}
        key={isWide ? 'wide' : 'narrow'}
        renderItem={({ item }) => <ClientCard client={item} projectCount={projectCounts[item.id] || 0} onDelete={handleDeleteClient} isWide={isWide} />}
        ListEmptyComponent={<View style={styles.emptyContainer}><MaterialIcons name="people" size={64} color={config.theme.textMuted} /><Text style={styles.emptyText}>No clients found</Text><Button title="Add Client" variant="primary" size="medium" onPress={() => router.push('/clients/create' as any)} style={styles.emptyButton} /></View>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/clients/create' as any)} accessibilityRole="button" accessibilityLabel="Add Client"><MaterialIcons name="add" size={28} color="#fff" /></TouchableOpacity>
    </DemoPage>
  );
}

function ClientCard({ client, projectCount, onDelete, isWide }: { client: any; projectCount: number; onDelete: (id: string) => void; isWide: boolean }) {
  const router = useRouter();
  const handleDelete = () => {
    if (Platform.OS === 'web') { if (window.confirm(`Confirm Client Delete\n\nDelete ${client.name}?`)) onDelete(client.id); return; }
    Alert.alert('Confirm Client Delete', `Delete ${client.name}?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'OK', style: 'destructive', onPress: () => onDelete(client.id) }], { cancelable: true });
  };
  return (
    <Card style={[styles.card, isWide && styles.cardWide]}>
      <TouchableOpacity onPress={() => router.push(('/clients/' + client.id + '/edit') as any)} accessibilityRole="button" accessibilityLabel={`Open ${client.name}`}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials(client.name)}</Text></View>
          <View style={styles.info}><Text style={styles.name}>{client.name}</Text>{client.company ? <Text style={styles.company}>{client.company}</Text> : null}<Text style={styles.email}>{client.email || 'No email'}</Text>{client.phone ? <Text style={styles.phone}>{formatPhone(client.phone)}</Text> : null}</View>
        </View>
      </TouchableOpacity>
      <View style={styles.clientStory}><MaterialIcons name="business-center" size={18} color={config.theme.primaryHover} /><Text style={styles.clientStoryText}>{projectCount} project(s) connected to this client</Text></View>
      <View style={styles.cardFooter}>
        <Text style={styles.projectsCount}>Ready for project follow-up</Text>
        <View style={styles.cardActions}><TouchableOpacity style={styles.deleteButton} onPress={handleDelete} accessibilityRole="button" accessibilityLabel={`Delete ${client.name}`}><MaterialIcons name="delete-outline" size={22} color={config.theme.error} /></TouchableOpacity><MaterialIcons name="chevron-right" size={24} color={config.theme.textMuted} /></View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  summaryCard: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16, backgroundColor: 'rgba(94,106,210,0.11)' },
  summaryItem: { minWidth: 130, gap: 3 },
  summaryValue: { color: config.theme.text, fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  summaryLabel: { color: config.theme.textSecondary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  summaryAction: { marginLeft: 'auto' },
  searchContainer: { paddingBottom: 2 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.035)', borderRadius: 14, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: config.theme.border },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: config.theme.text },
  list: { paddingBottom: 110, gap: 14 },
  card: { marginBottom: 14, gap: 14 },
  cardWide: { flex: 1, marginHorizontal: 7 },
  avatarContainer: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 52, height: 52, borderRadius: 17, backgroundColor: config.theme.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 17, fontWeight: '900', color: config.theme.text, letterSpacing: -0.2 },
  company: { fontSize: 14, color: config.theme.textSecondary, fontWeight: '700' },
  email: { fontSize: 13, color: config.theme.textMuted },
  phone: { fontSize: 13, color: config.theme.textMuted },
  clientStory: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: config.theme.borderSubtle },
  clientStoryText: { color: config.theme.textSecondary, fontSize: 13, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: config.theme.borderSubtle },
  projectsCount: { fontSize: 12, color: config.theme.textSecondary, fontWeight: '700' },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  deleteButton: { padding: 6 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: config.theme.primary, borderRadius: 999, padding: 15, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 16, fontSize: 16, color: config.theme.textSecondary },
  emptyButton: { marginTop: 16 },
});
