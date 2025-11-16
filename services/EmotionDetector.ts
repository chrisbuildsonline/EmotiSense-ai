import {
    DrowsinessDetector,
    EmotionClassifier,
    EyeDetector,
    HeadMovementDetector,
    SmileDetector,
    type EmotionType,
    type FaceFeature
} from '../lib/detectors';

export interface EmotionResult {
  emotion: EmotionType;
  confidence: number;
  smileIntensity: number;
  energyLevel: number;
  headMovement: number;
  eyesClosed: boolean;
  eyeClosureRate: number;
  drowsinessLevel: number;
  blinkRate: number;
  timestamp: number;
}

export interface EmotionStats {
  happyCount: number;
  excitedCount: number;
  neutralCount: number;
  tiredCount: number;
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
  
  // Detection modules
  private eyeDetector: EyeDetector;
  private headMovementDetector: HeadMovementDetector;
  private smileDetector: SmileDetector;
  private drowsinessDetector: DrowsinessDetector;
  private emotionClassifier: EmotionClassifier;

  constructor() {
    this.eyeDetector = new EyeDetector();
    this.headMovementDetector = new HeadMovementDetector();
    this.smileDetector = new SmileDetector();
    this.drowsinessDetector = new DrowsinessDetector();
    this.emotionClassifier = new EmotionClassifier();
  }

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
    
    // Use detection modules
    const smileResult = this.smileDetector.analyzeSmile(face);
    const eyeResult = this.eyeDetector.analyzeEyeClosure(face);
    const headResult = this.headMovementDetector.analyzeHeadMovement(face, now);
    const drowsinessResult = this.drowsinessDetector.calculateDrowsiness(
      eyeResult.eyeClosureRate,
      headResult.headMovement
    );
    
    const energyLevel = this.calculateEnergyLevel(
      smileResult.smileIntensity,
      headResult.headMovement,
      eyeResult.eyeClosureRate
    );
    
    const emotionResult = this.emotionClassifier.classifyEmotion(
      smileResult.smileIntensity,
      energyLevel,
      headResult.headMovement,
      eyeResult.eyesClosed
    );
    
    const result: EmotionResult = {
      emotion: emotionResult.emotion,
      confidence: emotionResult.confidence,
      smileIntensity: smileResult.smileIntensity,
      energyLevel,
      headMovement: headResult.headMovement,
      eyesClosed: eyeResult.eyesClosed,
      eyeClosureRate: eyeResult.eyeClosureRate,
      drowsinessLevel: drowsinessResult.drowsinessLevel,
      blinkRate: eyeResult.blinkRate,
      timestamp: now,
    };
    
    this.emotionHistory.push(result);
    if (this.emotionHistory.length > this.EMOTION_HISTORY_SIZE) {
      this.emotionHistory.shift();
    }

    return result;
  }

  private calculateEnergyLevel(smileIntensity: number, headMovement: number, eyeClosureRate: number): number {
    // Reduce energy if eyes are closing
    const eyeOpenFactor = 1 - eyeClosureRate;
    return Math.round((smileIntensity * 40 + headMovement * 30 + eyeOpenFactor * 30) * 100);
  }

  getStats(): EmotionStats {
    if (this.emotionHistory.length === 0) {
      return {
        happyCount: 0,
        excitedCount: 0,
        neutralCount: 0,
        tiredCount: 0,
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
        excitedCount: 0,
        neutralCount: 0,
        tiredCount: 0,
        totalSmile: 0,
        totalEnergy: 0,
      }
    );

    return {
      happyCount: stats.happyCount,
      excitedCount: stats.excitedCount,
      neutralCount: stats.neutralCount,
      tiredCount: stats.tiredCount,
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
      eyesClosed: false,
      eyeClosureRate: 0,
      drowsinessLevel: 0,
      blinkRate: 0,
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
      eyesClosed: false,
      eyeClosureRate: 0,
      drowsinessLevel: 0,
      blinkRate: 0,
      timestamp: Date.now(),
    };
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  reset(): void {
    this.emotionHistory = [];
    this.eyeDetector.reset();
    this.headMovementDetector.reset();
    this.smileDetector.reset();
  }

  dispose(): void {
    this.reset();
    this.isInitialized = false;
  }
}
