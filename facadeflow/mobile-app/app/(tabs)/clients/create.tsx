import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useClientsStore } from '../../../src/stores/clientsStore';
import { config } from '../../../src/lib/config';
import { Input } from '../../../components/ui/Input';

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
      <Input
        label="Client Name"
        error={errors.name}
        value={name}
        onChangeText={(value) => {
          setName(value);
          clearFieldError('name');
        }}
        placeholder="Enter client name"
      />
      <Input
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        placeholder="Optional"
      />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Optional"
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
