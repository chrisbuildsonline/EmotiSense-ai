# MotionAI

Real-time emotion tracking powered by on-device AI. Built for the Arm AI Developer Challenge 2025.

## What it does

MotionAI analyzes your facial expressions in real-time to detect emotions: happy, excited, tired, and neutral. It tracks smile intensity, energy levels, head movement, and drowsiness - all processed locally on your device using Arm-optimized AI.

## Why Arm?

This app leverages Google ML Kit Face Detection, which runs on TensorFlow Lite models optimized for Arm architecture. All AI processing happens on-device for maximum performance and privacy - no cloud, no data collection, just pure Arm-powered machine learning.

## Features

- **Real-time emotion detection** - Happy 😊, Excited 🤩, Tired 😴, Neutral 😐
- **Smile intensity tracking** - Measures how much you're smiling
- **Energy level monitoring** - Combines facial expressions and movement
- **Head movement detection** - Tracks nodding and motion patterns
- **Drowsiness alerts** - Multi-factor drowsiness calculation
- **Eye closure tracking** - Detects when eyes are closed
- **100% private** - All processing on-device, no data leaves your phone
- **Fully offline** - No internet required

## Tech Stack

- React Native + Expo SDK 54
- Google ML Kit Face Detection (TensorFlow Lite on Arm)
- TypeScript
- React Native Vision Camera

## Getting Started

### Prerequisites

- Node.js 18+
- iOS/Android device with Arm processor
- Expo CLI

### Installation

```bash
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values (if building with EAS)
```

### Running

**Important:** Expo Go doesn't support ML Kit. You need a development build:

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

Grant camera permission when prompted.

### Building for Distribution

#### Android APK

```bash
# Build APK for Android
eas build --platform android --profile preview

# Or build locally (requires Android Studio)
npx expo run:android --variant release
cd android && ./gradlew assembleRelease
# APK will be in: android/app/build/outputs/apk/release/app-release.apk
```

#### iOS IPA

```bash
# Build IPA for iOS (requires Apple Developer account)
eas build --platform ios --profile preview

# Or build locally (requires Xcode and Mac)
npx expo run:ios --configuration Release
# Then archive in Xcode: Product > Archive
```

**Note:** You'll need to set up EAS Build first:
```bash
npm install -g eas-cli
eas login
eas build:configure
```

## How it works

1. Camera captures your face in real-time
2. ML Kit detects facial features (landmarks, smile probability, eye openness)
3. Custom detectors analyze the data:
   - Eye detector tracks closure and blinks
   - Smile detector measures intensity
   - Head movement detector tracks motion
   - Drowsiness detector combines multiple signals
4. Emotion classifier determines your current emotion
5. Results update every 200ms for smooth tracking

## Architecture

The app uses a modular detection system:

```
lib/detectors/
├── EyeDetector.ts           # Eye tracking with 5-frame averaging
├── HeadMovementDetector.ts  # Head pose and motion (10-frame history)
├── SmileDetector.ts         # Smile intensity analysis
├── DrowsinessDetector.ts    # Multi-factor drowsiness calculation
└── EmotionClassifier.ts     # Emotion classification logic
```

Each detector is independent and can be used separately or combined.

## Emotion Detection Logic

- **Tired**: Eyes closed → 90% confidence
- **Excited**: High smile (>70%) + high energy (>70%) → up to 95% confidence
- **Happy**: Smile detected (>25%) → up to 90% confidence
- **Neutral**: Default state → 70% confidence

## Privacy

- Zero data collection
- No analytics or telemetry
- All processing happens on your device
- Camera feed is never recorded or transmitted
- No internet connection required

## Performance

- Runs at 5 FPS (200ms per frame)
- Optimized for mobile Arm processors
- Minimal battery impact
- Smooth real-time updates

## Use Cases

- Personal mood tracking
- Wellness and meditation apps
- Fatigue monitoring for safety
- User research and feedback
- Accessibility tools
- Entertainment and games

## Built for Arm AI Challenge

This project showcases:
- **Arm optimization**: TensorFlow Lite models running efficiently on Arm
- **On-device AI**: No cloud dependency, pure edge computing
- **Real-world application**: Practical emotion tracking
- **Quality code**: Clean, modular, maintainable architecture
- **User experience**: Smooth, responsive, intuitive interface

## Credits

Built by [@ChrisIsbuilding](https://x.com/ChrisIsbuilding) for the Arm AI Developer Hackathon 2025.

## License

MIT
