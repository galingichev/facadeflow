import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../../src/config';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface FieldAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  screen: string;
}

const fieldActions: FieldAction[] = [
  {
    id: 'voice',
    title: 'Voice Notes',
    description: 'Record voice notes and auto-transcribe',
    icon: 'mic',
    color: '#8b5cf6',
    screen: '/field/voice',
  },
  {
    id: 'photos',
    title: 'Photo Gallery',
    description: 'Capture and annotate project photos',
    icon: 'camera-alt',
    color: '#10b981',
    screen: '/field/photos',
  },
  {
    id: 'measurements',
    title: 'Measurements',
    description: 'Record dimensions and calculations',
    icon: 'straighten',
    color: '#3b82f6',
    screen: '/field/measurements',
  },
  {
    id: 'sketch',
    title: 'Sketch',
    description: 'Draw diagrams and plans',
    icon: 'palette',
    color: '#f59e0b',
    screen: '/field/sketch',
  },
  {
    id: 'scan',
    title: 'Document Scan',
    description: 'Scan contracts and documents',
    icon: 'document-scanner',
    color: '#ef4444',
    screen: '/field/scan',
  },
  {
    id: 'notes',
    title: 'Quick Notes',
    description: 'Text notes with auto-complete',
    icon: 'note',
    color: '#64748b',
    screen: '/field/notes',
  },
];

export default function FieldScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Field Tools</Text>
        <Text style={styles.subtitle}>Capture data on-site</Text>
      </View>

      <FlatList
        data={fieldActions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        numColumns={2}
        renderItem={({ item }) => (
          <FieldActionCard action={item} onPress={() => router.push(item.screen)} />
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Card style={styles.offlineCard} padding="medium">
              <View style={styles.offlineHeader}>
                <MaterialIcons name="cloud-off" size={24} color={config.theme.warning} />
                <Text style={styles.offlineTitle}>Offline Ready</Text>
              </View>
              <Text style={styles.offlineText}>
                All field tools work without internet. Data syncs automatically when you're back online.
              </Text>
            </Card>
          </View>
        }
      />
    </View>
  );
}

function FieldActionCard({ action, onPress }: { action: FieldAction; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.cardWrapper} onPress={onPress}>
      <Card style={styles.card} padding="medium">
        <View style={[styles.iconContainer, { backgroundColor: action.color + '20' }]}>
          <MaterialIcons name={action.icon as any} size={32} color={action.color} />
        </View>
        <Text style={styles.cardTitle}>{action.title}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {action.description}
        </Text>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.theme.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: config.theme.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: config.theme.text,
  },
  subtitle: {
    fontSize: 14,
    color: config.theme.textSecondary,
    marginTop: 4,
  },
  list: {
    padding: 12,
  },
  cardWrapper: {
    flex: 1,
    margin: 6,
    maxWidth: '45%',
  },
  card: {
    alignItems: 'center',
    padding: 16,
    minHeight: 140,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: config.theme.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: config.theme.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    paddingTop: 8,
  },
  offlineCard: {
    backgroundColor: config.theme.surface + '80',
  },
  offlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  offlineTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: config.theme.text,
  },
  offlineText: {
    fontSize: 13,
    color: config.theme.textSecondary,
    lineHeight: 18,
  },
});
