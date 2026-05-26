import { useState, useCallback } from 'react';

interface Recording {
  uri: string;
  duration: number;
  // add other fields as needed
}

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    setError(null);
    // TODO: implement actual recording using expo-av
    setIsRecording(true);
    setRecording(null);
  }, []);

  const stopRecording = useCallback(async () => {
    // TODO: stop and process
    setIsRecording(false);
    setIsPaused(false);
    // Simulate a recording result
    const result = { uri: 'file://recording.m4a', duration: 0 };
    setRecording(result);
    return result;
  }, []);

  const pauseRecording = useCallback(async () => {
    setIsPaused(true);
  }, []);

  const resumeRecording = useCallback(async () => {
    setIsPaused(false);
  }, []);

  const cancelRecording = useCallback(async () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecording(null);
  }, []);

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
  };
};
