# MotionAI - Quick Start Guide

## What is MotionAI?

MotionAI is an emotion tracking app that uses your device's camera to analyze your facial expressions in real-time. It detects whether you're happy, sad, excited, or neutral, and provides detailed statistics about your emotional state.

## Features

- 😊 **Real-time Emotion Detection**: Happy, Sad, Excited, Neutral
- 📊 **Live Metrics**: Smile intensity, energy level, head movement
- 📈 **Session Stats**: Track emotion counts and averages
- 🔒 **100% Private**: All processing happens on your device
- 📱 **Offline**: No internet connection required

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the App

For development with Expo Go (limited functionality):
```bash
npx expo start
```

For full face detection (recommended):
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### 3. Grant Camera Permission

When you first open the app, you'll be asked to grant camera permission. This is required for emotion detection.

## How It Works

1. **Position Your Face**: Make sure your face is visible to the front camera
2. **Wait for Detection**: The app will detect your face within 1-2 seconds
3. **View Your Emotion**: See your current emotion displayed with an emoji
4. **Check Metrics**: View smile intensity, energy level, and head movement
5. **Track Stats**: Session statistics show emotion counts and averages

## Understanding the Metrics

### Smile Intensity (0-100%)
- Measures how much you're smiling
- Higher values = bigger smile

### Energy Level (0-100%)
- Combines smile intensity and head movement
- Higher values = more energetic/engaged

### Head Movement (0-100%)
- Tracks how much your head is moving
- Higher values = more motion

## Emotion Classification

- **Excited** 🤩: High smile (>60%) + High energy (>60%)
- **Happy** 😊: Moderate smile (>40%)
- **Sad** 😢: Low smile (<20%) + Low energy (<30%)
- **Neutral** 😐: Everything else

## Privacy

- All AI processing happens on your device
- No data is sent to any server
- No images are stored
- Camera is only used for real-time analysis

## Troubleshooting

### "No face detected"
- Make sure you're in a well-lit area
- Position your face in front of the camera
- Remove any obstructions (sunglasses, masks, etc.)

### App not detecting emotions
- Ensure you're using a development build (not Expo Go)
- Check that camera permissions are granted
- Restart the app if needed

## Navigation

- **Emotions Tab**: Main screen with real-time detection
- **Settings Tab**: App information and features list

## Requirements

- iOS 13+ or Android 8+
- Device with front-facing camera
- Node.js 18+
- Expo CLI

## Support

For issues or questions, please check the README.md file or create an issue in the repository.

---

**Enjoy tracking your emotions with MotionAI!** 😊
