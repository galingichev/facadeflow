import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../../src/config';
import { Card } from '../../components/ui/Card';

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  screen: string;
  color: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'App preferences, notifications, theme',
    icon: 'settings',
    color: '#3b82f6',
    screen: '/more/settings',
  },
  {
    id: 'team',
    title: 'Team',
    subtitle: 'Manage crew, assign roles, permissions',
    icon: 'group',
    color: '#8b5cf6',
    screen: '/more/team',
  },
  {
    id: 'reports',
    title: 'Reports',
    subtitle: 'Financial, time tracking, custom analytics',
    icon: 'bar-chart',
    color: '#10b981',
    screen: '/more/reports',
  },
  {
    id: 'inventory',
    title: 'Inventory',
    subtitle: 'Materials, suppliers, stock levels',
    icon: 'inventory',
    color: '#f59e0b',
    screen: '/more/inventory',
  },
  {
    id: 'about',
    title: 'About',
    subtitle: 'Version, licenses, support',
    icon: 'info',
    color: '#64748b',
    screen: '/more/about',
  },
];

export default function MoreScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
        <Text style={styles.subtitle}>Settings & additional features</Text>
      </View>

      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <MenuItemCard item={item} onPress={() => router.push(item.screen)} />}
      />
    </View>
  );
}

function MenuItemCard({ item, onPress }: { item: MenuItem; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.cardWrapper} onPress={onPress}>
      <Card style={styles.card} padding="medium">
        <View style={styles.row}>
          <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            <MaterialIcons name={item.icon as any} size={24} color={item.color} />
          </View>
          <View style={styles.info}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={config.theme.border} />
        </View>
        {item.badge !== undefined && item.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
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
    marginBottom: 8,
  },
  card: {
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: config.theme.text,
  },
  subtitle: {
    fontSize: 13,
    color: config.theme.textSecondary,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: config.theme.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
