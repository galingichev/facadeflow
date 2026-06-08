import type { TaskStatus, TaskPriority } from '../types';
import { Platform, Dimensions } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getActiveCurrency, getActiveLanguage, translateInstant, type AppCurrency } from '../i18n';

// =====================
// Date Utilities
// =====================
export const formatDate = (date: Date | string | null | undefined, format: 'short' | 'long' | 'time' = 'short'): string => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';

  const options = {
    short: { year: 'numeric' as const, month: 'short' as const, day: 'numeric' as const },
    long: { year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const },
    time: { hour: 'numeric' as const, minute: '2-digit' as const },
  }[format];

  return d.toLocaleDateString('en-US', options);
};

export const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const isToday = (date: Date | string): boolean => {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

export const isPast = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return d < now;
};

export const isOverdue = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return d < now && !isToday(d);
};

export const daysBetween = (start: Date | string, end: Date | string): number => {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  return Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
};

export const addDays = (date: Date | string, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// =====================
// Currency Utilities
// =====================
export const formatCurrency = (amount: number, currency: AppCurrency = getActiveCurrency()): string => {
  const locale = getActiveLanguage() === 'bg' ? 'bg-BG' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const calculateTax = (subtotal: number, taxRate: number): number => {
  return Math.round(subtotal * taxRate * 100) / 100;
};

export const calculateTotal = (subtotal: number, taxRate: number, adjustments: { amount: number }[] = []): number => {
  const tax = calculateTax(subtotal, taxRate);
  const adjustmentSum = adjustments.reduce((sum, a) => sum + a.amount, 0);
  return Math.round((subtotal + tax + adjustmentSum) * 100) / 100;
};

// =====================
// String Utilities
// =====================
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
};

export const initials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// =====================
// Phone Utilities
// =====================
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

// =====================
// Email Utilities
// =====================
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// =====================
// Validation
// =====================
export const required = (value: any): string | null => {
  if (value === undefined || value === null || value === '') {
    return 'This field is required';
  }
  return null;
};

export const minLength = (min: number) => (value: string): string | null => {
  if (value && value.length < min) {
    return `Minimum ${min} characters required`;
  }
  return null;
};

export const maxLength = (max: number) => (value: string): string | null => {
  if (value && value.length > max) {
    return `Maximum ${max} characters allowed`;
  }
  return null;
};

export const numeric = (value: any): string | null => {
  if (value && isNaN(Number(value))) {
    return 'Must be a number';
  }
  return null;
};

export const positiveNumber = (value: any): string | null => {
  if (value !== undefined && value !== null && Number(value) <= 0) {
    return 'Must be greater than 0';
  }
  return null;
};

// =====================
// Array/Object Utilities
// =====================
export const groupBy = <T, K extends keyof any>(array: T[], key: (item: T) => K): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const group = key(item) as string;
    result[group] = result[group] || [];
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = <T, K extends keyof any>(array: T[], key: (item: T) => K): T[] => {
  const seen = new Set();
  return array.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

// =====================
// Status/Enums
// =====================
export const getProjectStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    draft: 'Lead / Inquiry',
    inquired: 'Survey / Measurement',
    quoted: 'Quote Sent',
    approved: 'Approved / Ordered',
    in_progress: 'Fabrication / Installation',
    on_hold: 'Waiting / On Hold',
    completed: 'Handover Complete',
    cancelled: 'Cancelled',
  };
  return translateInstant(labels[status] || status);
};

export const getTaskStatusLabel = (status: TaskStatus): string => {
  const labels: Record<TaskStatus, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done',
  };
  return labels[status];
};

export const getTaskPriorityLabel = (priority: TaskPriority): string => {
  const labels: Record<TaskPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  };
  return labels[priority];
};

export const getProjectStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: '#94a3b8',
    inquired: '#3b82f6',
    quoted: '#f59e0b',
    approved: '#8b5cf6',
    in_progress: '#2563eb',
    on_hold: '#ef4444',
    completed: '#10b981',
    cancelled: '#64748b',
  };
  return colors[status] || '#94a3b8';
};

export const getTaskPriorityColor = (priority: TaskPriority): string => {
  const colors: Record<TaskPriority, string> = {
    low: '#94a3b8',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444',
  };
  return colors[priority];
};

// =====================
// Async Utilities
// =====================
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: any = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// =====================
// Device Utilities
// =====================
export const isIOS = () => {
  return Platform.OS === 'ios';
};

export const isAndroid = () => {
  return Platform.OS === 'android';
};

export const isTablet = () => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = width / height;
  return (
    (Platform.OS === 'ios' && aspectRatio < 1.6) ||
    (Platform.OS === 'android' && aspectRatio < 1.6) ||
    (width >= 1024 && height >= 768)
  );
};

// =====================
// Storage Helpers
// =====================
export const storeData = async (key: string, value: any): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error storing data', error);
    throw error;
  }
};

export const getData = async (key: string): Promise<any> => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting data', error);
    return null;
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Error removing data', error);
    throw error;
  }
};
