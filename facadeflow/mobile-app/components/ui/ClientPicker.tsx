import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { getClients } from '../../src/services/clientService';
import { config } from '../../src/lib/config';
import type { Client } from '../../src/types';
import { useI18n } from '../../src/i18n';

type ClientPickerProps = {
  value: string;
  onChange: (clientId: string) => void;
  label?: string;
  error?: string;
};

export default function ClientPicker({ value, onChange, label, error }: ClientPickerProps) {
  const { t } = useI18n();
  const pickerId = React.useId();
  const hasError = Boolean(error);
  const labelId = label ? `${pickerId}-label` : undefined;
  const errorId = hasError ? `${pickerId}-error` : undefined;
  const translatedLabel = label ? t(label) : undefined;
  const translatedError = error ? t(error) : undefined;
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getClients();
        // Handle both direct array and { data: [...] } responses
        const arr = Array.isArray(data) ? data : data?.data ?? [];
        setClients(arr);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const selectedClient = clients.find((c) => c.id === value);

  return (
    <View>
      {translatedLabel ? <Text nativeID={labelId} style={styles.label}>{translatedLabel}</Text> : null}
      <TouchableOpacity
        style={[styles.trigger, hasError && styles.triggerError]}
        onPress={() => setModalVisible(true)}
        accessibilityRole="combobox"
        accessibilityLabel={translatedLabel}
        aria-labelledby={labelId}
        aria-describedby={errorId}
        accessibilityState={{ expanded: modalVisible }}
      >
        <Text style={styles.triggerText}>
          {selectedClient ? selectedClient.name : t('Select a client')}
        </Text>
      </TouchableOpacity>
      {hasError ? <Text nativeID={errorId} style={styles.error}>{translatedError}</Text> : null}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            {loading ? (
              <ActivityIndicator size="large" color={config.theme.primary} />
            ) : (
              <FlatList
                data={clients}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.item,
                      item.id === value && styles.itemSelected,
                    ]}
                    onPress={() => {
                      onChange(item.id);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.phone && (
                      <Text style={styles.itemPhone}>{item.phone}</Text>
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.empty}>{t('No clients found')}</Text>
                }
              />
            )}
            <TouchableOpacity
              style={styles.cancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>{t('Cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: config.theme.text,
    marginBottom: 6,
  },
  trigger: {
    borderWidth: 1,
    borderColor: config.theme.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: config.theme.background,
  },
  triggerError: {
    borderColor: config.theme.error,
    marginBottom: 6,
  },
  triggerText: {
    color: config.theme.text,
  },
  error: {
    color: config.theme.error,
    fontSize: 13,
    marginBottom: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: config.theme.background,
    borderRadius: 8,
    padding: 16,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: config.theme.border,
  },
  itemSelected: {
    backgroundColor: config.theme.primary + '20',
  },
  itemName: {
    fontSize: 16,
    color: config.theme.text,
  },
  itemPhone: {
    fontSize: 12,
    color: config.theme.textSecondary,
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    color: config.theme.textSecondary,
    marginVertical: 20,
  },
  cancel: {
    marginTop: 12,
    padding: 12,
    backgroundColor: config.theme.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: config.theme.text,
    fontWeight: '600',
  },
});
