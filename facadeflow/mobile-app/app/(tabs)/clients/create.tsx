import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useClientsStore } from '../../../src/stores/clientsStore';
import { config } from '../../../src/lib/config';

type FormErrors = {
  name?: string;
  submit?: string;
};

export default function CreateClientScreen() {
  const router = useRouter();
  const { createClient, isLoading } = useClientsStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined, submit: undefined }));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrors({ name: 'Client name is required.' });
      return;
    }

    setErrors({});
    setSuccessMessage('');
    setLoading(true);
    try {
      const client = await createClient({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });
      setSuccessMessage('Client created. Opening client record...');
      setTimeout(() => router.replace(`/clients/${client.id}/edit` as any), 650);
    } catch (err: any) {
      setErrors({ submit: err?.response?.data?.error || err?.message || 'Failed to create client.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Client Name</Text>
      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        value={name}
        onChangeText={(value) => {
          setName(value);
          clearFieldError('name');
        }}
        placeholder="Enter client name"
        placeholderTextColor={config.theme.textSecondary}
      />
      {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Optional"
        placeholderTextColor={config.theme.textSecondary}
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Optional"
        placeholderTextColor={config.theme.textSecondary}
      />
      {errors.submit ? <Text style={styles.formError}>{errors.submit}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
      <View style={{ height: 20 }} />
      <Button
        title={isLoading || loading ? 'Creating...' : 'Create Client'}
        onPress={handleSubmit}
        disabled={isLoading || loading}
        color={config.theme.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: config.theme.background,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: config.theme.text,
  },
  input: {
    borderWidth: 1,
    borderColor: config.theme.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: config.theme.text,
  },
  inputError: {
    borderColor: config.theme.error,
    marginBottom: 6,
  },
  errorText: {
    color: config.theme.error,
    fontSize: 13,
    marginBottom: 16,
  },
  formError: {
    color: config.theme.error,
    fontSize: 14,
    marginBottom: 12,
  },
  successText: {
    color: config.theme.success,
    fontSize: 14,
    marginBottom: 12,
  },
});
