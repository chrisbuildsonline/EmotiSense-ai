import { Alert, Vibration } from 'react-native';

// Manual face feature interface (compatible with expo-face-detector types)
export interface FaceFeature {
  bounds: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  rollAngle?: number;
  yawAngle?: number;
  smilingProbability?: number;
  leftEyeOpenProbability?: number;
  rightEyeOpenProbability?: number;
  leftMouthPosition?: { x: number; y: number };
  rightMouthPosition?: { x: number; y: number };
  bottomMouthPosition?: { x: number; y: number };
  faceID?: number;
}

export interface SleepinessResult {
  alertnessScore: number;
  eyeClosureRate: number;
  blinkRate: number;
  yawnDetected: boolean;
  headNodding: boolean;
  isSleepy: boolean;
  timestamp: number;
}

interface BlinkEvent {
  timestamp: number;
  duration: number;
}

export class SleepinessDetector {
  private isInitialized = false;
  private lastProcessTime = 0;
  private readonly FRAME_THROTTLE_MS = 200;
  
  private blinkHistory: BlinkEvent[] = [];
  private eyesClosedStartTime: number | null = null;
  private lastEyeState: 'open' | 'closed' = 'open';
  private readonly BLINK_THRESHOLD = 0.5;
  private readonly LONG_BLINK_DURATION = 500;
  private readonly BLINK_HISTORY_WINDOW = 60000;
  
  private headPoseHistory: { roll: number; yaw: number; timestamp: number }[] = [];
  private readonly HEAD_POSE_HISTORY_SIZE = 10;
  private readonly HEAD_NOD_THRESHOLD = 15;
  
  private mouthOpenHistory: number[] = [];
  private readonly MOUTH_OPEN_HISTORY_SIZE = 5;
  private readonly YAWN_THRESHOLD = 0.6;
  
  private consecutiveSleepyFrames = 0;
  private readonly ALERT_THRESHOLD = 3;
  private lastAlertTime = 0;
  private readonly ALERT_COOLDOWN = 10000;

  async initialize(): Promise<void> {
    try {
      console.log('SleepinessDetector: Initializing...');
      this.isInitialized = true;
      console.log('SleepinessDetector: Initialization complete');
    } catch (error) {
      console.error('SleepinessDetector: Failed to initialize:', error);
      throw error;
    }
  }

  async detectSleepiness(faces: FaceFeature[]): Promise<SleepinessResult> {
    if (!this.isInitialized) {
      throw new Error('SleepinessDetector not initialized');
    }

    const now = Date.now();
    
    if (now - this.lastProcessTime < this.FRAME_THROTTLE_MS) {
      return this.getLastResult();
    }
    
    this.lastProcessTime = now;

    if (!faces || faces.length === 0) {
      return this.getNoFaceResult();
    }

    const face = faces[0];
    
    const eyeClosureRate = this.analyzeEyeClosure(face, now);
    const blinkRate = this.calculateBlinkRate(now);
    const yawnDetected = this.detectYawn(face);
    const headNodding = this.detectHeadNodding(face, now);
    
    const alertnessScore = this.calculateAlertnessScore(
      eyeClosureRate,
      blinkRate,
      yawnDetected,
      headNodding
    );
    
    const isSleepy = alertnessScore < 40;
    
    if (isSleepy) {
      this.consecutiveSleepyFrames++;
    } else {
      this.consecutiveSleepyFrames = 0;
    }
    
    if (this.consecutiveSleepyFrames >= this.ALERT_THRESHOLD) {
      this.triggerSleepinessAlert(alertnessScore);
    }

    return {
      alertnessScore,
      eyeClosureRate,
      blinkRate,
      yawnDetected,
      headNodding,
      isSleepy,
      timestamp: now,
    };
  }

  private analyzeEyeClosure(face: FaceFeature, now: number): number {
    const leftEyeOpen = face.leftEyeOpenProbability ?? 0.8;
    const rightEyeOpen = face.rightEyeOpenProbability ?? 0.8;
    const avgEyeOpen = (leftEyeOpen + rightEyeOpen) / 2;
    
    const eyeClosureRate = 1 - avgEyeOpen;
    
    const currentState = avgEyeOpen < this.BLINK_THRESHOLD ? 'closed' : 'open';
    
    if (currentState === 'closed' && this.lastEyeState === 'open') {
      this.eyesClosedStartTime = now;
    } else if (currentState === 'open' && this.lastEyeState === 'closed') {
      if (this.eyesClosedStartTime !== null) {
        const blinkDuration = now - this.eyesClosedStartTime;
        this.blinkHistory.push({
          timestamp: now,
          duration: blinkDuration,
        });
        this.eyesClosedStartTime = null;
      }
    }
    
    this.lastEyeState = currentState;
    
    this.blinkHistory = this.blinkHistory.filter(
      blink => now - blink.timestamp < this.BLINK_HISTORY_WINDOW
    );
    
    return eyeClosureRate;
  }

