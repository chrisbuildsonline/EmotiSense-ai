
export interface FaceFeature {
  bounds?: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  frame?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  rollAngle?: number;
  yawAngle?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  smilingProbability?: number;
  leftEyeOpenProbability?: number;
  rightEyeOpenProbability?: number;
  landmarks?: {
    mouthLeft?: { position: { x: number; y: number } };
    mouthRight?: { position: { x: number; y: number } };
    mouthBottom?: { position: { x: number; y: number } };
  };
  leftMouthPosition?: { x: number; y: number };
  rightMouthPosition?: { x: number; y: number };
  bottomMouthPosition?: { x: number; y: number };
  faceID?: number;
}

export interface EmotionResult {
  emotion: 'happy' | 'sad' | 'excited' | 'neutral';
  confidence: number;
  smileIntensity: number;
  energyLevel: number;
  headMovement: number;
  timestamp: number;
}

export interface EmotionStats {
  happyCount: number;
  sadCount: number;
  excitedCount: number;
  neutralCount: number;
  totalDetections: number;
  averageSmile: number;
  averageEnergy: number;
}

export class EmotionDetector {
  private isInitialized = false;
  private lastProcessTime = 0;
  private readonly FRAME_THROTTLE_MS = 200;
  
  private emotionHistory: EmotionResult[] = [];
  private readonly EMOTION_HISTORY_SIZE = 100;
  
  private headPoseHistory: { pitch: number; yaw: number; timestamp: number }[] = [];
  private readonly HEAD_POSE_HISTORY_SIZE = 10;

  async initialize(): Promise<void> {
    try {
      console.log('EmotionDetector: Initializing...');
      this.isInitialized = true;
      console.log('EmotionDetector: Initialization complete');
    } catch (error) {
      console.error('EmotionDetector: Failed to initialize:', error);
      throw error;
    }
  }

  async detectEmotion(faces: FaceFeature[]): Promise<EmotionResult> {
    if (!this.isInitialized) {
      throw new Error('EmotionDetector not initialized');
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
    
    const smileIntensity = face.smilingProbability ?? 0;
    const headMovement = this.analyzeHeadMovement(face, now);
    const energyLevel = this.calculateEnergyLevel(smileIntensity, headMovement);
    
    const { emotion, confidence } = this.classifyEmotion(smileIntensity, energyLevel, headMovement);
    
    const result: EmotionResult = {
      emotion,
      confidence,
      smileIntensity,
      energyLevel,
      headMovement,
      timestamp: now,
    };
    
    this.emotionHistory.push(result);
    if (this.emotionHistory.length > this.EMOTION_HISTORY_SIZE) {
      this.emotionHistory.shift();
    }

    return result;
  }

  private analyzeHeadMovement(face: FaceFeature, now: number): number {
    const pitchAngle = face.rotationX ?? 0;
    const yawAngle = face.rotationY ?? face.yawAngle ?? 0;
    
    this.headPoseHistory.push({ pitch: pitchAngle, yaw: yawAngle, timestamp: now });
    if (this.headPoseHistory.length > this.HEAD_POSE_HISTORY_SIZE) {
      this.headPoseHistory.shift();
    }
    
    if (this.headPoseHistory.length < 3) {
      return 0;
    }
    
    const pitchAngles = this.headPoseHistory.map(h => h.pitch);
    const yawAngles = this.headPoseHistory.map(h => h.yaw);
    
    const pitchRange = Math.max(...pitchAngles) - Math.min(...pitchAngles);
    const yawRange = Math.max(...yawAngles) - Math.min(...yawAngles);
    
    const totalMovement = (pitchRange + yawRange) / 2;
    
    return Math.min(100, totalMovement * 2);
  }

  private calculateEnergyLevel(smileIntensity: number, headMovement: number): number {
    return Math.round((smileIntensity * 60 + headMovement * 40));
  }

  private classifyEmotion(
    smileIntensity: number,
    energyLevel: number,
    headMovement: number
  ): { emotion: 'happy' | 'sad' | 'excited' | 'neutral'; confidence: number } {
    if (smileIntensity > 0.6 && energyLevel > 60) {
      return { emotion: 'excited', confidence: Math.min(95, smileIntensity * 100) };
    }
    
    if (smileIntensity > 0.4) {
      return { emotion: 'happy', confidence: Math.min(90, smileIntensity * 100) };
    }
    
    if (smileIntensity < 0.2 && energyLevel < 30) {
      return { emotion: 'sad', confidence: Math.min(85, (1 - smileIntensity) * 80) };
    }
    
    return { emotion: 'neutral', confidence: 70 };
  }

  getStats(): EmotionStats {
    if (this.emotionHistory.length === 0) {
      return {
        happyCount: 0,
        sadCount: 0,
        excitedCount: 0,
        neutralCount: 0,
        totalDetections: 0,
        averageSmile: 0,
        averageEnergy: 0,
      };
    }

    const stats = this.emotionHistory.reduce(
      (acc, result) => {
        acc[`${result.emotion}Count`]++;
        acc.totalSmile += result.smileIntensity;
        acc.totalEnergy += result.energyLevel;
        return acc;
      },
      {
        happyCount: 0,
        sadCount: 0,
        excitedCount: 0,
        neutralCount: 0,
        totalSmile: 0,
        totalEnergy: 0,
      }
    );

    return {
      happyCount: stats.happyCount,
      sadCount: stats.sadCount,
      excitedCount: stats.excitedCount,
      neutralCount: stats.neutralCount,
      totalDetections: this.emotionHistory.length,
      averageSmile: Math.round((stats.totalSmile / this.emotionHistory.length) * 100),
      averageEnergy: Math.round(stats.totalEnergy / this.emotionHistory.length),
    };
  }

  private getLastResult(): EmotionResult {
    if (this.emotionHistory.length > 0) {
      return this.emotionHistory[this.emotionHistory.length - 1];
    }
    return {
      emotion: 'neutral',
      confidence: 0,
      smileIntensity: 0,
      energyLevel: 0,
      headMovement: 0,
      timestamp: Date.now(),
    };
  }

  private getNoFaceResult(): EmotionResult {
    return {
      emotion: 'neutral',
      confidence: 0,
      smileIntensity: 0,
      energyLevel: 0,
      headMovement: 0,
      timestamp: Date.now(),
    };
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  reset(): void {
    this.emotionHistory = [];
    this.headPoseHistory = [];
  }

  dispose(): void {
    this.reset();
    this.isInitialized = false;
  }
}
