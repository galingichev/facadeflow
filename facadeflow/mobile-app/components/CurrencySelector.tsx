import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../src/lib/config';
import type { AppCurrency } from '../src/i18n';
import { useI18n } from '../src/i18n';

export function CurrencySelector() {
  const { currency, currencies, setCurrency, t } = useI18n();
  const [visible, setVisible] = React.useState(false);
  const currentCurrency = currencies.find((item) => item.code === currency) || currencies[0];

  const chooseCurrency = async (nextCurrency: AppCurrency) => {
    await setCurrency(nextCurrency);
    setVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={t('Choose currency')}
      >
        <Text style={styles.symbol}>{currentCurrency.symbol}</Text>
        <Text style={styles.buttonText}>{currentCurrency.code}</Text>
        <MaterialIcons name="expand-more" size={18} color={config.theme.textSecondary} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>{t('Choose currency')}</Text>
            {currencies.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[styles.option, item.code === currency && styles.optionActive]}
                onPress={() => chooseCurrency(item.code)}
                accessibilityRole="button"
                accessibilityLabel={`${item.code} ${t(item.label)}`}
              >
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{item.symbol} {item.code} — {t(item.label)}</Text>
                  <Text style={styles.optionSubtitle}>{item.nativeLabel}</Text>
                </View>
                {item.code === currency ? <MaterialIcons name="check" size={20} color={config.theme.success} /> : null}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 12, borderWidth: 1, borderColor: config.theme.border, backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: 12 },
  symbol: { color: config.theme.textSecondary, fontSize: 14, fontWeight: '900' },
  buttonText: { color: config.theme.text, fontSize: 14, fontWeight: '900' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.55)', padding: 20 },
  menu: { width: '100%', maxWidth: 380, borderRadius: 18, borderWidth: 1, borderColor: config.theme.border, backgroundColor: config.theme.backgroundElevated, padding: 14, gap: 10 },
  menuTitle: { color: config.theme.text, fontSize: 18, fontWeight: '900', marginBottom: 4 },
  option: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, borderWidth: 1, borderColor: config.theme.borderSubtle, backgroundColor: 'rgba(255,255,255,0.025)', paddingHorizontal: 14, paddingVertical: 10, gap: 12 },
  optionActive: { borderColor: 'rgba(16,185,129,0.35)', backgroundColor: 'rgba(16,185,129,0.10)' },
  optionCopy: { flex: 1 },
  optionTitle: { color: config.theme.text, fontSize: 15, fontWeight: '900' },
  optionSubtitle: { color: config.theme.textSecondary, fontSize: 12, marginTop: 2 },
});
