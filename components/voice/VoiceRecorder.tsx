import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../../src/config';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

interface VoiceRecorderProps {
  projectId?: string;
  taskId?: string;
  onRecordingComplete?: (uri: string, duration: number) => void;
  onCancel?: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  projectId,
  taskId,
  onRecordingComplete,
  onCancel,
}) => {
  const {
    isRecording,
    isPaused,
    recording,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
  } = useVoiceRecorder();

  const { showToast } = useToast();
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, pulseAnim]);

  const handleStart = async () => {
    try {
      setElapsed(0);
      await startRecording();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleStop = async () => {
    const result = await stopRecording();
    if (result) {
      showToast('success', 'Recording saved');
      onRecordingComplete?.(result.uri, result.duration);
      // TODO: Upload to server / trigger transcription via OpenClaw skill
    }
  };

  const handleCancel = () => {
    cancelRecording();
    setElapsed(0);
    onCancel?.();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const WaveformPlaceholder = () => (
    <View style={styles.waveform}>
      {Array.from({ length: 30 }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.waveformBar,
            {
              height: isRecording
                ? pulseAnim.interpolate({
                    inputRange: [1, 1.2],
                    outputRange: [20, 40],
                  })
                : 20,
              opacity: isRecording ? 0.8 : 0.3,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Note</Text>
        <Text style={styles.subtitle}>
          Record a voice note to attach to this {projectId ? 'project' : 'task'}
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={20} color={config.theme.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.recorderArea}>
        {!isRecording ? (
          <TouchableOpacity
            style={styles.micButton}
            onPress={handleStart}
            disabled={isRecording}
          >
            <MaterialIcons name="mic" size={48} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.recordingUI}>
            <Animated.View style={[styles.recordingIndicator, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.timer}>{formatTime(elapsed)}</Text>
            <WaveformPlaceholder />
          </View>
        )}
      </View>

      <View style={styles.controls}>
        {isRecording ? (
          <>
            <TouchableOpacity
              style={[styles.controlButton, isPaused && styles.controlButtonActive]}
              onPress={isPaused ? resumeRecording : pauseRecording}
            >
              <MaterialIcons
                name={isPaused ? 'play-arrow' : 'pause'}
                size={32}
                color={config.theme.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStop}
            >
              <MaterialIcons name="stop" size={32} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.cancelButton]}
              onPress={handleCancel}
            >
              <MaterialIcons name="close" size={32} color={config.theme.text} />
            </TouchableOpacity>
          </>
        ) : (
          <Button
            title={recording ? 'Record Again' : 'Start Recording'}
            onPress={handleStart}
            icon="mic"
            size="large"
          />
        )}
      </View>

      {recording && (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Last Recording</Text>
          <Text style={styles.previewDuration}>{formatTime(recording.duration)}</Text>
          <Button
            title="Transcribe"
            variant="outline"
            size="small"
            onPress={() => {
              // Send to OpenClaw for transcription
              showToast('info', 'Transcription queued...');
            }}
            style={{ marginTop: 8 }}
          />
        </View>
      )}
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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: config.theme.text,
  },
  subtitle: {
    fontSize: 14,
    color: config.theme.textSecondary,
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: config.theme.error + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    color: config.theme.error,
    fontSize: 14,
  },
  recorderArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  micButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: config.theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: config.theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  recordingUI: {
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: config.theme.error,
    marginBottom: 16,
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    color: config.theme.text,
    fontVariant: ['tabular-nums'],
    marginBottom: 24,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    gap: 4,
  },
  waveformBar: {
    width: 4,
    backgroundColor: config.theme.primary,
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 32,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: config.theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: config.theme.border,
  },
  controlButtonActive: {
    backgroundColor: config.theme.primary,
  },
  stopButton: {
    backgroundColor: config.theme.error,
    borderColor: config.theme.error,
  },
  cancelButton: {
    backgroundColor: config.theme.surface,
    borderColor: config.theme.border,
  },
  preview: {
    marginTop: 24,
    padding: 16,
    backgroundColor: config.theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: config.theme.border,
  },
  previewLabel: {
    fontSize: 12,
    color: config.theme.textSecondary,
    marginBottom: 4,
  },
  previewDuration: {
    fontSize: 20,
    fontWeight: '600',
    color: config.theme.text,
  },
});
