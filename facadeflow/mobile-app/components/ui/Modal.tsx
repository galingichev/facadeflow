import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Dimensions,
  Pressable,
} from 'react-native';
import { config } from '../../src/lib/config';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
  style?: ViewStyle;
}

export const ModalOverlay: React.FC<{ visible: boolean; onClose: () => void; children: React.ReactNode; accessibilityLabel?: string }> = ({
  visible,
  onClose,
  children,
  accessibilityLabel = 'Dialog',
}) => {
  useEffect(() => {
    if (visible) {
      // Prevent body scroll on web
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
      return () => {
        if (typeof document !== 'undefined') {
          document.body.style.overflow = 'unset';
        }
      };
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close dialog"
        accessibilityHint="Dismisses the current dialog"
      >
        <Pressable
          style={styles.content}
          onStartShouldSetResponder={() => true}
          accessibilityLabel={accessibilityLabel}
          accessibilityViewIsModal={true}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export const ModalHeader: React.FC<{
  title: string;
  onClose: () => void;
  style?: ViewStyle;
}> = ({ title, onClose, style }) => {
  return (
    <View style={[styles.header, style]}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.closeButton}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

export const ModalBody: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => {
  return <View style={[styles.body, style]}>{children}</View>;
};

export const ModalFooter: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => {
  return <View style={[styles.footer, style]}>{children}</View>;
};

export const ModalAction: React.FC<{
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}> = ({ label, onPress, variant = 'primary', disabled, loading, style }) => {
  const getBackgroundColor = () => {
    if (disabled) return config.theme.border;
    switch (variant) {
      case 'primary':
        return config.theme.primary;
      case 'secondary':
        return config.theme.secondary;
      case 'danger':
        return config.theme.error;
      default:
        return config.theme.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return config.theme.textSecondary;
    return variant === 'primary' || variant === 'danger' ? '#fff' : config.theme.text;
  };

  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Text style={[styles.actionText, { color: getTextColor() }]}>
        {loading ? 'Loading...' : label}
      </Text>
    </TouchableOpacity>
  );
};

// All-in-one Modal component
export const ModalWrapper: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  actions,
  style,
}) => {
  const { width } = Dimensions.get('window');
  const modalWidth = Math.min(width - 32, 600);

  return (
    <ModalOverlay visible={visible} onClose={onClose}>
      <View style={[styles.modal, { width: modalWidth }, style]}>
        {title && <ModalHeader title={title} onClose={onClose} />}
        <ModalBody>{children}</ModalBody>
        {actions && actions.length > 0 && (
          <ModalFooter>
            <View style={styles.actionButtons}>
              {actions.map((action, index) => (
                <ModalAction
                  key={index}
                  label={action.label}
                  onPress={() => {
                    action.onPress();
                  }}
                  variant={action.variant}
                  style={{ flex: 1, marginHorizontal: index < actions.length - 1 ? 4 : 0 }}
                />
              ))}
            </View>
          </ModalFooter>
        )}
      </View>
    </ModalOverlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    width: '100%',
  },
  modal: {
    backgroundColor: config.theme.background,
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: config.theme.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: config.theme.text,
  },
  closeButton: {
    fontSize: 24,
    color: config.theme.textSecondary,
    fontWeight: '300',
  },
  body: {
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: config.theme.border,
    backgroundColor: config.theme.surface,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
  },
  actionText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
