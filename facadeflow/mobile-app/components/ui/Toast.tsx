import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../../src/lib/config';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onClose: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  duration = 3000,
  onClose,
  action,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, fadeAnim]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#ecfdf5';
      case 'error':
        return '#fef2f2';
      case 'warning':
        return '#fffbeb';
      case 'info':
      default:
        return '#eff6ff';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return config.theme.success;
      case 'error':
        return config.theme.error;
      case 'warning':
        return config.theme.warning;
      case 'info':
      default:
        return config.theme.primary;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return '#065f46';
      case 'error':
        return '#991b1b';
      case 'warning':
        return '#92400e';
      case 'info':
      default:
        return '#1e40af';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor(), opacity: fadeAnim },
      ]}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name={getIcon()} size={24} color={getIconColor()} />
      </View>
      <Text style={[styles.message, { color: getTextColor() }]} numberOfLines={2}>
        {message}
      </Text>
      {action && (
        <TouchableOpacity onPress={action.onPress}>
          <Text style={[styles.action, { color: getIconColor() }]}>{action.label}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <MaterialIcons name="close" size={20} color={getIconColor()} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Toast Context for global notifications
interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number, action?: { label: string; onPress: () => void }) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

export const ToastContext = React.createContext<ToastContextType>({
  showToast: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
});

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = React.useState<ToastProps | null>(null);

  const showToast = (
    type: ToastType,
    message: string,
    duration?: number,
    action?: { label: string; onPress: () => void }
  ) => {
    setToast({ type, message, duration, onClose: () => setToast(null), action });
  };

  const success = (message: string, duration?: number) => showToast('success', message, duration);
  const error = (message: string, duration?: number) => showToast('error', message, duration);
  const warning = (message: string, duration?: number) => showToast('warning', message, duration);
  const info = (message: string, duration?: number) => showToast('info', message, duration);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {toast && (
        <View style={styles.toastRoot}>
          <Toast
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={toast.onClose}
            action={toast.action}
          />
        </View>
      )}
    </ToastContext.Provider>
  );
};

// Hook for using toast
export const useToast = () => React.useContext(ToastContext);

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toastRoot: {
    position: 'absolute',
    top: 44, // Below status bar
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  iconContainer: {
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    marginLeft: 8,
    padding: 2,
  },
});
