import { Stack } from 'expo-router';
import { config } from '../../src/config';

/**
 * Field Operations Stack Navigator
 *
 * Screens:
 * - FieldHome: quick access to camera, voice, measurements
 * - VoiceRecorder: record voice notes, transcribe
 * - VoiceNoteDetail: view/edit transcript
 * - PhotoGallery: project photos, annotation mode
 * - PhotoEditor: annotation canvas
 * - MeasurementTool: measure distances on photos
 */
export default function FieldNavigator() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: config.theme.background,
        },
        headerTintColor: config.theme.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: config.theme.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Field',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="voice"
        options={{
          title: 'Voice Note',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="voice/[voiceNoteId]"
        options={{
          title: 'Voice Note Detail',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="photos"
        options={{
          title: 'Photos',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="photo-editor"
        options={{
          title: 'Annotate Photo',
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="measurements"
        options={{
          title: 'Measurements',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