  private calculateBlinkRate(now: number): number {
    const recentBlinks = this.blinkHistory.filter(
      blink => now - blink.timestamp < this.BLINK_HISTORY_WINDOW
    );
    
    return recentBlinks.length;
  }

  private detectYawn(face: FaceFeature): boolean {
    let mouthAspectRatio = 0;
    
    if (face.leftMouthPosition && face.rightMouthPosition && face.bottomMouthPosition) {
      const mouthWidth = Math.abs(face.rightMouthPosition.x - face.leftMouthPosition.x);
      const mouthHeight = Math.abs(face.bottomMouthPosition.y - 
        ((face.leftMouthPosition.y + face.rightMouthPosition.y) / 2));
      mouthAspectRatio = mouthWidth > 0 ? mouthHeight / mouthWidth : 0;
    }
    
    this.mouthOpenHistory.push(mouthAspectRatio);
    if (this.mouthOpenHistory.length > this.MOUTH_OPEN_HISTORY_SIZE) {
      this.mouthOpenHistory.shift();
    }
    
    const avgMouthOpen = this.mouthOpenHistory.reduce((a, b) => a + b, 0) / this.mouthOpenHistory.length;
    const isYawning = avgMouthOpen > this.YAWN_THRESHOLD;
    
    return isYawning;
  }

  private detectHeadNodding(face: FaceFeature, now: number): boolean {
    const rollAngle = face.rollAngle ?? 0;
    const yawAngle = face.yawAngle ?? 0;
    
    this.headPoseHistory.push({ roll: rollAngle, yaw: yawAngle, timestamp: now });
    if (this.headPoseHistory.length > this.HEAD_POSE_HISTORY_SIZE) {
      this.headPoseHistory.shift();
    }
    
    if (this.headPoseHistory.length < 3) {
      return false;
    }
    
    const rollVariance = this.calculateVariance(this.headPoseHistory.map(h => h.roll));
    const yawVariance = this.calculateVariance(this.headPoseHistory.map(h => h.yaw));
    
    const isNodding = rollVariance > this.HEAD_NOD_THRESHOLD || yawVariance > this.HEAD_NOD_THRESHOLD;
    
    return isNodding;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    
    return Math.sqrt(variance);
  }

  private calculateAlertnessScore(
    eyeClosureRate: number,
    blinkRate: number,
    yawnDetected: boolean,
    headNodding: boolean
  ): number {
    let score = 100;
    
    const eyePenalty = eyeClosureRate * 80;
    score -= eyePenalty;
    
    let blinkPenalty = 0;
    if (blinkRate < 10) {
      blinkPenalty = 15;
    } else if (blinkRate > 30) {
      blinkPenalty = 10;
    }
    score -= blinkPenalty;
    
    const longBlinks = this.blinkHistory.filter(b => b.duration > this.LONG_BLINK_DURATION).length;
    const longBlinkPenalty = longBlinks * 5;
    score -= longBlinkPenalty;
    
    const yawnPenalty = yawnDetected ? 20 : 0;
    score -= yawnPenalty;
    
    const noddingPenalty = headNodding ? 15 : 0;
    score -= noddingPenalty;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private triggerSleepinessAlert(alertnessScore: number): void {
    const now = Date.now();
    
    if (now - this.lastAlertTime < this.ALERT_COOLDOWN) {
      return;
    }
    
    this.lastAlertTime = now;
    
    Vibration.vibrate([0, 500, 200, 500]);
    
    Alert.alert(
      '⚠️ Drowsiness Detected',
      `Your alertness score is ${alertnessScore}/100. Please take a break or rest!`,
      [
        { text: 'I\'m Awake', style: 'cancel' },
        { text: 'Take Break', style: 'default' }
      ]
    );
  }

  private getLastResult(): SleepinessResult {
    return {
      alertnessScore: 50,
      eyeClosureRate: 0.2,
      blinkRate: 15,
      yawnDetected: false,
      headNodding: false,
      isSleepy: false,
      timestamp: Date.now(),
    };
  }

  private getNoFaceResult(): SleepinessResult {
    return {
      alertnessScore: 0,
      eyeClosureRate: 0,
      blinkRate: 0,
      yawnDetected: false,
      headNodding: false,
      isSleepy: false,
      timestamp: Date.now(),
    };
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  reset(): void {
    this.blinkHistory = [];
    this.eyesClosedStartTime = null;
    this.headPoseHistory = [];
    this.mouthOpenHistory = [];
    this.consecutiveSleepyFrames = 0;
  }

  dispose(): void {
    this.reset();
    this.isInitialized = false;
  }
}
