import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { config } from '../../src/lib/config';

interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
  searchable?: boolean;
  style?: ViewStyle;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  error,
  helper,
  disabled = false,
  searchable = false,
  style,
}) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState(options);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    if (searchable && visible) {
      const lower = search.toLowerCase();
      setFiltered(
        options.filter((o) => o.label.toLowerCase().includes(lower) && !o.disabled)
      );
    } else {
      setFiltered(options.filter((o) => !o.disabled));
    }
  }, [search, options, visible, searchable]);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setVisible(false);
    setSearch('');
  };

  return (
    <View style={style}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableWithoutFeedback onPress={() => !disabled && setVisible(true)}>
        <View
          style={[
            styles.selectBox,
            {
              backgroundColor: disabled ? config.theme.border : config.theme.background,
              borderColor: error
                ? config.theme.error
                : visible
                ? config.theme.primary
                : config.theme.border,
            },
          ]}
          accessibilityRole={"combobox" as any}
          accessibilityLabel={label || 'Select option'}
          accessibilityState={{ expanded: visible, disabled }}
          accessibilityHint={error ? `Error: ${error}` : helper || undefined}
        >
          <Text
            style={[
              styles.selectText,
              !selectedOption && { color: config.theme.textSecondary },
            ]}
            numberOfLines={1}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <Text style={styles.icon}>▼</Text>
        </View>
      </TouchableWithoutFeedback>

      {error && <Text style={styles.error}>{error}</Text>}
      {helper && !error && <Text style={styles.helper}>{helper}</Text>}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
        accessibilityViewIsModal={true}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <View
                style={styles.modalContent}
                accessibilityRole={"dialog" as any}
                accessibilityLabel={label ? `${label} options` : 'Options'}
              >
                {searchable && (
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    value={search}
                    onChangeText={setSearch}
                    autoFocus
                    accessibilityLabel="Search options"
                  />
                )}
                <FlatList
                  data={filtered}
                  keyExtractor={(item) => item.value}
                  style={styles.optionsList}
                  renderItem={({ item }) => (
                    <TouchableWithoutFeedback
                      onPress={() => handleSelect(item.value)}
                      key={item.value}
                    >
                      <View
                        style={[
                          styles.option,
                          item.value === value && styles.optionSelected,
                        ]}
                        accessibilityRole={"option" as any}
                        accessibilityState={{ selected: item.value === value }}
                        accessibilityLabel={item.label}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            item.value === value && { color: config.theme.primary },
                          ]}
                        >
                          {item.label}
                        </Text>
                        {item.value === value && (
                          <Text style={styles.check}>✓</Text>
                        )}
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.noResults}>No results found</Text>
                  }
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: config.theme.text,
    marginBottom: 6,
  },
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    backgroundColor: config.theme.background,
  },
  selectText: {
    fontSize: 16,
    color: config.theme.text,
    flex: 1,
  },
  icon: {
    marginLeft: 8,
    color: config.theme.textSecondary,
    fontSize: 12,
  },
  error: {
    fontSize: 12,
    color: config.theme.error,
    marginTop: 4,
  },
  helper: {
    fontSize: 12,
    color: config.theme.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: config.theme.background,
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: config.theme.border,
    borderRadius: 8,
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: config.theme.text,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: config.theme.border,
  },
  optionSelected: {
    backgroundColor: config.theme.surface,
  },
  optionText: {
    fontSize: 16,
    color: config.theme.text,
  },
  check: {
    color: config.theme.primary,
    fontWeight: '700',
  },
  noResults: {
    textAlign: 'center',
    color: config.theme.textSecondary,
    padding: 20,
  },
});
