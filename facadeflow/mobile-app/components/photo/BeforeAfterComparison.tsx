import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { config } from '../../src/lib/config';
import { Button } from '../ui/Button';

interface BeforeAfterComparisonProps {
  beforeImageUrl: string;
  afterImageUrl: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  beforeImageUrl,
  afterImageUrl,
  onSave,
  onCancel,
}) => {
  const [position, setPosition] = useState(0.5); // 0 - 1, slider position

  const { width } = Dimensions.get('window');
  const containerWidth = width - 32;
  const containerHeight = (containerWidth * 4) / 3;

  const handleSlide = (offsetX: number) => {
    const newPos = Math.max(0, Math.min(1, offsetX / containerWidth));
    setPosition(newPos);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Before & After</Text>
        <View style={styles.legend}>
          <View style={[styles.legendItem, { borderLeftColor: config.theme.primary }]}>
            <Text style={styles.legendText}>After</Text>
          </View>
          <View style={[styles.legendItem, { borderLeftColor: config.theme.error }]}>
            <Text style={styles.legendText}>Before</Text>
          </View>
        </View>
      </View>

      <View style={styles.comparisonContainer}>
        {/* After image (bottom layer) */}
        <Image
          source={{ uri: afterImageUrl }}
          style={[styles.image, { width: containerWidth, height: containerHeight }]}
          resizeMode="cover"
        />

        {/* Before image (top layer, clipped) */}
        <View
          style={[
            styles.clipContainer,
            {
              width: containerWidth * position,
              height: containerHeight,
            },
          ]}
        >
          <Image
            source={{ uri: beforeImageUrl }}
            style={[styles.image, { width: containerWidth, height: containerHeight }]}
            resizeMode="cover"
          />
          {/* Tint overlay to distinguish */}
          <View style={[styles.tintOverlay, { width: containerWidth, height: containerHeight }]} />
        </View>

        {/* Slider line */}
        <View
          style={[
            styles.sliderLine,
            {
              left: containerWidth * position - 2,
              height: containerHeight,
            },
          ]}
        >
          <View style={styles.sliderHandle} />
        </View>

        {/* Touch area for sliding */}
        <TouchableOpacity
          style={[styles.sliderTouchArea, { width: containerWidth, height: containerHeight }]}
          activeOpacity={1}
          onPress={(e) => {
            const { locationX } = e.nativeEvent;
            handleSlide(locationX);
          }}
        />
      </View>

      <View style={styles.controls}>
        <Button
          title="Reset"
          variant="outline"
          size="small"
          onPress={() => setPosition(0.5)}
          icon="refresh"
          style={{ flex: 1 }}
        />
        <View style={{ width: 8 }} />
        <Button
          title="Save Comparison"
          variant="primary"
          size="small"
          onPress={onSave}
          icon="save"
          style={{ flex: 1 }}
        />
        {onCancel && (
          <>
            <View style={{ width: 8 }} />
            <Button
              title="Cancel"
              variant="ghost"
              size="small"
              onPress={onCancel}
              style={{ flex: 1 }}
            />
          </>
        )}
      </View>

      <Text style={styles.hint}>
        Drag horizontally to compare before and after
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.theme.background,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: config.theme.text,
    marginBottom: 8,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    borderLeftWidth: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    color: config.theme.textSecondary,
  },
  comparisonContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  clipContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    borderRightWidth: 2,
    borderRightColor: '#fff',
  },
  tintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255,0,0,0.1)', // Light red tint for before
  },
  sliderLine: {
    position: 'absolute',
    top: 0,
    width: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderHandle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    position: 'absolute',
    top: '50%',
    left: -14,
    marginTop: -16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderTouchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    // Make hit area larger than visual slider
  },
  controls: {
    flexDirection: 'row',
    marginTop: 16,
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: config.theme.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
