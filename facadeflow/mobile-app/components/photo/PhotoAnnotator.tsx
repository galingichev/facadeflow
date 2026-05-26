import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableWithoutFeedback, PanResponder, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Svg, Circle, Line, Text as SvgText, Rect, G } from 'react-native-svg';
import { config } from '../../src/lib/config';
import { usePhotoAnnotation, Annotation, COLORS } from '../../src/hooks/usePhotoAnnotation';
import { Button } from '../ui/Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH - 32;
const IMAGE_HEIGHT = (IMAGE_WIDTH * 4) / 3; // 4:3 aspect ratio placeholder

interface PhotoAnnotatorProps {
  imageUrl: string;
  annotations: Annotation[];
  onAnnotationsChange: (annotations: Annotation[]) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export const PhotoAnnotator: React.FC<PhotoAnnotatorProps> = ({
  imageUrl,
  annotations,
  onAnnotationsChange,
  onSave,
  onCancel,
}) => {
  const {
    selectedTool,
    selectedColor,
    setSelectedTool,
    setSelectedColor,
    addAnnotation,
  } = usePhotoAnnotation();

  const [currentDrawing, setCurrentDrawing] = useState<Annotation | null>(null);
  const [scale] = useState(1);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (selectedTool === 'pan') return;

        const { locationX, locationY } = evt.nativeEvent;
        const x = locationX / IMAGE_WIDTH;
        const y = locationY / (IMAGE_HEIGHT * scale);

        if (selectedTool === 'arrow' || selectedTool === 'text') {
          setCurrentDrawing({
            id: 'current',
            type: selectedTool,
            x,
            y,
            color: selectedColor,
            text: selectedTool === 'text' ? '' : undefined,
            endX: x + 0.1,
            endY: y + 0.1,
          });
        }
      },
      onPanResponderMove: (evt) => {
        if (!currentDrawing || selectedTool !== 'arrow') return;
        const { locationX, locationY } = evt.nativeEvent;
        const endX = Math.max(0, Math.min(1, locationX / IMAGE_WIDTH));
        const endY = Math.max(0, Math.min(1, locationY / (IMAGE_HEIGHT * scale)));
        setCurrentDrawing((prev: Annotation | null) => prev ? { ...prev, endX, endY } : null);
      },
      onPanResponderRelease: () => {
        if (currentDrawing && currentDrawing.id === 'current') {
          addAnnotation(currentDrawing);
          setCurrentDrawing(null);
        }
      },
    })
  ).current;

  const renderAnnotation = (annotation: Annotation) => {
    const baseProps = {
      x: annotation.x * IMAGE_WIDTH,
      y: annotation.y * IMAGE_HEIGHT,
      stroke: annotation.color,
      strokeWidth: 3,
      fill: annotation.color,
    };

    switch (annotation.type) {
      case 'arrow':
        return (
          <G key={annotation.id}>
            <Line
              x1={baseProps.x}
              y1={baseProps.y}
              x2={(annotation.endX || 0) * IMAGE_WIDTH}
              y2={(annotation.endY || 0) * IMAGE_HEIGHT}
              {...baseProps}
            />
            {/* Arrowhead would be added here with proper math */}
          </G>
        );
      case 'circle':
        return (
          <Circle
            key={annotation.id}
            cx={baseProps.x}
            cy={baseProps.y}
            r={20}
            fill="transparent"
            stroke={annotation.color}
            strokeWidth={3}
          />
        );
      case 'highlight':
        return (
          <Rect
            key={annotation.id}
            x={baseProps.x}
            y={baseProps.y}
            width={(annotation.width || 0.5) * IMAGE_WIDTH}
            height={(annotation.height || 0.1) * IMAGE_HEIGHT}
            fill={annotation.color + '40'} // 25% opacity
          />
        );
      case 'text':
        return (
          <SvgText
            key={annotation.id}
            x={baseProps.x}
            y={baseProps.y}
            fill={annotation.color}
            fontSize={16}
            fontWeight="bold"
          >
            {annotation.text || 'Text'}
          </SvgText>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.toolGroup}>
          {(['arrow', 'circle', 'highlight', 'pan'] as const).map((tool) => (
            <TouchableWithoutFeedback
              key={tool}
              onPress={() => setSelectedTool(tool)}
            >
              <View
                style={[
                  styles.toolButton,
                  selectedTool === tool && styles.toolButtonActive,
                ]}
              >
                <MaterialIcons
                  name={getToolIcon(tool) as any}
                  size={20}
                  color={selectedTool === tool ? '#fff' : config.theme.text}
                />
              </View>
            </TouchableWithoutFeedback>
          ))}
        </View>

        <View style={styles.colorGroup}>
          {COLORS.map((color: string) => (
            <TouchableWithoutFeedback
              key={color}
              onPress={() => setSelectedColor(color)}
            >
              <View
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorSwatchActive,
                ]}
              />
            </TouchableWithoutFeedback>
          ))}
        </View>

        <View style={styles.actionButtons}>
          <Button
            title="Clear"
            variant="ghost"
            size="small"
            onPress={() => onAnnotationsChange([])}
            icon="delete"
          />
          <Button
            title="Save"
            variant="primary"
            size="small"
            onPress={onSave}
            icon="check"
          />
          {onCancel && (
            <Button
              title="Cancel"
              variant="outline"
              size="small"
              onPress={onCancel}
            />
          )}
        </View>
      </View>

      <TouchableWithoutFeedback {...panResponder.panHandlers}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
          <Svg width={IMAGE_WIDTH} height={IMAGE_HEIGHT} style={styles.svgOverlay}>
            {annotations.map(renderAnnotation)}
            {currentDrawing && renderAnnotation(currentDrawing)}
          </Svg>
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.instructions}>
        <MaterialIcons name="info-outline" size={16} color={config.theme.textSecondary} />
        <Text style={styles.instructionText}>
          {selectedTool === 'pan'
            ? 'Pan mode - tap annotations to delete'
            : `Draw ${selectedTool}s - tap & ${selectedTool === 'arrow' ? 'drag' : 'tap'} on image`}
        </Text>
      </View>
    </View>
  );
};

function getToolIcon(tool: string): string {
  switch (tool) {
    case 'arrow':
      return 'keyboard-arrow-right';
    case 'circle':
      return 'favorite-border';
    case 'highlight':
      return 'highlight';
    case 'pan':
      return 'pan-tool';
    default:
      return 'brush';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.theme.background,
  },
  toolbar: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: config.theme.border,
    backgroundColor: config.theme.surface,
  },
  toolGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  toolButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: config.theme.background,
    borderWidth: 1,
    borderColor: config.theme.border,
  },
  toolButtonActive: {
    backgroundColor: config.theme.primary,
    borderColor: config.theme.primary,
  },
  colorGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: config.theme.text,
    transform: [{ scale: 1.1 }],
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  imageContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: config.theme.border,
    backgroundColor: config.theme.surface,
  },
  instructionText: {
    marginLeft: 8,
    fontSize: 12,
    color: config.theme.textSecondary,
    flex: 1,
  },
});
