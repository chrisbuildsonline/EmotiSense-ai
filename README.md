# Drowsiness Alert - Arm AI Developer Challenge

A real-time drowsiness detection app that monitors driver/user alertness using on-device AI inference on Arm-based devices.

## 🎯 Features

### Real-Time Sleepiness Detection
- **Eye Closure Monitoring**: Tracks eye openness probability and detects prolonged closures
- **Blink Rate Analysis**: Monitors blink frequency (normal: 15-20/min, drowsy: <10 or >30/min)
- **Yawn Detection**: Analyzes mouth aspect ratio to detect yawning
- **Head Nodding Detection**: Tracks head pose variance to detect nodding
- **Alertness Scoring**: 0-100 score based on multiple drowsiness indicators

### Smart Alerting System
- **Progressive Alerts**: Vibration + visual warnings when drowsiness detected
- **Consecutive Frame Tracking**: Requires 3 consecutive drowsy detections to avoid false positives
- **Alert Cooldown**: 10-second cooldown between alerts to prevent alert fatigue

### Privacy-First Design
- **100% On-Device Processing**: All AI inference runs locally on Arm device
- **No Data Transmission**: Zero network requests - complete offline functionality
- **Real-Time Analysis**: Face detection and analysis every 3 seconds

## 🏗️ Technical Architecture

### AI/ML Stack
- **Face Detection**: expo-face-detector (optimized for mobile)
- **Facial Landmarks**: Full landmark detection (eyes, mouth, nose, cheeks, ears)
- **Classifications**: Eye openness probability, smiling probability
- **Head Pose**: Roll and yaw angle tracking

### Drowsiness Indicators

#### 1. Eye Closure Rate (0-40 points penalty)
- Normal: 0-20% closure
- Drowsy: 30-50% closure  
- Very Drowsy: >50% closure

#### 2. Blink Rate
- Normal: 15-20 blinks/minute
- Drowsy: <10 blinks/minute (staring)
- Tired: >30 blinks/minute (eye fatigue)

#### 3. Long Blinks (5 points each)
- Blinks >500ms indicate drowsiness
- Tracked over 1-minute rolling window

#### 4. Yawn Detection (20 points penalty)
- Mouth aspect ratio >0.6 indicates yawning
- Averaged over 5-frame history for stability

#### 5. Head Nodding (15 points penalty)
- Variance in roll/yaw angles >15° indicates nodding
- Tracked over 10-frame history

### Performance Optimizations
- **Frame Throttling**: 200ms between processing (5 FPS)
- **Rolling Windows**: 1-minute blink history, 10-frame pose history
- **Smoothing**: Multi-frame averaging for stable detection
- **Efficient Memory**: Automatic cleanup of old data

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+
Expo CLI
iOS/Android device or simulator
```

### Installation
```bash
npm install
npx expo start
```

### ⚠️ IMPORTANT: Real Face Detection Requires Development Build

**Expo Go does NOT support real face detection.** To use actual on-device AI:

```bash
# iOS
npx expo run:ios

# Android  
npx expo run:android
```

This creates a development build with:
- ✅ REAL face detection using device AI
- ✅ Arm-optimized ML inference
- ✅ Google ML Kit (Android) / Vision (iOS)
- ✅ No simulation - actual camera analysis

See [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md) for details.

## 📊 Alertness Scoring

### Score Ranges
- **70-100**: ALERT (Green) - Fully awake and attentive
- **50-69**: NORMAL (Light Green) - Normal alertness
- **30-49**: DROWSY (Orange) - Showing signs of drowsiness
- **0-29**: VERY DROWSY (Red) - Immediate break recommended

### Alert Triggers
- Alertness score <40 for 3 consecutive frames (9 seconds)
- Vibration pattern: [0ms, 500ms, 200ms, 500ms]
- Visual alert banner with recommended action

## 🔬 Arm Optimization

### On-Device Inference
- All ML processing runs on device CPU/GPU
- Optimized for Arm Cortex-A/X processors
- No cloud dependencies - works completely offline

### Future Optimizations
- Integration with Arm KleidiCV for optimized CV operations
- ONNX Runtime with Arm acceleration
- Quantization for reduced model size
- Arm Performance Studio profiling

## 📱 UI Components

### Monitor Screen
- Live camera feed with face detection overlay
- Real-time alertness score (0-100)
- Status indicator (ALERT/NORMAL/DROWSY/VERY DROWSY)
- Metrics grid:
  - Eye Closure %
  - Blink Rate (per minute)
  - Yawn Detection (Yes/No)
  - Head Nodding (Yes/No)
- Alert banner when drowsy

### Metrics Display
- Color-coded status badges
- Progress bar visualization
- Real-time metric cards
- Face detection indicator

## 🛡️ Privacy & Security

- **No Data Collection**: Zero telemetry or analytics
- **Local Processing**: All computation on-device
- **No Network**: Completely offline functionality
- **Camera Access**: Only used for real-time analysis, no recording

## 🎓 Use Cases

1. **Driver Safety**: Monitor alertness while driving
2. **Long-Haul Trucking**: Prevent fatigue-related accidents
3. **Night Shift Workers**: Track alertness during extended shifts
4. **Students**: Monitor focus during study sessions
5. **Medical Monitoring**: Track patient alertness

## 🔧 Technical Details

### Dependencies
- React Native + Expo SDK 54
- expo-camera: Camera access and control
- expo-face-detector: On-device face detection
- React Navigation: Tab navigation

### File Structure
```
app/
├── services/
│   └── SleepinessDetector.ts    # Core detection logic
├── contexts/
│   └── ServiceContext.tsx        # Service initialization
├── (tabs)/
│   ├── index.tsx                 # Monitor screen
│   └── _layout.tsx               # Tab navigation
└── types/
    └── index.ts                  # TypeScript types
```

### Key Algorithms

#### Alertness Score Calculation
```typescript
score = 100
score -= eyeClosureRate * 80        // 0-40 points
score -= (blinkRate < 10) ? 15 : 0  // Low blink penalty
score -= (blinkRate > 30) ? 10 : 0  // High blink penalty
score -= longBlinks * 5              // Long blink penalty
score -= yawnDetected ? 20 : 0       // Yawn penalty
score -= headNodding ? 15 : 0        // Nodding penalty
```

#### Blink Detection
```typescript
if (eyeOpenness < 0.3) {
  // Eyes closed - start timer
  if (!closedStartTime) closedStartTime = now;
} else {
  // Eyes open - record blink
  if (closedStartTime) {
    blinkDuration = now - closedStartTime;
    recordBlink(blinkDuration);
  }
}
```

## 🏆 Arm AI Developer Challenge

This app demonstrates:
- ✅ On-device AI inference on Arm architecture
- ✅ Real-time computer vision processing
- ✅ Practical safety application
- ✅ Privacy-first design
- ✅ Production-ready implementation
- ✅ No static values - all metrics from real face detection

## 📈 Future Enhancements

1. **ML Model Integration**: Custom drowsiness classification model
2. **Arm Optimization**: KleidiCV/KleidiAI integration
3. **Audio Analysis**: Yawn sound detection
4. **Historical Tracking**: Session logging and trends
5. **Calibration**: Per-user baseline adjustment
6. **Multi-face**: Support for passenger monitoring
7. **Export Data**: Share alertness reports

## 📄 License

MIT License - Built for Arm AI Developer Challenge

## 🤝 Contributing

This is a hackathon project. Contributions welcome after the challenge!

---

**Built with ❤️ for the Arm AI Developer Challenge**
