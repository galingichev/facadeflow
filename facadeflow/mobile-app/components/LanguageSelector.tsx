import React from 'react';
import { Alert, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../src/lib/config';
import type { AppLanguage } from '../src/i18n';
import { translateInstant, useI18n } from '../src/i18n';

export function LanguageSelector() {
  const { language, languages, setLanguage, t } = useI18n();
  const [visible, setVisible] = React.useState(false);
  const currentLanguage = languages.find((item) => item.code === language) || languages[0];

  const confirmLanguage = async (nextLanguage: AppLanguage) => {
    const message = nextLanguage === 'bg'
      ? 'The app language is now Bulgarian.'
      : 'The app language is now English.';

    await setLanguage(nextLanguage);
    setVisible(false);
    const title = translateInstant('Language changed');
    const body = translateInstant(message);

    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${body}`);
      return;
    }

    Alert.alert(title, body, [{ text: translateInstant('OK') }]);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={t('Choose language')}
      >
        <MaterialIcons name="language" size={18} color={config.theme.text} />
        <Text style={styles.buttonText}>{currentLanguage.nativeLabel}</Text>
        <MaterialIcons name="expand-more" size={18} color={config.theme.textSecondary} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>{t('Choose language')}</Text>
            {languages.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[styles.option, item.code === language && styles.optionActive]}
                onPress={() => confirmLanguage(item.code)}
                accessibilityRole="button"
                accessibilityLabel={item.nativeLabel}
              >
                <View>
                  <Text style={styles.optionTitle}>{item.nativeLabel}</Text>
                  <Text style={styles.optionSubtitle}>{item.label}</Text>
                </View>
                {item.code === language ? <MaterialIcons name="check" size={20} color={config.theme.success} /> : null}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, borderColor: config.theme.border, backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: 12 },
  buttonText: { color: config.theme.text, fontSize: 14, fontWeight: '800' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.55)', padding: 20 },
  menu: { width: '100%', maxWidth: 360, borderRadius: 18, borderWidth: 1, borderColor: config.theme.border, backgroundColor: config.theme.backgroundElevated, padding: 14, gap: 10 },
  menuTitle: { color: config.theme.text, fontSize: 18, fontWeight: '900', marginBottom: 4 },
  option: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, borderWidth: 1, borderColor: config.theme.borderSubtle, backgroundColor: 'rgba(255,255,255,0.025)', paddingHorizontal: 14, paddingVertical: 10 },
  optionActive: { borderColor: 'rgba(16,185,129,0.35)', backgroundColor: 'rgba(16,185,129,0.10)' },
  optionTitle: { color: config.theme.text, fontSize: 15, fontWeight: '900' },
  optionSubtitle: { color: config.theme.textSecondary, fontSize: 12, marginTop: 2 },
});
