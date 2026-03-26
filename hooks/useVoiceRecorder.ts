import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

interface VoiceRecording {
  uri: string;
  duration: number;
  createdAt: Date;
}

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  recording: VoiceRecording | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<VoiceRecording | null>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  cancelRecording: () => void;
  playback: Audio.Sound | null;
  playbackStatus: Audio.PlaybackStatus;
  playSound: (uri: string) => Promise<void>;
  pausePlayback: () => Promise<void>;
  stopPlayback: () => Promise<void>;
  releasePlayback: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recording, setRecording] = useState<VoiceRecording | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const playbackRef = useRef<Audio.Sound | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<Audio.PlaybackStatus>({});

  useEffect(() => {
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    };
    setupAudio();

    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (playbackRef.current) {
        playbackRef.current.unloadAsync();
      }
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
      }

      const { recording, status } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      if (!status.canRecord) {
        throw new Error('Cannot start recording - check permissions');
      }

      recordingRef.current = recording;
      setIsRecording(true);
      setIsPaused(false);
      setRecording(null);

      // Monitor recording duration
      recordingRef.current.setOnRecordingStatusUpdate((status) => {
        if (status.durationMillis) {
          // Duration updates happen in real-time
        }
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const stopRecording = async (): Promise<VoiceRecording | null> => {
    if (!recordingRef.current) {
      setError('No active recording');
      return null;
    }

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      if (!uri) {
        throw new Error('Recording failed - no file generated');
      }

      const duration = recordingRef.current.getStatus().durationMillis || 0;
      const durationSeconds = Math.floor(duration / 1000);

      const recordingData: VoiceRecording = {
        uri,
        duration: durationSeconds,
        createdAt: new Date(),
      };

      setRecording(recordingData);
      setRecording(null);
      setIsRecording(false);
      setIsPaused(false);
      recordingRef.current = null;

      return recordingData;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const pauseRecording = async () => {
    if (recordingRef.current && isRecording && !isPaused) {
      await recordingRef.current.pauseAsync();
      setIsPaused(true);
    }
  };

  const resumeRecording = async () => {
    if (recordingRef.current && isPaused) {
      await recordingRef.current.startAsync();
      setIsPaused(false);
    }
  };

  const cancelRecording = () => {
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().then(() => {
        // Delete the file
        if (recordingRef.current) {
          const uri = recordingRef.current.getURI();
          if (uri) {
            FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
          }
        }
      });
    }
    recordingRef.current = null;
    setIsRecording(false);
    setIsPaused(false);
    setRecording(null);
    setError(null);
  };

  const playSound = async (uri: string) => {
    try {
      if (playbackRef.current) {
        await playbackRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      playbackRef.current = sound;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const onPlaybackStatusUpdate = (status: Audio.PlaybackStatus) => {
    setPlaybackStatus(status);
    if (status.didJustFinish) {
      // Cleanup after playback
      playbackRef.current?.unloadAsync().then(() => {
        playbackRef.current = null;
        setPlaybackStatus({});
      });
    }
  };

  const pausePlayback = async () => {
    await playbackRef.current?.pauseAsync();
  };

  const stopPlayback = async () => {
    await playbackRef.current?.stopAsync();
    if (playbackRef.current) {
      playbackRef.current.unloadAsync().then(() => {
        playbackRef.current = null;
        setPlaybackStatus({});
      });
    }
  };

  const releasePlayback = () => {
    if (playbackRef.current) {
      playbackRef.current.unloadAsync();
      playbackRef.current = null;
      setPlaybackStatus({});
    }
  };

  return {
    isRecording,
    isPaused,
    recording,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    playback: playbackRef.current,
    playbackStatus,
    playSound,
    pausePlayback,
    stopPlayback,
    releasePlayback,
  };
}
