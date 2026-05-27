import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform, ViewStyle } from 'react-native';
import { config } from '../../src/lib/config';

export function FacadeFlowMark({ size = 34 }: { size?: number }) {
  const radius = Math.round(size * 0.31);
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: radius }]}>
      <View style={styles.markPaneLeft} />
      <View style={styles.markPaneRight} />
      <View style={styles.markBase} />
    </View>
  );
}

export function DemoPage({
  eyebrow = 'FacadeFlow Demo', title, subtitle, children, rightSlot, style,
}: { eyebrow?: string; title: string; subtitle?: string; children: React.ReactNode; rightSlot?: React.ReactNode; style?: ViewStyle }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  return (
    <View style={[styles.screen, isWide && styles.wideScreen, style]}>
      <View style={styles.heroGlow} />
      <View style={styles.heroGlowSecondary} />
      <View style={[styles.header, isWide && styles.headerWide]}>
        <View style={styles.brandRow}>
          <FacadeFlowMark />
          <Text style={styles.brand}>FacadeFlow</Text>
          <View style={styles.demoPill}><Text style={styles.demoPillText}>Client Demo</Text></View>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={[styles.title, isWide && styles.titleWide]}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightSlot}
      </View>
      <View style={[styles.body, isWide && styles.bodyWide]}>{children}</View>
    </View>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={styles.sectionTitleWrap}><Text style={styles.sectionTitle}>{title}</Text>{subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}</View>;
}

export function StatusPill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'purple' }) {
  const color = { neutral: '#a9b0bc', success: config.theme.success, warning: config.theme.warning, danger: config.theme.error, info: '#60a5fa', purple: config.theme.primaryHover }[tone];
  return <View style={[styles.statusPill, { borderColor: `${color}66`, backgroundColor: `${color}1f` }]}><View style={[styles.statusDot, { backgroundColor: color }]} /><Text style={[styles.statusPillText, { color }]}>{label}</Text></View>;
}

export function MoneyText({ value, color }: { value: string; color?: string }) {
  return <Text style={[styles.moneyText, { color: color || config.theme.text }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: config.theme.background, position: 'relative' },
  wideScreen: { alignItems: 'center' },
  heroGlow: { position: 'absolute', top: -170, right: -70, width: 340, height: 340, borderRadius: 170, backgroundColor: 'rgba(94,106,210,0.20)', opacity: Platform.OS === 'web' ? 1 : 0.75 },
  heroGlowSecondary: { position: 'absolute', top: 130, left: -130, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(16,185,129,0.08)' },
  header: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 10, gap: 18 },
  headerWide: { width: '100%', maxWidth: 1180, paddingTop: 34, paddingHorizontal: 24 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  mark: { backgroundColor: config.theme.primary, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', overflow: 'hidden', position: 'relative' },
  markPaneLeft: { position: 'absolute', left: 7, top: 7, width: 8, height: 17, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.95)' },
  markPaneRight: { position: 'absolute', left: 18, top: 7, width: 8, height: 17, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.70)' },
  markBase: { position: 'absolute', left: 7, right: 7, bottom: 7, height: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.86)' },
  brand: { color: config.theme.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  demoPill: { borderWidth: 1, borderColor: config.theme.border, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  demoPillText: { color: config.theme.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  headerText: { gap: 7 },
  eyebrow: { color: config.theme.primaryHover, fontSize: 12, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' },
  title: { color: config.theme.text, fontSize: 34, lineHeight: 38, fontWeight: '800', letterSpacing: -1.05 },
  titleWide: { fontSize: 48, lineHeight: 52, maxWidth: 860 },
  subtitle: { color: config.theme.textSecondary, fontSize: 15, lineHeight: 23, maxWidth: 760 },
  body: { paddingHorizontal: 18, paddingBottom: 28, gap: 16 },
  bodyWide: { width: '100%', maxWidth: 1180, paddingHorizontal: 24 },
  sectionTitleWrap: { gap: 4, marginTop: 4, marginBottom: 2 },
  sectionTitle: { color: config.theme.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  sectionSubtitle: { color: config.theme.textMuted, fontSize: 13, lineHeight: 19 },
  statusPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 999 },
  statusPillText: { fontSize: 11, fontWeight: '800', textTransform: 'capitalize' },
  moneyText: { fontSize: 22, fontWeight: '800', letterSpacing: -0.6 },
});
